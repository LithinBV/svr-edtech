const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    /**
     * Template name
     *
     * Example:
     * "Welcome Lead"
     */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Short description
     */
    description: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Template category
     */
    category: {
      type: String,
      enum: [
        "WELCOME",
        "FOLLOW_UP",
        "COURSE",
        "DEMO",
        "PAYMENT",
        "REMINDER",
        "GENERAL",
      ],
      default: "GENERAL",
      index: true,
    },

    /**
     * Email subject
     *
     * Supports variables:
     *
     * {{leadName}}
     * {{agentName}}
     * {{companyName}}
     */
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Plain-text email body
     */
    message: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Optional HTML version
     */
    htmlMessage: {
      type: String,
      default: null,
    },

    /**
     * Template status
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * User who created the template
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * User who last updated the template
     */
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


/**
 * =====================================================
 * INDEXES
 * =====================================================
 */

/**
 * Quickly find active templates by category
 */
emailTemplateSchema.index({
  isActive: 1,
  category: 1,
});


/**
 * Prevent duplicate template names
 */
emailTemplateSchema.index(
  {
    name: 1,
  },
  {
    unique: true,
  }
);


/**
 * =====================================================
 * MODEL
 * =====================================================
 */

module.exports = mongoose.model(
  "EmailTemplate",
  emailTemplateSchema
);