import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import indianStates from "../data/indianStates.js";
import indianRegions from "../data/indianRegions.js";

// ============================================================
// COMPONENT
// ============================================================

function CreateInstitution() {
    const navigate = useNavigate();

    // ========================================================
    // FORM STATE
    // ========================================================

    const [institutionName, setInstitutionName] =
        useState("");

    const [state, setState] =
        useState("");

    const [region, setRegion] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    // ========================================================
    // UI STATE
    // ========================================================

    const [stateOpen, setStateOpen] =
        useState(false);

    const [regionOpen, setRegionOpen] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState("error");

    const [isCreating, setIsCreating] =
        useState(false);

    // ========================================================
    // AUTH CHECK
    // ========================================================

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        const userType =
            localStorage.getItem("userType");

        if (!token) {
            navigate("/login", {
                replace: true,
            });

            return;
        }

        if (userType !== "SUPER_ADMIN") {
            if (
                userType ===
                "INSTITUTION_ADMIN"
            ) {
                navigate(
                    "/institution-admin-dashboard",
                    {
                        replace: true,
                    }
                );
            } else {
                localStorage.clear();

                navigate("/login", {
                    replace: true,
                });
            }
        }
    }, [navigate]);

    // ========================================================
    // REGIONS FOR SELECTED STATE
    // ========================================================

    const regions = useMemo(() => {
        return indianRegions[state] || [];
    }, [state]);

    // ========================================================
    // SHOW MESSAGE
    // ========================================================

    const showMessage = (
        text,
        type = "error"
    ) => {
        setMessage(text);
        setMessageType(type);
    };

    // ========================================================
    // SELECT STATE
    // ========================================================

    const handleStateSelect = (
        selectedState
    ) => {
        setState(selectedState);

        // Reset region whenever state changes
        setRegion("");

        setStateOpen(false);
        setRegionOpen(false);

        setMessage("");
    };

    // ========================================================
    // SELECT REGION
    // ========================================================

    const handleRegionSelect = (
        selectedRegion
    ) => {
        setRegion(selectedRegion);

        setRegionOpen(false);

        setMessage("");
    };

    // ========================================================
    // PASSWORD VALIDATION
    // ========================================================

    const isValidPassword = (value) => {
        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        return passwordPattern.test(value);
    };

    // ========================================================
    // GET TOKEN
    // ========================================================

    const getValidAccessToken = () => {
        return localStorage.getItem("token");
    };

    // ========================================================
    // FORM SUBMIT
    // ========================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setMessage("");

        // ======================================================
        // TOKEN
        // ======================================================

        const token =
            getValidAccessToken();

        if (!token) {
            showMessage(
                "Your session has expired. Please login again."
            );

            return;
        }

        // ======================================================
        // CLEAN VALUES
        // ======================================================

        const cleanInstitutionName =
            institutionName.trim();

        const cleanState =
            state.trim();

        const cleanRegion =
            region.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        const cleanUsername =
            username.trim();

        // ======================================================
        // REQUIRED FIELD VALIDATION
        // ======================================================

        if (
            !cleanInstitutionName ||
            !cleanState ||
            !cleanRegion ||
            !cleanEmail ||
            !cleanUsername ||
            !password
        ) {
            showMessage(
                "Please fill all fields."
            );

            return;
        }

        // ======================================================
        // EMAIL VALIDATION
        // ======================================================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                cleanEmail
            )
        ) {
            showMessage(
                "Please enter a valid email address."
            );

            return;
        }

        // ======================================================
        // PASSWORD VALIDATION
        // ======================================================

        if (!isValidPassword(password)) {
            showMessage(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            );

            return;
        }

        // ======================================================
        // DISABLE BUTTON
        // ======================================================

        setIsCreating(true);

        // ======================================================
        // SEND REQUEST
        // ======================================================

        try {
            const response =
                await fetch(
                    "/api/institutions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            institutionName:
                                cleanInstitutionName,

                            state:
                                cleanState,

                            region:
                                cleanRegion,

                            email:
                                cleanEmail,

                            username:
                                cleanUsername,

                            password,
                        }),
                    }
                );

            // ==================================================
            // READ RESPONSE
            // ==================================================

            let data = {};

            const responseText =
                await response.text();

            try {
                data =
                    JSON.parse(
                        responseText
                    );
            } catch {
                data = {
                    message:
                        responseText ||
                        "Server returned an invalid response.",
                };
            }

            // ==================================================
            // UNAUTHORIZED
            // ==================================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();

                showMessage(
                    "Your session has expired. Please login again."
                );

                setTimeout(() => {
                    navigate("/login", {
                        replace: true,
                    });
                }, 1000);

                return;
            }

            // ==================================================
            // OTHER ERROR
            // ==================================================

            if (!response.ok) {
                showMessage(
                    data.message ||
                        "Failed to create institution."
                );

                return;
            }

            // ==================================================
            // SUCCESS
            // ==================================================

            showMessage(
                data.message ||
                    "Institution created successfully.",
                "success"
            );

            // ==================================================
            // RESET FORM
            // ==================================================

            setInstitutionName("");
            setState("");
            setRegion("");

            setEmail("");
            setUsername("");
            setPassword("");

            setStateOpen(false);
            setRegionOpen(false);

            // ==================================================
            // REDIRECT
            // ==================================================

            setTimeout(() => {
                navigate(
                    "/admin-dashboard"
                );
            }, 1500);

        } catch (error) {
            console.error(
                "Create institution error:",
                error
            );

            showMessage(
                "Unable to connect to the server."
            );
        } finally {
            setIsCreating(false);
        }
    };

    // ========================================================
    // CLOSE DROPDOWNS
    // ========================================================

    useEffect(() => {
        const handleOutsideClick = (
            event
        ) => {
            if (
                !event.target.closest(
                    "[data-state-dropdown]"
                )
            ) {
                setStateOpen(false);
            }

            if (
                !event.target.closest(
                    "[data-region-dropdown]"
                )
            ) {
                setRegionOpen(false);
            }
        };

        document.addEventListener(
            "click",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "click",
                handleOutsideClick
            );
        };
    }, []);

    // ========================================================
    // COMMON INPUT STYLE
    // ========================================================

    const inputClass = `
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        px-4
        py-3.5
        text-sm
        font-medium
        text-[#102236]
        outline-none
        transition-all
        duration-200
        placeholder:text-slate-400
        hover:border-[#102236]/20
        hover:bg-white
        focus:border-[#F6C945]
        focus:bg-white
        focus:ring-4
        focus:ring-[#F6C945]/15
    `;

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="min-h-screen bg-[#F7F9FC]">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="
                relative
                overflow-hidden
                border-b
                border-[#F6C945]/20
                bg-[#102236]
            ">

                {/* Decorative Yellow Circle */}

                <div className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-64
                    w-64
                    rounded-full
                    bg-[#F6C945]/10
                " />

                <div className="
                    pointer-events-none
                    absolute
                    -bottom-20
                    left-1/3
                    h-48
                    w-48
                    rounded-full
                    bg-[#F6C945]/5
                " />

                <div className="
                    relative
                    mx-auto
                    flex
                    max-w-6xl
                    flex-col
                    gap-5
                    px-4
                    py-7
                    sm:px-6
                    lg:px-8
                    md:flex-row
                    md:items-center
                    md:justify-between
                ">

                    {/* PAGE TITLE */}

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <div className="
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#F6C945]
                            text-[#102236]
                            shadow-lg
                            shadow-black/10
                        ">

                            <svg
                                className="h-7 w-7"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 12h16"
                                />
                            </svg>

                        </div>

                        <div>

                            <p className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-[#F6C945]
                            ">
                                Institution Management
                            </p>

                            <h1 className="
                                mt-1
                                text-2xl
                                font-black
                                tracking-tight
                                text-white
                                sm:text-3xl
                            ">
                                Create Institution
                            </h1>

                            <p className="
                                mt-1
                                text-sm
                                text-white/60
                            ">
                                Add a new institution and
                                administrator account
                            </p>

                        </div>

                    </div>

                    {/* BACK BUTTON */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            px-5
                            py-3
                            text-sm
                            font-bold
                            text-white
                            backdrop-blur-sm
                            transition-all
                            duration-200
                            hover:border-[#F6C945]/50
                            hover:bg-[#F6C945]
                            hover:text-[#102236]
                        "
                    >

                        <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 12H5"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 19l-7-7 7-7"
                            />
                        </svg>

                        Back to Dashboard

                    </button>

                </div>

            </header>

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="
                mx-auto
                max-w-6xl
                px-4
                py-8
                sm:px-6
                lg:px-8
            ">

                {/* =================================================
                    INTRO
                ================================================= */}

                <div className="mb-7">

                    <div className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#F6C945]/30
                        bg-[#F6C945]/10
                        px-3
                        py-1.5
                    ">

                        <span className="
                            h-2
                            w-2
                            rounded-full
                            bg-[#F6C945]
                        " />

                        <span className="
                            text-xs
                            font-bold
                            text-[#8A6B00]
                        ">
                            NEW INSTITUTION
                        </span>

                    </div>

                    <h2 className="
                        mt-4
                        text-2xl
                        font-black
                        tracking-tight
                        text-[#14213D]
                        sm:text-3xl
                    ">
                        Add a New Institution
                    </h2>

                    <p className="
                        mt-1
                        max-w-2xl
                        text-sm
                        text-slate-500
                    ">
                        Create an institution and
                        configure its administrator
                        account.
                    </p>

                </div>

                {/* =================================================
                    FORM CARD
                ================================================= */}

                <div className="
                    overflow-visible
                    rounded-[28px]
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_12px_40px_rgba(16,34,54,0.08)]
                ">

                    <form
                        onSubmit={handleSubmit}
                        className="p-5 sm:p-7 lg:p-9"
                    >

                        {/* =================================================
                            INSTITUTION INFORMATION
                        ================================================= */}

                        <div className="
                            rounded-2xl
                            border
                            border-[#F6C945]/30
                            bg-[#F6C945]/5
                            p-5
                        ">

                            <div className="
                                flex
                                items-center
                                gap-4
                            ">

                                <div className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#F6C945]
                                    text-[#102236]
                                    shadow-sm
                                ">

                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 21h18"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 7h1"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 7h1"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 11h1"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 11h1"
                                        />
                                    </svg>

                                </div>

                                <div>

                                    <h3 className="
                                        text-lg
                                        font-black
                                        text-[#102236]
                                    ">
                                        Institution Information
                                    </h3>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-[#102236]/60
                                    ">
                                        Enter the basic details
                                        of the institution.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            INSTITUTION NAME
                        ================================================= */}

                        <div className="mt-7">

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Institution Name
                            </label>

                            <input
                                type="text"
                                value={institutionName}
                                onChange={(event) =>
                                    setInstitutionName(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter institution name"
                                required
                                className={inputClass}
                            />

                        </div>

                        {/* =================================================
                            STATE + REGION
                        ================================================= */}

                        <div className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        ">

                            {/* STATE */}

                            <div
                                className="relative"
                                data-state-dropdown
                            >

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">
                                    State
                                </label>

                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        setStateOpen(
                                            (previous) =>
                                                !previous
                                        );

                                        setRegionOpen(
                                            false
                                        );
                                    }}
                                    className={`
                                        ${inputClass}
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        text-left
                                    `}
                                >

                                    <span
                                        className={`
                                            flex-1
                                            truncate
                                            ${
                                                state
                                                    ? "text-[#102236]"
                                                    : "text-slate-400"
                                            }
                                        `}
                                    >
                                        {state ||
                                            "Select State"}
                                    </span>

                                    <svg
                                        className={`
                                            h-5
                                            w-5
                                            shrink-0
                                            text-slate-400
                                            transition-transform
                                            ${
                                                stateOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </button>

                                {stateOpen && (
                                    <div className="
                                        absolute
                                        left-0
                                        right-0
                                        top-full
                                        z-50
                                        mt-2
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        shadow-[0_18px_45px_rgba(16,34,54,0.16)]
                                    ">

                                        <div className="
                                            max-h-64
                                            overflow-y-auto
                                            p-2
                                        ">

                                            {indianStates.map(
                                                (item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() =>
                                                            handleStateSelect(
                                                                item
                                                            )
                                                        }
                                                        className={`
                                                            w-full
                                                            rounded-xl
                                                            px-4
                                                            py-2.5
                                                            text-left
                                                            text-sm
                                                            font-medium
                                                            transition
                                                            ${
                                                                state ===
                                                                item
                                                                    ? "bg-[#102236] text-[#F6C945]"
                                                                    : "text-slate-700 hover:bg-[#F6C945]/10 hover:text-[#102236]"
                                                            }
                                                        `}
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            )}

                                        </div>

                                    </div>
                                )}

                            </div>

                            {/* REGION */}

                            <div
                                className="relative"
                                data-region-dropdown
                            >

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">
                                    Region
                                </label>

                                <button
                                    type="button"
                                    disabled={
                                        !state ||
                                        regions.length === 0
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();

                                        if (
                                            !state ||
                                            regions.length === 0
                                        ) {
                                            return;
                                        }

                                        setRegionOpen(
                                            (previous) =>
                                                !previous
                                        );

                                        setStateOpen(
                                            false
                                        );
                                    }}
                                    className={`
                                        ${inputClass}
                                        flex
                                        items-center
                                        justify-between
                                        gap-3
                                        text-left
                                        ${
                                            !state ||
                                            regions.length === 0
                                                ? "cursor-not-allowed bg-slate-100"
                                                : ""
                                        }
                                    `}
                                >

                                    <span
                                        className={`
                                            flex-1
                                            truncate
                                            ${
                                                region
                                                    ? "text-[#102236]"
                                                    : "text-slate-400"
                                            }
                                        `}
                                    >
                                        {!state
                                            ? "Select State First"
                                            : regions.length === 0
                                            ? "No regions available"
                                            : region ||
                                              "Select Region"}
                                    </span>

                                    <svg
                                        className={`
                                            h-5
                                            w-5
                                            shrink-0
                                            text-slate-400
                                            transition-transform
                                            ${
                                                regionOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </button>

                                {regionOpen && (
                                    <div className="
                                        absolute
                                        left-0
                                        right-0
                                        top-full
                                        z-50
                                        mt-2
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        shadow-[0_18px_45px_rgba(16,34,54,0.16)]
                                    ">

                                        <div className="
                                            max-h-64
                                            overflow-y-auto
                                            p-2
                                        ">

                                            {regions.map(
                                                (item) => (
                                                    <button
                                                        key={item}
                                                        type="button"
                                                        onClick={() =>
                                                            handleRegionSelect(
                                                                item
                                                            )
                                                        }
                                                        className={`
                                                            w-full
                                                            rounded-xl
                                                            px-4
                                                            py-2.5
                                                            text-left
                                                            text-sm
                                                            font-medium
                                                            transition
                                                            ${
                                                                region ===
                                                                item
                                                                    ? "bg-[#102236] text-[#F6C945]"
                                                                    : "text-slate-700 hover:bg-[#F6C945]/10 hover:text-[#102236]"
                                                            }
                                                        `}
                                                    >
                                                        {item}
                                                    </button>
                                                )
                                            )}

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* =================================================
                            ADMIN INFORMATION
                        ================================================= */}

                        <div className="
                            mt-9
                            rounded-2xl
                            border
                            border-[#102236]/10
                            bg-[#102236]/[0.035]
                            p-5
                        ">

                            <div className="
                                flex
                                items-center
                                gap-4
                            ">

                                <div className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-[#102236]
                                    text-[#F6C945]
                                    shadow-sm
                                ">

                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle
                                            cx="12"
                                            cy="8"
                                            r="3"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 20a7 7 0 0114 0"
                                        />
                                    </svg>

                                </div>

                                <div>

                                    <h3 className="
                                        text-lg
                                        font-black
                                        text-[#102236]
                                    ">
                                        Institution Admin
                                    </h3>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-[#102236]/60
                                    ">
                                        Create the login
                                        credentials for the
                                        institution administrator.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            EMAIL
                        ================================================= */}

                        <div className="mt-7">

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter admin email"
                                required
                                autoComplete="email"
                                className={inputClass}
                            />

                            <p className="
                                mt-2
                                text-xs
                                text-slate-400
                            ">
                                This email will be used by
                                the institution administrator
                                to log in.
                            </p>

                        </div>

                        {/* =================================================
                            USERNAME
                        ================================================= */}

                        <div className="mt-5">

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter admin username"
                                required
                                autoComplete="username"
                                className={inputClass}
                            />

                        </div>

                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <div className="mt-5">

                            <label className="
                                mb-2
                                block
                                text-sm
                                font-bold
                                text-slate-700
                            ">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter admin password"
                                minLength={8}
                                required
                                autoComplete="new-password"
                                className={inputClass}
                            />

                            <p className="
                                mt-2
                                text-xs
                                text-slate-400
                            ">
                                Minimum 8 characters with
                                uppercase, lowercase, number
                                and special character.
                            </p>

                        </div>

                        {/* =================================================
                            MESSAGE
                        ================================================= */}

                        {message && (
                            <div
                                className={`
                                    mt-7
                                    rounded-2xl
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    ${
                                        messageType ===
                                        "success"
                                            ? "border-[#F6C945]/40 bg-[#F6C945]/10 text-[#705600]"
                                            : "border-red-200 bg-red-50 text-red-700"
                                    }
                                `}
                            >

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                    {messageType ===
                                    "success" ? (
                                        <div className="
                                            flex
                                            h-7
                                            w-7
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#F6C945]
                                            text-[#102236]
                                        ">
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 12l4 4L19 6"
                                                />
                                            </svg>
                                        </div>
                                    ) : (
                                        <svg
                                            className="
                                                h-5
                                                w-5
                                                shrink-0
                                                text-red-600
                                            "
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />

                                            <path
                                                d="M12 8v4"
                                            />

                                            <path
                                                d="M12 16h.01"
                                            />
                                        </svg>
                                    )}

                                    <span>
                                        {message}
                                    </span>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="
                            mt-8
                            flex
                            flex-col-reverse
                            gap-3
                            border-t
                            border-slate-100
                            pt-7
                            sm:flex-row
                            sm:justify-end
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/admin-dashboard"
                                    )
                                }
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-7
                                    py-3.5
                                    text-sm
                                    font-bold
                                    text-[#102236]
                                    transition-all
                                    duration-200
                                    hover:border-[#102236]/20
                                    hover:bg-[#102236]/5
                                    sm:w-auto
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`
                                    w-full
                                    rounded-2xl
                                    px-8
                                    py-3.5
                                    text-sm
                                    font-black
                                    transition-all
                                    duration-200
                                    sm:w-auto
                                    ${
                                        isCreating
                                            ? "cursor-not-allowed bg-slate-300 text-slate-500"
                                            : "bg-[#F6C945] text-[#102236] shadow-lg shadow-[#F6C945]/20 hover:-translate-y-0.5 hover:bg-[#FFD95A] hover:shadow-xl"
                                    }
                                `}
                            >

                                <span className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                ">

                                    {isCreating && (
                                        <svg
                                            className="
                                                h-4
                                                w-4
                                                animate-spin
                                            "
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                    )}

                                    {isCreating
                                        ? "Creating Institution..."
                                        : "Create Institution"}

                                </span>

                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default CreateInstitution;