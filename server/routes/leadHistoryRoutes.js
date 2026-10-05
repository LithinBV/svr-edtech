const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getLeadHistory
} = require("../controllers/leadHistoryController");


// ==========================================
// GET HISTORY FOR A LEAD
// ==========================================

router.get("/:leadId", protect, getLeadHistory);


module.exports = router;