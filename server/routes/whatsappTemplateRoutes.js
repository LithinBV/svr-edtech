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
// GET ALL WHATSAPP TEMPLATES
// GET /api/whatsapp-templates
// =====================================================

router.get(
  "/",
  protect,
  getTemplates
);


// =====================================================
// GET SINGLE WHATSAPP TEMPLATE
// GET /api/whatsapp-templates/:id
// =====================================================

router.get(
  "/:id",
  protect,
  getTemplateById
);


// =====================================================
// CREATE WHATSAPP TEMPLATE
// POST /api/whatsapp-templates
// =====================================================

router.post(
  "/",
  protect,
  createTemplate
);


// =====================================================
// UPDATE WHATSAPP TEMPLATE
// PUT /api/whatsapp-templates/:id
// =====================================================

router.put(
  "/:id",
  protect,
  updateTemplate
);


// =====================================================
// DELETE / DEACTIVATE WHATSAPP TEMPLATE
// DELETE /api/whatsapp-templates/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  deleteTemplate
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;