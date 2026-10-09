const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 1. IMPORT CONNECT_DB
const connectDB = require("../config/db");

const SuperAdmin = require("../models/superAdmin");
const InstitutionAdmin = require("../models/institutionAdmin");
const User = require("../models/user");

const {
    generateOTP,
    hashOTP
} = require("../utils/otp");

const {
    sendOTPEmail
} = require("../utils/email");


// ==================================================
// OTP SETTINGS
// ==================================================

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_DAILY_LIMIT = 50;


// ==================================================
// SESSION SETTINGS
// ==================================================

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_DAYS = 30;
const MAX_SESSIONS_PER_USER = 5;


// ==================================================
// PASSWORD VALIDATION
// ==================================================

function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
        password
    );
}


// ==================================================
// REFRESH TOKEN HELPERS
// ==================================================

function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}


// ==================================================
// CREATE ACCESS TOKEN
// ==================================================

function createAccessToken(user, userType) {

    const jwtPayload = {
        id: user._id,
        userId: user._id,
        role: userType,
        userType
    };

    if (userType === "INSTITUTION_ADMIN") {
        jwtPayload.institutionId = user.institutionId;
    }

    return jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    );
}


// ==================================================
// CREATE REFRESH TOKEN + SAVE TO DATABASE (MULTI-SESSION)
// ==================================================

async function createRefreshToken(user) {
    // Ensure DB connection is active before saving
    await connectDB();

    const refreshToken = generateRefreshToken();

    const refreshTokenHash = hashRefreshToken(
        refreshToken
    );

    const refreshTokenExpiresAt = new Date(
        Date.now() +
        REFRESH_TOKEN_DAYS *
        24 *
        60 *
        60 *
        1000
    );

    // Ensure refreshTokens array exists
    if (!Array.isArray(user.refreshTokens)) {
        user.refreshTokens = [];
    }

    // 1. Purge expired sessions
    const now = new Date();
    user.refreshTokens = user.refreshTokens.filter(
        (session) => session.expiresAt && session.expiresAt > now
    );

    // 2. Remove oldest session if max session count reached
    if (user.refreshTokens.length >= MAX_SESSIONS_PER_USER) {
        user.refreshTokens.shift();
    }

    // 3. Add new active session
    user.refreshTokens.push({
        hash: refreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
        createdAt: now
    });

    await user.save();

    return refreshToken;
}


// ==================================================
// FIND ACCOUNT BY EMAIL (AWAITS DB CONNECTION)
// ==================================================

async function findAccountByEmail(email) {
    // CRITICAL FIX: Ensure connection is ready before querying models
    await connectDB();

    const normalizedEmail =
        email.trim().toLowerCase();

    const superAdmin =
        await SuperAdmin.findOne({
            email: normalizedEmail
        });

    if (superAdmin) {
        return {
            user: superAdmin,
            userType: "SUPER_ADMIN"
        };
    }

    const institutionAdmin =
        await InstitutionAdmin.findOne({
            email: normalizedEmail
        });

    if (institutionAdmin) {
        return {
            user: institutionAdmin,
            userType: "INSTITUTION_ADMIN"
        };
    }

    const normalUser =
        await User.findOne({
            email: normalizedEmail
        });

    if (normalUser) {
        return {
            user: normalUser,
            userType: normalUser.role
        };
    }

    return null;
}


// ==================================================
// FIND ACCOUNT BY GOOGLE ID (AWAITS DB CONNECTION)
// ==================================================

async function findAccountByGoogleId(googleId) {
    // CRITICAL FIX: Ensure connection is ready before querying models
    await connectDB();

    const superAdmin =
        await SuperAdmin.findOne({
            googleId
        });

    if (superAdmin) {
        return {
            user: superAdmin,
            userType: "SUPER_ADMIN"
        };
    }

    const institutionAdmin =
        await InstitutionAdmin.findOne({
            googleId
        });

    if (institutionAdmin) {
        return {
            user: institutionAdmin,
            userType: "INSTITUTION_ADMIN"
        };
    }

    const normalUser =
        await User.findOne({
            googleId
        });

    if (normalUser) {
        return {
            user: normalUser,
            userType: normalUser.role
        };
    }

    return null;
}


// ==================================================
// PREPARE DAILY OTP COUNT
// ==================================================

function prepareDailyOTPCount(user) {

    const now = new Date();

    if (!user.otpDailyResetAt) {

        const tomorrow = new Date();

        tomorrow.setHours(
            24,
            0,
            0,
            0
        );

        user.otpDailyResetAt =
            tomorrow;

        user.otpDailyCount =
            0;

        return;
    }

    if (
        now >=
        user.otpDailyResetAt
    ) {

        const tomorrow =
            new Date();

        tomorrow.setHours(
            24,
            0,
            0,
            0
        );

        user.otpDailyResetAt =
            tomorrow;

        user.otpDailyCount =
            0;
    }
}


// ==================================================
// CHECK OTP SEND LIMIT
// ==================================================

function getOTPLimitError(user) {

    prepareDailyOTPCount(user);

    const now =
        Date.now();

    if (user.otpLastSentAt) {

        const secondsSinceLastOTP =
            Math.floor(
                (
                    now -
                    new Date(
                        user.otpLastSentAt
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

    if (
        user.otpDailyCount >=
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
// GENERATE AND SEND LOGIN OTP
// ==================================================

async function generateAndSendLoginOTP(user) {
    // Ensure DB connection is active before updating user
    await connectDB();

    const limitCheck =
        getOTPLimitError(user);

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

    const otp =
        generateOTP();

    const otpHash =
        hashOTP(otp);

    const expiresAt =
        new Date(
            Date.now() +
            OTP_EXPIRY_MINUTES *
            60 *
            1000
        );

    user.otpHash =
        otpHash;

    user.otpExpiresAt =
        expiresAt;

    user.otpAttempts =
        0;

    user.otpLastSentAt =
        new Date();

    user.otpDailyCount +=
        1;

    await user.save();

    try {

        await sendOTPEmail(
            user.email,
            otp
        );

    } catch (emailError) {

        user.otpHash =
            null;

        user.otpExpiresAt =
            null;

        user.otpAttempts =
            0;

        await user.save();

        throw emailError;
    }
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
    isValidPassword,
    generateRefreshToken,
    hashRefreshToken,
    createAccessToken,
    createRefreshToken,
    findAccountByEmail,
    findAccountByGoogleId,
    prepareDailyOTPCount,
    getOTPLimitError,
    generateAndSendLoginOTP
};