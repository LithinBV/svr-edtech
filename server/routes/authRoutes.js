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
  resetPassword,
} = require("../controllers/authController");

// Authentication & OTP
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/google", googleLogin); // Fallback alias
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Token Refresh (Supports both /refresh and /refresh-token)
router.post("/refresh", refreshToken);
router.post("/refresh-token", refreshToken);

// Session Termination
router.post("/logout", logout);

// Password Recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;