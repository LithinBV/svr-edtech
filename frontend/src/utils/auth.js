// ============================================================
// SVR EDTECH - AUTHENTICATION UTILS
// ============================================================

// ============================================================
// API CONFIGURATION
// ============================================================

// VITE_API_URL should contain only the backend URL.
//
// Local:
// VITE_API_URL=http://localhost:3000
//
// Production:
// VITE_API_URL=https://svr-edtech-server.vercel.app

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";


// ============================================================
// TOKEN SETTINGS
// ============================================================

// Refresh access token when it has 1 minute or less remaining.
const ACCESS_TOKEN_REFRESH_BUFFER = 60 * 1000;

// Check token every 30 seconds.
const REFRESH_CHECK_INTERVAL = 30 * 1000;


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

        // Convert Base64URL to Base64.
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
    // PREVENT MULTIPLE REFRESH REQUESTS
    // ----------------------------------------------------------

    if (
        refreshInProgress &&
        refreshPromise
    ) {
        return refreshPromise;
    }


    // ----------------------------------------------------------
    // GET REFRESH TOKEN
    // ----------------------------------------------------------

    const refreshToken =
        localStorage.getItem("refreshToken");


    if (!refreshToken) {

        console.warn(
            "No refresh token available."
        );

        return false;
    }


    // ----------------------------------------------------------
    // MARK REFRESH AS IN PROGRESS
    // ----------------------------------------------------------

    refreshInProgress = true;


    // ----------------------------------------------------------
    // CREATE REFRESH REQUEST
    // ----------------------------------------------------------

    refreshPromise = (async () => {

        try {

            console.log(
                "Refreshing access token..."
            );


            // ==================================================
            // CALL BACKEND REFRESH ENDPOINT
            // ==================================================

            const response = await fetch(
                `${API_BASE}/api/auth/refresh-token`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        refreshToken,
                    }),
                }
            );


            // ==================================================
            // READ RESPONSE
            // ==================================================

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

                // ------------------------------------------------
                // SAVE NEW ACCESS TOKEN
                // ------------------------------------------------

                localStorage.setItem(
                    "token",
                    data.token
                );


                // ------------------------------------------------
                // SAVE NEW REFRESH TOKEN
                // ------------------------------------------------

                if (data.refreshToken) {

                    localStorage.setItem(
                        "refreshToken",
                        data.refreshToken
                    );
                }


                // ------------------------------------------------
                // UPDATE USER TYPE
                // ------------------------------------------------

                if (data.userType) {

                    localStorage.setItem(
                        "userType",
                        data.userType
                    );
                }


                // ------------------------------------------------
                // UPDATE USER NAME
                // ------------------------------------------------

                if (data.userName) {

                    localStorage.setItem(
                        "userName",
                        data.userName
                    );
                }


                // ------------------------------------------------
                // UPDATE INSTITUTION ID
                // ------------------------------------------------

                if (data.institutionId) {

                    localStorage.setItem(
                        "institutionId",
                        data.institutionId
                    );

                } else if (
                    data.userType &&
                    data.userType !==
                        "INSTITUTION_ADMIN"
                ) {

                    localStorage.removeItem(
                        "institutionId"
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
                data.message ||
                    response.status
            );


            // --------------------------------------------------
            // GIVE ANOTHER TAB A CHANCE
            // --------------------------------------------------

            await new Promise(
                (resolve) => {
                    setTimeout(
                        resolve,
                        500
                    );
                }
            );


            const latestToken =
                localStorage.getItem(
                    "token"
                );

            const latestRefreshToken =
                localStorage.getItem(
                    "refreshToken"
                );


            // --------------------------------------------------
            // ANOTHER TAB MAY HAVE REFRESHED
            // --------------------------------------------------

            if (
                latestToken &&
                latestRefreshToken &&
                latestRefreshToken !==
                    refreshToken
            ) {

                console.log(
                    "Another refresh updated the session."
                );

                return true;
            }


            return false;

        } catch (error) {

            console.error(
                "Token refresh error:",
                error
            );

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
        localStorage.getItem(
            "refreshToken"
        );


    // ----------------------------------------------------------
    // NO AUTH DATA
    // ----------------------------------------------------------

    if (
        !token ||
        !refreshToken
    ) {
        return false;
    }


    try {

        // ------------------------------------------------------
        // DECODE ACCESS TOKEN
        // ------------------------------------------------------

        const payload =
            decodeJWT(token);


        // ------------------------------------------------------
        // TOKEN CANNOT BE DECODED
        // ------------------------------------------------------

        if (
            !payload ||
            !payload.exp
        ) {

            console.warn(
                "Access token cannot be decoded. Refreshing..."
            );

            return await refreshAccessToken();
        }


        // ------------------------------------------------------
        // CALCULATE EXPIRATION
        // ------------------------------------------------------

        const expirationTime =
            payload.exp * 1000;

        const currentTime =
            Date.now();


        // ------------------------------------------------------
        // TOKEN STILL VALID
        // ------------------------------------------------------

        if (
            expirationTime -
                currentTime >
            ACCESS_TOKEN_REFRESH_BUFFER
        ) {

            return true;
        }


        // ------------------------------------------------------
        // TOKEN EXPIRED OR CLOSE TO EXPIRING
        // ------------------------------------------------------

        console.log(
            "Access token expired or about to expire. Refreshing..."
        );


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

    // ----------------------------------------------------------
    // PREVENT MULTIPLE WATCHERS
    // ----------------------------------------------------------

    if (refreshWatcherStarted) {
        return;
    }


    refreshWatcherStarted = true;


    // ----------------------------------------------------------
    // CHECK IMMEDIATELY
    // ----------------------------------------------------------

    ensureValidAccessToken()
        .catch((error) => {

            console.error(
                "Initial token check failed:",
                error
            );

        });


    // ----------------------------------------------------------
    // CHECK EVERY 30 SECONDS
    // ----------------------------------------------------------

    const intervalId =
        setInterval(
            async () => {

                const token =
                    localStorage.getItem(
                        "token"
                    );

                const refreshToken =
                    localStorage.getItem(
                        "refreshToken"
                    );


                // ----------------------------------------------
                // NO ACTIVE SESSION
                // ----------------------------------------------

                if (
                    !token ||
                    !refreshToken
                ) {
                    return;
                }


                // ----------------------------------------------
                // CHECK TOKEN
                // ----------------------------------------------

                const valid =
                    await ensureValidAccessToken();


                // ----------------------------------------------
                // REFRESH FAILED
                // ----------------------------------------------

                if (!valid) {

                    console.warn(
                        "Token refresh check failed. Keeping current session."
                    );

                    return;
                }

            },
            REFRESH_CHECK_INTERVAL
        );


    // ----------------------------------------------------------
    // STORE INTERVAL
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

        // ------------------------------------------------------
        // TELL BACKEND TO LOG OUT
        // ------------------------------------------------------

        if (refreshToken) {

            await fetch(
                `${API_BASE}/api/auth/logout`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        refreshToken,
                    }),
                }
            );
        }

    } catch (error) {

        console.error(
            "Logout request failed:",
            error
        );

    } finally {

        // ------------------------------------------------------
        // STOP REFRESH WATCHER
        // ------------------------------------------------------

        stopTokenRefreshWatcher();


        // ------------------------------------------------------
        // CLEAR LOCAL AUTH DATA
        // ------------------------------------------------------

        clearAuthData();
    }
}