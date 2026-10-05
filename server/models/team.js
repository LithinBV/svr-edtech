const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        executives: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin",
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);