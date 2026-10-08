const mongoose = require("mongoose");

const institutionAdminSchema = new mongoose.Schema(
    {
        // ==========================================
        // ADMIN NAME
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // ADMIN EMAIL
        // ==========================================

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // ==========================================
        // GOOGLE LOGIN
        // ==========================================

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            default: null
        },

        // ==========================================
        // USERNAME
        // ==========================================

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        // ==========================================
        // PASSWORD
        // ==========================================

        password: {
            type: String,
            required: true
        },

        // ==========================================
        // INSTITUTION
        // ==========================================

        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Institution",
            required: true
        },

        // ==========================================
        // LOGIN OTP
        // ==========================================

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

        // ==========================================
        // OTP RESEND CONTROL
        // ==========================================

        otpLastSentAt: {
            type: Date,
            default: null
        },

        otpDailyCount: {
            type: Number,
            default: 0
        },

        otpDailyResetAt: {
            type: Date,
            default: null
        },

        // ==========================================
        // PASSWORD RESET OTP
        // ==========================================

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
        },

        // ==========================================
        // REFRESH TOKENS (MULTI-DEVICE SESSION SUPPORT)
        // ==========================================

        refreshTokens: [
            {
                hash: {
                    type: String,
                    required: true
                },
                expiresAt: {
                    type: Date,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },

    {
        timestamps: true
    }
);


// ==========================================
// EXPORT MODEL
// ==========================================

module.exports = mongoose.model(
    "InstitutionAdmin",
    institutionAdminSchema,
    "institutionAdmins"
);