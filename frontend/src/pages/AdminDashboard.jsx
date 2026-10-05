import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

function AdminDashboard() {
    const navigate = useNavigate();

    const [analytics, setAnalytics] = useState(null);
    const [institutions, setInstitutions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // ============================================================
    // GET AUTH TOKEN
    // ============================================================

    const getToken = () => {
        const possibleTokens = [
            "adminToken",
            "superAdminToken",
            "token",
            "accessToken",
            "access_token",
            "jwt",
            "authToken",
            "managerToken",
        ];

        for (const key of possibleTokens) {
            const value = localStorage.getItem(key);

            if (value) {
                return value;
            }
        }

        return null;
    };

    // ============================================================
    // NAVIGATION
    // ============================================================

    const handleNavigation = (path) => {
        navigate(path);
    };

    // ============================================================
    // FETCH DASHBOARD DATA DIRECTLY FROM BACKEND
    // ============================================================

    const fetchDashboardData = useCallback(
        async (showRefresh = false) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const token = getToken();

                if (!token) {
                    throw new Error(
                        "Authentication token not found. Please login again."
                    );
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                };

                // ====================================================
                // FETCH DIRECTLY FROM ACTUAL BACKEND ENDPOINTS
                // NO ANALYTICS API
                // ====================================================

                const [
                    leadsResponse,
                    followUpsResponse,
                    institutionResponse,
                ] = await Promise.all([
                    fetch(`${API_URL}/api/leads`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(`${API_URL}/api/leads/follow-ups`, {
                        method: "GET",
                        headers,
                    }),

                    fetch(`${API_URL}/api/institutions`, {
                        method: "GET",
                        headers,
                    }),
                ]);

                // ====================================================
                // READ RESPONSES
                // ====================================================

                const leadsResult =
                    await leadsResponse.json();

                const followUpsResult =
                    await followUpsResponse.json();

                const institutionResult =
                    await institutionResponse.json();

                // ====================================================
                // CHECK LEADS RESPONSE
                // ====================================================

                if (!leadsResponse.ok) {
                    throw new Error(
                        leadsResult?.message ||
                            "Failed to load leads."
                    );
                }

                // ====================================================
                // CHECK FOLLOW-UP RESPONSE
                // ====================================================

                if (!followUpsResponse.ok) {
                    throw new Error(
                        followUpsResult?.message ||
                            "Failed to load follow-ups."
                    );
                }

                // ====================================================
                // CHECK INSTITUTION RESPONSE
                // ====================================================

                if (!institutionResponse.ok) {
                    throw new Error(
                        institutionResult?.message ||
                            "Failed to load institutions."
                    );
                }

                // ====================================================
                // LEADS
                // ====================================================

                const leadList =
                    Array.isArray(leadsResult?.leads)
                        ? leadsResult.leads
                        : [];

                // ====================================================
                // TOTAL LEADS
                // ====================================================

                const totalLeads =
                    Number(
                        leadsResult?.count ??
                            leadsResult?.total ??
                            leadList.length
                    ) || 0;

                // ====================================================
                // LEAD STATUS COUNTS
                // DIRECTLY FROM /api/leads
                // ====================================================

                const newLeads =
                    leadList.filter(
                        (lead) =>
                            String(
                                lead?.status || ""
                            ).toUpperCase() === "NEW"
                    ).length;

                const hotLeads =
                    leadList.filter(
                        (lead) =>
                            String(
                                lead?.status || ""
                            ).toUpperCase() === "HOT"
                    ).length;

                const warmLeads =
                    leadList.filter(
                        (lead) =>
                            String(
                                lead?.status || ""
                            ).toUpperCase() === "WARM"
                    ).length;

                const coldLeads =
                    leadList.filter(
                        (lead) =>
                            String(
                                lead?.status || ""
                            ).toUpperCase() === "COLD"
                    ).length;

                // ====================================================
                // TODAY'S LEADS
                // DIRECTLY FROM lead.createdAt
                // ====================================================

                const now = new Date();

                const startOfToday = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );

                const startOfTomorrow = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 1
                );

                const todayLeads =
                    leadList.filter((lead) => {
                        if (!lead?.createdAt) {
                            return false;
                        }

                        const createdAt =
                            new Date(lead.createdAt);

                        return (
                            createdAt >= startOfToday &&
                            createdAt < startOfTomorrow
                        );
                    }).length;

                // ====================================================
                // ENROLLED LEADS
                // DIRECTLY FROM lead.latestRemark
                // ====================================================

                const enrolled =
                    leadList.filter(
                        (lead) =>
                            String(
                                lead?.latestRemark || ""
                            ).toUpperCase() === "ENROLLED"
                    ).length;

                // ====================================================
                // FOLLOW-UPS
                // DIRECTLY FROM /api/leads/follow-ups
                // ====================================================

                const followUpList =
                    Array.isArray(
                        followUpsResult?.leads
                    )
                        ? followUpsResult.leads
                        : Array.isArray(
                              followUpsResult?.followUps
                          )
                        ? followUpsResult.followUps
                        : [];

                const followUps =
                    Number(
                        followUpsResult?.count ??
                            followUpsResult?.total ??
                            followUpList.length
                    ) || 0;

                // ====================================================
                // INSTITUTIONS
                // DIRECTLY FROM /api/institutions
                // ====================================================

                const institutionList =
                    Array.isArray(
                        institutionResult?.institutions
                    )
                        ? institutionResult.institutions
                        : [];

                // ====================================================
                // KEEP EXISTING UI DATA SHAPE
                // SO THE DESIGN DOES NOT CHANGE
                // ====================================================

                setAnalytics({
                    totalLeads,
                    status: {
                        new: newLeads,
                        hot: hotLeads,
                        warm: warmLeads,
                        cold: coldLeads,
                    },
                    date: {
                        today: todayLeads,
                    },
                    conversion: {
                        enrolled,
                    },
                    followUps: {
                        total: followUps,
                    },
                });

                setInstitutions(institutionList);

                console.log(
                    "===== DASHBOARD DIRECT BACKEND DATA ====="
                );
                console.log("Total Leads:", totalLeads);
                console.log("New Leads:", newLeads);
                console.log("Hot Leads:", hotLeads);
                console.log("Warm Leads:", warmLeads);
                console.log("Cold Leads:", coldLeads);
                console.log("Today's Leads:", todayLeads);
                console.log("Enrolled:", enrolled);
                console.log("Follow-ups:", followUps);
                console.log("Institutions:", institutionList.length);
                console.log("==========================================");
            } catch (err) {
                console.error(
                    "Dashboard direct backend error:",
                    err
                );

                setError(
                    err.message ||
                        "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // ============================================================
    // SAFE VALUES
    // ============================================================

    const totalLeads =
        Number(analytics?.totalLeads) || 0;

    const newLeads =
        Number(analytics?.status?.new) || 0;

    const hotLeads =
        Number(analytics?.status?.hot) || 0;

    const warmLeads =
        Number(analytics?.status?.warm) || 0;

    const coldLeads =
        Number(analytics?.status?.cold) || 0;

    const todayLeads =
        Number(analytics?.date?.today) || 0;

    const enrolled =
        Number(
            analytics?.conversion?.enrolled ??
                analytics?.enrolled ??
                0
        ) || 0;

    const followUps =
        Number(
            analytics?.followUps?.total ??
                analytics?.followUps ??
                0
        ) || 0;

    // ============================================================
    // INSTITUTION COUNT
    // ============================================================

    const totalInstitutions =
        institutions.length;

    // ============================================================
    // PERCENTAGE
    // ============================================================

    const getPercentage = (value) => {
        if (!totalLeads) {
            return "0%";
        }

        return `${Math.round(
            (value / totalLeads) * 100
        )}%`;
    };

    // ============================================================
    // STAT CARD
    // ============================================================

    const StatCard = ({
        title,
        value,
        subtitle,
        icon,
        iconClass,
        progress,
        progressClass,
    }) => {
        return (
            <div
                className="
                    group
                    relative
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#F6C945]/60
                    hover:shadow-[0_18px_45px_rgba(246,201,69,0.14)]
                "
            >
                {/* Decorative Background */}

                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-10
                        -top-10
                        h-28
                        w-28
                        rounded-full
                        bg-[#F6C945]/10
                        transition-transform
                        duration-500
                        group-hover:scale-150
                    "
                />

                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div
                            className={`
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                transition-all
                                duration-300
                                ${iconClass}
                            `}
                        >
                            {icon}
                        </div>

                        {progress !== undefined && (
                            <span
                                className="
                                    rounded-full
                                    bg-slate-100
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-bold
                                    text-slate-500
                                    transition
                                    group-hover:bg-[#F6C945]/15
                                    group-hover:text-[#8A6B00]
                                "
                            >
                                {progress}
                            </span>
                        )}
                    </div>

                    <div className="mt-5">
                        <p className="text-sm font-medium text-slate-500">
                            {title}
                        </p>

                        <h3
                            className="
                                mt-1
                                text-3xl
                                font-black
                                tracking-tight
                                text-[#14213D]
                            "
                        >
                            {value}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    {progress !== undefined && (
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className={`
                                    h-full
                                    rounded-full
                                    transition-all
                                    duration-700
                                    ${progressClass}
                                `}
                                style={{
                                    width:
                                        progress === "0%"
                                            ? "0%"
                                            : progress,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ============================================================
    // STATUS ROW
    // ============================================================

    const StatusRow = ({
        title,
        value,
        percentage,
        icon,
    }) => {
        return (
            <div className="group">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-[#35516D]
                                transition
                                duration-300
                                group-hover:bg-[#F6C945]
                                group-hover:text-[#102236]
                            "
                        >
                            {icon}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                            {title}
                        </span>
                    </div>

                    <div className="text-right">
                        <span className="text-sm font-bold text-[#14213D]">
                            {value}
                        </span>

                        <span className="ml-2 text-xs text-slate-400">
                            {percentage}
                        </span>
                    </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="
                            h-full
                            rounded-full
                            bg-[#F6C945]
                            transition-all
                            duration-700
                        "
                        style={{
                            width:
                                percentage === "0%"
                                    ? "0%"
                                    : percentage,
                        }}
                    />
                </div>
            </div>
        );
    };

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-full bg-[#F7F9FC]">
                <main className="px-4 py-7 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-10 w-80 rounded-xl bg-slate-200" />

                        <div className="mt-3 h-5 w-96 rounded-lg bg-slate-200" />

                        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="
                                            h-44
                                            rounded-3xl
                                            bg-slate-200
                                        "
                                    />
                                )
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="h-80 rounded-3xl bg-slate-200" />

                            <div className="h-80 rounded-3xl bg-slate-200" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ============================================================
    // MAIN DASHBOARD
    // ============================================================

    return (
        <div className="min-h-full bg-[#F7F9FC]">
            <main className="px-4 py-7 sm:px-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[30px]
                        bg-[#102236]
                        p-6
                        shadow-[0_20px_60px_rgba(16,34,54,0.18)]
                        sm:p-8
                    "
                >
                    {/* Decorative Elements */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-20
                            h-64
                            w-64
                            rounded-full
                            bg-[#F6C945]/10
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-24
                            right-40
                            h-52
                            w-52
                            rounded-full
                            bg-[#F6C945]/5
                        "
                    />

                    <div
                        className="
                            relative
                            z-10
                            flex
                            flex-col
                            gap-6
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >
                        <div>
                            <div
                                className="
                                    mb-3
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-[#F6C945]/20
                                    bg-[#F6C945]/10
                                    px-3
                                    py-1.5
                                "
                            >
                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-[#F6C945]
                                    "
                                />

                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        tracking-wide
                                        text-[#F6C945]
                                    "
                                >
                                    LIVE DASHBOARD
                                </span>
                            </div>

                            <h1
                                className="
                                    text-3xl
                                    font-black
                                    tracking-tight
                                    text-white
                                    sm:text-4xl
                                "
                            >
                                Welcome back,
                                <span className="ml-2 text-[#F6C945]">
                                    Super Admin!
                                </span>{" "}
                                👋
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    text-white/60
                                    sm:text-base
                                "
                            >
                                Manage institutions, users,
                                leads and platform activities
                                from one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                fetchDashboardData(true)
                            }
                            disabled={refreshing}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-2xl
                                border
                                border-[#F6C945]/30
                                bg-[#F6C945]
                                px-5
                                py-3
                                text-sm
                                font-bold
                                text-[#102236]
                                transition
                                duration-200
                                hover:bg-[#FFD95A]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            <svg
                                className={`h-5 w-5 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h5"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 20v-5h-5"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 9A8 8 0 006.34 6.34L4 9"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 15a8 8 0 0013.66 2.66L20 15"
                                />
                            </svg>

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>
                </section>

                {/* =====================================================
                    ERROR
                ===================================================== */}

                {error && (
                    <div
                        className="
                            mt-5
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-5
                            py-4
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-100
                                "
                            >
                                <svg
                                    className="h-5 w-5 text-red-600"
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

                                    <path d="M12 8v4" />

                                    <path d="M12 16h.01" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-red-800">
                                    Unable to load dashboard
                                </p>

                                <p className="mt-0.5 text-xs text-red-600">
                                    {error}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                fetchDashboardData()
                            }
                            className="
                                rounded-xl
                                bg-red-600
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-white
                                transition
                                hover:bg-red-700
                            "
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* =====================================================
                    QUICK NAVIGATION
                ===================================================== */}

                <section className="mt-7">
                    <div className="mb-4">
                        <p
                            className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-[#A38400]
                            "
                        >
                            Quick Navigation
                        </p>

                        <h2
                            className="
                                mt-1
                                text-2xl
                                font-black
                                tracking-tight
                                text-[#14213D]
                            "
                        >
                            Manage Your Platform
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Quickly access leads, follow-ups,
                            users, institutions and analytics.
                        </p>
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-3
                        "
                    >
                        {/* =================================================
                            LEADS
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/all-leads"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <path d="M4 19V5" />
                                            <path d="M4 19h16" />
                                            <path d="M8 16v-5" />
                                            <path d="M12 16V8" />
                                            <path d="M16 16V4" />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    Leads
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View and manage all leads
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    {totalLeads} Total
                                </div>
                            </div>
                        </button>

                        {/* =================================================
                            FOLLOW UPS
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/follow-ups"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />

                                            <path d="M12 7v5l3 2" />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    Follow-ups
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage all follow-up activities
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    {followUps} Follow-ups
                                </div>
                            </div>
                        </button>

                        {/* =================================================
                            USERS
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/view-users"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                                            <circle
                                                cx="9"
                                                cy="7"
                                                r="4"
                                            />

                                            <path d="M22 21v-2a4 4 0 00-3-3.87" />

                                            <path d="M16 3.13a4 4 0 010 7.75" />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    Users & Team
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Manage users and team members
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    Manage Users
                                </div>
                            </div>
                        </button>

                        {/* =================================================
                            ANALYTICS
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/analytics"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <path d="M4 19V5" />
                                            <path d="M4 19h16" />
                                            <path d="M8 16v-5" />
                                            <path d="M12 16V8" />
                                            <path d="M16 16V4" />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    Analytics
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View platform performance
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    View Reports
                                </div>
                            </div>
                        </button>

                        {/* =================================================
                            ADD INSTITUTION
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/create-institution"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    Add Institution
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Create a new institution
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    Create New
                                </div>
                            </div>
                        </button>

                        {/* =================================================
                            VIEW INSTITUTIONS
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "/institutions"
                                )
                            }
                            className="
                                group
                                relative
                                overflow-hidden
                                rounded-[24px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                text-left
                                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:border-[#F6C945]
                                hover:shadow-[0_15px_40px_rgba(246,201,69,0.16)]
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
                                    bg-[#F6C945]/10
                                    transition-transform
                                    duration-500
                                    group-hover:scale-150
                                "
                            />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-slate-100
                                            text-[#35516D]
                                            transition
                                            duration-300
                                            group-hover:bg-[#F6C945]
                                            group-hover:text-[#102236]
                                        "
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.8"
                                        >
                                            <path d="M4 21h16" />

                                            <path d="M6 21V7l6-4 6 4v14" />

                                            <path d="M9 10h6" />

                                            <path d="M9 14h6" />

                                            <path d="M9 18h6" />
                                        </svg>
                                    </div>

                                    <span
                                        className="
                                            text-xl
                                            text-slate-300
                                            transition
                                            duration-300
                                            group-hover:translate-x-1
                                            group-hover:text-[#F6C945]
                                        "
                                    >
                                        →
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-black text-[#14213D]">
                                    View Institutions
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    View and manage institutions
                                </p>

                                <div
                                    className="
                                        mt-4
                                        inline-flex
                                        rounded-full
                                        bg-slate-100
                                        px-3
                                        py-1
                                        text-xs
                                        font-bold
                                        text-slate-500
                                        transition
                                        group-hover:bg-[#F6C945]/15
                                        group-hover:text-[#8A6B00]
                                    "
                                >
                                    {totalInstitutions} Institutions
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                {/* =====================================================
                    OVERVIEW TITLE
                ===================================================== */}

                <section className="mt-9">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-[#F6C945]
                                    "
                                />

                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.2em]
                                        text-[#8A6B00]
                                    "
                                >
                                    Platform Overview
                                </p>
                            </div>

                            <h2
                                className="
                                    mt-2
                                    text-2xl
                                    font-black
                                    tracking-tight
                                    text-[#14213D]
                                    sm:text-3xl
                                "
                            >
                                Today's Performance
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                A quick look at your lead
                                activity and conversion
                                performance.
                            </p>
                        </div>

                        <div
                            className="
                                rounded-full
                                border
                                border-[#F6C945]/30
                                bg-[#F6C945]/10
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-[#8A6B00]
                            "
                        >
                            Live data
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    PRIMARY STAT CARDS
                ===================================================== */}

                <section
                    className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-5
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >
                    <StatCard
                        title="Total Leads"
                        value={totalLeads}
                        subtitle="All leads in the system"
                        progress="100%"
                        progressClass="bg-[#F6C945]"
                        iconClass="bg-[#F6C945]/15 text-[#8A6B00]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path d="M22 21v-2a4 4 0 00-3-3.87" />

                                <path d="M16 3.13a4 4 0 010 7.75" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="New Leads"
                        value={newLeads}
                        subtitle="Recently added leads"
                        progress={getPercentage(
                            newLeads
                        )}
                        progressClass="bg-[#F6C945]"
                        iconClass="bg-[#F6C945]/15 text-[#8A6B00]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    d="M12 5v14M5 12h14"
                                />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Hot Leads"
                        value={hotLeads}
                        subtitle="High-priority leads"
                        progress={getPercentage(
                            hotLeads
                        )}
                        progressClass="bg-[#F6C945]"
                        iconClass="bg-[#F6C945]/15 text-[#8A6B00]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M12 3c1.5 3 5 4.5 5 9a5 5 0 01-10 0c0-2.5 1.5-4.5 3-6" />

                                <path d="M12 14c1 0 2-1 2-2" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Today's Leads"
                        value={todayLeads}
                        subtitle="Created today"
                        iconClass="bg-[#102236]/10 text-[#102236]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="17"
                                    rx="2"
                                />

                                <path d="M16 2v4" />

                                <path d="M8 2v4" />

                                <path d="M3 10h18" />
                            </svg>
                        }
                    />
                </section>

                {/* =====================================================
                    SECONDARY STAT CARDS
                ===================================================== */}

                <section
                    className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-5
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >
                    <StatCard
                        title="Warm Leads"
                        value={warmLeads}
                        subtitle="Interested leads"
                        progress={getPercentage(
                            warmLeads
                        )}
                        progressClass="bg-[#F6C945]"
                        iconClass="bg-[#F6C945]/15 text-[#8A6B00]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M12 3c-2 3-5 5-5 9a5 5 0 0010 0c0-4-3-6-5-9z" />

                                <path d="M9 16c.5 1.5 1.5 2 3 2s2.5-.5 3-2" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Cold Leads"
                        value={coldLeads}
                        subtitle="Low-priority leads"
                        progress={getPercentage(
                            coldLeads
                        )}
                        progressClass="bg-[#35516D]"
                        iconClass="bg-[#102236]/10 text-[#35516D]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Follow-ups"
                        value={followUps}
                        subtitle="Follow-up activities"
                        iconClass="bg-[#F6C945]/15 text-[#8A6B00]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />

                                <path d="M12 7v5l3 2" />
                            </svg>
                        }
                    />

                    <StatCard
                        title="Enrolled"
                        value={enrolled}
                        subtitle="Converted leads"
                        iconClass="bg-[#102236]/10 text-[#102236]"
                        icon={
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                        }
                    />
                </section>

                {/* =====================================================
                    LOWER SECTION
                ===================================================== */}

                <section
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        gap-6
                        lg:grid-cols-2
                    "
                >
                    {/* =================================================
                        LEAD STATUS
                    ================================================= */}

                    <div
                        className="
                            rounded-[28px]
                            border
                            border-slate-200
                            bg-white
                            p-6
                            shadow-[0_10px_40px_rgba(15,23,42,0.05)]
                            sm:p-7
                        "
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-[0.16em]
                                        text-slate-400
                                    "
                                >
                                    Lead Distribution
                                </p>

                                <h3
                                    className="
                                        mt-1
                                        text-xl
                                        font-black
                                        text-[#14213D]
                                    "
                                >
                                    Lead Status
                                </h3>
                            </div>

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#F6C945]/15
                                    text-[#8A6B00]
                                "
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path d="M4 19V5" />

                                    <path d="M4 19h16" />

                                    <path d="M8 16v-5" />

                                    <path d="M12 16V8" />

                                    <path d="M16 16V4" />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-7 space-y-6">
                            <StatusRow
                                title="New"
                                value={newLeads}
                                percentage={getPercentage(
                                    newLeads
                                )}
                                icon={
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                }
                            />

                            <StatusRow
                                title="Hot"
                                value={hotLeads}
                                percentage={getPercentage(
                                    hotLeads
                                )}
                                icon={
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 3c1.5 3 5 4.5 5 9a5 5 0 01-10 0c0-2.5 1.5-4.5 3-6" />
                                    </svg>
                                }
                            />

                            <StatusRow
                                title="Warm"
                                value={warmLeads}
                                percentage={getPercentage(
                                    warmLeads
                                )}
                                icon={
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 3c-2 3-5 5-5 9a5 5 0 0010 0c0-4-3-6-5-9z" />
                                    </svg>
                                }
                            />

                            <StatusRow
                                title="Cold"
                                value={coldLeads}
                                percentage={getPercentage(
                                    coldLeads
                                )}
                                icon={
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* =================================================
                        QUICK OVERVIEW
                    ================================================= */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-[28px]
                            bg-[#102236]
                            p-6
                            shadow-[0_15px_50px_rgba(16,34,54,0.15)]
                            sm:p-7
                        "
                    >
                        <div
                            className="
                                pointer-events-none
                                absolute
                                -right-16
                                -top-16
                                h-48
                                w-48
                                rounded-full
                                bg-[#F6C945]/10
                            "
                        />

                        <div className="relative z-10">
                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.16em]
                                    text-[#F6C945]
                                "
                            >
                                Quick Overview
                            </p>

                            <h3 className="mt-2 text-2xl font-black text-white">
                                Platform at a glance
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-white/60">
                                Keep track of your lead pipeline
                                and daily activity from the
                                Super Admin dashboard.
                            </p>

                            <div
                                className="
                                    mt-7
                                    grid
                                    grid-cols-2
                                    gap-3
                                "
                            >
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-4
                                    "
                                >
                                    <p className="text-xs text-white/50">
                                        Total Leads
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-[#F6C945]">
                                        {totalLeads}
                                    </p>
                                </div>

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-4
                                    "
                                >
                                    <p className="text-xs text-white/50">
                                        Today's Leads
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-[#F6C945]">
                                        {todayLeads}
                                    </p>
                                </div>

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-4
                                    "
                                >
                                    <p className="text-xs text-white/50">
                                        Follow-ups
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-[#F6C945]">
                                        {followUps}
                                    </p>
                                </div>

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-4
                                    "
                                >
                                    <p className="text-xs text-white/50">
                                        Institutions
                                    </p>

                                    <p className="mt-1 text-2xl font-black text-[#F6C945]">
                                        {totalInstitutions}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/analytics"
                                    )
                                }
                                className="
                                    mt-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[#F6C945]
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-[#102236]
                                    transition
                                    hover:bg-[#FFD95A]
                                "
                            >
                                View Full Analytics

                                <span className="text-lg">
                                    →
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    FOOTER ACTIONS
                ===================================================== */}

                <section
                    className="
                        mt-6
                        rounded-[28px]
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-[0_10px_40px_rgba(15,23,42,0.04)]
                        sm:p-6
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div>
                            <h3 className="font-bold text-[#14213D]">
                                Manage your platform
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Quickly access the most used
                                administration sections.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/all-leads"
                                    )
                                }
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >
                                All Leads
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/view-users"
                                    )
                                }
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >
                                View Users
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/follow-ups"
                                    )
                                }
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >
                                Follow-ups
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/create-institution"
                                    )
                                }
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >
                                Add Institution
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "/institutions"
                                    )
                                }
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >
                                View Institutions
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;