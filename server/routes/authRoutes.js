const express = require("express");

const router = express.Router();

const {
    login,
    verifyOTP,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");


// ===============================
// LOGIN
// ===============================

router.post(
    "/login",
    login
);


// ===============================
// VERIFY LOGIN OTP
// ===============================

router.post(
    "/verify-otp",
    verifyOTP
);


// ===============================
// FORGOT PASSWORD
// ===============================

router.post(
    "/forgot-password",
    forgotPassword
);


// ===============================
// RESET PASSWORD
// ===============================

router.post(
    "/reset-password",
    resetPassword
);


module.exports = router;