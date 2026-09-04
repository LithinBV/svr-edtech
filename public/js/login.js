// ============================================================
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("adminLoginForm");

const otpForm =
    document.getElementById("otpForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const otpInput =
    document.getElementById("otp");

const loginButton =
    document.getElementById("loginButton");

const verifyOtpButton =
    document.getElementById("verifyOtpButton");

const resendOtpButton =
    document.getElementById("resendOtpButton");

const resendCountdown =
    document.getElementById("resendCountdown");

const loginMessage =
    document.getElementById("loginMessage");

const otpMessage =
    document.getElementById("otpMessage");

const otpEmail =
    document.getElementById("otpEmail");

const backToLogin =
    document.getElementById("backToLogin");

const loginHeading =
    document.getElementById("loginHeading");

const socialSection =
    document.getElementById("socialSection");

const googleLogin =
    document.getElementById("googleLogin");

const microsoftLogin =
    document.getElementById("microsoftLogin");

const forgotPassword =
    document.getElementById("forgotPassword");


// ============================================================
// STORE EMAIL FOR OTP
// ============================================================

let loginEmail = "";


// ============================================================
// RESEND TIMER
// ============================================================

let resendTimer = null;

let resendSecondsRemaining = 0;


// ============================================================
// GOOGLE CLIENT ID
// ============================================================

const GOOGLE_CLIENT_ID =
    "156975952914-brbedulqojpg63ns1f12smic32ijll47.apps.googleusercontent.com";


// ============================================================
// LOGIN FORM
// ============================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ------------------------------------------
        // Get values
        // ------------------------------------------

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        // ------------------------------------------
        // Clear old message
        // ------------------------------------------

        showMessage(
            loginMessage,
            "",
            false
        );


        // ------------------------------------------
        // Disable button
        // ------------------------------------------

        loginButton.disabled =
            true;

        loginButton.textContent =
            "Sending OTP...";


        try {

            // --------------------------------------
            // Send login request
            // --------------------------------------

            const response =
                await fetch(
                    "/api/auth/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            // --------------------------------------
            // Backend error
            // --------------------------------------

            if (!response.ok) {

                showMessage(
                    loginMessage,
                    data.message ||
                        "Login failed.",
                    true
                );

                return;
            }


            // --------------------------------------
            // Save email
            // --------------------------------------

            loginEmail =
                data.email || email;


            // --------------------------------------
            // Show OTP
            // --------------------------------------

            showOtpSection();


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                loginMessage,
                "Unable to connect to the server.",
                true
            );


        } finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";
        }

    }
);


// ============================================================
// SHOW OTP SECTION
// ============================================================

function showOtpSection() {

    // ------------------------------------------
    // Hide login form
    // ------------------------------------------

    loginForm.classList.add(
        "hidden"
    );


    // ------------------------------------------
    // Hide social login
    // ------------------------------------------

    socialSection.classList.add(
        "hidden"
    );


    // ------------------------------------------
    // Change heading
    // ------------------------------------------

    loginHeading.innerHTML = `

        <h1
            class="text-3xl sm:text-4xl
            font-bold text-[#00323F]"
        >
            Verify OTP
        </h1>

        <p
            class="mt-2 text-sm text-gray-500"
        >
            Complete your secure admin login
        </p>

    `;


    // ------------------------------------------
    // Display email
    // ------------------------------------------

    otpEmail.textContent =
        loginEmail;


    // ------------------------------------------
    // Show OTP form
    // ------------------------------------------

    otpForm.classList.remove(
        "hidden"
    );


    // ------------------------------------------
    // Clear OTP
    // ------------------------------------------

    otpInput.value =
        "";


    // ------------------------------------------
    // Focus OTP
    // ------------------------------------------

    otpInput.focus();


    // ------------------------------------------
    // Start 60 second timer
    // ------------------------------------------

    startResendCountdown(60);
}


// ============================================================
// OTP FORM
// ============================================================

otpForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ------------------------------------------
        // Get OTP
        // ------------------------------------------

        const otp =
            otpInput.value.trim();


        // ------------------------------------------
        // Clear old message
        // ------------------------------------------

        showMessage(
            otpMessage,
            "",
            false
        );


        // ------------------------------------------
        // Check OTP length
        // ------------------------------------------

        if (!/^\d{6}$/.test(otp)) {

            showMessage(
                otpMessage,
                "Please enter a valid 6-digit OTP.",
                true
            );

            return;
        }


        // ------------------------------------------
        // Disable button
        // ------------------------------------------

        verifyOtpButton.disabled =
            true;

        verifyOtpButton.textContent =
            "Verifying...";


        try {

            // --------------------------------------
            // Send OTP to backend
            // --------------------------------------

            const response =
                await fetch(
                    "/api/auth/verify-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email:
                                    loginEmail,

                                otp
                            })
                    }
                );


            const data =
                await response.json();


            // --------------------------------------
            // Backend error
            // --------------------------------------

            if (!response.ok) {

                showMessage(
                    otpMessage,
                    data.message ||
                        "Invalid OTP.",
                    true
                );

                return;
            }


            // --------------------------------------
            // OTP SUCCESS
            // --------------------------------------

            showMessage(
                otpMessage,
                "OTP verified successfully.",
                false
            );


            // --------------------------------------
            // Store authentication token
            // --------------------------------------

            localStorage.setItem(
                "token",
                data.token
            );


            // --------------------------------------
            // Store user type
            // --------------------------------------

            localStorage.setItem(
                "userType",
                data.userType
            );


            // --------------------------------------
            // Stop resend timer
            // --------------------------------------

            stopResendCountdown();


            // --------------------------------------
            // Go to dashboard
            // --------------------------------------

            window.location.href =
                "/pages/admin-dashboard.html";


        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );


            showMessage(
                otpMessage,
                "Unable to connect to the server.",
                true
            );


        } finally {

            verifyOtpButton.disabled =
                false;

            verifyOtpButton.textContent =
                "Verify OTP";
        }

    }
);


// ============================================================
// RESEND OTP
// ============================================================

resendOtpButton.addEventListener(
    "click",
    async function () {

        // ------------------------------------------
        // Prevent clicking during countdown
        // ------------------------------------------

        if (
            resendSecondsRemaining > 0
        ) {
            return;
        }


        // ------------------------------------------
        // Validate email
        // ------------------------------------------

        if (!loginEmail) {

            showMessage(
                otpMessage,
                "Please login again.",
                true
            );

            return;
        }


        // ------------------------------------------
        // Disable button
        // ------------------------------------------

        resendOtpButton.disabled =
            true;

        resendOtpButton.textContent =
            "Sending...";


        showMessage(
            otpMessage,
            "",
            false
        );


        try {

            // --------------------------------------
            // Send resend request
            // --------------------------------------

            const response =
                await fetch(
                    "/api/auth/resend-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email:
                                    loginEmail
                            })
                    }
                );


            const data =
                await response.json();


            // --------------------------------------
            // Backend error
            // --------------------------------------

            if (!response.ok) {

                showMessage(
                    otpMessage,
                    data.message ||
                        "Unable to resend OTP.",
                    true
                );


                // If backend tells us
                // remaining seconds,
                // restart countdown.

                if (
                    data.remainingSeconds
                ) {

                    startResendCountdown(
                        data.remainingSeconds
                    );

                } else {

                    resendOtpButton.disabled =
                        false;

                    resendOtpButton.textContent =
                        "Resend OTP";
                }


                return;
            }


            // --------------------------------------
            // Success
            // --------------------------------------

            showMessage(
                otpMessage,
                "A new OTP has been sent to your email.",
                false
            );


            // --------------------------------------
            // Clear old OTP
            // --------------------------------------

            otpInput.value =
                "";


            otpInput.focus();


            // --------------------------------------
            // Start new cooldown
            // --------------------------------------

            startResendCountdown(60);


        } catch (error) {

            console.error(
                "Resend OTP error:",
                error
            );


            showMessage(
                otpMessage,
                "Unable to connect to the server.",
                true
            );


            resendOtpButton.disabled =
                false;

            resendOtpButton.textContent =
                "Resend OTP";

        }

    }
);


// ============================================================
// START RESEND COUNTDOWN
// ============================================================

function startResendCountdown(
    seconds
) {

    // ------------------------------------------
    // Stop old timer
    // ------------------------------------------

    stopResendCountdown();


    resendSecondsRemaining =
        Math.max(
            0,
            Number(seconds)
        );


    // ------------------------------------------
    // Update immediately
    // ------------------------------------------

    updateResendCountdown();


    // ------------------------------------------
    // Already finished
    // ------------------------------------------

    if (
        resendSecondsRemaining <= 0
    ) {

        return;
    }


    // ------------------------------------------
    // Start timer
    // ------------------------------------------

    resendTimer =
        setInterval(
            function () {

                resendSecondsRemaining -=
                    1;


                updateResendCountdown();


                if (
                    resendSecondsRemaining <=
                    0
                ) {

                    stopResendCountdown();

                    resendOtpButton.disabled =
                        false;

                    resendOtpButton.textContent =
                        "Resend OTP";
                }

            },
            1000
        );
}


// ============================================================
// UPDATE RESEND COUNTDOWN UI
// ============================================================

function updateResendCountdown() {

    if (
        resendSecondsRemaining > 0
    ) {

        resendOtpButton.disabled =
            true;

        resendOtpButton.textContent =
            "Resend OTP";


        resendCountdown.textContent =
            `You can resend OTP in ${resendSecondsRemaining}s`;


        resendCountdown.classList.remove(
            "hidden"
        );

    } else {

        resendOtpButton.disabled =
            false;

        resendOtpButton.textContent =
            "Resend OTP";


        resendCountdown.textContent =
            "";


        resendCountdown.classList.add(
            "hidden"
        );
    }
}


// ============================================================
// STOP RESEND COUNTDOWN
// ============================================================

function stopResendCountdown() {

    if (resendTimer) {

        clearInterval(
            resendTimer
        );

        resendTimer =
            null;
    }


    resendSecondsRemaining =
        0;
}


// ============================================================
// BACK TO LOGIN
// ============================================================

backToLogin.addEventListener(
    "click",
    function () {

        // ------------------------------------------
        // Stop countdown
        // ------------------------------------------

        stopResendCountdown();


        // ------------------------------------------
        // Hide OTP
        // ------------------------------------------

        otpForm.classList.add(
            "hidden"
        );


        // ------------------------------------------
        // Show login
        // ------------------------------------------

        loginForm.classList.remove(
            "hidden"
        );


        // ------------------------------------------
        // Show social buttons
        // ------------------------------------------

        socialSection.classList.remove(
            "hidden"
        );


        // ------------------------------------------
        // Restore heading
        // ------------------------------------------

        loginHeading.innerHTML = `

            <h1
                class="text-3xl sm:text-4xl
                font-bold text-[#00323F]"
            >
                Welcome Back
            </h1>

            <p
                class="mt-2 text-sm text-gray-500"
            >
                Sign in to your admin account
            </p>

        `;


        // ------------------------------------------
        // Clear OTP
        // ------------------------------------------

        otpInput.value =
            "";


        // ------------------------------------------
        // Clear messages
        // ------------------------------------------

        showMessage(
            otpMessage,
            "",
            false
        );

    }
);


// ============================================================
// ONLY ALLOW NUMBERS IN OTP
// ============================================================

otpInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value.replace(
                /\D/g,
                ""
            );

    }
);


// ============================================================
// MESSAGE FUNCTION
// ============================================================

function showMessage(
    element,
    message,
    isError
) {

    if (!message) {

        element.textContent =
            "";

        element.classList.add(
            "hidden"
        );

        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );


    if (isError) {

        element.classList.remove(
            "text-green-600"
        );

        element.classList.add(
            "text-red-600"
        );

    } else {

        element.classList.remove(
            "text-red-600"
        );

        element.classList.add(
            "text-green-600"
        );

    }

}


// ============================================================
// GOOGLE LOGIN
// ============================================================

function initializeGoogleLogin() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.error(
            "Google Identity Services has not loaded."
        );

        return;
    }


    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleResponse

    });

}


// ============================================================
// GOOGLE RESPONSE
// ============================================================

async function handleGoogleResponse(
    response
) {

    try {

        if (
            !response ||
            !response.credential
        ) {

            showMessage(
                loginMessage,
                "Google authentication failed.",
                true
            );

            return;
        }


        // ------------------------------------------
        // Disable Google button
        // ------------------------------------------

        googleLogin.disabled =
            true;

        googleLogin.textContent =
            "Signing in with Google...";


        showMessage(
            loginMessage,
            "",
            false
        );


        // ------------------------------------------
        // Send Google credential
        // ------------------------------------------

        const backendResponse =
            await fetch(
                "/api/auth/google-login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            credential:
                                response.credential

                        })
                }
            );


        const data =
            await backendResponse.json();


        // ------------------------------------------
        // Backend error
        // ------------------------------------------

        if (!backendResponse.ok) {

            showMessage(
                loginMessage,
                data.message ||
                    "Google login failed.",
                true
            );

            return;
        }


        // ------------------------------------------
        // Save email for OTP
        // ------------------------------------------

        loginEmail =
            data.email;


        // ------------------------------------------
        // Show OTP section
        // ------------------------------------------

        showOtpSection();


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        showMessage(
            loginMessage,
            "Unable to connect to the server.",
            true
        );


    } finally {

        googleLogin.disabled =
            false;

        googleLogin.textContent =
            "Continue with Google";
    }

}


// ============================================================
// GOOGLE BUTTON
// ============================================================

googleLogin.addEventListener(
    "click",
    function () {

        if (
            typeof google === "undefined" ||
            !google.accounts ||
            !google.accounts.id
        ) {

            showMessage(
                loginMessage,
                "Google Login is still loading. Please try again.",
                true
            );

            return;
        }


        // ------------------------------------------
        // Open Google's account selection
        // ------------------------------------------

        google.accounts.id.prompt();

    }
);


// ============================================================
// MICROSOFT LOGIN
// ============================================================

microsoftLogin.addEventListener(
    "click",
    function () {

        alert(
            "Microsoft login will be implemented later."
        );

    }
);


// ============================================================
// FORGOT PASSWORD
// ============================================================

forgotPassword.addEventListener(
    "click",
    function () {

        window.location.href =
            "forgot-password.html";

    }
);


// ============================================================
// INITIALIZE GOOGLE
// ============================================================

initializeGoogleLogin();