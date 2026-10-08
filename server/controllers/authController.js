const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const SuperAdmin = require("../models/superAdmin");
const InstitutionAdmin = require("../models/institutionAdmin");
const User = require("../models/user");

const {
    generateOTP,
    hashOTP
} = require("../utils/otp");

const {
    sendPasswordResetOTPEmail
} = require("../utils/email");

const {
    isValidPassword,
    hashRefreshToken,
    createAccessToken,
    createRefreshToken,
    findAccountByEmail,
    findAccountByGoogleId,
    generateAndSendLoginOTP
} = require("./authHelper");


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
const OTP_MAX_ATTEMPTS = 5;

const RESET_OTP_EXPIRY_MINUTES = 5;
const RESET_OTP_MAX_ATTEMPTS = 5;

const REFRESH_TOKEN_DAYS = 30;


// ==================================================
// LOGIN
// ==================================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const accountData =
            await findAccountByEmail(
                normalizedEmail
            );

        if (!accountData) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const {
            user,
            userType
        } = accountData;


        // ------------------------------------------
        // CHECK ACTIVE STATUS
        // ------------------------------------------

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message:
                        "Your account is inactive. Please contact the administrator."
                });
            }
        }


        // ------------------------------------------
        // CHECK PASSWORD
        // ------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }


        // ------------------------------------------
        // SEND OTP
        // ------------------------------------------

        try {

            await generateAndSendLoginOTP(
                user
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


        return res.json({
            success: true,
            message:
                "OTP sent to your email",
            email: user.email,
            userType,
            userName: user.name
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

        if (!credential) {

            return res.status(400).json({
                success: false,
                message:
                    "Google authentication credential is required."
            });
        }


        // ------------------------------------------
        // VERIFY GOOGLE TOKEN
        // ------------------------------------------

        const ticket =
            await googleClient.verifyIdToken({
                idToken: credential,
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
            payload.email
                ?.trim()
                .toLowerCase();

        const emailVerified =
            payload.email_verified;


        if (!googleId || !email) {

            return res.status(401).json({
                success: false,
                message:
                    "Unable to get Google account information."
            });
        }

        if (emailVerified !== true) {

            return res.status(401).json({
                success: false,
                message:
                    "Google email is not verified."
            });
        }


        // ------------------------------------------
        // FIND BY GOOGLE ID
        // ------------------------------------------

        let accountData =
            await findAccountByGoogleId(
                googleId
            );


        // ------------------------------------------
        // FIND BY EMAIL
        // ------------------------------------------

        if (!accountData) {

            accountData =
                await findAccountByEmail(
                    email
                );

            if (!accountData) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This Google account is not authorized for this application."
                });
            }


            // --------------------------------------
            // ACTIVE CHECK
            // --------------------------------------

            if (
                accountData.userType === "MANAGER" ||
                accountData.userType === "EXECUTIVE"
            ) {

                if (
                    accountData.user.status !==
                    "ACTIVE"
                ) {

                    return res.status(403).json({
                        success: false,
                        message:
                            "Your account is inactive. Please contact the administrator."
                    });
                }
            }


            // --------------------------------------
            // LINK GOOGLE ACCOUNT
            // --------------------------------------

            accountData.user.googleId =
                googleId;

            await accountData.user.save();
        }


        const {
            user,
            userType
        } = accountData;


        // ------------------------------------------
        // ACTIVE CHECK
        // ------------------------------------------

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message:
                        "Your account is inactive. Please contact the administrator."
                });
            }
        }


        // ------------------------------------------
        // SEND OTP
        // ------------------------------------------

        try {

            await generateAndSendLoginOTP(
                user
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


        return res.json({
            success: true,
            message:
                "Google login successful. OTP sent to your email.",
            email: user.email,
            userType,
            userName: user.name
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

        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Email is required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const accountData =
            await findAccountByEmail(
                normalizedEmail
            );

        if (!accountData) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid request"
            });
        }

        const {
            user,
            userType
        } = accountData;


        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message:
                        "Your account is inactive."
                });
            }
        }


        try {

            await generateAndSendLoginOTP(
                user
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


        return res.json({
            success: true,
            message:
                "A new OTP has been sent to your email.",
            expiresIn:
                OTP_EXPIRY_MINUTES * 60,
            userType
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

        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const accountData =
            await findAccountByEmail(
                normalizedEmail
            );

        if (!accountData) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid request"
            });
        }

        const {
            user,
            userType
        } = accountData;


        // ------------------------------------------
        // ACTIVE CHECK
        // ------------------------------------------

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message:
                        "Your account is inactive."
                });
            }
        }


        // ------------------------------------------
        // OTP EXISTS
        // ------------------------------------------

        if (
            !user.otpHash ||
            !user.otpExpiresAt
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "OTP not found. Please request a new OTP."
            });
        }


        // ------------------------------------------
        // OTP EXPIRY
        // ------------------------------------------

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
                    "OTP has expired. Please request a new OTP."
            });
        }


        // ------------------------------------------
        // OTP ATTEMPTS
        // ------------------------------------------

        if (
            user.otpAttempts >=
            OTP_MAX_ATTEMPTS
        ) {

            user.otpHash = null;
            user.otpExpiresAt = null;
            user.otpAttempts = 0;

            await user.save();

            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect attempts. Please request a new OTP."
            });
        }


        // ------------------------------------------
        // COMPARE OTP
        // ------------------------------------------

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
                message:
                    "Invalid OTP",
                attemptsRemaining:
                    Math.max(
                        0,
                        OTP_MAX_ATTEMPTS -
                        user.otpAttempts
                    )
            });
        }


        // ------------------------------------------
        // START ACTIVITY TRACKING
        // ------------------------------------------

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            user.lastActivityAt =
                new Date();
        }


        // ------------------------------------------
        // CLEAR OTP
        // ------------------------------------------

        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpAttempts = 0;

        await user.save();


        // ------------------------------------------
        // ACCESS TOKEN
        // ------------------------------------------

        const token =
            createAccessToken(
                user,
                userType
            );


        // ------------------------------------------
        // REFRESH TOKEN (ADDS TO SESSIONS ARRAY)
        // ------------------------------------------

        const refreshToken =
            await createRefreshToken(
                user
            );


        return res.json({
            success: true,
            message:
                "OTP verified successfully",
            token,
            refreshToken,
            userType,
            userName: user.name,

            institutionId:
                userType === "INSTITUTION_ADMIN"
                    ? user.institutionId
                    : null,

            expiresIn:
                15 * 60
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
// REFRESH ACCESS TOKEN (MULTI-SESSION SAFE)
// ==================================================

const refreshToken = async (req, res) => {

    try {

        const {
            refreshToken:
                submittedRefreshToken
        } = req.body;

        if (!submittedRefreshToken) {

            return res.status(401).json({
                success: false,
                message:
                    "Refresh token is required."
            });
        }

        const submittedHash =
            hashRefreshToken(
                submittedRefreshToken
            );


        // ------------------------------------------
        // FIND ACCOUNT CONTAINING THIS TOKEN
        // ------------------------------------------

        const tokenQuery = {
            "refreshTokens.hash": submittedHash
        };

        let accountData = null;

        const superAdmin =
            await SuperAdmin.findOne(tokenQuery);

        if (superAdmin) {
            accountData = {
                user: superAdmin,
                userType: "SUPER_ADMIN"
            };
        }

        if (!accountData) {
            const institutionAdmin =
                await InstitutionAdmin.findOne(tokenQuery);

            if (institutionAdmin) {
                accountData = {
                    user: institutionAdmin,
                    userType: "INSTITUTION_ADMIN"
                };
            }
        }

        if (!accountData) {
            const normalUser =
                await User.findOne(tokenQuery);

            if (normalUser) {
                accountData = {
                    user: normalUser,
                    userType: normalUser.role
                };
            }
        }

        if (!accountData) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid refresh token. Please login again."
            });
        }


        const {
            user,
            userType
        } = accountData;


        // ------------------------------------------
        // ACTIVE CHECK
        // ------------------------------------------

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                // Remove this session on inactive status
                user.refreshTokens = user.refreshTokens.filter(
                    (s) => s.hash !== submittedHash
                );
                await user.save();

                return res.status(403).json({
                    success: false,
                    message:
                        "Your account is inactive."
                });
            }
        }


        // ------------------------------------------
        // EXPIRY CHECK FOR THIS SESSION
        // ------------------------------------------

        const matchedSession = user.refreshTokens.find(
            (s) => s.hash === submittedHash
        );

        if (
            !matchedSession ||
            !matchedSession.expiresAt ||
            new Date() > matchedSession.expiresAt
        ) {

            // Remove expired token
            user.refreshTokens = user.refreshTokens.filter(
                (s) => s.hash !== submittedHash
            );
            await user.save();

            return res.status(401).json({
                success: false,
                message:
                    "Your session has expired. Please login again."
            });
        }


        // ------------------------------------------
        // ROTATE: REMOVE OLD TOKEN & ISSUE NEW ONE
        // ------------------------------------------

        user.refreshTokens = user.refreshTokens.filter(
            (s) => s.hash !== submittedHash
        );

        const newRefreshToken =
            await createRefreshToken(
                user
            );


        // ------------------------------------------
        // NEW ACCESS TOKEN
        // ------------------------------------------

        const token =
            createAccessToken(
                user,
                userType
            );


        return res.json({
            success: true,
            token,
            refreshToken:
                newRefreshToken,

            userType,
            userName: user.name,

            institutionId:
                userType === "INSTITUTION_ADMIN"
                    ? user.institutionId
                    : null,

            expiresIn:
                15 * 60,

            refreshExpiresIn:
                REFRESH_TOKEN_DAYS *
                24 *
                60 *
                60
        });

    } catch (error) {

        console.error(
            "Refresh token error:",
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
// LOGOUT (DEVICE-SPECIFIC LOGOUT)
// ==================================================

const logout = async (req, res) => {

    try {

        const {
            refreshToken:
                submittedRefreshToken
        } = req.body;

        if (!submittedRefreshToken) {

            return res.json({
                success: true,
                message:
                    "Logged out successfully."
            });
        }

        const submittedHash =
            hashRefreshToken(
                submittedRefreshToken
            );

        const tokenQuery = {
            "refreshTokens.hash": submittedHash
        };


        // ------------------------------------------
        // FIND ACCOUNT & REMOVE SPECIFIC SESSION
        // ------------------------------------------

        let user =
            await SuperAdmin.findOne(tokenQuery);

        if (!user) {
            user =
                await InstitutionAdmin.findOne(tokenQuery);
        }

        if (!user) {
            user =
                await User.findOne(tokenQuery);
        }

        if (user) {

            // Only remove the current device's refresh token
            user.refreshTokens = user.refreshTokens.filter(
                (s) => s.hash !== submittedHash
            );

            // Clear activity tracker for this device
            user.lastActivityAt = null;

            await user.save();
        }


        return res.json({
            success: true,
            message:
                "Logged out successfully."
        });

    } catch (error) {

        console.error(
            "Logout error:",
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
            email.trim().toLowerCase();

        const accountData =
            await findAccountByEmail(
                normalizedEmail
            );

        if (!accountData) {

            return res.json({
                success: true,
                message:
                    "If an account exists for this email, a verification OTP has been sent."
            });
        }

        const {
            user,
            userType
        } = accountData;

        if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {

            if (user.status !== "ACTIVE") {

                return res.json({
                    success: true,
                    message:
                        "If an account exists for this email, a verification OTP has been sent."
                });
            }
        }

        const otp =
            generateOTP();

        const otpHash =
            hashOTP(otp);

        const expiresAt =
            new Date(
                Date.now() +
                RESET_OTP_EXPIRY_MINUTES *
                60 *
                1000
            );

        user.resetOtpHash =
            otpHash;

        user.resetOtpExpiresAt =
            expiresAt;

        user.resetOtpAttempts =
            0;

        await user.save();

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
                "If an account exists for this email, a verification OTP has been sent.",
            email: user.email,
            userType
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
            !isValidPassword(
                newPassword
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const accountData =
            await findAccountByEmail(
                normalizedEmail
            );

        if (!accountData) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid request"
            });
        }

        const {
            user
        } = accountData;

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

        if (
            user.resetOtpAttempts >=
            RESET_OTP_MAX_ATTEMPTS
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
                message:
                    "Invalid OTP",

                attemptsRemaining:
                    Math.max(
                        0,
                        RESET_OTP_MAX_ATTEMPTS -
                        user.resetOtpAttempts
                    )
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );

        user.password =
            hashedPassword;

        // Clear reset and login OTPs
        user.resetOtpHash = null;
        user.resetOtpExpiresAt = null;
        user.resetOtpAttempts = 0;

        user.otpHash = null;
        user.otpExpiresAt = null;
        user.otpAttempts = 0;

        // Invalidate all active sessions across all devices for security
        user.refreshTokens = [];

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
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};