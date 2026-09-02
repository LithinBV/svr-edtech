const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "SUPER_ADMIN",
                "INSTITUTION_ADMIN"
            ],
            required: true
        },

        institutionId: {
            type: String,
            default: null
        },


        // ===============================
        // LOGIN OTP
        // ===============================

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


        // ===============================
        // PASSWORD RESET OTP
        // ===============================

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

module.exports = mongoose.model("User", userSchema);