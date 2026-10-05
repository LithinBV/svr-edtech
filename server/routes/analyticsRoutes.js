const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getAnalyticsOverview,
  getDateWiseAnalytics,
  getSourceWiseAnalytics,
  getConversionAnalytics,
  getLeadTypeAnalytics,
  getProgramWiseAnalytics,
  getUserWiseAnalytics,
} = require("../controllers/analyticsController");

// ============================================================
// ADMIN ANALYTICS
// ============================================================

// Overview
router.get(
  "/overview",
  protect,
  getAnalyticsOverview
);

// Date-wise
router.get(
  "/date-wise",
  protect,
  getDateWiseAnalytics
);

// Source-wise
router.get(
  "/source-wise",
  protect,
  getSourceWiseAnalytics
);

// Conversion / latest remark
router.get(
  "/conversion",
  protect,
  getConversionAnalytics
);

// Lead type
router.get(
  "/lead-type",
  protect,
  getLeadTypeAnalytics
);

// Program-wise
router.get(
  "/program-wise",
  protect,
  getProgramWiseAnalytics
);

// User / lead-owner wise
router.get(
  "/user-wise",
  protect,
  getUserWiseAnalytics
);

module.exports = router;