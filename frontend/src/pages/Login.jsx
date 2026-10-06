import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import svrLogo from "../assets/images/svr-logo.png";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");



const GOOGLE_CLIENT_ID =
    "YOUR_EXISTING_GOOGLE_CLIENT_ID";


function Login() {
    const navigate = useNavigate();

    const [isOtpStep, setIsOtpStep] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [pendingUserType, setPendingUserType] = useState("");
    const [pendingUserName, setPendingUserName] = useState("");

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [resendSeconds, setResendSeconds] = useState(0);

    const resendTimerRef = useRef(null);

    const googleButtonRef = useRef(null);
    const googleInitializedRef = useRef(false);


    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    useEffect(() => {
        return () => {
            if (resendTimerRef.current) {
                clearInterval(resendTimerRef.current);
            }
        };
    }, []);


    /*
     * ---------------------------------------------------------
     * GOOGLE IDENTITY SERVICES
     * ---------------------------------------------------------
     */

    useEffect(() => {
        let cancelled = false;

        const initializeGoogle = () => {
            if (cancelled) {
                return;
            }

            if (
                typeof window.google === "undefined" ||
                !window.google.accounts ||
                !window.google.accounts.id
            ) {
                return;
            }

            try {
                if (!googleInitializedRef.current) {
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: handleGoogleResponse,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    googleInitializedRef.current = true;
                }

                if (googleButtonRef.current) {
                    googleButtonRef.current.innerHTML = "";

                    window.google.accounts.id.renderButton(
                        googleButtonRef.current,
                        {
                            type: "standard",
                            theme: "outline",
                            size: "large",
                            text: "continue_with",
                            shape: "rectangular",
                            logo_alignment: "left",
                            width: 400,
                        }
                    );
                }
            } catch (error) {
                console.error(
                    "Google initialization error:",
                    error
                );

                showMessage(
                    "Unable to initialize Google Login.",
                    "error"
                );
            }
        };

        const existingScript = document.querySelector(
            'script[src="https://accounts.google.com/gsi/client"]'
        );

        if (existingScript) {
            if (
                typeof window.google !== "undefined" &&
                window.google.accounts &&
                window.google.accounts.id
            ) {
                initializeGoogle();
            } else {
                existingScript.addEventListener(
                    "load",
                    initializeGoogle
                );
            }

            return () => {
                cancelled = true;

                existingScript.removeEventListener(
                    "load",
                    initializeGoogle
                );
            };
        }

        const script = document.createElement("script");

        script.src =
            "https://accounts.google.com/gsi/client";

        script.async = true;
        script.defer = true;

        script.onload = initializeGoogle;

        script.onerror = () => {
            console.error(
                "Google Identity Services failed to load."
            );

            showMessage(
                "Google Login could not be loaded.",
                "error"
            );
        };

        document.body.appendChild(script);

        return () => {
            cancelled = true;
        };
    }, []);


    /*
     * ---------------------------------------------------------
     * MESSAGE
     * ---------------------------------------------------------
     */

    function showMessage(text, type = "") {
        setMessage(text);
        setMessageType(type);
    }


    /*
     * ---------------------------------------------------------
     * START RESEND COUNTDOWN
     * ---------------------------------------------------------
     */

    function startResendCountdown(seconds) {
        if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
        }

        const initialSeconds =
            Math.max(0, Number(seconds) || 0);

        setResendSeconds(initialSeconds);

        if (initialSeconds <= 0) {
            return;
        }

        resendTimerRef.current = setInterval(() => {
            setResendSeconds((previous) => {
                if (previous <= 1) {
                    clearInterval(
                        resendTimerRef.current
                    );

                    resendTimerRef.current = null;

                    return 0;
                }

                return previous - 1;
            });
        }, 1000);
    }


    /*
     * ---------------------------------------------------------
     * STOP RESEND COUNTDOWN
     * ---------------------------------------------------------
     */

    function stopResendCountdown() {
        if (resendTimerRef.current) {
            clearInterval(
                resendTimerRef.current
            );

            resendTimerRef.current = null;
        }

        setResendSeconds(0);
    }


    /*
     * ---------------------------------------------------------
     * NORMAL LOGIN
     * ---------------------------------------------------------
     */

    async function handleLogin(event) {
        event.preventDefault();

        const cleanedEmail =
            email.trim().toLowerCase();

        showMessage("");

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanedEmail
            )
        ) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }

        if (!password) {
            showMessage(
                "Please enter your password.",
                "error"
            );

            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email: cleanedEmail,
                        password,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                showMessage(
                    data.message ||
                        "Login failed.",
                    "error"
                );

                return;
            }

            setEmail(
                data.email ||
                    cleanedEmail
            );

            setPendingUserType(
                data.userType || ""
            );

            setPendingUserName(
                data.userName || ""
            );

            showMessage("");

            setIsOtpStep(true);

            setOtp("");

            startResendCountdown(60);
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    }


    /*
     * ---------------------------------------------------------
     * VERIFY OTP
     * ---------------------------------------------------------
     */

    async function handleVerifyOtp(event) {
        event.preventDefault();

        const cleanedOtp =
            otp.trim();

        showMessage("");

        if (!/^\d{6}$/.test(cleanedOtp)) {
            showMessage(
                "Please enter a valid 6-digit OTP.",
                "error"
            );

            return;
        }

        setIsLoading(true);

        try {
            const response =
                await fetch(
                    `${API_URL}/api/auth/verify-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email,
                            otp: cleanedOtp,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                showMessage(
                    data.message ||
                        "Invalid OTP.",
                    "error"
                );

                return;
            }

            showMessage(
                "OTP verified successfully.",
                "success"
            );

            const userType =
                data.userType ||
                pendingUserType;

            const userName =
                data.userName ||
                pendingUserName ||
                "";

            if (data.token) {
                localStorage.setItem(
                    "token",
                    data.token
                );
            }

            if (data.refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    data.refreshToken
                );
            }

            if (userType) {
                localStorage.setItem(
                    "userType",
                    userType
                );
            }

            if (userName) {
                localStorage.setItem(
                    "userName",
                    userName
                );
            } else {
                localStorage.removeItem(
                    "userName"
                );
            }

            if (email) {
                localStorage.setItem(
                    "userEmail",
                    email
                );
            }

            if (
                userType ===
                    "INSTITUTION_ADMIN" &&
                data.institutionId
            ) {
                localStorage.setItem(
                    "institutionId",
                    data.institutionId
                );
            } else {
                localStorage.removeItem(
                    "institutionId"
                );
            }

            stopResendCountdown();

            redirectUser(userType);
        } catch (error) {
            console.error(
                "OTP verification error:",
                error
            );

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    }


    /*
     * ---------------------------------------------------------
     * REDIRECT USER
     * ---------------------------------------------------------
     */

    function redirectUser(userType) {
        switch (userType) {
            case "SUPER_ADMIN":
                navigate(
                    "/admin-dashboard"
                );
                break;

            case "INSTITUTION_ADMIN":
                navigate(
                    "/institution-admin-dashboard"
                );
                break;

            case "MANAGER":
            case "USER_MANAGER":
                navigate(
                    "/manager-dashboard"
                );
                break;

            case "EXECUTIVE":
            case "USER_EXECUTIVE":
                navigate(
                    "/executive-dashboard"
                );
                break;

            default:
                console.error(
                    "Unknown user type:",
                    userType
                );

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "refreshToken"
                );

                localStorage.removeItem(
                    "userType"
                );

                localStorage.removeItem(
                    "userName"
                );

                localStorage.removeItem(
                    "userEmail"
                );

                localStorage.removeItem(
                    "institutionId"
                );

                showMessage(
                    "Invalid user type.",
                    "error"
                );
        }
    }


    /*
     * ---------------------------------------------------------
     * RESEND OTP
     * ---------------------------------------------------------
     */

    async function handleResendOtp() {
        if (resendSeconds > 0) {
            return;
        }

        if (!email) {
            showMessage(
                "Please login again.",
                "error"
            );

            return;
        }

        setIsLoading(true);

        showMessage("");

        try {
            const response =
                await fetch(
                    `${API_URL}/api/auth/resend-otp`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                showMessage(
                    data.message ||
                        "Unable to resend OTP.",
                    "error"
                );

                if (
                    data.remainingSeconds
                ) {
                    startResendCountdown(
                        data.remainingSeconds
                    );
                }

                return;
            }

            showMessage(
                "A new OTP has been sent to your email.",
                "success"
            );

            setOtp("");

            startResendCountdown(60);
        } catch (error) {
            console.error(
                "Resend OTP error:",
                error
            );

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    }


    /*
     * ---------------------------------------------------------
     * BACK TO LOGIN
     * ---------------------------------------------------------
     */

    function handleBackToLogin() {
        stopResendCountdown();

        setIsOtpStep(false);

        setOtp("");

        setPendingUserType("");

        setPendingUserName("");

        showMessage("");
    }


    /*
     * ---------------------------------------------------------
     * GOOGLE RESPONSE
     * ---------------------------------------------------------
     */

    async function handleGoogleResponse(
        response
    ) {
        try {
            if (
                !response ||
                !response.credential
            ) {
                showMessage(
                    "Google authentication failed.",
                    "error"
                );

                return;
            }

            setIsLoading(true);

            showMessage("");

            const backendResponse =
                await fetch(
                    `${API_URL}/api/auth/google-login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            credential:
                                response.credential,
                        }),
                    }
                );

            const data =
                await backendResponse.json();

            if (!backendResponse.ok) {
                showMessage(
                    data.message ||
                        "Google login failed.",
                    "error"
                );

                return;
            }

            setEmail(
                data.email || ""
            );

            setPendingUserType(
                data.userType || ""
            );

            setPendingUserName(
                data.userName || ""
            );

            showMessage("");

            setIsOtpStep(true);

            setOtp("");

            startResendCountdown(60);
        } catch (error) {
            console.error(
                "Google login error:",
                error
            );

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    }


    /*
     * ---------------------------------------------------------
     * OTP INPUT
     * ---------------------------------------------------------
     */

    function handleOtpChange(event) {
        const numericValue =
            event.target.value.replace(
                /\D/g,
                ""
            );

        setOtp(
            numericValue.slice(0, 6)
        );
    }


    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (
        <div className="min-h-screen bg-[#00323F] flex items-center justify-center p-5">

            <div className="w-full max-w-5xl min-h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

                {/* LEFT SIDE */}

                <div className="relative bg-[#FECA42] flex flex-col items-center justify-center text-center p-10 overflow-hidden">

                    <div className="relative z-10 flex items-center justify-center">

                        <img
                            src={svrLogo}
                            alt="SVR EDTECH Logo"
                            className="w-80 max-w-full h-auto object-contain"
                        />

                    </div>

                    <h2 className="relative z-10 mt-7 text-3xl font-bold text-[#00323F]">
                        SVR EDTECH Portal
                    </h2>

                    <p className="relative z-10 mt-3 max-w-sm text-sm leading-6 text-[#00323F]/75">
                        Securely access your account,
                        manage leads, teams and platform
                        activities.
                    </p>

                </div>


                {/* RIGHT SIDE */}

                <div className="flex items-center justify-center bg-white p-7 sm:p-10 md:p-12">

                    <div className="w-full max-w-md">

                        {/* HEADING */}

                        {!isOtpStep ? (

                            <div className="mb-8">

                                <h1 className="text-3xl sm:text-4xl font-bold text-[#00323F]">
                                    Welcome Back
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    Sign in to your account
                                </p>

                            </div>

                        ) : (

                            <div className="mb-8">

                                <h1 className="text-3xl sm:text-4xl font-bold text-[#00323F]">
                                    Verify OTP
                                </h1>

                                <p className="mt-2 text-sm text-gray-500">
                                    Complete your secure
                                    login
                                </p>

                            </div>

                        )}


                        {/* LOGIN FORM */}

                        {!isOtpStep && (

                            <>

                                <form
                                    onSubmit={
                                        handleLogin
                                    }
                                    className="space-y-5"
                                >

                                    {/* EMAIL */}

                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-gray-700"
                                        >
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(
                                                event
                                            ) =>
                                                setEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter your email"
                                            autoComplete="email"
                                            required
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10"
                                        />

                                    </div>


                                    {/* PASSWORD */}

                                    <div>

                                        <div className="mb-2 flex items-center justify-between">

                                            <label
                                                htmlFor="password"
                                                className="text-sm font-semibold text-gray-700"
                                            >
                                                Password
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        "/forgot-password"
                                                    )
                                                }
                                                className="text-sm font-medium text-[#00323F] transition hover:underline"
                                            >
                                                Forgot Password?
                                            </button>

                                        </div>

                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(
                                                event
                                            ) =>
                                                setPassword(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10"
                                        />

                                    </div>


                                    {/* MESSAGE */}

                                    {message && (

                                        <p
                                            className={`text-center text-sm font-medium ${
                                                messageType ===
                                                "error"
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {message}
                                        </p>

                                    )}


                                    {/* LOGIN BUTTON */}

                                    <button
                                        type="submit"
                                        disabled={
                                            isLoading
                                        }
                                        className="w-full rounded-xl bg-[#00323F] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#024957] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isLoading
                                            ? "Sending OTP..."
                                            : "Login"}
                                    </button>

                                </form>


                                {/* GOOGLE LOGIN */}

                                <div>

                                    <div className="my-7 flex items-center gap-3">

                                        <div className="h-px flex-1 bg-gray-200" />

                                        <span className="whitespace-nowrap text-xs font-medium text-gray-400">
                                            OR CONTINUE WITH
                                        </span>

                                        <div className="h-px flex-1 bg-gray-200" />

                                    </div>


                                    <div
                                        ref={
                                            googleButtonRef
                                        }
                                        className="flex justify-center min-h-[44px]"
                                    />

                                </div>

                            </>

                        )}


                        {/* OTP FORM */}

                        {isOtpStep && (

                            <form
                                onSubmit={
                                    handleVerifyOtp
                                }
                                className="space-y-5"
                            >

                                <div>

                                    <h2 className="text-2xl font-bold text-[#00323F]">
                                        Verify Your Email
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        We have sent a 6-digit
                                        OTP to your email
                                        address.
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[#00323F]">
                                        {email}
                                    </p>

                                </div>


                                {/* OTP */}

                                <div>

                                    <label
                                        htmlFor="otp"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Enter OTP
                                    </label>

                                    <input
                                        type="password"
                                        id="otp"
                                        value={otp}
                                        onChange={
                                            handleOtpChange
                                        }
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        placeholder="Enter 6-digit OTP"
                                        required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-gray-800 outline-none transition placeholder:text-gray-400 placeholder:tracking-normal focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10"
                                    />

                                </div>


                                {/* MESSAGE */}

                                {message && (

                                    <p
                                        className={`text-center text-sm font-medium ${
                                            messageType ===
                                            "error"
                                                ? "text-red-600"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {message}
                                    </p>

                                )}


                                {/* VERIFY */}

                                <button
                                    type="submit"
                                    disabled={
                                        isLoading
                                    }
                                    className="w-full rounded-xl bg-[#00323F] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#024957] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoading
                                        ? "Verifying..."
                                        : "Verify OTP"}
                                </button>


                                {/* RESEND */}

                                <div className="text-center">

                                    <p className="text-sm text-gray-500">
                                        Didn't receive the
                                        OTP?
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            handleResendOtp
                                        }
                                        disabled={
                                            isLoading ||
                                            resendSeconds >
                                                0
                                        }
                                        className="mt-1 text-sm font-semibold text-[#00323F] hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                                    >
                                        Resend OTP
                                    </button>

                                    {resendSeconds >
                                        0 && (

                                        <p className="mt-1 text-xs text-gray-400">
                                            You can resend OTP{" "}
                                            {
                                                resendSeconds
                                            }
                                            s
                                        </p>

                                    )}

                                </div>


                                {/* BACK */}

                                <button
                                    type="button"
                                    onClick={
                                        handleBackToLogin
                                    }
                                    className="w-full text-sm font-medium text-[#00323F] hover:underline"
                                >
                                    Back to Login
                                </button>

                            </form>

                        )}


                        {/* FOOTER */}

                        <p className="mt-8 text-center text-xs text-gray-400">
                            © 2026 SVR EDTECH. All rights
                            reserved.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;