import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import Icon from "../components/Executive/ExecutiveIcon";

const API_BASE = "/api";

// ============================================================
// DATE HELPERS
// ============================================================

const getTodayKey = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDateTime = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getFollowUpStatusClasses = (status) => {
    switch (status) {
        case "UPCOMING":
            return "bg-blue-100 text-blue-700";

        case "MISSED":
            return "bg-red-100 text-red-700";

        case "TODAY":
            return "bg-yellow-100 text-yellow-700";

        case "COMPLETED":
            return "bg-emerald-100 text-emerald-700";

        default:
            return "bg-gray-100 text-gray-500";
    }
};

const getFollowUpStatusLabel = (status) => {
    switch (status) {
        case "UPCOMING":
            return "Upcoming";

        case "MISSED":
            return "Missed";

        case "TODAY":
            return "Today";

        case "COMPLETED":
            return "Completed";

        default:
            return "No Follow-up";
    }
};

// ============================================================
// EXECUTIVE DASHBOARD
// ============================================================

function ExecutiveDashboard() {
    const navigate = useNavigate();

    const [executiveName, setExecutiveName] =
        useState("Executive");

    const [profileImage, setProfileImage] =
        useState(null);

    const [leads, setLeads] =
        useState([]);

    const [followUps, setFollowUps] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // ========================================================
    // TOKEN
    // ========================================================

    const getToken = useCallback(() => {
        return (
            localStorage.getItem("executiveToken") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    }, []);

    // ========================================================
    // AUTH
    // ========================================================

    useEffect(() => {
        const token = getToken();

        const userType =
            localStorage.getItem("executiveUserType") ||
            localStorage.getItem("userType");

        if (!token) {
            navigate("/login", {
                replace: true,
            });

            return;
        }

        if (
            userType !== "EXECUTIVE" &&
            userType !== "USER_EXECUTIVE"
        ) {
            if (userType === "SUPER_ADMIN") {
                navigate("/admin-dashboard", {
                    replace: true,
                });
            } else if (
                userType === "MANAGER" ||
                userType === "USER_MANAGER"
            ) {
                navigate("/manager-dashboard", {
                    replace: true,
                });
            } else if (
                userType === "INSTITUTION_ADMIN"
            ) {
                navigate(
                    "/institution-admin-dashboard",
                    {
                        replace: true,
                    }
                );
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("executiveToken");
                localStorage.removeItem("userType");
                localStorage.removeItem(
                    "executiveUserType"
                );

                navigate("/login", {
                    replace: true,
                });
            }

            return;
        }

        const storedName =
            localStorage.getItem("executiveUserName") ||
            localStorage.getItem("userName") ||
            "Executive";

        setExecutiveName(storedName);
    }, [navigate, getToken]);

    // ========================================================
    // LOAD PROFILE
    // ========================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = getToken();

                if (!token) {
                    return;
                }

                const response = await fetch(
                    `${API_BASE}/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    console.error(
                        "Failed to load profile:",
                        data?.message
                    );

                    return;
                }

                const profile =
                    data?.user ||
                    data?.profile ||
                    data;

                const backendName =
                    profile?.name || "Executive";

                setExecutiveName(backendName);

                setProfileImage(
                    profile?.profileImage || null
                );

                localStorage.setItem(
                    "executiveUserName",
                    backendName
                );

                localStorage.setItem(
                    "userName",
                    backendName
                );
            } catch (profileError) {
                console.error(
                    "Dashboard profile error:",
                    profileError
                );
            }
        };

        loadProfile();
    }, [getToken]);

    // ========================================================
    // LOAD DASHBOARD DATA
    // ========================================================

    const loadDashboardData = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const token = getToken();

                if (!token) {
                    navigate("/login", {
                        replace: true,
                    });

                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                const [
                    leadsResponse,
                    followUpsResponse,
                ] = await Promise.all([
                    fetch(`${API_BASE}/leads`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(
                        `${API_BASE}/leads/follow-ups`,
                        {
                            method: "GET",
                            headers,
                        }
                    ),
                ]);

                let leadsData = {};
                let followUpsData = {};

                try {
                    leadsData =
                        await leadsResponse.json();
                } catch {
                    leadsData = {};
                }

                try {
                    followUpsData =
                        await followUpsResponse.json();
                } catch {
                    followUpsData = {};
                }

                // ====================================================
                // AUTH FAILURE
                // ====================================================

                if (
                    leadsResponse.status === 401 ||
                    leadsResponse.status === 403 ||
                    followUpsResponse.status === 401 ||
                    followUpsResponse.status === 403
                ) {
                    localStorage.removeItem(
                        "executiveToken"
                    );

                    localStorage.removeItem(
                        "accessToken"
                    );

                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "jwt"
                    );

                    localStorage.removeItem(
                        "authToken"
                    );

                    navigate("/login", {
                        replace: true,
                    });

                    return;
                }

                if (!leadsResponse.ok) {
                    throw new Error(
                        leadsData?.message ||
                        "Failed to load leads"
                    );
                }

                // ====================================================
                // EXTRACT LEADS
                // ====================================================

                const receivedLeads =
                    Array.isArray(leadsData)
                        ? leadsData
                        : leadsData?.leads ||
                          leadsData?.data ||
                          [];

                // ====================================================
                // EXTRACT FOLLOW-UPS
                // ====================================================

                const receivedFollowUps =
                    Array.isArray(followUpsData)
                        ? followUpsData
                        : followUpsData?.leads ||
                          followUpsData?.followUps ||
                          followUpsData?.data ||
                          [];

                setLeads(receivedLeads);

                setFollowUps(receivedFollowUps);
            } catch (dashboardError) {
                console.error(
                    "Dashboard loading error:",
                    dashboardError
                );

                setError(
                    dashboardError?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        },
        [getToken, navigate]
    );

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // ========================================================
    // AUTO REFRESH
    // ========================================================

    useEffect(() => {
        const interval = setInterval(() => {
            loadDashboardData();
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [loadDashboardData]);

    // ========================================================
    // NAVIGATION
    // ========================================================

    const handleMyLeads = () => {
        navigate("/executive-leads");
    };

    const handleFollowUps = () => {
        navigate("/executive-follow-ups");
    };

    const handleProfile = () => {
        navigate("/executive-profile");
    };

    const handleViewAllFollowUps = () => {
        navigate("/executive-follow-ups");
    };

    const handleViewLead = (lead) => {
        if (!lead?._id) {
            return;
        }

        navigate(`/leads/${lead._id}`);
    };

    // ========================================================
    // STATISTICS
    // ========================================================

    const stats = useMemo(() => {
        const total = leads.length;

        const newLeads = leads.filter(
            (lead) =>
                lead?.status === "NEW"
        ).length;

        const cold = leads.filter(
            (lead) =>
                lead?.status === "COLD"
        ).length;

        const warm = leads.filter(
            (lead) =>
                lead?.status === "WARM"
        ).length;

        const hot = leads.filter(
            (lead) =>
                lead?.status === "HOT"
        ).length;

        // IMPORTANT:
        // Follow-up status comes directly from the backend.
        // The backend calculates TODAY / UPCOMING / MISSED /
        // COMPLETED and also handles rescheduled follow-ups.
        const upcoming = followUps.filter(
            (lead) => lead?.followUpStatus === "UPCOMING"
        ).length;

        const missed = followUps.filter(
            (lead) => lead?.followUpStatus === "MISSED"
        ).length;

        const completed = followUps.filter(
            (lead) => lead?.followUpStatus === "COMPLETED"
        ).length;

        return {
            total,
            newLeads,
            cold,
            warm,
            hot,
            upcoming,
            missed,
            completed,
        };
    }, [leads, followUps]);

    // ========================================================
    // TODAY'S FOLLOW-UPS
    // ========================================================

    const todaysFollowUps = useMemo(() => {
        // The backend is the source of truth.
        // Only records explicitly classified as TODAY
        // belong in this section.
        return followUps
            .filter(
                (lead) =>
                    lead?.followUpStatus === "TODAY"
            )
            .sort(
                (a, b) =>
                    new Date(
                        a?.displayFollowUpAt ||
                        a?.followUpAt
                    ).getTime() -
                    new Date(
                        b?.displayFollowUpAt ||
                        b?.followUpAt
                    ).getTime()
            )
            .slice(0, 5);
    }, [followUps]);

    // ========================================================
    // PERCENTAGE
    // ========================================================

    const getPercentage = (value) => {
        if (!stats.total) {
            return 0;
        }

        return Math.round(
            (value / stats.total) * 100
        );
    };

    // ========================================================
    // PROFILE INITIAL
    // ========================================================

    const profileInitial =
        executiveName
            ?.charAt(0)
            ?.toUpperCase() || "E";

    // ========================================================
    // DASHBOARD
    // ========================================================

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            {/* ==================================================
                DECORATIVE BACKGROUND
            ================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div
                    className="
                        absolute
                        -right-32
                        -top-32
                        h-80
                        w-80
                        rounded-full
                        bg-[#FECA42]/10
                        blur-3xl
                    "
                />

                <div
                    className="
                        absolute
                        -left-32
                        top-[45%]
                        h-80
                        w-80
                        rounded-full
                        bg-blue-500/5
                        blur-3xl
                    "
                />

            </div>

            {/* ==================================================
                MAIN CONTENT
                SIDEBAR + NAVBAR ARE PROVIDED BY EXECUTIVELAYOUT
            ================================================== */}

            <main className="relative min-h-screen">

                <section className="p-4 sm:p-6 lg:p-8">

                    {/* ==================================================
                        HERO
                    ================================================== */}

                    <div
                        className="
                            relative
                            mb-6
                            overflow-hidden
                            rounded-[28px]
                            bg-[#102236]
                            shadow-xl
                        "
                    >

                        {/* Decorative circles */}

                        <div
                            className="
                                pointer-events-none
                                absolute
                                -right-20
                                -top-28
                                h-72
                                w-72
                                rounded-full
                                border-[35px]
                                border-[#FECA42]/10
                            "
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute
                                -bottom-28
                                right-20
                                h-56
                                w-56
                                rounded-full
                                border-[28px]
                                border-white/5
                            "
                        />

                        <div
                            className="
                                pointer-events-none
                                absolute
                                bottom-0
                                left-[45%]
                                h-20
                                w-20
                                rounded-full
                                bg-[#FECA42]/10
                                blur-2xl
                            "
                        />

                        <div
                            className="
                                relative
                                grid
                                grid-cols-1
                                gap-8
                                p-6
                                sm:p-8
                                lg:grid-cols-[1fr_300px]
                                lg:p-10
                            "
                        >

                            {/* Hero text */}

                            <div>

                                <div
                                    className="
                                        mb-4
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        border-[#FECA42]/20
                                        bg-[#FECA42]/10
                                        px-3
                                        py-1.5
                                    "
                                >
                                    <span
                                        className="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-[#FECA42]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-[0.18em]
                                            text-[#FECA42]
                                        "
                                    >
                                        Executive Portal
                                    </span>
                                </div>

                                <p className="text-sm font-medium text-gray-400">
                                    Good to see you again
                                </p>

                                <h1
                                    className="
                                        mt-2
                                        text-3xl
                                        font-black
                                        tracking-tight
                                        text-white
                                        sm:text-4xl
                                    "
                                >
                                    Welcome,{" "}
                                    <span className="text-[#FECA42]">
                                        {executiveName}
                                    </span>
                                </h1>

                                <p
                                    className="
                                        mt-3
                                        max-w-xl
                                        text-sm
                                        leading-6
                                        text-gray-300
                                    "
                                >
                                    Keep track of your leads,
                                    follow-ups and daily
                                    activities from one place.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">

                                    <button
                                        type="button"
                                        onClick={handleMyLeads}
                                        className="
                                            inline-flex
                                            items-center
                                            rounded-xl
                                            bg-[#FECA42]
                                            px-5
                                            py-3
                                            text-sm
                                            font-bold
                                            text-[#102236]
                                            shadow-lg
                                            shadow-yellow-900/20
                                            transition
                                            hover:-translate-y-0.5
                                            hover:bg-yellow-300
                                        "
                                    >
                                        <Icon
                                            type="leads"
                                            className="mr-2 h-4 w-4"
                                        />

                                        View My Leads
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleFollowUps}
                                        className="
                                            inline-flex
                                            items-center
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            px-5
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-white/10
                                        "
                                    >
                                        <Icon
                                            type="clock"
                                            className="mr-2 h-4 w-4"
                                        />

                                        Follow-ups
                                    </button>

                                </div>

                            </div>

                            {/* ==================================================
                                FLOATING GRAPHIC
                            ================================================== */}

                            <div
                                className="
                                    relative
                                    hidden
                                    min-h-[210px]
                                    lg:block
                                "
                            >

                                {/* Main graphic */}

                                <div
                                    className="
                                        absolute
                                        right-4
                                        top-2
                                        flex
                                        h-44
                                        w-44
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-white/10
                                        bg-white/5
                                        backdrop-blur-sm
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-32
                                            w-32
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#FECA42]
                                            shadow-2xl
                                            shadow-yellow-900/30
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                h-20
                                                w-20
                                                items-center
                                                justify-center
                                                rounded-2xl
                                                bg-[#102236]
                                                text-[#FECA42]
                                                rotate-6
                                            "
                                        >
                                            <Icon
                                                type="leads"
                                                className="h-10 w-10"
                                            />
                                        </div>

                                    </div>

                                </div>

                                {/* Floating total card */}

                                <div
                                    className="
                                        absolute
                                        left-0
                                        top-8
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/10
                                        px-4
                                        py-3
                                        backdrop-blur-md
                                        shadow-xl
                                    "
                                >
                                    <p className="text-[10px] font-medium text-gray-400">
                                        Total Leads
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-white">
                                        {loading
                                            ? "..."
                                            : stats.total}
                                    </p>
                                </div>

                                {/* Floating follow-up card */}

                                <div
                                    className="
                                        absolute
                                        bottom-4
                                        right-0
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/10
                                        px-4
                                        py-3
                                        backdrop-blur-md
                                        shadow-xl
                                    "
                                >
                                    <div className="flex items-center gap-2">

                                        <span
                                            className="
                                                flex
                                                h-7
                                                w-7
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-blue-500/20
                                                text-blue-300
                                            "
                                        >
                                            <Icon
                                                type="clock"
                                                className="h-4 w-4"
                                            />
                                        </span>

                                        <div>
                                            <p className="text-[10px] text-gray-400">
                                                Upcoming
                                            </p>

                                            <p className="text-lg font-black text-white">
                                                {loading
                                                    ? "..."
                                                    : stats.upcoming}
                                            </p>
                                        </div>

                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div
                            className="
                                mb-6
                                flex
                                flex-col
                                gap-4
                                rounded-2xl
                                border
                                border-red-200
                                bg-red-50
                                px-5
                                py-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            <div>

                                <p className="font-semibold text-red-700">
                                    Unable to load dashboard
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {error}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={loadDashboardData}
                                className="
                                    rounded-lg
                                    bg-red-600
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-white
                                    hover:bg-red-700
                                "
                            >
                                Retry
                            </button>

                        </div>
                    )}

                    {/* ==================================================
                        SUMMARY CARDS
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        {/* TOTAL */}

                        <button
                            type="button"
                            onClick={handleMyLeads}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div
                                className="
                                    absolute
                                    -right-8
                                    -top-8
                                    h-24
                                    w-24
                                    rounded-full
                                    bg-blue-50
                                    transition
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">
                                        Total Leads
                                    </p>

                                    <p className="mt-2 text-3xl font-black text-[#102236]">
                                        {loading
                                            ? "..."
                                            : stats.total}
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                        transition
                                        group-hover:bg-blue-600
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="leads"
                                        className="h-6 w-6"
                                    />
                                </div>

                            </div>

                            <div className="relative mt-4 flex items-center justify-between">

                                <span className="text-xs text-gray-400">
                                    All assigned leads
                                </span>

                                <span className="text-xs font-bold text-blue-600">
                                    View →
                                </span>

                            </div>

                        </button>

                        {/* NEW */}

                        <button
                            type="button"
                            onClick={handleMyLeads}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div
                                className="
                                    absolute
                                    -right-8
                                    -top-8
                                    h-24
                                    w-24
                                    rounded-full
                                    bg-blue-50
                                    transition
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">
                                        New Leads
                                    </p>

                                    <p className="mt-2 text-3xl font-black text-blue-600">
                                        {loading
                                            ? "..."
                                            : stats.newLeads}
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                        transition
                                        group-hover:bg-blue-600
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="plus"
                                        className="h-6 w-6"
                                    />
                                </div>

                            </div>

                            <div className="relative mt-4">

                                <div className="mb-1 flex justify-between text-xs">

                                    <span className="text-gray-400">
                                        Of total leads
                                    </span>

                                    <span className="font-bold text-blue-600">
                                        {getPercentage(
                                            stats.newLeads
                                        )}
                                        %
                                    </span>

                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">

                                    <div
                                        className="
                                            h-full
                                            rounded-full
                                            bg-blue-500
                                            transition-all
                                        "
                                        style={{
                                            width: `${getPercentage(
                                                stats.newLeads
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </button>

                        {/* HOT */}

                        <button
                            type="button"
                            onClick={handleMyLeads}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div
                                className="
                                    absolute
                                    -right-8
                                    -top-8
                                    h-24
                                    w-24
                                    rounded-full
                                    bg-red-50
                                    transition
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">
                                        Hot Leads
                                    </p>

                                    <p className="mt-2 text-3xl font-black text-red-600">
                                        {loading
                                            ? "..."
                                            : stats.hot}
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-red-50
                                        text-red-600
                                        transition
                                        group-hover:bg-red-600
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="fire"
                                        className="h-6 w-6"
                                    />
                                </div>

                            </div>

                            <div className="relative mt-4">

                                <div className="mb-1 flex justify-between text-xs">

                                    <span className="text-gray-400">
                                        Of total leads
                                    </span>

                                    <span className="font-bold text-red-600">
                                        {getPercentage(
                                            stats.hot
                                        )}
                                        %
                                    </span>

                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">

                                    <div
                                        className="
                                            h-full
                                            rounded-full
                                            bg-red-500
                                            transition-all
                                        "
                                        style={{
                                            width: `${getPercentage(
                                                stats.hot
                                            )}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </button>

                        {/* FOLLOW-UPS */}

                        <button
                            type="button"
                            onClick={handleFollowUps}
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div
                                className="
                                    absolute
                                    -right-8
                                    -top-8
                                    h-24
                                    w-24
                                    rounded-full
                                    bg-orange-50
                                    transition
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative flex items-center justify-between">

                                <div>

                                    <p className="text-sm font-medium text-gray-500">
                                        Upcoming Follow-ups
                                    </p>

                                    <p className="mt-2 text-3xl font-black text-orange-600">
                                        {loading
                                            ? "..."
                                            : stats.upcoming}
                                    </p>

                                </div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-orange-50
                                        text-orange-600
                                        transition
                                        group-hover:bg-orange-500
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="clock"
                                        className="h-6 w-6"
                                    />
                                </div>

                            </div>

                            <div className="relative mt-4 flex items-center justify-between">

                                <span className="text-xs text-gray-400">
                                    Pending follow-ups
                                </span>

                                <span className="text-xs font-bold text-orange-600">
                                    View →
                                </span>

                            </div>

                        </button>

                    </div>

                    {/* ==================================================
                        LEAD + FOLLOW-UP OVERVIEW
                    ================================================== */}

                    <div
                        className="
                            mt-6
                            grid
                            grid-cols-1
                            gap-6
                            xl:grid-cols-3
                        "
                    >

                        {/* ==================================================
                            LEAD OVERVIEW
                        ================================================== */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                                xl:col-span-2
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <h3 className="text-base font-black text-gray-900">
                                        Lead Overview
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Current status of your assigned leads
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={handleMyLeads}
                                    className="
                                        text-xs
                                        font-bold
                                        text-blue-600
                                        hover:text-blue-700
                                    "
                                >
                                    View Leads →
                                </button>

                            </div>

                            <div
                                className="
                                    mt-6
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-3
                                "
                            >

                                {/* COLD */}

                                <div className="rounded-2xl bg-slate-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500">
                                                Cold
                                            </p>

                                            <p className="mt-1 text-2xl font-black text-slate-700">
                                                {loading
                                                    ? "..."
                                                    : stats.cold}
                                            </p>

                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">

                                            <Icon
                                                type="snow"
                                                className="h-5 w-5"
                                            />

                                        </div>

                                    </div>

                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">

                                        <div
                                            className="h-full rounded-full bg-slate-500"
                                            style={{
                                                width: `${getPercentage(
                                                    stats.cold
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-2 text-[11px] text-gray-400">
                                        {getPercentage(stats.cold)}% of total
                                    </p>

                                </div>

                                {/* WARM */}

                                <div className="rounded-2xl bg-amber-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500">
                                                Warm
                                            </p>

                                            <p className="mt-1 text-2xl font-black text-amber-600">
                                                {loading
                                                    ? "..."
                                                    : stats.warm}
                                            </p>

                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                                            <Icon
                                                type="fire"
                                                className="h-5 w-5"
                                            />

                                        </div>

                                    </div>

                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">

                                        <div
                                            className="h-full rounded-full bg-amber-500"
                                            style={{
                                                width: `${getPercentage(
                                                    stats.warm
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-2 text-[11px] text-gray-400">
                                        {getPercentage(stats.warm)}% of total
                                    </p>

                                </div>

                                {/* HOT */}

                                <div className="rounded-2xl bg-red-50 p-4">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-semibold text-gray-500">
                                                Hot
                                            </p>

                                            <p className="mt-1 text-2xl font-black text-red-600">
                                                {loading
                                                    ? "..."
                                                    : stats.hot}
                                            </p>

                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                            <Icon
                                                type="fire"
                                                className="h-5 w-5"
                                            />

                                        </div>

                                    </div>

                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white">

                                        <div
                                            className="h-full rounded-full bg-red-500"
                                            style={{
                                                width: `${getPercentage(
                                                    stats.hot
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                    <p className="mt-2 text-[11px] text-gray-400">
                                        {getPercentage(stats.hot)}% of total
                                    </p>

                                </div>

                            </div>

                            {/* STATUS SUMMARY */}

                            <div className="mt-6 border-t border-gray-100 pt-5">

                                <div className="flex flex-wrap gap-5">

                                    <div className="flex items-center gap-2">

                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                                        <span className="text-xs text-gray-500">
                                            New
                                        </span>

                                        <span className="text-xs font-black text-gray-800">
                                            {stats.newLeads}
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />

                                        <span className="text-xs text-gray-500">
                                            Cold
                                        </span>

                                        <span className="text-xs font-black text-gray-800">
                                            {stats.cold}
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

                                        <span className="text-xs text-gray-500">
                                            Warm
                                        </span>

                                        <span className="text-xs font-black text-gray-800">
                                            {stats.warm}
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                                        <span className="text-xs text-gray-500">
                                            Hot
                                        </span>

                                        <span className="text-xs font-black text-gray-800">
                                            {stats.hot}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ==================================================
                            FOLLOW-UP SUMMARY
                        ================================================== */}

                        <div
                            className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                shadow-sm
                            "
                        >

                            <div className="flex items-center justify-between">

                                <div>

                                    <h3 className="text-base font-black text-gray-900">
                                        Follow-ups
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Follow-up activity
                                    </p>

                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">

                                    <Icon
                                        type="clock"
                                        className="h-5 w-5"
                                    />

                                </div>

                            </div>

                            <div className="mt-5 space-y-3">

                                {/* UPCOMING */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        rounded-xl
                                        bg-blue-50
                                        px-4
                                        py-3
                                    "
                                >

                                    <div className="flex items-center gap-3">

                                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                                        <span className="text-sm font-medium text-gray-600">
                                            Upcoming
                                        </span>

                                    </div>

                                    <span className="text-lg font-black text-blue-600">
                                        {stats.upcoming}
                                    </span>

                                </div>

                                {/* MISSED */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        rounded-xl
                                        bg-red-50
                                        px-4
                                        py-3
                                    "
                                >

                                    <div className="flex items-center gap-3">

                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                                        <span className="text-sm font-medium text-gray-600">
                                            Missed
                                        </span>

                                    </div>

                                    <span className="text-lg font-black text-red-600">
                                        {stats.missed}
                                    </span>

                                </div>

                                {/* COMPLETED */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        rounded-xl
                                        bg-emerald-50
                                        px-4
                                        py-3
                                    "
                                >

                                    <div className="flex items-center gap-3">

                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                                        <span className="text-sm font-medium text-gray-600">
                                            Completed
                                        </span>

                                    </div>

                                    <span className="text-lg font-black text-emerald-600">
                                        {stats.completed}
                                    </span>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={handleFollowUps}
                                className="
                                    mt-5
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-gray-700
                                    transition
                                    hover:border-orange-300
                                    hover:bg-orange-50
                                    hover:text-orange-600
                                "
                            >
                                Manage Follow-ups

                                <Icon
                                    type="arrow"
                                    className="ml-2 h-4 w-4"
                                />
                            </button>

                        </div>

                    </div>

                    {/* ==================================================
                        TODAY'S FOLLOW-UPS
                    ================================================== */}

                    <div
                        className="
                            mt-6
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-100
                            bg-white
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                border-b
                                border-gray-100
                                p-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            <div>

                                <h3 className="text-base font-black text-gray-900">
                                    Today's Follow-ups
                                </h3>

                                <p className="mt-1 text-xs text-gray-400">
                                    Your scheduled follow-ups for today
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleViewAllFollowUps
                                }
                                className="
                                    text-xs
                                    font-bold
                                    text-blue-600
                                    hover:text-blue-700
                                "
                            >
                                View All Follow-ups →
                            </button>

                        </div>

                        {/* LOADING */}

                        {loading ? (
                            <div className="p-10 text-center">

                                <div
                                    className="
                                        mx-auto
                                        h-8
                                        w-8
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-gray-200
                                        border-t-blue-600
                                    "
                                />

                                <p className="mt-3 text-sm text-gray-400">
                                    Loading follow-ups...
                                </p>

                            </div>
                        ) : todaysFollowUps.length === 0 ? (

                            /* EMPTY */

                            <div className="p-10 text-center">

                                <div
                                    className="
                                        mx-auto
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-gray-100
                                        text-gray-400
                                    "
                                >
                                    <Icon
                                        type="clock"
                                        className="h-7 w-7"
                                    />
                                </div>

                                <h4 className="mt-4 text-sm font-black text-gray-700">
                                    No follow-ups today
                                </h4>

                                <p className="mt-1 text-xs text-gray-400">
                                    You don't have any follow-ups scheduled for today.
                                </p>

                            </div>

                        ) : (

                            /* LIST */

                            <div className="divide-y divide-gray-100">

                                {todaysFollowUps.map(
                                    (lead, index) => {
                                        // Use the status calculated by the backend.
                                        const status =
                                            lead?.followUpStatus ||
                                            "NONE";

                                        const leadName =
                                            lead?.name ||
                                            lead?.fullName ||
                                            lead?.leadName ||
                                            "Unnamed Lead";

                                        const phone =
                                            lead?.phone ||
                                            lead?.mobile ||
                                            lead?.contact ||
                                            "";

                                        return (
                                            <div
                                                key={
                                                    lead?._id ||
                                                    lead?.id ||
                                                    index
                                                }
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-4
                                                    p-5
                                                    transition
                                                    hover:bg-gray-50
                                                    sm:flex-row
                                                    sm:items-center
                                                    sm:justify-between
                                                "
                                            >

                                                <div className="flex min-w-0 items-center gap-4">

                                                    <div
                                                        className="
                                                            flex
                                                            h-11
                                                            w-11
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-blue-50
                                                            text-sm
                                                            font-black
                                                            text-blue-600
                                                        "
                                                    >
                                                        {leadName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-black text-gray-800">
                                                            {leadName}
                                                        </p>

                                                        {phone && (
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {phone}
                                                            </p>
                                                        )}

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {formatDateTime(
                                                                lead?.displayFollowUpAt ||
                                                                lead?.followUpAt
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                        sm:shrink-0
                                                    "
                                                >

                                                    <span
                                                        className={`
                                                            rounded-full
                                                            px-3
                                                            py-1.5
                                                            text-[10px]
                                                            font-black
                                                            ${getFollowUpStatusClasses(
                                                                status
                                                            )}
                                                        `}
                                                    >
                                                        {getFollowUpStatusLabel(
                                                            status
                                                        )}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewLead(
                                                                lead
                                                            )
                                                        }
                                                        className="
                                                            rounded-lg
                                                            border
                                                            border-gray-200
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-bold
                                                            text-gray-600
                                                            transition
                                                            hover:border-blue-200
                                                            hover:bg-blue-50
                                                            hover:text-blue-600
                                                        "
                                                    >
                                                        View
                                                    </button>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </div>

                    {/* ==================================================
                        QUICK ACTIONS
                    ================================================== */}

                    <div
                        className="
                            mt-6
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                        "
                    >

                        {/* LEADS */}

                        <button
                            type="button"
                            onClick={handleMyLeads}
                            className="
                                group
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div className="flex items-center gap-4">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                        transition
                                        group-hover:bg-blue-600
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="leads"
                                        className="h-6 w-6"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <h3 className="text-sm font-black text-gray-800">
                                        Manage My Leads
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        View and manage all your assigned leads.
                                    </p>

                                </div>

                                <Icon
                                    type="arrow"
                                    className="
                                        h-5
                                        w-5
                                        shrink-0
                                        text-gray-400
                                        transition
                                        group-hover:translate-x-1
                                        group-hover:text-blue-600
                                    "
                                />

                            </div>

                        </button>

                        {/* FOLLOW-UPS */}

                        <button
                            type="button"
                            onClick={handleFollowUps}
                            className="
                                group
                                rounded-2xl
                                border
                                border-gray-100
                                bg-white
                                p-5
                                text-left
                                shadow-sm
                                transition
                                hover:-translate-y-1
                                hover:shadow-xl
                            "
                        >

                            <div className="flex items-center gap-4">

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-orange-50
                                        text-orange-600
                                        transition
                                        group-hover:bg-orange-500
                                        group-hover:text-white
                                    "
                                >
                                    <Icon
                                        type="clock"
                                        className="h-6 w-6"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <h3 className="text-sm font-black text-gray-800">
                                        Manage Follow-ups
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-400">
                                        Check upcoming and missed follow-ups.
                                    </p>

                                </div>

                                <Icon
                                    type="arrow"
                                    className="
                                        h-5
                                        w-5
                                        shrink-0
                                        text-gray-400
                                        transition
                                        group-hover:translate-x-1
                                        group-hover:text-orange-600
                                    "
                                />

                            </div>

                        </button>

                    </div>

                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    <div className="mt-8 pb-5 text-center">

                        <p className="text-[11px] font-medium text-gray-400">
                            SVR EDTECH Executive Portal
                        </p>

                        <p className="mt-1 text-[10px] text-gray-300">
                            Manage your leads efficiently
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default ExecutiveDashboard;