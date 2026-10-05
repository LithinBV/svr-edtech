const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");


// ============================================================
// LEAD CONTROLLER
// ============================================================

const {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
} = require("../controllers/leadController");


// ============================================================
// FOLLOW-UP CONTROLLER
// ============================================================

const {
    getFollowUps,
    updateFollowUp,
    completeFollowUp,
    reopenFollowUp
} = require("../controllers/followUpController");


// ============================================================
// BULK UPDATE CONTROLLER
// ============================================================

const {
    bulkUploadLeads,
    getUnassignedBulkLeads,
    assignBulkLeads
} = require("../controllers/bulkUpdateLeadController");


// ============================================================
// CREATE LEAD
// ============================================================

router.post(
    "/",
    protect,
    createLead
);


// ============================================================
// BULK UPLOAD
// ============================================================

router.post(
    "/bulk-upload",
    protect,
    bulkUploadLeads
);


// ============================================================
// BULK UPLOAD - UNASSIGNED LEADS
// ============================================================

router.get(
    "/bulk-uploaded/unassigned",
    protect,
    getUnassignedBulkLeads
);


// ============================================================
// BULK UPLOAD - ASSIGN TO MANAGER / EXECUTIVE
// ============================================================

router.put(
    "/bulk-uploaded/assign",
    protect,
    assignBulkLeads
);


// ============================================================
// FOLLOW UPS
// ============================================================

// GET ALL FOLLOW-UPS
router.get(
    "/follow-ups",
    protect,
    getFollowUps
);


// UPDATE / RESCHEDULE FOLLOW-UP
router.put(
    "/:id/follow-up",
    protect,
    updateFollowUp
);


// COMPLETE FOLLOW-UP
router.put(
    "/:id/complete-follow-up",
    protect,
    completeFollowUp
);


// REOPEN FOLLOW-UP
router.put(
    "/:id/reopen-follow-up",
    protect,
    reopenFollowUp
);


// ============================================================
// GET LEADS
// ============================================================

router.get(
    "/",
    protect,
    getLeads
);


// ============================================================
// GET SINGLE LEAD
// ============================================================

router.get(
    "/:id",
    protect,
    getLeadById
);


// ============================================================
// UPDATE LEAD
// ============================================================

router.put(
    "/:id",
    protect,
    updateLead
);


// ============================================================
// DELETE LEAD
// ============================================================

router.delete(
    "/:id",
    protect,
    deleteLead
);


module.exports = router;