const mongoose = require("mongoose");

const whatsappMessageSchema = new mongoose.Schema(
  {
    // =====================================================
    // LEAD REFERENCE
    // =====================================================
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null, // Default null so unknown incoming numbers don't crash the worker
      index: true,
    },

    // =====================================================
    // EXECUTIVE / AGENT
    // =====================================================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Can be null on incoming messages until assigned
      index: true,
    },

    // =====================================================
    // PHONE NUMBERS
    // =====================================================
    // Lead's WhatsApp number
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Executive's connected WhatsApp number (optional session tracker)
    sessionPhone: {
      type: String,
      trim: true,
      default: null,
    },

    // =====================================================
    // MESSAGE CONTENT & IDS
    // =====================================================
    message: {
      type: String,
      default: "",
      trim: true,
    },

    // Unique Baileys/WhatsApp message ID to prevent duplicate database saves
    whatsappMessageId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // =====================================================
    // TEMPLATE DETAILS (Optional for click-to-open)
    // =====================================================
    templateName: {
      type: String,
      trim: true,
      default: null,
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsAppTemplate",
      default: null,
    },

    // =====================================================
    // DIRECTION
    // =====================================================
    direction: {
      type: String,
      enum: ["OUTBOUND", "INBOUND"],
      required: true,
      index: true,
    },

    // =====================================================
    // STATUS (Supports both UI clicks & Baileys live sync)
    // =====================================================
    status: {
      type: String,
      enum: [
        "PREPARED",
        "OPENED",
        "SENT",
        "DELIVERED",
        "RECEIVED",
        "FAILED",
      ],
      default: "SENT",
      index: true,
    },

    // =====================================================
    // MEDIA SUPPORT (Optional attachments / brochures)
    // =====================================================
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "document", "audio"],
      default: "text",
    },

    // =====================================================
    // TIMESTAMPS
    // =====================================================
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
// OPTIMIZED INDEXES
// =====================================================

// Ascending index for chronological chat timeline rendering
whatsappMessageSchema.index({ leadId: 1, createdAt: 1 });

// Fast lookup for agent audits & recent chats
whatsappMessageSchema.index({ agentId: 1, createdAt: -1 });

// Phone number index for worker phone matching
whatsappMessageSchema.index({ phoneNumber: 1, createdAt: -1 });

// Model caching export (serverless safe)
module.exports =
  mongoose.models.WhatsAppMessage ||
  mongoose.model("WhatsAppMessage", whatsappMessageSchema);