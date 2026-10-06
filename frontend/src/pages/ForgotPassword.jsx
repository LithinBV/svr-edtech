import { useState } from "react";
import { useNavigate } from "react-router-dom";
import svrLogo from "../assets/images/svr-logo.png";

function ForgotPassword() {

    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [resetEmail, setResetEmail] = useState("");

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [loading, setLoading] = useState(false);

    // ==========================================
    // MESSAGE
    // ==========================================

    function showError(text) {
        setMessage(text);
        setMessageType("error");
    }

    function showSuccess(text) {
        setMessage(text);
        setMessageType("success");
    }

    // ==========================================
    // SEND RESET OTP
    // ==========================================

    async function handleSendOtp(event) {
        event.preventDefault();

        const cleanedEmail = email.trim().toLowerCase();

        if (!cleanedEmail) {
            showError("Please enter your email.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanedEmail)) {
            showError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: cleanedEmail,
                }),
            });

            const responseText = await response.text();

            let data = {};

            try {
                data = JSON.parse(responseText);
            } catch {
                data = {
                    message:
                        responseText || "Unable to send OTP.",
                };
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to send OTP."
                );
            }

            const returnedEmail = (
                data.email || cleanedEmail
            )
                .trim()
                .toLowerCase();

            setResetEmail(returnedEmail);

            setOtp("");
            setNewPassword("");
            setConfirmPassword("");

            setMessage("");
            setStep(2);
        } catch (error) {
            console.error(
                "Forgot password error:",
                error
            );

            showError(
                error.message ||
                    "Unable to send OTP."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // OTP INPUT
    // ==========================================

    function handleOtpChange(event) {
        const value = event.target.value
            .replace(/\D/g, "")
            .slice(0, 6);

        setOtp(value);
    }

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    async function handleResetPassword(event) {
        event.preventDefault();

        if (!resetEmail) {
            showError(
                "Reset session expired. Please request a new OTP."
            );
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            showError(
                "Please enter a valid 6-digit OTP."
            );
            return;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordPattern.test(newPassword)) {
            showError(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/api/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        email: resetEmail,
                        otp: otp,
                        newPassword: newPassword,
                    }),
                }
            );

            const responseText =
                await response.text();

            let data = {};

            try {
                data = JSON.parse(responseText);
            } catch {
                data = {
                    message:
                        responseText ||
                        "Password reset failed.",
                };
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Password reset failed."
                );
            }

            showSuccess(
                "Password reset successfully! Redirecting to login..."
            );

            setOtp("");
            setNewPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            showError(
                error.message ||
                    "Password reset failed."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // BACK TO LOGIN
    // ==========================================

    function handleBackToLogin() {
        navigate("/login");
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="min-h-screen bg-[#00323F] flex items-center justify-center p-5">

            <div className="bg-white w-full max-w-5xl min-h-[600px] rounded-3xl overflow-hidden shadow-2xl grid md:grid-cols-2">

                {/* ==========================================
                    LEFT SIDE
                ========================================== */}

                <div className="bg-[#FECA42] flex flex-col justify-center items-center text-center p-10">

                    <div className="mb-8">
                        <img
                            src={svrLogo}
                            alt="SVR EDTECH Logo"
                            className="w-52 h-auto mx-auto"
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-[#00323F] mb-4">
                        SVR EDTECH Portal
                    </h1>

                    <p className="text-[#00323F] text-base leading-relaxed max-w-sm">
                        Securely reset your account password
                        and regain access to the SVR EDTECH
                        platform.
                    </p>

                </div>

                {/* ==========================================
                    RIGHT SIDE
                ========================================== */}

                <div className="flex flex-col justify-center p-8 sm:p-12">

                    {/* ==========================================
                        STEP 1
                    ========================================== */}

                    {step === 1 && (
                        <div>

                            <div className="mb-8">

                                <h2 className="text-3xl font-bold text-[#00323F] mb-3">
                                    Forgot Password?
                                </h2>

                                <p className="text-gray-500">
                                    Enter your registered email
                                    address and we will send you
                                    a verification OTP.
                                </p>

                            </div>

                            <form
                                onSubmit={handleSendOtp}
                                className="space-y-5"
                            >

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                        }
                                        required
                                        autoComplete="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FECA42] focus:border-transparent transition"
                                    />

                                </div>

                                {message && (
                                    <p
                                        className={`text-sm min-h-[20px] ${
                                            messageType ===
                                            "success"
                                                ? "text-green-600"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {message}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00323F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#004554] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Sending..."
                                        : "Send OTP"}
                                </button>

                            </form>

                        </div>
                    )}

                    {/* ==========================================
                        STEP 2
                    ========================================== */}

                    {step === 2 && (
                        <div>

                            <div className="mb-8">

                                <h2 className="text-3xl font-bold text-[#00323F] mb-3">
                                    Reset Password
                                </h2>

                                <p className="text-gray-500">
                                    Enter the OTP sent to your
                                    email and create a new password.
                                </p>

                            </div>

                            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4">

                                <p className="text-xs text-gray-500 mb-1">
                                    OTP sent to
                                </p>

                                <p className="font-semibold text-[#00323F] break-all">
                                    {resetEmail}
                                </p>

                            </div>

                            <form
                                onSubmit={handleResetPassword}
                                className="space-y-5"
                            >

                                {/* OTP */}

                                <div>

                                    <label
                                        htmlFor="resetOtp"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Verification OTP
                                    </label>

                                    <input
                                        type="text"
                                        id="resetOtp"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={
                                            handleOtpChange
                                        }
                                        maxLength={6}
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FECA42] focus:border-transparent transition tracking-[0.4em] text-center font-semibold"
                                    />

                                </div>

                                {/* NEW PASSWORD */}

                                <div>

                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        id="newPassword"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(event) =>
                                            setNewPassword(
                                                event.target.value
                                            )
                                        }
                                        minLength={8}
                                        required
                                        autoComplete="new-password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FECA42] focus:border-transparent transition"
                                    />

                                </div>

                                {/* CONFIRM PASSWORD */}

                                <div>

                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Confirm Password
                                    </label>

                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        minLength={8}
                                        required
                                        autoComplete="new-password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FECA42] focus:border-transparent transition"
                                    />

                                </div>

                                {message && (
                                    <p
                                        className={`text-sm min-h-[20px] ${
                                            messageType ===
                                            "success"
                                                ? "text-green-600"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {message}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00323F] text-white py-3.5 rounded-xl font-semibold hover:bg-[#004554] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>

                            </form>

                        </div>
                    )}

                    {/* ==========================================
                        BACK TO LOGIN
                    ========================================== */}

                    <div className="text-center mt-8">

                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="text-sm font-medium text-[#00323F] hover:underline"
                        >
                            ← Back to Login
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default ForgotPassword;