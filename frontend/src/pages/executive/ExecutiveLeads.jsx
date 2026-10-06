import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";

// ============================================================
// API
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL + "/api";

// ============================================================
// LEAD STATUS
// ============================================================

const STATUS_OPTIONS = [
    "ALL",
    "NEW",
    "COLD",
    "WARM",
    "HOT",
];

const STATUS_EDIT_OPTIONS = [
    "NEW",
    "COLD",
    "WARM",
    "HOT",
];

// ============================================================
// LEAD STATUS COLORS
// ============================================================

const getStatusClasses = (status) => {
    switch (status) {
        case "NEW":
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case "COLD":
            return `
                border-slate-200
                bg-slate-100
                text-slate-700
            `;

        case "WARM":
            return `
                border-amber-200
                bg-amber-50
                text-amber-700
            `;

        case "HOT":
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        default:
            return `
                border-gray-200
                bg-gray-100
                text-gray-600
            `;
    }
};

const getStatusDot = (status) => {
    switch (status) {
        case "NEW":
            return "bg-blue-500";

        case "COLD":
            return "bg-slate-500";

        case "WARM":
            return "bg-amber-500";

        case "HOT":
            return "bg-red-500";

        default:
            return "bg-gray-400";
    }
};

// ============================================================
// FOLLOW-UP STATUS COLORS
// ============================================================

const getFollowUpStatusClasses = (status) => {
    switch (status) {
        case "TODAY":
            return `
                border-amber-200
                bg-amber-50
                text-amber-700
            `;

        case "UPCOMING":
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case "MISSED":
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        case "COMPLETED":
            return `
                border-emerald-200
                bg-emerald-50
                text-emerald-700
            `;

        case "NONE":
        default:
            return `
                border-gray-200
                bg-gray-100
                text-gray-500
            `;
    }
};

const getFollowUpStatusDot = (status) => {
    switch (status) {
        case "TODAY":
            return "bg-amber-500";

        case "UPCOMING":
            return "bg-blue-500";

        case "MISSED":
            return "bg-red-500";

        case "COMPLETED":
            return "bg-emerald-500";

        default:
            return "bg-gray-400";
    }
};

const getFollowUpStatusLabel = (status) => {
    switch (status) {
        case "TODAY":
            return "Today";

        case "UPCOMING":
            return "Upcoming";

        case "MISSED":
            return "Missed";

        case "COMPLETED":
            return "Completed";

        default:
            return "No Follow-up";
    }
};

// ============================================================
// DATE FORMAT
// ============================================================

const formatFollowUp = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

// ============================================================
// ICON
// ============================================================

const Icon = ({
    type,
    className = "h-5 w-5",
}) => {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        case "search":
            return (
                <svg {...common}>
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    />
                    <path d="m20 20-4-4" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...common}>
                    <path d="M20 11a8 8 0 0 0-15.5-2" />
                    <path d="M4 4v5h5" />
                    <path d="M4 13a8 8 0 0 0 15.5 2" />
                    <path d="M20 20v-5h-5" />
                </svg>
            );

        case "leads":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />

                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "email":
            return (
                <svg {...common}>
                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                    />

                    <path d="m3 7 9 6 9-6" />
                </svg>
            );

        case "phone":
            return (
                <svg {...common}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
                </svg>
            );

        case "building":
            return (
                <svg {...common}>
                    <path d="M3 21h18" />
                    <path d="M5 21V5l7-3 7 3v16" />
                    <path d="M9 9h1" />
                    <path d="M14 9h1" />
                    <path d="M9 13h1" />
                    <path d="M14 13h1" />
                    <path d="M10 21v-4h4v4" />
                </svg>
            );

        case "filter":
            return (
                <svg {...common}>
                    <path d="M4 6h16" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...common}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );

        case "check":
            return (
                <svg {...common}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "alert":
            return (
                <svg {...common}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />

                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                </svg>
            );

        default:
            return null;
    }
};

// ============================================================
// MODERN STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
    valueColor,
    onClick,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group
                relative
                w-full
                overflow-hidden
                rounded-[24px]
                border
                border-slate-200/80
                bg-white
                p-5
                text-left
                shadow-[0_4px_20px_rgba(15,23,42,0.05)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-slate-300
                hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                active:scale-[0.99]
            "
        >
            {/* Decorative circle */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-28
                    w-28
                    rounded-full
                    bg-slate-100
                    opacity-70
                    transition-transform
                    duration-500
                    group-hover:scale-125
                "
            />

            {/* Bottom hover line */}
            <div
                className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-0
                    h-1
                    w-0
                    rounded-r-full
                    bg-[#FECA42]
                    transition-all
                    duration-300
                    group-hover:w-full
                "
            />

            <div className="relative flex items-start justify-between gap-4">

                <div className="min-w-0">

                    <p
                        className="
                            text-[10px]
                            font-extrabold
                            uppercase
                            tracking-[0.18em]
                            text-slate-400
                        "
                    >
                        {title}
                    </p>

                    <p
                        className={`
                            mt-3
                            text-[34px]
                            font-black
                            leading-none
                            tracking-tight
                            ${valueColor}
                        `}
                    >
                        {value}
                    </p>

                    <p
                        className="
                            mt-2
                            text-xs
                            font-medium
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                </div>

                <div
                    className={`
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        ${iconBg}
                        ${iconColor}
                        shadow-sm
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:rotate-3
                    `}
                >
                    <Icon
                        type={icon}
                        className="h-5 w-5"
                    />
                </div>

            </div>
        </button>
    );
};

// ============================================================
// MODERN FOLLOW-UP CARD
// ============================================================

const FollowUpCard = ({
    title,
    value,
    subtitle,
    accent,
    iconBg,
    iconColor,
    icon,
    onClick,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group
                relative
                w-full
                overflow-hidden
                rounded-[22px]
                border
                border-slate-200/80
                bg-white
                p-4
                text-left
                shadow-[0_4px_18px_rgba(15,23,42,0.04)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-slate-300
                hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)]
                active:scale-[0.99]
            "
        >
            {/* Left accent */}
            <div
                className={`
                    absolute
                    left-0
                    top-4
                    bottom-4
                    w-1
                    rounded-r-full
                    ${accent}
                    transition-all
                    duration-300
                    group-hover:top-2
                    group-hover:bottom-2
                `}
            />

            {/* Background glow */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-8
                    -top-8
                    h-24
                    w-24
                    rounded-full
                    bg-slate-50
                    transition-transform
                    duration-500
                    group-hover:scale-125
                "
            />

            <div
                className="
                    relative
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >

                <div className="min-w-0 pl-2">

                    <p
                        className="
                            text-[10px]
                            font-extrabold
                            uppercase
                            tracking-[0.16em]
                            text-slate-400
                        "
                    >
                        {title}
                    </p>

                    <p
                        className="
                            mt-1.5
                            text-[27px]
                            font-black
                            leading-none
                            tracking-tight
                            text-[#102236]
                        "
                    >
                        {value}
                    </p>

                    <p
                        className="
                            mt-1.5
                            truncate
                            text-[11px]
                            font-medium
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                </div>

                <div
                    className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        ${iconBg}
                        ${iconColor}
                        shadow-sm
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:rotate-3
                    `}
                >
                    <Icon
                        type={icon}
                        className="h-5 w-5"
                    />
                </div>

            </div>
        </button>
    );
};

// ============================================================
// EXECUTIVE LEADS
// ============================================================

function ExecutiveLeads() {
    const navigate = useNavigate();

    // ========================================================
    // STATE
    // ========================================================

    const [
        leads,
        setLeads,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");

    const [
        updatingLeadId,
        setUpdatingLeadId,
    ] = useState(null);

    // ========================================================
    // TOKEN
    // ========================================================

    const getToken = () => {
        return (
            localStorage.getItem("executiveToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken")
        );
    };

    // ========================================================
    // FETCH LEADS
    // ========================================================

    const fetchLeads = async (
        showLoader = true
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const token =
                getToken();

            if (!token) {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }

            const response =
                await fetch(
                    `${API_BASE}/leads`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",
                        },
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            if (
                response.status ===
                    401 ||
                response.status ===
                    403
            ) {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    data?.message ||
                        "Failed to fetch leads."
                );
            }

            const fetchedLeads =
                Array.isArray(
                    data?.leads
                )
                    ? data.leads
                    : [];

            setLeads(
                fetchedLeads
            );

        } catch (err) {
            console.error(
                "Executive leads error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load leads."
            );

            if (showLoader) {
                setLeads([]);
            }

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        fetchLeads();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = () => {
        fetchLeads(false);
    };

    // ========================================================
    // FILTERED LEADS
    // ========================================================

    const filteredLeads =
        useMemo(() => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return leads.filter(
                (lead) => {

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        lead?.status ===
                            statusFilter;

                    if (
                        !matchesStatus
                    ) {
                        return false;
                    }

                    if (
                        !searchValue
                    ) {
                        return true;
                    }

                    const searchableText =
                        [
                            lead?.name,
                            lead?.email,
                            lead?.contact,
                            lead?.collegeName,
                            lead?.department,
                            lead?.state,
                            lead?.district,
                            lead?.leadSource,
                            lead?.leadType,
                            lead?.programInterest,
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                    return searchableText.includes(
                        searchValue
                    );
                }
            );
        }, [
            leads,
            search,
            statusFilter,
        ]);

    // ========================================================
    // UI PAGINATION
    // ========================================================

    const {
        page,
        total,
        totalPages,
        paginatedItems,
        setPage,
        itemsPerPage,
    } = usePagination(
        filteredLeads,
        50
    );

    // ========================================================
    // STATS
    // ========================================================

    const stats =
        useMemo(() => {
            return {
                total:
                    leads.length,

                new:
                    leads.filter(
                        (lead) =>
                            lead?.status ===
                            "NEW"
                    ).length,

                cold:
                    leads.filter(
                        (lead) =>
                            lead?.status ===
                            "COLD"
                    ).length,

                warm:
                    leads.filter(
                        (lead) =>
                            lead?.status ===
                            "WARM"
                    ).length,

                hot:
                    leads.filter(
                        (lead) =>
                            lead?.status ===
                            "HOT"
                    ).length,

                today:
                    leads.filter(
                        (lead) =>
                            lead?.followUpStatus ===
                            "TODAY"
                    ).length,

                upcoming:
                    leads.filter(
                        (lead) =>
                            lead?.followUpStatus ===
                            "UPCOMING"
                    ).length,

                missed:
                    leads.filter(
                        (lead) =>
                            lead?.followUpStatus ===
                            "MISSED"
                    ).length,

                completed:
                    leads.filter(
                        (lead) =>
                            lead?.followUpStatus ===
                            "COMPLETED"
                    ).length,
            };
        }, [leads]);

    // ========================================================
    // STATUS UPDATE
    // ========================================================

    const handleStatusChange = async (
        leadId,
        newStatus
    ) => {
        const token =
            getToken();

        if (!token) {
            navigate(
                "/login",
                {
                    replace: true,
                }
            );

            return;
        }

        try {
            setUpdatingLeadId(
                leadId
            );

            setError("");

            const response =
                await fetch(
                    `${API_BASE}/leads/${leadId}`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                status:
                                    newStatus,
                            }),
                    }
                );

            let data = {};

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            if (
                response.status ===
                    401 ||
                response.status ===
                    403
            ) {
                navigate(
                    "/login",
                    {
                        replace: true,
                    }
                );

                return;
            }

            if (
                !response.ok
            ) {
                throw new Error(
                    data?.message ||
                        "Failed to update lead status."
                );
            }

            const updatedLead =
                data?.lead;

            setLeads(
                (previousLeads) =>
                    previousLeads.map(
                        (lead) => {

                            if (
                                String(
                                    lead?._id
                                ) !==
                                String(
                                    leadId
                                )
                            ) {
                                return lead;
                            }

                            return updatedLead
                                ? {
                                      ...lead,
                                      ...updatedLead,
                                  }
                                : {
                                      ...lead,
                                      status:
                                          newStatus,
                                  };
                        }
                    )
            );

        } catch (err) {
            console.error(
                "Update lead status error:",
                err
            );

            setError(
                err.message ||
                    "Unable to update lead status."
            );

        } finally {
            setUpdatingLeadId(
                null
            );
        }
    };

    // ========================================================
    // VIEW LEAD
    // ========================================================

    const handleViewLead = (
        lead
    ) => {
        if (
            !lead?._id
        ) {
            return;
        }

        navigate(
            `/leads/${lead._id}`
        );
    };

    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {
        setSearch("");
        setStatusFilter(
            "ALL"
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            {/* ==================================================
                PAGE CONTENT

                IMPORTANT:
                Sidebar and Navbar are NOT rendered here.

                They are now handled by:
                ExecutiveLayout.jsx
            ================================================== */}

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1600px]
                    px-4
                    py-5
                    sm:px-6
                    sm:py-7
                    lg:px-8
                    lg:py-8
                "
            >

                {/* ==================================================
                    HERO
                ================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        bg-[#102236]
                        p-6
                        text-white
                        shadow-lg
                        sm:p-8
                    "
                >
                    <div
                        className="
                            absolute
                            -right-16
                            -top-20
                            h-60
                            w-60
                            rounded-full
                            bg-[#FECA42]/10
                        "
                    />

                    <div
                        className="
                            absolute
                            -bottom-24
                            right-1/3
                            h-48
                            w-48
                            rounded-full
                            bg-white/[0.03]
                        "
                    />

                    <div
                        className="
                            relative
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
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white/80
                                "
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FECA42]" />

                                Executive Lead Management
                            </div>

                            <h1
                                className="
                                    mt-3
                                    text-3xl
                                    font-black
                                    tracking-tight
                                    sm:text-4xl
                                "
                            >
                                Your leads at a glance.
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-white/60
                                "
                            >
                                Manage your assigned leads,
                                update their status and stay
                                on top of your follow-ups.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                refreshing
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#FECA42]
                                px-5
                                py-3
                                text-sm
                                font-extrabold
                                text-[#102236]
                                shadow-md
                                transition
                                hover:bg-[#ffd45b]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            <Icon
                                type="refresh"
                                className={`
                                    h-4
                                    w-4
                                    ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                `}
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                    </div>
                </section>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div
                        className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            text-red-700
                        "
                    >
                        <div
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-100
                            "
                        >
                            <Icon
                                type="alert"
                                className="h-4 w-4"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-bold">
                                Something went wrong
                            </p>

                            <p className="mt-0.5 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* ==================================================
                    LEAD STATS
                ================================================== */}

                <section className="mt-6">

                    <div className="mb-4 flex items-end justify-between">

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8950]">
                                Lead Pipeline
                            </p>

                            <h2 className="mt-1 text-xl font-extrabold text-[#102236]">
                                Lead overview
                            </h2>
                        </div>

                        <p className="hidden text-xs text-gray-400 sm:block">
                            Click a card to filter
                        </p>

                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        <StatCard
                            title="Total Leads"
                            value={
                                stats.total
                            }
                            subtitle="Assigned to you"
                            icon="leads"
                            iconBg="bg-[#FECA42]"
                            iconColor="text-[#102236]"
                            valueColor="text-[#102236]"
                            onClick={() =>
                                setStatusFilter(
                                    "ALL"
                                )
                            }
                        />

                        <StatCard
                            title="New Leads"
                            value={
                                stats.new
                            }
                            subtitle="Fresh pipeline"
                            icon="leads"
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                            valueColor="text-blue-700"
                            onClick={() =>
                                setStatusFilter(
                                    "NEW"
                                )
                            }
                        />

                        <StatCard
                            title="Hot Leads"
                            value={
                                stats.hot
                            }
                            subtitle="High priority"
                            icon="leads"
                            iconBg="bg-red-100"
                            iconColor="text-red-600"
                            valueColor="text-red-600"
                            onClick={() =>
                                setStatusFilter(
                                    "HOT"
                                )
                            }
                        />

                        <StatCard
                            title="Warm Leads"
                            value={
                                stats.warm
                            }
                            subtitle="Active opportunities"
                            icon="leads"
                            iconBg="bg-amber-100"
                            iconColor="text-amber-600"
                            valueColor="text-amber-600"
                            onClick={() =>
                                setStatusFilter(
                                    "WARM"
                                )
                            }
                        />

                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2">

                        <StatCard
                            title="Cold Leads"
                            value={
                                stats.cold
                            }
                            subtitle="Low priority"
                            icon="leads"
                            iconBg="bg-slate-100"
                            iconColor="text-slate-600"
                            valueColor="text-slate-700"
                            onClick={() =>
                                setStatusFilter(
                                    "COLD"
                                )
                            }
                        />

                    </div>

                </section>

                {/* ==================================================
                    FOLLOW-UP SUMMARY
                ================================================== */}

                <section className="mt-7">

                    <div className="mb-4">

                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8950]">
                            Follow-up Tower
                        </p>

                        <h2 className="mt-1 text-xl font-extrabold text-[#102236]">
                            Follow-up command center
                        </h2>

                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        <FollowUpCard
                            title="Today"
                            value={
                                stats.today
                            }
                            subtitle="Due today"
                            accent="bg-amber-500"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-600"
                            icon="refresh"
                            onClick={() =>
                                navigate(
                                    "/executive-follow-ups"
                                )
                            }
                        />

                        <FollowUpCard
                            title="Upcoming"
                            value={
                                stats.upcoming
                            }
                            subtitle="Scheduled next"
                            accent="bg-blue-500"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-600"
                            icon="arrow"
                            onClick={() =>
                                navigate(
                                    "/executive-follow-ups"
                                )
                            }
                        />

                        <FollowUpCard
                            title="Completed"
                            value={
                                stats.completed
                            }
                            subtitle="Successfully handled"
                            accent="bg-emerald-500"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-600"
                            icon="check"
                            onClick={() =>
                                navigate(
                                    "/executive-follow-ups"
                                )
                            }
                        />

                        <FollowUpCard
                            title="Missed"
                            value={
                                stats.missed
                            }
                            subtitle="Needs attention"
                            accent="bg-red-500"
                            iconBg="bg-red-50"
                            iconColor="text-red-600"
                            icon="alert"
                            onClick={() =>
                                navigate(
                                    "/executive-follow-ups"
                                )
                            }
                        />

                    </div>

                </section>

                {/* ==================================================
                    SEARCH + FILTER
                ================================================== */}

                <section
                    className="
                        mt-7
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    "
                >

                    <div
                        className="
                            mb-4
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a8950]">
                                Find a lead
                            </p>

                            <h2 className="mt-1 text-base font-extrabold text-[#102236]">
                                Search & Filter
                            </h2>
                        </div>

                        {(search ||
                            statusFilter !==
                                "ALL") && (
                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="
                                    self-start
                                    text-xs
                                    font-bold
                                    text-[#102236]
                                    underline
                                    underline-offset-4
                                    transition
                                    hover:text-[#806100]
                                "
                            >
                                Clear filters
                            </button>
                        )}

                    </div>

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            lg:flex-row
                        "
                    >

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            >
                                <Icon
                                    type="search"
                                    className="h-5 w-5"
                                />
                            </div>

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search by name, email, phone, college or program..."
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-[#f8faf9]
                                    py-3
                                    pl-11
                                    pr-4
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#FECA42]
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-[#FECA42]/10
                                "
                            />

                        </div>

                        {/* STATUS */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-[#f8faf9]
                                px-3
                                lg:w-56
                            "
                        >

                            <Icon
                                type="filter"
                                className="h-4 w-4 shrink-0 text-gray-400"
                            />

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatusFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="
                                    w-full
                                    bg-transparent
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    outline-none
                                "
                            >
                                {STATUS_OPTIONS.map(
                                    (
                                        status
                                    ) => (
                                        <option
                                            key={
                                                status
                                            }
                                            value={
                                                status
                                            }
                                        >
                                            {status ===
                                            "ALL"
                                                ? "All Statuses"
                                                : status}
                                        </option>
                                    )
                                )}
                            </select>

                        </div>

                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">

                        <p className="text-xs text-gray-400">
                            Showing{" "}
                            <span className="font-bold text-gray-700">
                                {
                                    filteredLeads.length
                                }
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-gray-700">
                                {
                                    leads.length
                                }
                            </span>{" "}
                            leads
                        </p>

                        <div
                            className={`
                                rounded-full
                                border
                                px-3
                                py-1.5
                                text-[10px]
                                font-bold
                                ${getStatusClasses(
                                    statusFilter ===
                                        "ALL"
                                        ? "NONE"
                                        : statusFilter
                                )}
                            `}
                        >
                            {statusFilter ===
                            "ALL"
                                ? "All Leads"
                                : statusFilter}
                        </div>

                    </div>

                </section>

                {/* ==================================================
                    LEAD TABLE
                ================================================== */}

                <section
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

                    {/* TABLE HEADER */}

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

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#102236]
                                        text-white
                                    "
                                >
                                    <Icon
                                        type="leads"
                                        className="h-5 w-5"
                                    />
                                </div>

                                <div>

                                    <h2 className="text-lg font-extrabold text-[#102236]">
                                        Lead List
                                    </h2>

                                    <p className="text-xs text-gray-400">
                                        Your assigned leads
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="rounded-full bg-[#FECA42]/20 px-3 py-1.5 text-[11px] font-bold text-[#806100]">
                            {filteredLeads.length} Results
                        </div>

                    </div>

                    {/* LOADING */}

                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[360px]
                                items-center
                                justify-center
                            "
                        >

                            <div className="text-center">

                                <div
                                    className="
                                        mx-auto
                                        h-10
                                        w-10
                                        animate-spin
                                        rounded-full
                                        border-4
                                        border-gray-200
                                        border-t-[#102236]
                                    "
                                />

                                <p className="mt-4 text-sm font-bold text-[#102236]">
                                    Loading your leads...
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Please wait
                                </p>

                            </div>

                        </div>

                    ) : filteredLeads.length ===
                      0 ? (

                        /* EMPTY */

                        <div
                            className="
                                flex
                                min-h-[360px]
                                items-center
                                justify-center
                                px-6
                            "
                        >

                            <div className="text-center">

                                <div
                                    className="
                                        mx-auto
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-blue-50
                                        text-blue-500
                                    "
                                >
                                    <Icon
                                        type="leads"
                                        className="h-8 w-8"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-extrabold text-[#102236]">
                                    No leads found
                                </h3>

                                <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                                    {search ||
                                    statusFilter !==
                                        "ALL"
                                        ? "Try changing your search or status filter."
                                        : "No leads are currently assigned to you."}
                                </p>

                                {(search ||
                                    statusFilter !==
                                        "ALL") && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="
                                            mt-4
                                            rounded-xl
                                            bg-[#FECA42]
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-extrabold
                                            text-[#102236]
                                            transition
                                            hover:bg-[#ffd45b]
                                        "
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>

                        </div>

                    ) : (

                        /* TABLE */

                        <div className="overflow-x-auto">

                            <table className="min-w-[1100px] w-full">

                                <thead>

                                    <tr className="border-b border-gray-100 bg-[#f8faf9]">

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Lead
                                        </th>

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Contact
                                        </th>

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            College
                                        </th>

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Program
                                        </th>

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Follow-up
                                        </th>

                                        <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {paginatedItems.map(
                                        (
                                            lead,
                                            index
                                        ) => {

                                            const followUpStatus =
                                                lead?.followUpStatus ||
                                                "NONE";

                                            const followUpDate =
                                                lead?.displayFollowUpAt ||
                                                lead?.followUpAt ||
                                                null;

                                            const initials =
                                                lead?.name
                                                    ?.charAt(
                                                        0
                                                    )
                                                    ?.toUpperCase() ||
                                                "L";

                                            return (
                                                <tr
                                                    key={
                                                        lead?._id ||
                                                        index
                                                    }
                                                    className="
                                                        group
                                                        transition-colors
                                                        duration-150
                                                        hover:bg-[#fffdf5]
                                                    "
                                                >

                                                    {/* LEAD */}

                                                    <td className="px-5 py-5">

                                                        <div className="flex items-center gap-3">

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
                                                                    font-extrabold
                                                                    text-blue-700
                                                                "
                                                            >
                                                                {
                                                                    initials
                                                                }
                                                            </div>

                                                            <div className="min-w-0">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleViewLead(
                                                                            lead
                                                                        )
                                                                    }
                                                                    className="
                                                                        max-w-[230px]
                                                                        truncate
                                                                        text-left
                                                                        text-sm
                                                                        font-extrabold
                                                                        text-[#102236]
                                                                        transition
                                                                        hover:text-blue-600
                                                                    "
                                                                >
                                                                    {lead?.name ||
                                                                        "-"}
                                                                </button>

                                                                <div className="mt-1 flex max-w-[250px] items-center gap-1.5">

                                                                    <Icon
                                                                        type="email"
                                                                        className="h-3.5 w-3.5 shrink-0 text-gray-400"
                                                                    />

                                                                    <p className="truncate text-xs text-gray-400">
                                                                        {lead?.email ||
                                                                            "-"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* CONTACT */}

                                                    <td className="px-5 py-5">

                                                        <div className="flex items-center gap-2">

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    bg-blue-50
                                                                    text-blue-600
                                                                "
                                                            >
                                                                <Icon
                                                                    type="phone"
                                                                    className="h-4 w-4"
                                                                />
                                                            </div>

                                                            <span className="text-sm font-medium text-gray-700">
                                                                {lead?.contact ||
                                                                    "-"}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    {/* COLLEGE */}

                                                    <td className="max-w-[240px] px-5 py-5">

                                                        <div className="flex items-start gap-2">

                                                            <div
                                                                className="
                                                                    mt-0.5
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    bg-slate-100
                                                                    text-slate-600
                                                                "
                                                            >
                                                                <Icon
                                                                    type="building"
                                                                    className="h-4 w-4"
                                                                />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="line-clamp-2 text-sm font-bold text-gray-700">
                                                                    {lead?.collegeName ||
                                                                        "-"}
                                                                </p>

                                                                <p className="mt-1 truncate text-xs text-gray-400">
                                                                    {lead?.district ||
                                                                        lead?.state ||
                                                                        "Location not available"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* PROGRAM */}

                                                    <td className="max-w-[220px] px-5 py-5">

                                                        <span
                                                            className="
                                                                inline-flex
                                                                max-w-[200px]
                                                                rounded-lg
                                                                border
                                                                border-gray-200
                                                                bg-gray-50
                                                                px-3
                                                                py-2
                                                                text-xs
                                                                font-semibold
                                                                text-gray-700
                                                            "
                                                        >
                                                            <span className="truncate">
                                                                {lead?.programInterest ||
                                                                    lead?.leadType ||
                                                                    "-"}
                                                            </span>
                                                        </span>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-5 py-5">

                                                        <div className="flex items-center gap-2">

                                                            <select
                                                                value={
                                                                    lead?.status ||
                                                                    "NEW"
                                                                }
                                                                disabled={
                                                                    updatingLeadId ===
                                                                    lead?._id
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleStatusChange(
                                                                        lead?._id,
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                className={`
                                                                    cursor-pointer
                                                                    appearance-none
                                                                    rounded-full
                                                                    border
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-bold
                                                                    outline-none
                                                                    transition
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-60
                                                                    ${getStatusClasses(
                                                                        lead?.status
                                                                    )}
                                                                `}
                                                            >

                                                                {STATUS_EDIT_OPTIONS.map(
                                                                    (
                                                                        status
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            {
                                                                                status
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}

                                                            </select>

                                                            <span
                                                                className={`
                                                                    h-2
                                                                    w-2
                                                                    shrink-0
                                                                    rounded-full
                                                                    ${getStatusDot(
                                                                        lead?.status
                                                                    )}
                                                                `}
                                                            />

                                                        </div>

                                                        {updatingLeadId ===
                                                            lead?._id && (
                                                            <p className="mt-1 text-[10px] font-medium text-gray-400">
                                                                Saving...
                                                            </p>
                                                        )}

                                                    </td>

                                                    {/* FOLLOW-UP */}

                                                    <td className="px-5 py-5">

                                                        <div className="flex flex-col items-start gap-2">

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    px-3
                                                                    py-1.5
                                                                    text-[10px]
                                                                    font-bold
                                                                    ${getFollowUpStatusClasses(
                                                                        followUpStatus
                                                                    )}
                                                                `}
                                                            >

                                                                <span
                                                                    className={`
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        ${getFollowUpStatusDot(
                                                                            followUpStatus
                                                                        )}
                                                                    `}
                                                                />

                                                                {getFollowUpStatusLabel(
                                                                    followUpStatus
                                                                )}

                                                            </span>

                                                            {followUpDate && (
                                                                <span className="text-xs text-gray-400">
                                                                    {formatFollowUp(
                                                                        followUpDate
                                                                    )}
                                                                </span>
                                                            )}

                                                        </div>

                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-5 py-5 text-right">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewLead(
                                                                    lead
                                                                )
                                                            }
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-2
                                                                rounded-xl
                                                                bg-[#102236]
                                                                px-4
                                                                py-2.5
                                                                text-xs
                                                                font-bold
                                                                text-white
                                                                shadow-sm
                                                                transition-all
                                                                duration-200
                                                                hover:bg-[#18344e]
                                                                hover:shadow-md
                                                                active:scale-95
                                                            "
                                                        >
                                                            View

                                                            <Icon
                                                                type="arrow"
                                                                className="h-3.5 w-3.5"
                                                            />
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {!loading &&
                    filteredLeads.length > 0 && (
                    <Pagination
                        page={page}
                        total={total}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setPage}
                        itemLabel="leads"
                    />
                )}

                {/* ==================================================
                    FOOTER
                ================================================== */}

                {!loading &&
                    filteredLeads.length > 0 && (
                    <div
                        className="
                            mt-4
                            flex
                            flex-col
                            items-center
                            justify-between
                            gap-2
                            text-xs
                            text-gray-400
                            sm:flex-row
                        "
                    >

                        <p>
                            Showing{" "}
                            <span className="font-bold text-gray-600">
                                {(page - 1) * itemsPerPage + 1}
                            </span>
                            {" – "}
                            <span className="font-bold text-gray-600">
                                {Math.min(
                                    page * itemsPerPage,
                                    total
                                )}
                            </span>
                            {" of "}
                            <span className="font-bold text-gray-600">
                                {total}
                            </span>{" "}
                            leads
                        </p>

                        <p>
                            SVR EDTECH • Executive
                            Lead Management
                        </p>

                    </div>
                )}

            </div>
        </div>
    );
}

export default ExecutiveLeads;