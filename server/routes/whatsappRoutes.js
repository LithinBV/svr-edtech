const express = require("express");

const router = express.Router();

// Existing authentication middleware
const protect = require("../middleware/authMiddleware");

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
// WHATSAPP TEMPLATES
// =====================================================

// GET ALL ACTIVE TEMPLATES
// GET /api/whatsapp/templates
router.get(
  "/templates",
  protect,
  getTemplates
);

// GET SINGLE TEMPLATE
// GET /api/whatsapp/templates/:id
router.get(
  "/templates/:id",
  protect,
  getTemplateById
);

// CREATE TEMPLATE
// POST /api/whatsapp/templates
router.post(
  "/templates",
  protect,
  createTemplate
);

// UPDATE TEMPLATE
// PUT /api/whatsapp/templates/:id
router.put(
  "/templates/:id",
  protect,
  updateTemplate
);

// DELETE / DEACTIVATE TEMPLATE
// DELETE /api/whatsapp/templates/:id
router.delete(
  "/templates/:id",
  protect,
  deleteTemplate
);

// =====================================================
// WHATSAPP ACTIVITY
// =====================================================

// RECORD WHATSAPP OPEN
//
// This does NOT send the WhatsApp message.
// It only stores the activity in MongoDB.
//
// POST /api/whatsapp/open
router.post(
  "/open",
  protect,
  logWhatsAppOpen
);

// =====================================================
// WHATSAPP HISTORY
// =====================================================

// GET WHATSAPP HISTORY FOR A LEAD
//
// GET /api/whatsapp/lead/:leadId
router.get(
  "/lead/:leadId",
  protect,
  getHistory
);

module.exports = router;