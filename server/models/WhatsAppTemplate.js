const mongoose = require("mongoose");

const whatsappTemplateSchema = new mongoose.Schema(
  {
    // Template name shown in SVR-EDTECH
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Actual message
    //
    // Example:
    // Hi {{name}}, this is {{executive}} from SVR-EDTECH.
    //
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Template category
    category: {
      type: String,
      enum: [
        "WELCOME",
        "FOLLOW_UP",
        "COURSE",
        "PAYMENT",
        "DEMO",
        "REMINDER",
        "GENERAL",
      ],
      default: "GENERAL",
      index: true,
    },

    // Whether the template is available
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // User who created the template
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // User who last updated it
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup for active templates
whatsappTemplateSchema.index({
  isActive: 1,
  category: 1,
});

module.exports = mongoose.model(
  "WhatsAppTemplate",
  whatsappTemplateSchema
);