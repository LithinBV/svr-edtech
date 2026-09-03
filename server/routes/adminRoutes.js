const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");


// ==========================================
// MASTER ADMIN DASHBOARD
// ==========================================

router.get(
    "/admin-dashboard",
    protect,
    (req, res) => {

        // Only Super Admin can access
        if (req.user.userType !== "SUPER_ADMIN") {

            return res.status(403).json({
                success: false,
                message: "Access denied. Only Master Admin can access this dashboard."
            });

        }

        res.json({
            success: true,
            message: "Welcome to Master Admin Dashboard",
            user: req.user
        });

    }
);


module.exports = router;