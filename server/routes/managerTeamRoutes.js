const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getMyTeam
} = require("../controllers/managerTeamController");


// ==========================================
// TEST ROUTE
// ==========================================

router.get(
    "/test",
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Manager routes are working"
        });

    }
);


// ==========================================
// GET MY TEAM
// ==========================================

router.get(
    "/my-team",
    protect,
    getMyTeam
);


module.exports = router;