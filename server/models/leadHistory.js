    const mongoose = require("mongoose");

const leadHistorySchema = new mongoose.Schema(
    {
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true
        },

        action: {
            type: String,
            required: true,
            trim: true
        },

        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        field: {
            type: String,
            default: null
        },

        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "LeadHistory",
    leadHistorySchema
);