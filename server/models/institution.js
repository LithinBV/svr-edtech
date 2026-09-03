const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
    {
        // Institution name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // State where the institution is located
        state: {
            type: String,
            required: true,
            trim: true
        },

        // Region of the institution
        region: {
            type: String,
            required: true,
            trim: true
        },

        // Institution Admin connected to this institution
        institutionAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InstitutionAdmin",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Institution",
    institutionSchema
);