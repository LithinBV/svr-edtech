const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const {
    generateOTP,
    hashOTP
} = require("../utils/otp");

const {
    sendOTPEmail,
    sendPasswordResetOTPEmail
} = require("../utils/email");


// ==================================================
// ADMIN LOGIN
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
        // Find user
        // -------------------------------

        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid email or password"

            });

        }


        // -------------------------------
        // Check role
        // -------------------------------

        if (user.role !== "SUPER_ADMIN") {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to use this login"

            });

        }


        // -------------------------------
        // Check password
        // -------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
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


        user.otpHash = otpHash;

        user.otpExpiresAt = expiresAt;

        user.otpAttempts = 0;


        await user.save();


        // -------------------------------
        // Send OTP
        // -------------------------------

        try {

            await sendOTPEmail(
                user.email,
                otp
            );

        } catch (emailError) {

            user.otpHash = null;

            user.otpExpiresAt = null;

            user.otpAttempts = 0;

            await user.save();

            throw emailError;

        }


        return res.json({

            success: true,

            message: "OTP sent to your email",

            email: user.email

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


        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.status(401).json({

                success: false,

                message: "Invalid request"

            });

        }


        if (
            !user.otpHash ||
            !user.otpExpiresAt
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
            user.otpExpiresAt
        ) {

            user.otpHash = null;

            user.otpExpiresAt = null;

            user.otpAttempts = 0;

            await user.save();

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please login again."

            });

        }


        // -------------------------------
        // Check attempts
        // -------------------------------

        if (user.otpAttempts >= 5) {

            user.otpHash = null;

            user.otpExpiresAt = null;

            user.otpAttempts = 0;

            await user.save();

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
            user.otpHash
        ) {

            user.otpAttempts += 1;

            await user.save();

            return res.status(400).json({

                success: false,

                message: "Invalid OTP"

            });

        }


        // -------------------------------
        // Clear OTP
        // -------------------------------

        user.otpHash = null;

        user.otpExpiresAt = null;

        user.otpAttempts = 0;

        await user.save();


        // -------------------------------
        // Create JWT
        // -------------------------------

        const token = jwt.sign(

            {
                userId: user._id,
                role: user.role
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

            role: user.role

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


        const user = await User.findOne({

            email: normalizedEmail

        });


        // Don't reveal whether account exists
        if (
            !user ||
            user.role !== "SUPER_ADMIN"
        ) {

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


        user.resetOtpHash = otpHash;

        user.resetOtpExpiresAt = expiresAt;

        user.resetOtpAttempts = 0;


        await user.save();


        // -------------------------------
        // Send reset OTP
        // -------------------------------

        try {

            await sendPasswordResetOTPEmail(

                user.email,

                otp

            );

        } catch (emailError) {

            user.resetOtpHash = null;

            user.resetOtpExpiresAt = null;

            user.resetOtpAttempts = 0;

            await user.save();

            throw emailError;

        }


        return res.json({

            success: true,

            message:
                "If an admin account exists for this email, a verification OTP has been sent.",

            email: user.email

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


        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.status(400).json({

                success: false,

                message: "Invalid request"

            });

        }


        // -------------------------------
        // Check reset OTP
        // -------------------------------

        if (
            !user.resetOtpHash ||
            !user.resetOtpExpiresAt
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
            user.resetOtpExpiresAt
        ) {

            user.resetOtpHash = null;

            user.resetOtpExpiresAt = null;

            user.resetOtpAttempts = 0;

            await user.save();

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
            user.resetOtpAttempts >= 5
        ) {

            user.resetOtpHash = null;

            user.resetOtpExpiresAt = null;

            user.resetOtpAttempts = 0;

            await user.save();

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
            user.resetOtpHash
        ) {

            user.resetOtpAttempts += 1;

            await user.save();

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


        user.password =
            hashedPassword;


        // -------------------------------
        // Clear reset OTP
        // -------------------------------

        user.resetOtpHash = null;

        user.resetOtpExpiresAt = null;

        user.resetOtpAttempts = 0;


        // Also invalidate any pending login OTP
        user.otpHash = null;

        user.otpExpiresAt = null;

        user.otpAttempts = 0;


        await user.save();


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