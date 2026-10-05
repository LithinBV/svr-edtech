import React, {
    useEffect,
    useState,
} from "react";

import {
    Navigate,
    useLocation,
} from "react-router-dom";

import {
    ensureValidAccessToken,
    getUserType,
    isLoggedIn,
    startTokenRefreshWatcher,
} from "../utils/auth.js";


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({
    allowedRoles = [],
    children,
}) {

    const location = useLocation();

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    const [authenticated, setAuthenticated] =
        useState(false);


    // ========================================================
    // AUTHENTICATION CHECK
    // ========================================================

    useEffect(() => {

        let mounted = true;

        const checkAuthentication = async () => {

            try {

                // ------------------------------------------------
                // CHECK LOGIN
                // ------------------------------------------------

                if (!isLoggedIn()) {

                    if (mounted) {

                        setAuthenticated(false);
                        setCheckingAuth(false);

                    }

                    return;
                }


                // ------------------------------------------------
                // VALIDATE / REFRESH TOKEN
                // ------------------------------------------------

                const valid =
                    await ensureValidAccessToken();


                if (!mounted) {
                    return;
                }


                if (!valid) {

                    setAuthenticated(false);
                    setCheckingAuth(false);

                    return;
                }


                // ------------------------------------------------
                // GET USER ROLE
                // ------------------------------------------------

                const userType =
                    String(
                        getUserType() || ""
                    )
                        .trim()
                        .toUpperCase()
                        .replace(/[\s-]+/g, "_");


                // ------------------------------------------------
                // ROLE CHECK
                // ------------------------------------------------

                const normalizedAllowedRoles =
                    allowedRoles.map(
                        (role) =>
                            String(role || "")
                                .trim()
                                .toUpperCase()
                                .replace(/[\s-]+/g, "_")
                    );


                if (
                    normalizedAllowedRoles.length > 0 &&
                    !normalizedAllowedRoles.includes(userType)
                ) {

                    console.warn(
                        "ProtectedRoute: Role not allowed",
                        {
                            userType,
                            allowedRoles:
                                normalizedAllowedRoles,
                        }
                    );

                    setAuthenticated(false);
                    setCheckingAuth(false);

                    return;
                }


                // ------------------------------------------------
                // START TOKEN REFRESH
                // ------------------------------------------------

                startTokenRefreshWatcher();


                // ------------------------------------------------
                // AUTHENTICATED
                // ------------------------------------------------

                setAuthenticated(true);
                setCheckingAuth(false);

            } catch (error) {

                console.error(
                    "ProtectedRoute authentication error:",
                    error
                );

                if (mounted) {

                    setAuthenticated(false);
                    setCheckingAuth(false);

                }

            }

        };


        checkAuthentication();


        return () => {

            mounted = false;

        };

    }, [JSON.stringify(allowedRoles)]);


    // ========================================================
    // CHECKING AUTHENTICATION
    // ========================================================

    if (checkingAuth) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                "
            >

                <div className="text-center">

                    <div
                        className="
                            w-10
                            h-10
                            border-4
                            border-gray-300
                            border-t-[#00323F]
                            rounded-full
                            animate-spin
                            mx-auto
                        "
                    />

                    <p
                        className="
                            mt-4
                            text-sm
                            text-gray-500
                        "
                    >
                        Checking authentication...
                    </p>

                </div>

            </div>

        );
    }


    // ========================================================
    // NOT AUTHENTICATED
    // ========================================================

    if (!authenticated) {

        return (

            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
            />

        );
    }


    // ========================================================
    // AUTHENTICATED
    // ========================================================

    return children;
}


export default ProtectedRoute;