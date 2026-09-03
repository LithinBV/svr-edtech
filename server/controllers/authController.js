const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
// SUPER ADMIN LOGIN
// ==================================================

const login = async (req, res) => {

    try {

        const { email, password } = req.body;


        // -------------------------------
        // Validate input
        // -------------------------------

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        // -------------------------------
        // Find Super Admin
        // -------------------------------

        const superAdmin = await SuperAdmin.findOne({
            email: email.toLowerCase()
        });


        if (!superAdmin) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // -------------------------------
        // Check password
        // -------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                superAdmin.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // -------------------------------
        // Generate OTP
        // -------------------------------

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        const expiresAt =
            new Date(Date.now() + 5 * 60 * 1000);


        superAdmin.otpHash = otpHash;

        superAdmin.otpExpiresAt = expiresAt;

        superAdmin.otpAttempts = 0;


        await superAdmin.save();


        // -------------------------------
        // Send OTP
        // -------------------------------

        try {

            await sendOTPEmail(
                superAdmin.email,
                otp
            );

        } catch (emailError) {

            superAdmin.otpHash = null;

            superAdmin.otpExpiresAt = null;

            superAdmin.otpAttempts = 0;

            await superAdmin.save();

            throw emailError;

        }


        return res.json({

            success: true,

            message: "OTP sent to your email",

            email: superAdmin.email

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error"

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


        if (!email || !otp) {

            return res.status(400).json({

                success: false,

                message: "Email and OTP are required"

            });

        }


        // -------------------------------
        // Find Super Admin
        // -------------------------------

        const superAdmin = await SuperAdmin.findOne({

            email: email.toLowerCase()

        });


        if (!superAdmin) {

            return res.status(401).json({

                success: false,

                message: "Invalid request"

            });

        }


        // -------------------------------
        // Check OTP exists
        // -------------------------------

        if (
            !superAdmin.otpHash ||
            !superAdmin.otpExpiresAt
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP not found. Please login again."

            });

        }


        // -------------------------------
        // Check expiry
        // -------------------------------

        if (
            new Date() >
            superAdmin.otpExpiresAt
        ) {

            superAdmin.otpHash = null;

            superAdmin.otpExpiresAt = null;

            superAdmin.otpAttempts = 0;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please login again."

            });

        }


        // -------------------------------
        // Check attempts
        // -------------------------------

        if (superAdmin.otpAttempts >= 5) {

            superAdmin.otpHash = null;

            superAdmin.otpExpiresAt = null;

            superAdmin.otpAttempts = 0;

            await superAdmin.save();


            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Please login again."

            });

        }


        // -------------------------------
        // Compare OTP
        // -------------------------------

        const submittedHash =
            hashOTP(otp);


        if (
            submittedHash !==
            superAdmin.otpHash
        ) {

            superAdmin.otpAttempts += 1;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message: "Invalid OTP"

            });

        }


        // -------------------------------
        // Clear OTP
        // -------------------------------

        superAdmin.otpHash = null;

        superAdmin.otpExpiresAt = null;

        superAdmin.otpAttempts = 0;


        await superAdmin.save();


        // -------------------------------
        // Create JWT
        // -------------------------------

        const token = jwt.sign(

            {
                userId: superAdmin._id,
                userType: "SUPER_ADMIN"
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1h"
            }

        );


        return res.json({

            success: true,

            message:
                "OTP verified successfully",

            token,

            userType: "SUPER_ADMIN"

        });


    } catch (error) {

        console.error(
            "OTP verification error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

};


// ==================================================
// FORGOT PASSWORD
// ==================================================

const forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message: "Email is required"

            });

        }


        const normalizedEmail =
            email.toLowerCase();


        // -------------------------------
        // Find Super Admin
        // -------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email: normalizedEmail

            });


        // Don't reveal whether account exists

        if (!superAdmin) {

            return res.json({

                success: true,

                message:
                    "If an admin account exists for this email, a verification OTP has been sent."

            });

        }


        // -------------------------------
        // Generate reset OTP
        // -------------------------------

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        const expiresAt =
            new Date(Date.now() + 5 * 60 * 1000);


        superAdmin.resetOtpHash = otpHash;

        superAdmin.resetOtpExpiresAt = expiresAt;

        superAdmin.resetOtpAttempts = 0;


        await superAdmin.save();


        // -------------------------------
        // Send reset OTP
        // -------------------------------

        try {

            await sendPasswordResetOTPEmail(

                superAdmin.email,

                otp

            );

        } catch (emailError) {

            superAdmin.resetOtpHash = null;

            superAdmin.resetOtpExpiresAt = null;

            superAdmin.resetOtpAttempts = 0;

            await superAdmin.save();

            throw emailError;

        }


        return res.json({

            success: true,

            message:
                "If an admin account exists for this email, a verification OTP has been sent.",

            email: superAdmin.email

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Server error"

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


        // -------------------------------
        // Validate input
        // -------------------------------

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


        if (newPassword.length < 8) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 8 characters"

            });

        }


        // -------------------------------
        // Find Super Admin
        // -------------------------------

        const superAdmin =
            await SuperAdmin.findOne({

                email: email.toLowerCase()

            });


        if (!superAdmin) {

            return res.status(400).json({

                success: false,

                message: "Invalid request"

            });

        }


        // -------------------------------
        // Check reset OTP
        // -------------------------------

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


        // -------------------------------
        // Check expiry
        // -------------------------------

        if (
            new Date() >
            superAdmin.resetOtpExpiresAt
        ) {

            superAdmin.resetOtpHash = null;

            superAdmin.resetOtpExpiresAt = null;

            superAdmin.resetOtpAttempts = 0;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message:
                    "Reset OTP has expired. Please request a new OTP."

            });

        }


        // -------------------------------
        // Check attempts
        // -------------------------------

        if (
            superAdmin.resetOtpAttempts >= 5
        ) {

            superAdmin.resetOtpHash = null;

            superAdmin.resetOtpExpiresAt = null;

            superAdmin.resetOtpAttempts = 0;

            await superAdmin.save();


            return res.status(429).json({

                success: false,

                message:
                    "Too many incorrect attempts. Please request a new OTP."

            });

        }


        // -------------------------------
        // Compare OTP
        // -------------------------------

        const submittedHash =
            hashOTP(otp);


        if (
            submittedHash !==
            superAdmin.resetOtpHash
        ) {

            superAdmin.resetOtpAttempts += 1;

            await superAdmin.save();


            return res.status(400).json({

                success: false,

                message: "Invalid OTP"

            });

        }


        // -------------------------------
        // Hash new password
        // -------------------------------

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );


        superAdmin.password =
            hashedPassword;


        // -------------------------------
        // Clear reset OTP
        // -------------------------------

        superAdmin.resetOtpHash = null;

        superAdmin.resetOtpExpiresAt = null;

        superAdmin.resetOtpAttempts = 0;


        // Also invalidate any pending login OTP

        superAdmin.otpHash = null;

        superAdmin.otpExpiresAt = null;

        superAdmin.otpAttempts = 0;


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

            message: "Server error"

        });

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    login,

    verifyOTP,

    forgotPassword,

    resetPassword

};