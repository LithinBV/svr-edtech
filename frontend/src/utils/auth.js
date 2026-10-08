// ============================================================
// SVR EDTECH - AUTHENTICATION UTILS
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL + "/api";


// ============================================================
// TOKEN SETTINGS
// ============================================================

const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute
const REFRESH_CHECK_INTERVAL = 30 * 1000; // 30 seconds


// ============================================================
// INTERNAL STATE
// ============================================================

let refreshInProgress = false;
let refreshPromise = null;
let refreshWatcherStarted = false;


// ============================================================
// GET AUTH DATA
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


// ============================================================
// CHECK LOGIN
// ============================================================

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
        if (!token || typeof token !== "string") {
            return null;
        }

        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }

        let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (payload.length % 4 !== 0) {
            payload += "=";
        }

        const decodedPayload = decodeURIComponent(
            atob(payload)
                .split("")
                .map((character) => {
                    return (
                        "%" +
                        ("00" + character.charCodeAt(0).toString(16)).slice(-2)
                    );
                })
                .join("")
        );

        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error("JWT decode failed:", error);
        return null;
    }
}


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

export async function refreshAccessToken() {
    // Return ongoing refresh promise to prevent duplicate concurrent network requests
    if (refreshInProgress && refreshPromise) {
        return refreshPromise;
    }

    const currentRefreshToken = getRefreshToken();

    if (!currentRefreshToken) {
        console.warn("No refresh token available.");
        return false;
    }

    refreshInProgress = true;

    refreshPromise = (async () => {
        try {
            console.log("Refreshing access token...");

            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken: currentRefreshToken,
                }),
            });

            let data = {};
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error("Invalid refresh response format:", jsonError);
            }

            // Success
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
                } else if (
                    data.userType &&
                    data.userType !== "INSTITUTION_ADMIN"
                ) {
                    localStorage.removeItem("institutionId");
                }

                console.log("Access token refreshed successfully.");
                return true;
            }

            console.warn(
                "Refresh request failed:",
                data.message || response.status
            );

            // Allow short window to check if another browser tab already refreshed it
            await new Promise((resolve) => setTimeout(resolve, 400));

            const latestToken = getToken();
            const latestRefreshToken = getRefreshToken();

            if (
                latestToken &&
                latestRefreshToken &&
                latestRefreshToken !== currentRefreshToken
            ) {
                console.log("Another tab updated the session.");
                return true;
            }

            return false;
        } catch (error) {
            console.error("Token refresh network error:", error);
            return false;
        } finally {
            refreshInProgress = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}


// ============================================================
// ENSURE ACCESS TOKEN IS VALID
// ============================================================

export async function ensureValidAccessToken() {
    const token = getToken();
    const refreshToken = getRefreshToken();

    if (!token || !refreshToken) {
        return false;
    }

    try {
        const payload = decodeJWT(token);

        if (!payload || !payload.exp) {
            console.warn("Access token unreadable. Attempting refresh...");
            return await refreshAccessToken();
        }

        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        // Token still has ample validity time remaining
        if (expirationTime - currentTime > ACCESS_TOKEN_REFRESH_BUFFER) {
            return true;
        }

        console.log("Access token nearing expiration. Refreshing...");
        return await refreshAccessToken();
    } catch (error) {
        console.error("Access token validation check error:", error);
        return await refreshAccessToken();
    }
}


// ============================================================
// API FETCH (AUTO-RETRY ON 401)
// ============================================================

export async function apiFetch(url, options = {}) {
    // 1. Pre-emptively ensure token is valid
    await ensureValidAccessToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    // 2. If token expired while offline/sleeping, catch 401, refresh, and retry once
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            const freshToken = getToken();
            if (freshToken) {
                headers["Authorization"] = `Bearer ${freshToken}`;
            }

            response = await fetch(url, {
                ...options,
                headers,
            });
        } else {
            // Refresh token invalid or revoked
            logoutUser();
        }
    }

    return response;
}


// ============================================================
// START TOKEN REFRESH WATCHER
// ============================================================

export function startTokenRefreshWatcher() {
    if (refreshWatcherStarted) {
        return;
    }

    refreshWatcherStarted = true;

    // Check immediately upon startup
    ensureValidAccessToken().catch((error) => {
        console.error("Initial token validation error:", error);
    });

    // Periodic validation loop
    const intervalId = setInterval(async () => {
        const token = getToken();
        const refreshToken = getRefreshToken();

        if (!token || !refreshToken) {
            return;
        }

        const valid = await ensureValidAccessToken();
        if (!valid) {
            console.warn("Periodic session refresh failed.");
        }
    }, REFRESH_CHECK_INTERVAL);

    window.__svrAuthRefreshInterval = intervalId;

    // Synchronize authentication changes across tabs
    window.addEventListener("storage", handleStorageSync);
}


// ============================================================
// TAB STORAGE SYNC HANDLER
// ============================================================

function handleStorageSync(event) {
    if (event.key === "token" && !event.newValue) {
        // Logged out in another tab
        stopTokenRefreshWatcher();
    }
}


// ============================================================
// STOP TOKEN REFRESH WATCHER
// ============================================================

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refreshToken,
                }),
            });
        }
    } catch (error) {
        console.error("Logout request failed:", error);
    } finally {
        stopTokenRefreshWatcher();
        clearAuthData();
    }
}