const express = require("express");

const router = express.Router();

const {
    login,
    googleLogin,
    verifyOTP,
    resendOTP,
    refreshToken,
    logout,
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
// GOOGLE LOGIN
// ===============================

router.post(
    "/google-login",
    googleLogin
);


// ===============================
// VERIFY LOGIN OTP
// ===============================

router.post(
    "/verify-otp",
    verifyOTP
);


// ===============================
// RESEND LOGIN OTP
// ===============================

router.post(
    "/resend-otp",
    resendOTP
);


// ===============================
// REFRESH ACCESS TOKEN
// ===============================

router.post(
    "/refresh",
    refreshToken
);


// ===============================
// LOGOUT
// ===============================

router.post(
    "/logout",
    logout
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