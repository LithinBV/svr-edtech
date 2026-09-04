const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        googleId: {
            type: String,
            default: null,
            index: true
        },

        password: {
            type: String,
            required: true
        },

        // ==================================================
        // LOGIN OTP
        // ==================================================

        otpHash: {
            type: String,
            default: null
        },

        otpExpiresAt: {
            type: Date,
            default: null
        },

        otpAttempts: {
            type: Number,
            default: 0
        },

        // Last time an OTP was successfully sent
        otpLastSentAt: {
            type: Date,
            default: null
        },

        // Number of login OTPs sent today
        otpDailyCount: {
            type: Number,
            default: 0
        },

        // Date when the daily counter should reset
        otpDailyResetAt: {
            type: Date,
            default: null
        },

        // ==================================================
        // PASSWORD RESET OTP
        // ==================================================

        resetOtpHash: {
            type: String,
            default: null
        },

        resetOtpExpiresAt: {
            type: Date,
            default: null
        },

        resetOtpAttempts: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SuperAdmin",
    superAdminSchema,
    "superAdmins"
);