const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const {
    getMyProfile,
    updateMyProfile,
    uploadProfileImage,
    removeProfileImage
} = require("../controllers/profileController");


// ==================================================
// GET MY PROFILE
// ==================================================

router.get(
    "/",
    protect,
    getMyProfile
);


// ==================================================
// UPDATE MY PROFILE
// ==================================================
// Allowed fields:
// - name
// - contact
//
// Email, role, team, status, password, etc.
// cannot be changed here.

router.put(
    "/",
    protect,
    updateMyProfile
);


// ==================================================
// UPLOAD PROFILE IMAGE
// ==================================================
// Image flow:
//
// React
//   ↓
// Multer
//   ↓
// Cloudinary
//   ↓
// MongoDB profileImage URL

router.post(
    "/image",
    protect,
    upload.single("profileImage"),
    uploadProfileImage
);


// ==================================================
// REMOVE PROFILE IMAGE
// ==================================================
// Removes only the profile image.
// The account itself is NOT deleted.

router.delete(
    "/image",
    protect,
    removeProfileImage
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;