const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/whatsappTemplateController");

// =====================================================
// WHATSAPP TEMPLATE ROUTES
// =====================================================

// Get all active templates
router.get("/", protect, getTemplates);

// Get single template
router.get("/:id", protect, getTemplateById);

// Create template
router.post("/", protect, createTemplate);

// Update template
router.put("/:id", protect, updateTemplate);

// Deactivate template
router.delete("/:id", protect, deleteTemplate);

module.exports = router;