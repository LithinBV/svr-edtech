// ============================================================
// SVR EDTECH - AUTHENTICATION UTILS
// ============================================================

const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000; // 1 minute
const REFRESH_CHECK_INTERVAL = 30 * 1000; // 30 seconds

let refreshInProgress = false;
let refreshPromise = null;
let refreshWatcherStarted = false;


// ============================================================
// GET AUTH DATA
// ============================================================

export function getToken() {
    return localStorage.getItem("token");
}

export function getRefreshToken() {
    return localStorage.getItem("refreshToken");
}

export function getUserType() {
    return localStorage.getItem("userType");
}

export function getUserName() {
    return localStorage.getItem("userName") || "";
}

export function getInstitutionId() {
    return localStorage.getItem("institutionId");
}


// ============================================================
// CHECK LOGIN
// ============================================================

export function isLoggedIn() {
    return !!(
        localStorage.getItem("token") &&
        localStorage.getItem("refreshToken")
    );
}


// ============================================================
// CLEAR AUTH DATA
// ============================================================

export function clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("role");
    localStorage.removeItem("institutionId");
    localStorage.removeItem("email");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("lastActivityAt");
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

        let payload = parts[1];

        payload = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        while (payload.length % 4 !== 0) {
            payload += "=";
        }

        const decodedPayload = decodeURIComponent(
            atob(payload)
                .split("")
                .map((character) => {

                    return (
                        "%" +
                        (
                            "00" +
                            character
                                .charCodeAt(0)
                                .toString(16)
                        ).slice(-2)
                    );

                })
                .join("")
        );

        return JSON.parse(decodedPayload);

    } catch (error) {

        console.error(
            "JWT decode failed:",
            error
        );

        return null;
    }
}


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

export async function refreshAccessToken() {

    // ----------------------------------------------------------
    // IMPORTANT:
    // If another refresh request is already running,
    // wait for that same request instead of starting another one.
    // ----------------------------------------------------------

    if (refreshInProgress && refreshPromise) {
        return refreshPromise;
    }


    const refreshToken =
        localStorage.getItem("refreshToken");


    if (!refreshToken) {
        return false;
    }


    refreshInProgress = true;


    refreshPromise = (async () => {

        try {

            const response =
                await fetch(
                    "/api/auth/refresh",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            refreshToken
                        })
                    }
                );


            let data = {};

            try {

                data =
                    await response.json();

            } catch (jsonError) {

                console.error(
                    "Invalid refresh response:",
                    jsonError
                );

            }


            // ==================================================
            // REFRESH SUCCESS
            // ==================================================

            if (
                response.ok &&
                data.success &&
                data.token
            ) {

                // Save new access token
                localStorage.setItem(
                    "token",
                    data.token
                );


                // Save rotated refresh token
                if (data.refreshToken) {

                    localStorage.setItem(
                        "refreshToken",
                        data.refreshToken
                    );
                }


                // Update user type
                if (data.userType) {

                    localStorage.setItem(
                        "userType",
                        data.userType
                    );
                }


                // Update institution ID
                if (data.institutionId) {

                    localStorage.setItem(
                        "institutionId",
                        data.institutionId
                    );
                }


                console.log(
                    "Access token refreshed successfully."
                );

                return true;
            }


            // ==================================================
            // REFRESH FAILED
            // ==================================================

            console.warn(
                "Refresh request failed:",
                data.message || response.status
            );


            /*
             * IMPORTANT:
             *
             * Do NOT immediately clear localStorage here.
             *
             * A refresh can fail because another browser tab
             * already rotated the refresh token.
             *
             * Give the browser a short opportunity to see whether
             * another refresh has already updated localStorage.
             */

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });


            const latestToken =
                localStorage.getItem("token");

            const latestRefreshToken =
                localStorage.getItem("refreshToken");


            if (
                latestToken &&
                latestRefreshToken &&
                latestRefreshToken !== refreshToken
            ) {

                console.log(
                    "Another refresh updated the session."
                );

                return true;
            }


            /*
             * Only return false.
             *
             * Do NOT clear authentication data here.
             *
             * ProtectedRoute / the application can decide whether
             * the user really needs to log in again.
             */

            return false;

        } catch (error) {

            console.error(
                "Token refresh error:",
                error
            );

            /*
             * Do not immediately destroy the session on a
             * temporary network/server error.
             */

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

    const token =
        localStorage.getItem("token");

    const refreshToken =
        localStorage.getItem("refreshToken");


    if (!token || !refreshToken) {
        return false;
    }


    try {

        const payload =
            decodeJWT(token);


        // ------------------------------------------------------
        // JWT cannot be decoded
        // ------------------------------------------------------

        if (!payload || !payload.exp) {

            return await refreshAccessToken();
        }


        const expirationTime =
            payload.exp * 1000;

        const currentTime =
            Date.now();


        // ------------------------------------------------------
        // Token still has more than 1 minute remaining
        // ------------------------------------------------------

        if (
            expirationTime -
            currentTime >
            ACCESS_TOKEN_REFRESH_BUFFER
        ) {

            return true;
        }


        // ------------------------------------------------------
        // Token expired or is about to expire
        // ------------------------------------------------------

        return await refreshAccessToken();

    } catch (error) {

        console.error(
            "Access token check failed:",
            error
        );

        return await refreshAccessToken();
    }
}


// ============================================================
// START TOKEN REFRESH WATCHER
// ============================================================

export function startTokenRefreshWatcher() {

    if (refreshWatcherStarted) {
        return;
    }


    refreshWatcherStarted = true;


    // ----------------------------------------------------------
    // Check immediately
    // ----------------------------------------------------------

    ensureValidAccessToken()
        .catch((error) => {
            console.error(
                "Initial token check failed:",
                error
            );
        });


    // ----------------------------------------------------------
    // Check every 30 seconds
    // ----------------------------------------------------------

    const intervalId =
        setInterval(async () => {

            const token =
                localStorage.getItem("token");

            const refreshToken =
                localStorage.getItem("refreshToken");


            // No active session
            if (!token || !refreshToken) {
                return;
            }


            const valid =
                await ensureValidAccessToken();


            /*
             * IMPORTANT:
             *
             * Do NOT automatically redirect to /login here.
             *
             * A failed refresh can be temporary or another tab
             * may have refreshed the token.
             *
             * ProtectedRoute/API requests will handle genuine
             * authentication failures.
             */

            if (!valid) {

                console.warn(
                    "Token refresh check failed. Keeping current session."
                );

                return;
            }

        }, REFRESH_CHECK_INTERVAL);


    // ----------------------------------------------------------
    // Store interval so it can be cleared during logout
    // ----------------------------------------------------------

    window.__svrAuthRefreshInterval =
        intervalId;
}


// ============================================================
// STOP TOKEN REFRESH WATCHER
// ============================================================

export function stopTokenRefreshWatcher() {

    if (
        window.__svrAuthRefreshInterval
    ) {

        clearInterval(
            window.__svrAuthRefreshInterval
        );

        window.__svrAuthRefreshInterval =
            null;
    }


    refreshWatcherStarted = false;
}


// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {

    const refreshToken =
        localStorage.getItem(
            "refreshToken"
        );


    try {

        if (refreshToken) {

            await fetch(
                "/api/auth/logout",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        refreshToken
                    })
                }
            );
        }

    } catch (error) {

        console.error(
            "Logout request failed:",
            error
        );

    } finally {

        stopTokenRefreshWatcher();

        clearAuthData();
    }
}