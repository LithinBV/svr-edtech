import { useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL;


// ==================================================
// ACTIVITY TRACKING SETTINGS
// ==================================================

// Send activity to backend at most once every minute.
const ACTIVITY_UPDATE_INTERVAL = 60 * 1000;


// ==================================================
// USER ACTIVITY HOOK
// ==================================================

const useUserActivity = () => {

    const lastSentTime = useRef(0);


    useEffect(() => {

        // ==================================================
        // GET ACCESS TOKEN
        // ==================================================

        const getAccessToken = () => {

            return (
                localStorage.getItem("token") ||
                localStorage.getItem("accessToken")
            );
        };


        // ==================================================
        // SEND ACTIVITY
        // ==================================================

        const sendActivity = async () => {

            const token =
                getAccessToken();

            // No logged-in user
            if (!token) {
                return;
            }


            const now =
                Date.now();


            // ----------------------------------------------
            // THROTTLE REQUESTS
            // ----------------------------------------------

            if (
                now - lastSentTime.current <
                ACTIVITY_UPDATE_INTERVAL
            ) {
                return;
            }


            lastSentTime.current =
                now;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/users/activity`,
                        {
                            method: "POST",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                // ------------------------------------------
                // TOKEN / AUTH FAILURE
                // ------------------------------------------

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    console.warn(
                        "Activity request was rejected."
                    );
                }

            } catch (error) {

                console.error(
                    "Activity update error:",
                    error
                );
            }
        };


        // ==================================================
        // MARK INACTIVE WHEN APPLICATION CLOSES
        // ==================================================

        const markInactiveOnClose = () => {

            const refreshToken =
                localStorage.getItem(
                    "refreshToken"
                );


            if (!refreshToken) {
                return;
            }


            try {

                const blob =
                    new Blob(
                        [
                            JSON.stringify({
                                refreshToken
                            })
                        ],
                        {
                            type:
                                "application/json"
                        }
                    );


                navigator.sendBeacon(
                    `${API_URL}/api/auth/logout`    ,
                    blob
                );

            } catch (error) {

                console.error(
                    "Unable to mark user inactive:",
                    error
                );
            }
        };


        // ==================================================
        // USER ACTIVITY EVENTS
        // ==================================================

        const activityEvents = [

            "mousemove",

            "mousedown",

            "keydown",

            "scroll",

            "click",

            "touchstart",

            "pointerdown"
        ];


        // ==================================================
        // REGISTER ACTIVITY EVENTS
        // ==================================================

        activityEvents.forEach(
            (eventName) => {

                window.addEventListener(
                    eventName,
                    sendActivity,
                    {
                        passive: true
                    }
                );
            }
        );


        // ==================================================
        // INITIAL ACTIVITY
        // ==================================================

        sendActivity();


        // ==================================================
        // PAGE / BROWSER CLOSE
        // ==================================================

        window.addEventListener(
            "pagehide",
            markInactiveOnClose
        );


        // ==================================================
        // TAB BECOMES VISIBLE AGAIN
        // ==================================================

        const handleVisibilityChange = () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                sendActivity();
            }
        };


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        // ==================================================
        // CLEANUP
        // ==================================================

        return () => {

            activityEvents.forEach(
                (eventName) => {

                    window.removeEventListener(
                        eventName,
                        sendActivity
                    );
                }
            );


            window.removeEventListener(
                "pagehide",
                markInactiveOnClose
            );


            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };

    }, []);
};


export default useUserActivity;