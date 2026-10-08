const mongoose = require("mongoose");

const whatsappTemplateSchema = new mongoose.Schema(
  {
    // =====================================================
    // TEMPLATE NAME
    // =====================================================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // TEMPLATE MESSAGE
    // =====================================================
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // TEMPLATE CATEGORY / LEAD STATUS
    // =====================================================
    category: {
      type: String,
      required: true,
      default: "GENERAL",
      trim: true,
      uppercase: true,
    },

    // =====================================================
    // WHATSAPP PROVIDER TEMPLATE NAME
    // =====================================================
    // Keep this because you may use WhatsApp Business API
    // in the future.
    providerTemplateName: {
      type: String,
      default: null,
      trim: true,
    },

    // =====================================================
    // ACTIVE / INACTIVE
    // =====================================================
    isActive: {
      type: Boolean,
      default: true,
    },

    // =====================================================
    // CREATED BY
    // =====================================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // UPDATED BY
    // =====================================================
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


// =====================================================
// INDEXES
// =====================================================

whatsappTemplateSchema.index({
  category: 1,
  name: 1,
});

whatsappTemplateSchema.index({
  isActive: 1,
});


// =====================================================
// MODEL
// =====================================================

const WhatsAppTemplate = mongoose.model(
  "WhatsAppTemplate",
  whatsappTemplateSchema
);

module.exports = WhatsAppTemplate;