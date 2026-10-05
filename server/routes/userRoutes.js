const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateActivity
} = require("../controllers/userController");


// ==================================================
// CREATE USER
// ==================================================
// Only Super Admin can create Manager/Executive

router.post(
    "/",
    protect,
    (req, res, next) => {

        if (
            req.user.userType !==
            "SUPER_ADMIN"
        ) {
            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can create users"

            });
        }

        next();
    },
    createUser
);


// ==================================================
// GET ALL USERS
// ==================================================
// Only Super Admin can view all users

router.get(
    "/",
    protect,
    (req, res, next) => {

        if (
            req.user.userType !==
            "SUPER_ADMIN"
        ) {
            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can view users"

            });
        }

        next();
    },
    getUsers
);


// ==================================================
// UPDATE CURRENT USER ACTIVITY
// ==================================================
// Manager/Executive only
//
// IMPORTANT:
// The user ID is NOT taken from the URL.
// It comes from the verified JWT:
//
// req.user.userId
//
// This prevents one user from updating
// another user's activity.

router.post(
    "/activity",
    protect,
    updateActivity
);


// ==================================================
// GET USER BY ID
// ==================================================
// Only Super Admin can view a specific user

router.get(
    "/:id",
    protect,
    (req, res, next) => {

        if (
            req.user.userType !==
            "SUPER_ADMIN"
        ) {
            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can view user details"

            });
        }

        next();
    },
    getUserById
);


// ==================================================
// UPDATE USER
// ==================================================
// Only Super Admin can edit users

router.put(
    "/:id",
    protect,
    (req, res, next) => {

        if (
            req.user.userType !==
            "SUPER_ADMIN"
        ) {
            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can update users"

            });
        }

        next();
    },
    updateUser
);


// ==================================================
// DELETE USER
// ==================================================
// Only Super Admin can delete users

router.delete(
    "/:id",
    protect,
    (req, res, next) => {

        if (
            req.user.userType !==
            "SUPER_ADMIN"
        ) {
            return res.status(403).json({

                success: false,

                message:
                    "Only Super Admin can delete users"

            });
        }

        next();
    },
    deleteUser
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;