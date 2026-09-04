const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createInstitution,
    getInstitutions
} = require("../controllers/institutionController");


// ==========================================
// GET ALL INSTITUTIONS
// ==========================================

router.get(
    "/",
    protect,
    (req, res, next) => {

        // Only Master Admin can view institutions
        if (req.user.userType !== "SUPER_ADMIN") {

            return res.status(403).json({

                success: false,

                message:
                    "Access denied. Only Master Admin can view institutions."

            });

        }

        next();

    },
    getInstitutions
);


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


        // Only Master Admin can create institutions
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