const mongoose = require("mongoose");

const leadNoteSchema = new mongoose.Schema(
    {
        // ==========================================
        // LEAD
        // ==========================================

        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lead",
            required: true,
            index: true
        },


        // ==========================================
        // CREATED BY
        // ==========================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "createdByModel"
        },


        // ==========================================
        // CREATED BY MODEL
        // ==========================================

        createdByModel: {
            type: String,
            required: true,
            enum: [
                "User",
                "SuperAdmin",
                "InstitutionAdmin"
            ]
        },


        // ==========================================
        // NOTE
        // ==========================================

        note: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        }
    },
    {
        timestamps: true
    }
);


// ==========================================
// INDEX
// ==========================================

leadNoteSchema.index({
    lead: 1,
    createdAt: -1
});


// ==========================================
// MODEL
// ==========================================

module.exports = mongoose.model(
    "LeadNote",
    leadNoteSchema
);