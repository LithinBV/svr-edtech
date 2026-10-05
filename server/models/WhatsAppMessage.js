const mongoose = require("mongoose");

const whatsappMessageSchema = new mongoose.Schema(
  {
    // =====================================================
    // LEAD
    // =====================================================

    // Lead connected to this WhatsApp activity
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    // =====================================================
    // EXECUTIVE / USER
    // =====================================================

    // Executive who prepared/opened the message
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // PHONE NUMBER
    // =====================================================

    // Lead's WhatsApp number
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // MESSAGE
    // =====================================================

    // Final message after variables are replaced
    //
    // Example:
    //
    // Template:
    // Hi {{name}}, following up about {{course}}.
    //
    // Stored message:
    // Hi Rahul, following up about Java Full Stack.
    //
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================================
    // TEMPLATE INFORMATION
    // =====================================================

    // Template name used by the executive
    templateName: {
      type: String,
      trim: true,
      default: null,
    },

    // Template ID used
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsAppTemplate",
      default: null,
    },

    // =====================================================
    // MESSAGE DIRECTION
    // =====================================================

    // OUTBOUND:
    // Executive/company → Lead
    //
    // INBOUND:
    // Lead → Executive/company
    //
    // Currently our normal WhatsApp setup will create
    // OUTBOUND records only.
    //
    // INBOUND can be used later if you connect an
    // integration that provides incoming WhatsApp messages.
    direction: {
      type: String,
      enum: ["OUTBOUND", "INBOUND"],
      default: "OUTBOUND",
      index: true,
    },

    // =====================================================
    // APPLICATION STATUS
    // =====================================================

    // IMPORTANT:
    //
    // These are OUR application's statuses.
    //
    // They are NOT WhatsApp delivery/read statuses.
    //
    // PREPARED:
    // Message was prepared inside SVR-EDTECH.
    //
    // OPENED:
    // SVR-EDTECH opened WhatsApp with this message.
    //
    status: {
      type: String,
      enum: [
        "PREPARED",
        "OPENED",
      ],
      default: "PREPARED",
      index: true,
    },

    // =====================================================
    // TIMESTAMPS
    // =====================================================

    // When SVR-EDTECH opened WhatsApp
    openedAt: {
      type: Date,
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

// Get a lead's WhatsApp history quickly
whatsappMessageSchema.index({
  leadId: 1,
  createdAt: -1,
});

// Get messages by executive
whatsappMessageSchema.index({
  agentId: 1,
  createdAt: -1,
});

// Get messages by direction
whatsappMessageSchema.index({
  direction: 1,
  createdAt: -1,
});

// Get messages by status
whatsappMessageSchema.index({
  status: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "WhatsAppMessage",
  whatsappMessageSchema
);