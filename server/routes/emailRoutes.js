const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  send,
  getHistory,
  updateStatus,
} = require("../controllers/emailController");

/**
 * =====================================================
 * SEND EMAIL
 * POST /api/email/send
 * =====================================================
 */
router.post(
  "/send",
  protect,
  send
);

/**
 * =====================================================
 * GET EMAIL HISTORY FOR A LEAD
 * GET /api/email/lead/:leadId
 * =====================================================
 */
router.get(
  "/lead/:leadId",
  protect,
  getHistory
);

/**
 * =====================================================
 * UPDATE EMAIL STATUS
 * PUT /api/email/status
 * =====================================================
 */
router.put(
  "/status",
  protect,
  updateStatus
);

module.exports = router;