const express = require("express");
const router = express.Router();

// Existing authentication middleware
const protect = require("../middleware/authMiddleware");

// Unified WhatsApp controller
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  logWhatsAppOpen,
  getHistory,
} = require("../controllers/whatsappController");

// =====================================================
// WHATSAPP TEMPLATES (CRUD)
// =====================================================

// GET /api/whatsapp/templates - List active templates (filterable by ?category=)
router.get("/templates", protect, getTemplates);

// GET /api/whatsapp/templates/:id - Single template by ID
router.get("/templates/:id", protect, getTemplateById);

// POST /api/whatsapp/templates - Create new template
router.post("/templates", protect, createTemplate);

// PUT /api/whatsapp/templates/:id - Update existing template
router.put("/templates/:id", protect, updateTemplate);

// DELETE /api/whatsapp/templates/:id - Soft delete (deactivate)
router.delete("/templates/:id", protect, deleteTemplate);

// =====================================================
// WHATSAPP CHAT ACTIVITY & TRACKING
// =====================================================

// POST /api/whatsapp/open - Log "Click-to-WhatsApp" event (Strict Lead-Owner Guarded)
router.post("/open", protect, logWhatsAppOpen);

// GET /api/whatsapp/lead/:leadId - Fetch full chronological chat timeline (Executive/Admin RBAC Guarded)
router.get("/lead/:leadId", protect, getHistory);

module.exports = router;