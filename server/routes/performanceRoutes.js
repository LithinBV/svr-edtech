const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getPerformanceOverview
} = require("../controllers/performanceController");


// Performance Overview
router.get(
    "/overview",
    protect,
    getPerformanceOverview
);


module.exports = router;