// ============================================================
// ELEMENTS
// ============================================================

// Step 1 section
const forgotPasswordSection =
    document.getElementById("forgotPasswordSection");

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

// Step 2 section
const resetPasswordSection =
    document.getElementById("resetPasswordSection");

const resetPasswordForm =
    document.getElementById("resetPasswordForm");


// Email
const emailInput =
    document.getElementById("email");


// Reset email display
const resetEmailDisplay =
    document.getElementById("resetEmailDisplay");


// OTP
const resetOtpInput =
    document.getElementById("resetOtp");


// Passwords
const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");


// Messages
const forgotPasswordMessage =
    document.getElementById("forgotPasswordMessage");

const resetPasswordMessage =
    document.getElementById("resetPasswordMessage");


// Buttons
const sendResetOtpButton =
    document.getElementById("sendResetOtpButton");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");


// ============================================================
// STORE EMAIL
// ============================================================

let resetEmail = "";


// ============================================================
// SEND RESET OTP
// ============================================================

forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get email
        const email =
            emailInput.value.trim();


        // Validate email
        if (!email) {

            forgotPasswordMessage.textContent =
                "Please enter your email.";

            return;
        }


        // Clear old message
        forgotPasswordMessage.textContent = "";


        // Disable button
        sendResetOtpButton.disabled = true;

        sendResetOtpButton.textContent =
            "Sending...";


        try {

            // Send email to backend
            const response =
                await fetch(
                    "/api/auth/forgot-password",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email
                        })

                    }
                );


            const data =
                await response.json();


            // Backend error
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to send OTP."
                );

            }


            // Save email
            resetEmail =
                data.email || email;


            // Display email
            resetEmailDisplay.textContent =
                resetEmail;


            // ====================================================
            // CHANGE FROM STEP 1 TO STEP 2
            // ====================================================

            forgotPasswordSection.classList.add(
                "hidden"
            );

            resetPasswordSection.classList.remove(
                "hidden"
            );


            // Focus OTP
            resetOtpInput.focus();


        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );


            forgotPasswordMessage.textContent =
                error.message;


            // Enable button again
            sendResetOtpButton.disabled =
                false;

            sendResetOtpButton.textContent =
                "Send OTP";

        }

    }
);


// ============================================================
// OTP INPUT
// ============================================================

resetOtpInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


// ============================================================
// RESET PASSWORD
// ============================================================

resetPasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Get values
        const otp =
            resetOtpInput.value.trim();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // Clear old message
        resetPasswordMessage.textContent = "";


        // ====================================================
        // VALIDATE OTP
        // ====================================================

        if (!/^\d{6}$/.test(otp)) {

            resetPasswordMessage.textContent =
                "Please enter a valid 6-digit OTP.";

            return;
        }


        // ====================================================
        // VALIDATE PASSWORD
        // ====================================================

        if (newPassword.length < 8) {

            resetPasswordMessage.textContent =
                "Password must be at least 8 characters.";

            return;
        }


        // ====================================================
        // CONFIRM PASSWORD
        // ====================================================

        if (
            newPassword !==
            confirmPassword
        ) {

            resetPasswordMessage.textContent =
                "Passwords do not match.";

            return;
        }


        // Disable button
        resetPasswordButton.disabled =
            true;

        resetPasswordButton.textContent =
            "Resetting...";


        try {

            // Send OTP + new password
            const response =
                await fetch(
                    "/api/auth/reset-password",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email: resetEmail,

                            otp: otp,

                            newPassword:
                                newPassword

                        })

                    }
                );


            const data =
                await response.json();


            // Backend error
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Password reset failed."
                );

            }


            // ====================================================
            // SUCCESS
            // ====================================================

            resetPasswordMessage.textContent =
                "Password reset successfully! Redirecting to login...";


            resetPasswordMessage.classList.remove(
                "text-red-500"
            );

            resetPasswordMessage.classList.add(
                "text-green-600"
            );


            resetPasswordButton.textContent =
                "Password Reset";


            // Redirect to login
            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                2000
            );


        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );


            resetPasswordMessage.textContent =
                error.message;


            resetPasswordButton.disabled =
                false;

            resetPasswordButton.textContent =
                "Reset Password";

        }

    }
);