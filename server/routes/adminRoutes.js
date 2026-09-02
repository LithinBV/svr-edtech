const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");


// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get("/dashboard", protect, (req, res) => {

    res.json({
        success: true,
        message: "Welcome to Admin Dashboard",
        user: req.user
    });

});


module.exports = router;