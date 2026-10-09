// ============================================================
// SVR EDTECH - AUTHENTICATION UTILS (FIXED & CONCURRENCY SAFE)
// ============================================================

// 1. Safe URL normalization (prevents double /api or trailing slashes)
const RAW_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
const API_BASE = RAW_URL.endsWith("/api") ? RAW_URL : `${RAW_URL}/api`;

const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute buffer
const REFRESH_CHECK_INTERVAL = 30 * 1000; // 30 seconds check

let refreshPromise = null;
let refreshWatcherStarted = false;

// ============================================================
// STORAGE GETTERS
// ============================================================

export function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem("refreshToken");
  } catch {
    return null;
  }
}

export function getUserType() {
  try {
    return localStorage.getItem("userType");
  } catch {
    return null;
  }
}

export function getUserName() {
  try {
    return localStorage.getItem("userName") || "";
  } catch {
    return "";
  }
}

export function getInstitutionId() {
  try {
    return localStorage.getItem("institutionId");
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!(getToken() && getRefreshToken());
}

// ============================================================
// CLEAR AUTH DATA
// ============================================================

export function clearAuthData() {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("role");
    localStorage.removeItem("institutionId");
    localStorage.removeItem("email");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("lastActivityAt");
  } catch (e) {
    console.error("Failed to clear auth data:", e);
  }
}

// ============================================================
// DECODE JWT
// ============================================================

export function decodeJWT(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (payload.length % 4 !== 0) payload += "=";

    const decodedPayload = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

// ============================================================
// REFRESH ACCESS TOKEN (SHARED PROMISE QUEUE)
// ============================================================

export async function refreshAccessToken() {
  // If an active refresh request is already in-flight, return the same promise
  if (refreshPromise) {
    return refreshPromise;
  }

  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    return false;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error("JSON parse error on refresh:", err);
      }

      if (response.ok && data.success && data.token) {
        localStorage.setItem("token", data.token);

        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        if (data.userType) {
          localStorage.setItem("userType", data.userType);
        }
        if (data.userName) {
          localStorage.setItem("userName", data.userName);
        }
        if (data.institutionId) {
          localStorage.setItem("institutionId", data.institutionId);
        } else if (data.userType && data.userType !== "INSTITUTION_ADMIN") {
          localStorage.removeItem("institutionId");
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Network failure during token refresh:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================
// ENSURE ACCESS TOKEN IS VALID
// ============================================================

export async function ensureValidAccessToken() {
  // If a refresh is currently executing, wait for it to complete
  if (refreshPromise) {
    return await refreshPromise;
  }

  const token = getToken();
  const refreshToken = getRefreshToken();

  if (!token || !refreshToken) return false;

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return await refreshAccessToken();
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  // If token is expiring within 60 seconds, refresh proactively
  if (expirationTime - currentTime > ACCESS_TOKEN_REFRESH_BUFFER) {
    return true;
  }

  return await refreshAccessToken();
}

// ============================================================
// API FETCH (BLOCKS CONCURRENT CALLS & HANDLES RETRIES)
// ============================================================

export async function apiFetch(url, options = {}) {
  // 1. Wait for any active refresh or preemptively refresh if expiring
  await ensureValidAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const currentToken = getToken();
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  let response = await fetch(url, { ...options, headers });

  // 2. If token expired while tab was idle or asleep
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const freshToken = getToken();
      if (freshToken) {
        headers["Authorization"] = `Bearer ${freshToken}`;
      }
      // Retry original request with the renewed token
      response = await fetch(url, { ...options, headers });
    } else {
      logoutUser();
    }
  }

  return response;
}

// ============================================================
// SESSION WATCHER & BACKGROUND INTERVAL
// ============================================================

export function startTokenRefreshWatcher() {
  if (refreshWatcherStarted) return;
  refreshWatcherStarted = true;

  ensureValidAccessToken().catch(() => {});

  const intervalId = setInterval(async () => {
    if (!getToken() || !getRefreshToken()) return;
    await ensureValidAccessToken();
  }, REFRESH_CHECK_INTERVAL);

  window.__svrAuthRefreshInterval = intervalId;
  window.addEventListener("storage", handleStorageSync);
}

function handleStorageSync(event) {
  if (event.key === "token" && !event.newValue) {
    stopTokenRefreshWatcher();
  }
}

export function stopTokenRefreshWatcher() {
  if (window.__svrAuthRefreshInterval) {
    clearInterval(window.__svrAuthRefreshInterval);
    window.__svrAuthRefreshInterval = null;
  }
  window.removeEventListener("storage", handleStorageSync);
  refreshWatcherStarted = false;
}

// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {
  const refreshToken = getRefreshToken();
  try {
    if (refreshToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    stopTokenRefreshWatcher();
    clearAuthData();
    window.location.href = "/login";
  }
}