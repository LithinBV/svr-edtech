const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
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
    // EMAIL RECIPIENTS
    // =====================================================
    to: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    cc: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    bcc: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // =====================================================
    // EMAIL CONTENT
    // =====================================================
    subject: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      default: "",
    },

    htmlMessage: {
      type: String,
      default: null,
    },

    // =====================================================
    // TEMPLATE
    // =====================================================
    templateName: {
      type: String,
      default: null,
    },

    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      default: null,
    },

    // =====================================================
    // EMAIL DIRECTION
    // =====================================================
    direction: {
      type: String,
      enum: [
        "OUTBOUND",
        "INBOUND",
      ],
      default: "OUTBOUND",
    },

    // =====================================================
    // EMAIL STATUS
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
    // PROVIDER
    // =====================================================
    provider: {
      type: String,
      default: "resend",
    },

    providerMessageId: {
      type: String,
      default: null,
      index: true,
    },

    // =====================================================
    // PROVIDER METADATA
    // =====================================================
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =====================================================
    // ERROR INFORMATION
    // =====================================================
    errorCode: {
      type: String,
      default: null,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    // =====================================================
    // TIMESTAMPS
    // =====================================================
    sentAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    openedAt: {
      type: Date,
      default: null,
    },

    clickedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Email",
    emailSchema
  );