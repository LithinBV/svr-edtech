const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createInstitution
} = require("../controllers/institutionController");


// ==========================================
// CREATE INSTITUTION
// ==========================================

router.post(
    "/",

    protect,

    (req, res, next) => {

        console.log("==========================================");
        console.log("INSTITUTION ROUTE REACHED");
        console.log("USER:", req.user);
        console.log("==========================================");


        // ==========================================
        // CHECK MASTER ADMIN
        // ==========================================

        if (req.user.userType !== "SUPER_ADMIN") {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. Only Master Admin can create institutions."

            });

        }


        next();

    },

    createInstitution

);


module.exports = router;