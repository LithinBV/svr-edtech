const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const SuperAdmin = require("../models/superAdmin");

const {
    generateOTP,
    hashOTP
} = require("../utils/otp");

const {
    sendOTPEmail,
    sendPasswordResetOTPEmail
} = require("../utils/email");


// ==================================================
// GOOGLE CLIENT
// ==================================================

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);


// ==================================================
// OTP SETTINGS
// ==================================================

const OTP_EXPIRY_MINUTES = 10;

const OTP_RESEND_COOLDOWN_SECONDS = 60;

const OTP_DAILY_LIMIT = 5;

const OTP_MAX_ATTEMPTS = 5;


// ==================================================
// HELPER
// CHECK / RESET DAILY OTP COUNTER
// ==================================================

function prepareDailyOTPCount(superAdmin) {

    const now = new Date();

    // If there is no reset date,
    // initialize it.
    if (!superAdmin.otpDailyResetAt) {

        const tomorrow = new Date();

        tomorrow.setHours(
            24,
            0,
            0,
            0
        );

        superAdmin.otpDailyResetAt =
            tomorrow;

        superAdmin.otpDailyCount = 0;

        return;
    }


    // Reset counter if the reset time has passed
    if (
        now >=
        superAdmin.otpDailyResetAt
    ) {

        const tomorrow = new Date();

        tomorrow.setHours(
            24,
            0,
            0,
            0
        );

        superAdmin.otpDailyResetAt =
            tomorrow;

        superAdmin.otpDailyCount = 0;
    }
}


// ==================================================
// HELPER
// CHECK OTP SEND LIMIT
// ==================================================

function getOTPLimitError(superAdmin) {

    prepareDailyOTPCount(superAdmin);

    const now = Date.now();


    // ------------------------------------------
    // Check 60 second cooldown
    // ------------------------------------------

    if (superAdmin.otpLastSentAt) {

        const secondsSinceLastOTP =
            Math.floor(
                (
                    now -
                    new Date(
                        superAdmin.otpLastSentAt
                    ).getTime()
                ) / 1000
            );


        if (
            secondsSinceLastOTP <
            OTP_RESEND_COOLDOWN_SECONDS
        ) {

            const remainingSeconds =
                OTP_RESEND_COOLDOWN_SECONDS -
                secondsSinceLastOTP;


            return {
                allowed: false,
                status: 429,
                message:
                    `Please wait ${remainingSeconds} seconds before requesting another OTP.`,
                remainingSeconds
            };
        }
    }


    // ------------------------------------------
    // Check daily limit
    // ------------------------------------------

    if (
        superAdmin.otpDailyCount >=
        OTP_DAILY_LIMIT
    ) {

        return {
            allowed: false,
            status: 429,
            message:
                "Daily OTP limit reached. Please try again tomorrow."
        };
    }


    return {
        allowed: true
    };
}


// ==================================================
// HELPER
// GENERATE AND SEND LOGIN OTP
// ==================================================

async function generateAndSendLoginOTP(
    superAdmin
) {

    // ------------------------------------------
    // Check limits
    // ------------------------------------------

    const limitCheck =
        getOTPLimitError(
            superAdmin
        );


    if (!limitCheck.allowed) {

        const error =
            new Error(
                limitCheck.message
            );

        error.status =
            limitCheck.status;

        error.remainingSeconds =
            limitCheck.remainingSeconds;

        throw error;
    }


    // ------------------------------------------
    // Generate OTP
    // ------------------------------------------

    const otp =
        generateOTP();


    const otpHash =
        hashOTP(otp);


    // ------------------------------------------
    // OTP expires in 10 minutes
    // ------------------------------------------

    const expiresAt =
        new Date(
            Date.now() +
            OTP_EXPIRY_MINUTES *
            60 *
            1000
        );


    // ------------------------------------------
    // Save OTP
    // ------------------------------------------

    superAdmin.otpHash =
        otpHash;

    superAdmin.otpExpiresAt =
        expiresAt;

    superAdmin.otpAttempts =
        0;


    // ------------------------------------------
    // Update send tracking
    // ------------------------------------------

    superAdmin.otpLastSentAt =
        new Date();

    superAdmin.otpDailyCount +=
        1;


    await superAdmin.save();


    // ------------------------------------------
    // Send email
    // ------------------------------------------

    try {

        await sendOTPEmail(
            superAdmin.email,
            otp
        );

    } catch (emailError) {

        // If email fails, remove OTP
        // but keep the send counter.
        // This prevents abuse by repeatedly
        // triggering failed emails.

        superAdmin.otpHash =
            null;

        superAdmin.otpExpiresAt =
            null;

        superAdmin.otpAttempts =
            0;

        await superAdmin.save();

        throw emailError;
    }
}


// ==================================================
// SUPER ADMIN LOGIN
// ==================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ------------------------------------------
        // Validate input
        // ------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });
        }


        // ------------------------------------------
        // Find Super Admin
        // ------------------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email:
                    email.toLowerCase()

            });


        if (!superAdmin) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });
        }


        // ------------------------------------------
        // Check password
        // ------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                superAdmin.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });
        }


        // ------------------------------------------
        // Generate and send OTP
        // ------------------------------------------

        try {

            await generateAndSendLoginOTP(
                superAdmin
            );

        } catch (otpError) {

            return res.status(
                otpError.status || 500
            ).json({

                success: false,

                message:
                    otpError.message ||
                    "Unable to send OTP",

                remainingSeconds:
                    otpError.remainingSeconds
            });
        }


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.json({

            success: true,

            message:
                "OTP sent to your email",

            email:
                superAdmin.email

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });
    }
};


// ==================================================
// GOOGLE LOGIN
// ==================================================

const googleLogin = async (req, res) => {

    try {

        const {
            credential
        } = req.body;


        // ------------------------------------------
        // Validate credential
        // ------------------------------------------

        if (!credential) {

            return res.status(400).json({

                success: false,

                message:
                    "Google authentication credential is required."

            });
        }


        // ------------------------------------------
        // Verify Google ID token
        // ------------------------------------------

        const ticket =
            await googleClient.verifyIdToken({

                idToken:
                    credential,

                audience:
                    process.env.GOOGLE_CLIENT_ID

            });


        const payload =
            ticket.getPayload();


        if (!payload) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid Google account."

            });
        }


        const googleId =
            payload.sub;


        const email =
            payload.email?.toLowerCase();


        const emailVerified =
            payload.email_verified;


        // ------------------------------------------
        // Validate Google account
        // ------------------------------------------

        if (!googleId || !email) {

            return res.status(401).json({

                success: false,

                message:
                    "Unable to get Google account information."

            });
        }


        if (
            emailVerified !== true
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Google email is not verified."

            });
        }


        // ------------------------------------------
        // Find Master Admin
        // ------------------------------------------

        let superAdmin =
            await SuperAdmin.findOne({

                googleId

            });


        // ------------------------------------------
        // If Google account isn't linked,
        // find by email
        // ------------------------------------------

        if (!superAdmin) {

            superAdmin =
                await SuperAdmin.findOne({

                    email

                });


            if (!superAdmin) {

                return res.status(403).json({

                    success: false,

                    message:
                        "This Google account is not authorized as a Master Admin."

                });
            }


            // --------------------------------------
            // Link Google account
            // --------------------------------------

            superAdmin.googleId =
                googleId;

            await superAdmin.save();
        }


        // ------------------------------------------
        // Generate and send OTP
        // ------------------------------------------

        try {

            await generateAndSendLoginOTP(
                superAdmin
            );

        } catch (otpError) {

            return res.status(
                otpError.status || 500
            ).json({

                success: false,

                message:
                    otpError.message ||
                    "Unable to send OTP",

                remainingSeconds:
                    otpError.remainingSeconds
            });
        }


        // ------------------------------------------
        // Return email for OTP screen
        // ------------------------------------------

        return res.json({

            success: true,

            message:
                "Google login successful. OTP sent to your email.",

            email:
                superAdmin.email

        });


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Google authentication failed."

        });
    }
};


// ==================================================
// RESEND LOGIN OTP
// ==================================================

const resendOTP = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        // ------------------------------------------
        // Validate email
        // ------------------------------------------

        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });
        }


        // ------------------------------------------
        // Find Super Admin
        // ------------------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email:
                    email.toLowerCase()

            });


        if (!superAdmin) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid request"

            });
        }


        // ------------------------------------------
        // Generate and send new OTP
        // ------------------------------------------

        try {

            await generateAndSendLoginOTP(
                superAdmin
            );

        } catch (otpError) {

            return res.status(
                otpError.status || 500
            ).json({

                success: false,

                message:
                    otpError.message ||
                    "Unable to resend OTP",

                remainingSeconds:
                    otpError.remainingSeconds

            });
        }


        // ------------------------------------------
        // Success
        // ------------------------------------------

        return res.json({

            success: true,

            message:
                "A new OTP has been sent to your email.",

            expiresIn:
                OTP_EXPIRY_MINUTES * 60

        });


    } catch (error) {

        console.error(
            "Resend OTP error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });
    }
};


// ==================================================
// VERIFY LOGIN OTP
// ==================================================

const verifyOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        // ------------------------------------------
        // Validate input
        // ------------------------------------------

        if (!email || !otp) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and OTP are required"

            });
        }


        // ------------------------------------------
        // Find Super Admin
        // ------------------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email:
                    email.toLowerCase()

            });


        if (!superAdmin) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid request"

            });
        }


        // ------------------------------------------
        // Check OTP exists
        // ------------------------------------------

        if (
            !superAdmin.otpHash ||
            !superAdmin.otpExpiresAt
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP not found. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Check expiry
        // ------------------------------------------

        if (
            new Date() >
            superAdmin.otpExpiresAt
        ) {

            superAdmin.otpHash =
                null;

            superAdmin.otpExpiresAt =
                null;

            superAdmin.otpAttempts =
                0;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Check attempts
        // ------------------------------------------

        if (
            superAdmin.otpAttempts >=
            OTP_MAX_ATTEMPTS
        ) {

            superAdmin.otpHash =
                null;

            superAdmin.otpExpiresAt =
                null;

            superAdmin.otpAttempts =
                0;

            await superAdmin.save();


            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Compare OTP
        // ------------------------------------------

        const submittedHash =
            hashOTP(otp);


        if (
            submittedHash !==
            superAdmin.otpHash
        ) {

            superAdmin.otpAttempts +=
                1;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP",

                attemptsRemaining:
                    Math.max(
                        0,
                        OTP_MAX_ATTEMPTS -
                        superAdmin.otpAttempts
                    )

            });
        }


        // ------------------------------------------
        // Clear OTP
        // ------------------------------------------

        superAdmin.otpHash =
            null;

        superAdmin.otpExpiresAt =
            null;

        superAdmin.otpAttempts =
            0;


        await superAdmin.save();


        // ------------------------------------------
        // Create JWT
        // ------------------------------------------

        const token =
            jwt.sign(

                {
                    userId:
                        superAdmin._id,

                    userType:
                        "SUPER_ADMIN"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "1h"
                }
            );


        // ------------------------------------------
        // Response
        // ------------------------------------------

        return res.json({

            success: true,

            message:
                "OTP verified successfully",

            token,

            userType:
                "SUPER_ADMIN"

        });


    } catch (error) {

        console.error(
            "OTP verification error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });
    }
};


// ==================================================
// FORGOT PASSWORD
// ==================================================

const forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });
        }


        const normalizedEmail =
            email.toLowerCase();


        // ------------------------------------------
        // Find Super Admin
        // ------------------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email:
                    normalizedEmail

            });


        // Don't reveal whether account exists

        if (!superAdmin) {

            return res.json({

                success: true,

                message:
                    "If an admin account exists for this email, a verification OTP has been sent."

            });
        }


        // ------------------------------------------
        // Generate reset OTP
        // ------------------------------------------

        const otp =
            generateOTP();


        const otpHash =
            hashOTP(otp);


        const expiresAt =
            new Date(
                Date.now() +
                5 *
                60 *
                1000
            );


        superAdmin.resetOtpHash =
            otpHash;

        superAdmin.resetOtpExpiresAt =
            expiresAt;

        superAdmin.resetOtpAttempts =
            0;


        await superAdmin.save();


        // ------------------------------------------
        // Send reset OTP
        // ------------------------------------------

        try {

            await sendPasswordResetOTPEmail(

                superAdmin.email,

                otp

            );

        } catch (emailError) {

            superAdmin.resetOtpHash =
                null;

            superAdmin.resetOtpExpiresAt =
                null;

            superAdmin.resetOtpAttempts =
                0;

            await superAdmin.save();

            throw emailError;
        }


        return res.json({

            success: true,

            message:
                "If an admin account exists for this email, a verification OTP has been sent.",

            email:
                superAdmin.email

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });
    }
};


// ==================================================
// RESET PASSWORD
// ==================================================

const resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;


        // ------------------------------------------
        // Validate input
        // ------------------------------------------

        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, OTP and new password are required"

            });
        }


        if (
            newPassword.length < 8
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 8 characters"

            });
        }


        // ------------------------------------------
        // Find Super Admin
        // ------------------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email:
                    email.toLowerCase()

            });


        if (!superAdmin) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid request"

            });
        }


        // ------------------------------------------
        // Check reset OTP
        // ------------------------------------------

        if (
            !superAdmin.resetOtpHash ||
            !superAdmin.resetOtpExpiresAt
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Reset OTP not found. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Check expiry
        // ------------------------------------------

        if (
            new Date() >
            superAdmin.resetOtpExpiresAt
        ) {

            superAdmin.resetOtpHash =
                null;

            superAdmin.resetOtpExpiresAt =
                null;

            superAdmin.resetOtpAttempts =
                0;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "Reset OTP has expired. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Check attempts
        // ------------------------------------------

        if (
            superAdmin.resetOtpAttempts >=
            5
        ) {

            superAdmin.resetOtpHash =
                null;

            superAdmin.resetOtpExpiresAt =
                null;

            superAdmin.resetOtpAttempts =
                0;

            await superAdmin.save();


            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Please request a new OTP."

            });
        }


        // ------------------------------------------
        // Compare OTP
        // ------------------------------------------

        const submittedHash =
            hashOTP(otp);


        if (
            submittedHash !==
            superAdmin.resetOtpHash
        ) {

            superAdmin.resetOtpAttempts +=
                1;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP"

            });
        }


        // ------------------------------------------
        // Hash new password
        // ------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );


        superAdmin.password =
            hashedPassword;


        // ------------------------------------------
        // Clear reset OTP
        // ------------------------------------------

        superAdmin.resetOtpHash =
            null;

        superAdmin.resetOtpExpiresAt =
            null;

        superAdmin.resetOtpAttempts =
            0;


        // Also invalidate pending login OTP

        superAdmin.otpHash =
            null;

        superAdmin.otpExpiresAt =
            null;

        superAdmin.otpAttempts =
            0;


        await superAdmin.save();


        return res.json({

            success: true,

            message:
                "Password reset successfully"

        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"

        });
    }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    login,

    googleLogin,

    verifyOTP,

    resendOTP,

    forgotPassword,

    resetPassword

};