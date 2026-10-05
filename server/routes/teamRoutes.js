const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const superAdminOnly = require("../middleware/superAdminMiddleware");

const {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addExecutiveToTeam,
    removeExecutiveFromTeam
} = require("../controllers/teamController");


// ==========================================
// CREATE TEAM
// ==========================================

router.post(
    "/",
    protect,
    superAdminOnly,
    createTeam
);


// ==========================================
// GET ALL / MY TEAMS
// ==========================================

router.get(
    "/",
    protect,
    getTeams
);


// ==========================================
// GET SINGLE TEAM
// ==========================================

router.get(
    "/:id",
    protect,
    getTeamById
);


// ==========================================
// UPDATE TEAM
// ==========================================

router.put(
    "/:id",
    protect,
    superAdminOnly,
    updateTeam
);


// ==========================================
// DELETE TEAM
// ==========================================

router.delete(
    "/:id",
    protect,
    superAdminOnly,
    deleteTeam
);


// ==========================================
// ADD EXECUTIVE TO TEAM
// ==========================================

router.post(
    "/:id/executives/:userId",
    protect,
    superAdminOnly,
    addExecutiveToTeam
);


// ==========================================
// REMOVE EXECUTIVE FROM TEAM
// ==========================================

router.delete(
    "/:id/executives/:userId",
    protect,
    superAdminOnly,
    removeExecutiveFromTeam
);


module.exports = router;