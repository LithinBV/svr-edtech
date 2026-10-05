const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/emailTemplateController");

// Get all active email templates
router.get("/", protect, getTemplates);

// Get single email template
router.get("/:id", protect, getTemplateById);

// Create new email template
router.post("/", protect, createTemplate);

// Update email template
router.put("/:id", protect, updateTemplate);

// Soft delete email template
router.delete("/:id", protect, deleteTemplate);

module.exports = router;