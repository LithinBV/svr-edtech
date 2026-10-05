const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
  {
    // =====================================================
    // LEAD
    // =====================================================
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },

    // =====================================================
    // AGENT / USER
    // =====================================================
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =====================================================
    // COMMUNICATION TYPE
    // =====================================================
    type: {
      type: String,
      enum: [
        "EMAIL",
        "CALL",
        "WHATSAPP",
        "SMS",
        "NOTE",
      ],
      required: true,
      index: true,
    },

    // =====================================================
    // DIRECTION
    // =====================================================
    direction: {
      type: String,
      enum: [
        "INBOUND",
        "OUTBOUND",
      ],
      default: "OUTBOUND",
    },

    // =====================================================
    // STATUS
    // =====================================================
    status: {
      type: String,
      enum: [
        "QUEUED",
        "SENDING",
        "SENT",
        "DELIVERED",
        "OPENED",
        "CLICKED",
        "BOUNCED",
        "FAILED",
      ],
      default: "QUEUED",
      index: true,
    },

    // =====================================================
    // MESSAGE
    // =====================================================
    message: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    // =====================================================
    // EMAIL
    // =====================================================
    email: {
      type: String,
      default: null,
    },

    // =====================================================
    // PROVIDER
    // =====================================================
    provider: {
      type: String,
      default: null,
    },

    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },

    // =====================================================
    // METADATA
    // =====================================================
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Communication",
    communicationSchema
  );