const mongoose = require("mongoose");

// ============================================================
// LEAD SCHEMA
// ============================================================

const leadSchema = new mongoose.Schema(
    {
        // ========================================================
        // BASIC DETAILS
        // ========================================================

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        contact: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: [
                "Male",
                "Female",
                "Other",
                "Prefer not to say",
            ],
            required: true,
            trim: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            required: true,
            trim: true,
        },

        collegeName: {
            type: String,
            required: true,
            trim: true,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        // ========================================================
        // EDUCATION
        // ========================================================

        ugYearOfPassout: {
            type: Number,
            required: true,
        },

        pgYearOfPassout: {
            type: Number,
            default: null,
        },

        // ========================================================
        // LEAD OWNER
        // ========================================================

        // Manual leads have an owner.
        // Bulk uploaded leads can initially be unassigned.
        leadOwner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        // ========================================================
        // CREATED VIA
        // ========================================================

        createdVia: {
            type: String,
            enum: [
                "MANUAL",
                "BULK_UPLOAD",
            ],
            default: "MANUAL",
        },

        // ========================================================
        // LEAD SOURCE
        // ========================================================

        leadSource: {
            type: String,
            enum: [
                "FB / Meta",
                "College campaign",
                "LinkedIn",
                "Referral",
                "Inbound",
            ],
            required: true,
        },

        // ========================================================
        // LEAD TYPE
        // ========================================================

        leadType: {
            type: String,
            enum: [
                "IT",
                "Non-IT",
            ],
            required: true,
        },

        // ========================================================
        // PROGRAM INTEREST
        // ========================================================

        programInterest: {
            type: String,
            enum: [
                "Full Stack",
                "Data Analysis",
                "Data Science",
                "HR",
                "DM",
            ],
            required: true,
        },

        // ========================================================
        // LEAD STATUS
        // ========================================================

        status: {
            type: String,
            enum: [
                "NEW",
                "COLD",
                "WARM",
                "HOT",
            ],
            default: "NEW",
        },

        // ========================================================
        // CALL / CONTACT REMARK
        // ========================================================

        remarks: {
            type: String,
            enum: [
                "RNR",
                "CALLBACK",
                "INTERESTED",
                "NOT_INTERESTED",
                "SWITCHED_OFF",
                "WRONG_NUMBER",
                "INVALID_LEAD",
            ],
            default: null,
        },

        // ========================================================
        // LATEST LEAD OUTCOME
        // ========================================================

        latestRemark: {
            type: String,
            enum: [
                "INTERESTED",
                "NOT_INTERESTED",
                "WALKING_IN",
                "ENROLLED",
                "RNR",
            ],
            default: null,
        },

        // ========================================================
        // FOLLOW-UP DATE + TIME
        // ========================================================

        followUpAt: {
            type: Date,
            default: null,
        },

        // ========================================================
        // FOLLOW-UP COMPLETION
        // ========================================================

        followUpCompleted: {
            type: Boolean,
            default: false,
        },

        followUpCompletedAt: {
            type: Date,
            default: null,
        },

        followUpCompletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },

    {
        timestamps: true,
    }
);

// ============================================================
// PROGRAM VALIDATION
// ============================================================

leadSchema.pre(
    "validate",
    async function () {

        // --------------------------------------------------------
        // IT
        // --------------------------------------------------------

        if (this.leadType === "IT") {

            const allowedPrograms = [
                "Full Stack",
                "Data Analysis",
                "Data Science",
            ];

            if (
                !allowedPrograms.includes(
                    this.programInterest
                )
            ) {
                throw new Error(
                    "Selected program is not valid for IT leads."
                );
            }
        }

        // --------------------------------------------------------
        // NON-IT
        // --------------------------------------------------------

        if (this.leadType === "Non-IT") {

            const allowedPrograms = [
                "HR",
                "DM",
            ];

            if (
                !allowedPrograms.includes(
                    this.programInterest
                )
            ) {
                throw new Error(
                    "Selected program is not valid for Non-IT leads."
                );
            }
        }
    }
);

// ============================================================
// INDEXES
// ============================================================

leadSchema.index({
    email: 1,
});

leadSchema.index({
    leadOwner: 1,
});

leadSchema.index({
    status: 1,
});

leadSchema.index({
    remarks: 1,
});

leadSchema.index({
    latestRemark: 1,
});

leadSchema.index({
    createdAt: -1,
});

leadSchema.index({
    followUpAt: 1,
});

leadSchema.index({
    followUpCompleted: 1,
});

leadSchema.index({
    createdVia: 1,
    leadOwner: 1,
});

// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model(
    "Lead",
    leadSchema
);