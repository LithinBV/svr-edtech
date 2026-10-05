const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");


// ============================================================
// MANAGER LEAD CONTROLLER
// ============================================================

const {

    getManagerLeads,

    getManagerLeadExecutives,

    createManagerLead,

    bulkUploadManagerLeads

} = require("../controllers/managerLeadController");


// ============================================================
// MANAGER LEAD ASSIGNMENT CONTROLLER
// ============================================================

const {

    getManagerLeadManagers,

    assignManagerLead,

    assignManagerLeadsBulk

} = require("../controllers/managerLeadAssignmentController");


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
// GET ALL MANAGER LEADS
// ============================================================
//
// GET /api/manager/leads
//
// ============================================================

router.get(

    "/",

    protect,

    getManagerLeads

);


// ============================================================
// CREATE LEAD BY MANAGER
// ============================================================
//
// POST /api/manager/leads
//
// ============================================================

router.post(

    "/",

    protect,

    createManagerLead

);


// ============================================================
// MANAGER BULK UPLOAD LEADS
// ============================================================
//
// POST /api/manager/leads/bulk-upload
//
// Body:
//
// {
//     rows: [...],
//     executiveId: "OPTIONAL_EXECUTIVE_ID"
// }
//
// ============================================================

router.post(

    "/bulk-upload",

    protect,

    bulkUploadManagerLeads

);


// ============================================================
// GET MANAGER FOLLOW-UPS
// ============================================================
//
// GET /api/manager/leads/follow-ups
//
// ============================================================

router.get(

    "/follow-ups",

    protect,

    getFollowUps

);


// ============================================================
// UPDATE / RESCHEDULE MANAGER FOLLOW-UP
// ============================================================
//
// PUT /api/manager/leads/:leadId/follow-up
//
// ============================================================

router.put(

    "/:leadId/follow-up",

    protect,

    updateFollowUp

);


// ============================================================
// COMPLETE MANAGER FOLLOW-UP
// ============================================================
//
// PUT /api/manager/leads/:leadId/complete-follow-up
//
// ============================================================

router.put(

    "/:leadId/complete-follow-up",

    protect,

    completeFollowUp

);


// ============================================================
// REOPEN MANAGER FOLLOW-UP
// ============================================================
//
// PUT /api/manager/leads/:leadId/reopen-follow-up
//
// ============================================================

router.put(

    "/:leadId/reopen-follow-up",

    protect,

    reopenFollowUp

);


// ============================================================
// GET MANAGER EXECUTIVES
// ============================================================
//
// GET /api/manager/leads/executives
//
// ============================================================

router.get(

    "/executives",

    protect,

    getManagerLeadExecutives

);


// ============================================================
// GET ALL ACTIVE MANAGERS
// ============================================================
//
// GET /api/manager/leads/managers
//
// ============================================================

router.get(

    "/managers",

    protect,

    getManagerLeadManagers

);


// ============================================================
// BULK ASSIGN LEADS
// ============================================================
//
// PUT /api/manager/leads/assign-bulk
//
// ============================================================

router.put(

    "/assign-bulk",

    protect,

    assignManagerLeadsBulk

);


// ============================================================
// ASSIGN ONE LEAD
// ============================================================
//
// PUT /api/manager/leads/:leadId/assign
//
// ============================================================

router.put(

    "/:leadId/assign",

    protect,

    assignManagerLead

);


module.exports = router;