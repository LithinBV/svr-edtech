const mongoose = require("mongoose");


// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
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

        contact: {
            type: String,
            default: "",
            trim: true
        },

        profileImage: {
            type: String,
            default: null
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "EXECUTIVE",
                "MANAGER"
            ],
            required: true
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null
        },

        // ======================================================
        // ACCOUNT STATUS
        // ======================================================

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE"
            ],
            default: "ACTIVE"
        },

        // ======================================================
        // ACTIVITY TRACKING
        // ======================================================

        lastActivityAt: {
            type: Date,
            default: null
        },

        // ======================================================
        // CREATED BY
        // ======================================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin",
            default: null
        },

        // ======================================================
        // GOOGLE
        // ======================================================

        googleId: {
            type: String,
            default: null,
            sparse: true
        },

        // ======================================================
        // LOGIN OTP
        // ======================================================

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

        // ======================================================
        // PASSWORD RESET OTP
        // ======================================================

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

        // ======================================================
        // REFRESH TOKENS (MULTI-DEVICE SESSION SUPPORT)
        // ======================================================

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


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports = mongoose.model(
    "User",
    userSchema,
    "users"
);