    import React, {
        useEffect,
        useMemo,
        useState
    } from "react";

    import { useNavigate } from "react-router-dom";


  const API_URL = import.meta.env.VITE_API_URL;


    // ============================================================
    // ICON
    // ============================================================

    function Icon({
        type,
        className = "h-5 w-5"
    }) {

        const common = {
            className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round"
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


            case "users":
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


            case "phone":
                return (
                    <svg {...common}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5.07 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.05 10.95a16 16 0 0 0 4 4l1.31-1.31a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 0 22 16.92z" />
                    </svg>
                );


            case "mail":
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


            case "calendar":
                return (
                    <svg {...common}>
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
                );


            case "refresh":
                return (
                    <svg {...common}>
                        <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
                        <path d="M4 4v4h4" />
                        <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
                        <path d="M20 20v-4h-4" />
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


            case "check":
                return (
                    <svg {...common}>
                        <path d="m5 12 4 4L19 6" />
                    </svg>
                );


            case "clock":
                return (
                    <svg {...common}>
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />
                        <path d="M12 7v5l3 2" />
                    </svg>
                );


            case "alert":
                return (
                    <svg {...common}>
                        <path d="M10.3 3.3 2.5 17a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                );


            case "arrow":
                return (
                    <svg {...common}>
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                    </svg>
                );


            case "x":
                return (
                    <svg {...common}>
                        <path d="M6 6l12 12" />
                        <path d="M18 6L6 18" />
                    </svg>
                );


            case "usersPlus":
                return (
                    <svg {...common}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle
                            cx="9"
                            cy="7"
                            r="4"
                        />
                        <path d="M19 8v6" />
                        <path d="M22 11h-6" />
                    </svg>
                );


            default:
                return null;

        }

    }


    // ============================================================
    // LEAD STATUS
    // ============================================================

    const LEAD_STATUS_CONFIG = {

        NEW: {
            label: "New",
            className:
                "bg-blue-50 text-blue-700 border-blue-200",
            dot:
                "bg-blue-500"
        },

        COLD: {
            label: "Cold",
            className:
                "bg-slate-50 text-slate-700 border-slate-200",
            dot:
                "bg-slate-500"
        },

        WARM: {
            label: "Warm",
            className:
                "bg-amber-50 text-amber-700 border-amber-200",
            dot:
                "bg-amber-500"
        },

        HOT: {
            label: "Hot",
            className:
                "bg-red-50 text-red-700 border-red-200",
            dot:
                "bg-red-500"
        }

    };


    // ============================================================
    // FOLLOW-UP STATUS
    // ============================================================

    const FOLLOW_UP_CONFIG = {

        UPCOMING: {
            label: "Upcoming",
            icon: "calendar",
            className:
                "border-violet-200 bg-violet-50 text-violet-700",
            dot:
                "bg-violet-500",
            glow:
                "bg-violet-200"
        },

        TODAY: {
            label: "Today",
            icon: "clock",
            className:
                "border-blue-200 bg-blue-50 text-blue-700",
            dot:
                "bg-blue-500",
            glow:
                "bg-blue-200"
        },

        MISSED: {
            label: "Missed",
            icon: "alert",
            className:
                "border-red-200 bg-red-50 text-red-700",
            dot:
                "bg-red-500",
            glow:
                "bg-red-200"
        },

        COMPLETED: {
            label: "Completed",
            icon: "check",
            className:
                "border-emerald-200 bg-emerald-50 text-emerald-700",
            dot:
                "bg-emerald-500",
            glow:
                "bg-emerald-200"
        },

        NONE: {
            label: "No Follow-up",
            icon: "calendar",
            className:
                "border-slate-200 bg-slate-50 text-slate-500",
            dot:
                "bg-slate-400",
            glow:
                "bg-slate-200"
        }

    };


    // ============================================================
    // TOKEN
    // ============================================================

    function getToken() {

        return (
            localStorage.getItem(
                "managerToken"
            ) ||
            localStorage.getItem(
                "token"
            )
        );

    }


    // ============================================================
    // RESPONSE
    // ============================================================

    async function getResponseData(
        response
    ) {

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            return await response.json();

        }


        const text =
            await response.text();


        throw new Error(
            text ||
            `Server returned ${response.status}`
        );

    }


    // ============================================================
    // DATE HELPERS
    // ============================================================

    function formatFollowUpDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "-";

        }


        return parsed.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function formatDate(
        date
    ) {

        if (!date) {
            return "-";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "-";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ============================================================
    // INITIALS
    // ============================================================

    function getInitials(
        name
    ) {

        if (!name) {
            return "U";
        }


        const parts =
            String(name)
                .trim()
                .split(/\s+/);


        if (
            parts.length === 1
        ) {

            return parts[0]
                .charAt(0)
                .toUpperCase();

        }


        return (
            parts[0].charAt(0) +
            parts[
                parts.length - 1
            ].charAt(0)
        ).toUpperCase();

    }


    // ============================================================
    // FOLLOW-UP CARD
    // ============================================================

    function FollowUpCard({
        title,
        count,
        description,
        icon,
        active,
        onClick,
        type
    }) {

        const config =
            FOLLOW_UP_CONFIG[type] ||
            FOLLOW_UP_CONFIG.NONE;


        return (

            <button
                type="button"
                onClick={onClick}
                className={`
                    group relative overflow-hidden
                    rounded-2xl border p-5
                    text-left transition-all duration-300
                    ${
                        active
                            ? "border-slate-300 bg-white shadow-xl ring-2 ring-slate-200"
                            : "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl"
                    }
                `}
            >

                <div
                    className={`
                        absolute
                        -right-10
                        -top-10
                        h-28
                        w-28
                        rounded-full
                        opacity-60
                        blur-3xl
                        transition-transform
                        duration-500
                        group-hover:scale-125
                        ${config.glow}
                    `}
                />


                <div className="relative">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                {title}
                            </p>


                            <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                {count}
                            </p>


                            <p className="mt-1 text-xs font-medium text-slate-400">
                                {description}
                            </p>

                        </div>


                        <div
                            className={`
                                flex h-11 w-11
                                items-center justify-center
                                rounded-xl
                                ${config.className}
                            `}
                        >

                            <Icon
                                type={icon}
                                className="h-5 w-5"
                            />

                        </div>

                    </div>


                    <div className="mt-5 flex items-center justify-between">

                        <span
                            className={`
                                inline-flex items-center gap-1.5
                                text-xs font-bold
                                ${
                                    active
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                }
                            `}
                        >

                            {active
                                ? "Viewing"
                                : "View leads"
                            }


                            <Icon
                                type="arrow"
                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                            />

                        </span>


                        {active && (

                            <span className="h-2 w-2 rounded-full bg-slate-900" />

                        )}

                    </div>

                </div>

            </button>

        );

    }


    // ============================================================
    // MAIN COMPONENT
    // ============================================================

    export default function ManagerLeads() {

        const navigate =
            useNavigate();


        // ========================================================
        // DATA
        // ========================================================

        const [
            leads,
            setLeads
        ] = useState([]);


        const [
            executives,
            setExecutives
        ] = useState([]);


        const [
            team,
            setTeam
        ] = useState(null);


        const [
            totalLeads,
            setTotalLeads
        ] = useState(0);


        // ========================================================
        // LOADING
        // ========================================================

        const [
            loading,
            setLoading
        ] = useState(true);


        const [
            executivesLoading,
            setExecutivesLoading
        ] = useState(true);


        // ========================================================
        // ERROR
        // ========================================================

        const [
            error,
            setError
        ] = useState("");


        // ========================================================
        // FILTERS
        // ========================================================

        const [
            search,
            setSearch
        ] = useState("");


        const [
            status,
            setStatus
        ] = useState("");


        const [
            executive,
            setExecutive
        ] = useState("");


        const [
            leadType,
            setLeadType
        ] = useState("ALL");


        const [
            followUpFilter,
            setFollowUpFilter
        ] = useState("ALL");


        // ========================================================
        // VIEW LEAD
        // ========================================================

        const handleViewLead = (
            lead
        ) => {

            if (!lead?._id) {
                return;
            }


            navigate(
                `/leads/${lead._id}`
            );

        };


        // ========================================================
        // FETCH EXECUTIVES
        // ========================================================

        const fetchExecutives =
            async () => {

                try {

                    setExecutivesLoading(
                        true
                    );


                    const token =
                        getToken();


                    if (!token) {

                        throw new Error(
                            "Manager authentication token not found."
                        );

                    }


                    const response =
                        await fetch(
                            `${API_URL}/api/manager/leads/executives`,
                            {
                                method: "GET",
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                    Accept:
                                        "application/json"
                                }
                            }
                        );


                    const data =
                        await getResponseData(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to load executives."
                        );

                    }


                    setExecutives(
                        data.executives ||
                        []
                    );

                    const executiveEndpointAllLeads =
                        data?.totalLeads ??
                        data?.stats?.totalLeads ??
                        data?.summary?.totalLeads;

                    if (executiveEndpointAllLeads != null) {
                        setTotalLeads(
                            Number(executiveEndpointAllLeads)
                        );
                    }


                    if (data.team) {

                        setTeam(
                            data.team
                        );

                    }

                } catch (error) {

                    console.error(
                        "Fetch executives error:",
                        error
                    );

                } finally {

                    setExecutivesLoading(
                        false
                    );

                }

            };


        // ========================================================
        // FETCH LEADS
        // ========================================================

        const fetchLeads =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    const token =
                        getToken();


                    if (!token) {

                        throw new Error(
                            "Manager authentication token not found."
                        );

                    }


                    const params =
                        new URLSearchParams();


                    // ------------------------------------------------
                    // BACKEND FILTERS
                    // ------------------------------------------------

                    if (status) {

                        params.append(
                            "status",
                            status
                        );

                    }


                    if (executive) {

                        params.append(
                            "executive",
                            executive
                        );

                    }


                    if (
                        search.trim()
                    ) {

                        params.append(
                            "search",
                            search.trim()
                        );

                    }


                    if (
                        leadType ===
                        "DIRECT"
                    ) {

                        params.append(
                            "type",
                            "DIRECT"
                        );

                    }


                    if (
                        leadType ===
                        "EXECUTIVE"
                    ) {

                        params.append(
                            "type",
                            "EXECUTIVE"
                        );

                    }


                    const queryString =
                        params.toString();


                    const url =
                        `${API_URL}/api/manager/leads` +
                        (
                            queryString
                                ? `?${queryString}`
                                : ""
                        );


                    const response =
                        await fetch(
                            url,
                            {
                                method: "GET",
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,
                                    Accept:
                                        "application/json"
                                }
                            }
                        );


                    const data =
                        await getResponseData(
                            response
                        );


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to load leads."
                        );

                    }


                    // ------------------------------------------------
                    // IMPORTANT
                    //
                    // followUpStatus comes directly from backend.
                    //
                    // DO NOT calculate it again in React.
                    // ------------------------------------------------

                    setLeads(
                        data.leads ||
                        []
                    );


                    // Keep the backend as the source of truth for totals.
                    // Support the common response shapes without changing any API.
                    const responseTotalLeads =
                        data?.totalLeads ??
                        data?.stats?.totalLeads ??
                        data?.summary?.totalLeads ??
                        data?.meta?.totalLeads ??
                        data?.pagination?.total ??
                        data?.total ??
                        data?.count;

                    setTotalLeads(
                        Number(
                            responseTotalLeads ??
                            (Array.isArray(data?.leads)
                                ? data.leads.length
                                : 0)
                        )
                    );

                    if (data.team) {

                        setTeam(
                            data.team
                        );

                    }

                } catch (error) {

                    console.error(
                        "Fetch manager leads error:",
                        error
                    );


                    setError(
                        error.message ||
                        "Unable to load leads."
                    );


                    setLeads([]);

                } finally {

                    setLoading(
                        false
                    );

                }

            };


        // ========================================================
        // INITIAL LOAD
        // ========================================================

        useEffect(() => {

            fetchExecutives();

        }, []);


        // ========================================================
        // FETCH WHEN BACKEND FILTERS CHANGE
        // ========================================================

        useEffect(() => {

            const timer =
                setTimeout(
                    () => {
                        fetchLeads();
                    },
                    300
                );


            return () => {

                clearTimeout(
                    timer
                );

            };

        }, [
            search,
            status,
            executive,
            leadType
        ]);


        // ========================================================
        // IMPORTANT
        //
        // NO FRONTEND FOLLOW-UP DATE CALCULATION.
        //
        // Backend already returns:
        //
        // COMPLETED
        // TODAY
        // UPCOMING
        // MISSED
        // NONE
        //
        // So React simply consumes:
        //
        // lead.followUpStatus
        // ========================================================

        const followUpCounts =
            useMemo(
                () => {

                    return {

                        UPCOMING:
                            leads.filter(
                                (lead) =>
                                    lead.followUpStatus ===
                                    "UPCOMING"
                            ).length,


                        TODAY:
                            leads.filter(
                                (lead) =>
                                    lead.followUpStatus ===
                                    "TODAY"
                            ).length,


                        MISSED:
                            leads.filter(
                                (lead) =>
                                    lead.followUpStatus ===
                                    "MISSED"
                            ).length,


                        COMPLETED:
                            leads.filter(
                                (lead) =>
                                    lead.followUpStatus ===
                                    "COMPLETED"
                            ).length

                    };

                },
                [leads]
            );


        // ========================================================
        // FOLLOW-UP FILTER
        // ========================================================

        const displayedLeads =
            useMemo(
                () => {

                    if (
                        followUpFilter ===
                        "ALL"
                    ) {

                        return leads;

                    }


                    return leads.filter(
                        (lead) =>
                            lead.followUpStatus ===
                            followUpFilter
                    );

                },
                [
                    leads,
                    followUpFilter
                ]
            );


        // ========================================================
        // UI PAGINATION
        // ========================================================

        const ITEMS_PER_PAGE = 50;

        const [page, setPage] = useState(1);

        const totalDisplayedLeads =
            displayedLeads.length;

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalDisplayedLeads /
                    ITEMS_PER_PAGE
                )
            );

        useEffect(() => {
            setPage(1);
        }, [
            search,
            status,
            executive,
            leadType,
            followUpFilter
        ]);

        useEffect(() => {
            if (page > totalPages) {
                setPage(totalPages);
            }
        }, [
            page,
            totalPages
        ]);

        const paginatedLeads =
            useMemo(() => {
                const start =
                    (page - 1) *
                    ITEMS_PER_PAGE;

                return displayedLeads.slice(
                    start,
                    start + ITEMS_PER_PAGE
                );
            }, [
                displayedLeads,
                page
            ]);

        // ========================================================
        // CLEAR FILTERS
        // ========================================================

        const clearFilters =
            () => {

                setSearch("");

                setStatus("");

                setExecutive("");

                setLeadType("ALL");

                setFollowUpFilter(
                    "ALL"
                );

            };


        const hasFilters =
            Boolean(
                search ||
                status ||
                executive ||
                leadType !== "ALL" ||
                followUpFilter !== "ALL"
            );


        // ========================================================
        // RENDER
        // ========================================================

        return (

            <div className="min-h-screen bg-slate-50 text-slate-900">

                {/* ==================================================
                    PAGE BACKGROUND
                ================================================== */}

                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute left-[8%] top-[-180px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-[120px]" />
                    <div className="absolute right-[4%] top-[28%] h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-[120px]" />
                    <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[120px]" />
                </div>

                <main className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                    {/* ==================================================
                        HERO
                    ================================================== */}

                    <section className="relative overflow-hidden rounded-3xl border border-[#1d344d] bg-[#102236] p-6 shadow-[0_25px_80px_rgba(16,34,54,0.28)] sm:p-8">

                        <div className="pointer-events-none absolute inset-0">
                            <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
                            <div className="absolute bottom-[-120px] right-[25%] h-64 w-64 rounded-full bg-[#FECA42]/5 blur-3xl" />
                        </div>

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                            <div className="max-w-3xl">

                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                                    Manager Workspace
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Manager Leads
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                    Track your team's leads and follow-ups in one place.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-400">

                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                        Backend data synced
                                    </span>

                                    <span className="hidden h-4 w-px bg-white/10 sm:block" />

                                    <span>
                                        {totalLeads} total leads
                                    </span>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    fetchExecutives();
                                    fetchLeads();
                                }}
                                className="
                                    inline-flex shrink-0 items-center justify-center gap-2
                                    rounded-xl border border-[#FECA42] bg-[#FECA42]
                                    px-4 py-3 text-sm font-semibold text-[#102236]
                                    shadow-lg shadow-[#FECA42]/20 transition
                                    hover:border-[#e8b52f] hover:bg-[#e8b52f]
                                    disabled:cursor-not-allowed disabled:opacity-50
                                "
                            >
                                <Icon
                                    type="refresh"
                                    className={`
                                        h-4 w-4
                                        ${loading ? "animate-spin" : ""}
                                    `}
                                />
                                Refresh
                            </button>

                        </div>
                    </section>


                    {/* ==================================================
                        FOLLOW-UP OVERVIEW
                        DESIGN ONLY — STATUS LOGIC IS UNCHANGED
                    ================================================== */}

                    <section className="mt-6">

                        <div className="mb-4 flex items-end justify-between">

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Follow-up overview
                                </p>

                                <h2 className="mt-1 text-xl font-black text-slate-900">
                                    Today's activity
                                </h2>
                            </div>

                            {followUpFilter !== "ALL" && (
                                <button
                                    type="button"
                                    onClick={() => setFollowUpFilter("ALL")}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                >
                                    Show all
                                </button>
                            )}

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <FollowUpCard
                                title="Today"
                                count={followUpCounts.TODAY}
                                description="Due today"
                                icon="clock"
                                type="TODAY"
                                active={followUpFilter === "TODAY"}
                                onClick={() => setFollowUpFilter("TODAY")}
                            />

                            <FollowUpCard
                                title="Upcoming"
                                count={followUpCounts.UPCOMING}
                                description="Future follow-ups"
                                icon="calendar"
                                type="UPCOMING"
                                active={followUpFilter === "UPCOMING"}
                                onClick={() => setFollowUpFilter("UPCOMING")}
                            />

                            <FollowUpCard
                                title="Missed"
                                count={followUpCounts.MISSED}
                                description="Past & not completed"
                                icon="alert"
                                type="MISSED"
                                active={followUpFilter === "MISSED"}
                                onClick={() => setFollowUpFilter("MISSED")}
                            />

                            <FollowUpCard
                                title="Completed"
                                count={followUpCounts.COMPLETED}
                                description="Completed today"
                                icon="check"
                                type="COMPLETED"
                                active={followUpFilter === "COMPLETED"}
                                onClick={() => setFollowUpFilter("COMPLETED")}
                            />

                        </div>
                    </section>


                    {/* ==================================================
                        TEAM OVERVIEW
                    ================================================== */}

                    <section className="mt-6">

                        <div className="mb-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Team overview
                            </p>

                            <h2 className="mt-1 text-xl font-black text-slate-900">
                                Lead distribution
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">

                            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-200/60 blur-3xl transition duration-500 group-hover:scale-125" />

                                <div className="relative flex items-start justify-between">

                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                            Total Leads
                                        </p>

                                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                            {totalLeads}
                                        </p>

                                        <p className="mt-1 text-xs font-medium text-slate-400">
                                            All leads in your team
                                        </p>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                                        <Icon type="users" className="h-5 w-5" />
                                    </div>

                                </div>

                                <div className="relative mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                    Team leads
                                    <Icon type="arrow" className="h-3.5 w-3.5" />
                                </div>

                            </div>

                        </div>
                    </section>


                    {/* ==================================================
                        SEARCH + FILTERS
                    ================================================== */}

                    <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_20px_70px_rgba(16,34,54,0.10)] sm:p-5">

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                            <div className="relative w-full xl:max-w-md">

                                <Icon
                                    type="search"
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search lead, owner, phone, email..."
                                    className="
                                        h-12 w-full rounded-xl border border-gray-200
                                        bg-gray-50 pl-11 pr-10 text-sm font-medium
                                        text-gray-900 outline-none transition
                                        placeholder:text-gray-400
                                        focus:border-blue-400 focus:bg-white
                                        focus:ring-2 focus:ring-blue-100
                                    "
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <Icon type="x" className="h-4 w-4" />
                                    </button>
                                )}

                            </div>


                            <div className="flex gap-2 overflow-x-auto pb-1">

                                {[
                                    { key: "ALL", label: "All", count: leads.length },
                                    { key: "TODAY", label: "Today", count: followUpCounts.TODAY },
                                    { key: "UPCOMING", label: "Upcoming", count: followUpCounts.UPCOMING },
                                    { key: "MISSED", label: "Missed", count: followUpCounts.MISSED },
                                    { key: "COMPLETED", label: "Completed", count: followUpCounts.COMPLETED }
                                ].map((item) => {

                                    const active = followUpFilter === item.key;

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setFollowUpFilter(item.key)}
                                            className={`
                                                inline-flex shrink-0 items-center gap-2 rounded-xl
                                                border px-3.5 py-2.5 text-xs font-semibold transition
                                                ${
                                                    active
                                                        ? "border-blue-300 bg-blue-600/10 text-blue-700"
                                                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                                }
                                            `}
                                        >
                                            {item.label}

                                            <span className={`
                                                rounded-md px-1.5 py-0.5 text-[10px]
                                                ${
                                                    active
                                                        ? "bg-blue-600/15 text-blue-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }
                                            `}>
                                                {item.count}
                                            </span>
                                        </button>
                                    );
                                })}

                                <select
                                    value={executive}
                                    onChange={(event) => setExecutive(event.target.value)}
                                    disabled={executivesLoading}
                                    className="
                                        min-w-[180px] shrink-0 rounded-xl border border-gray-200
                                        bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-700
                                        outline-none transition focus:border-blue-400 focus:bg-white
                                        focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >
                                    <option value="">
                                        {executivesLoading ? "Loading executives..." : "All Executives"}
                                    </option>

                                    {executives.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>

                            </div>

                        </div>


                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 md:grid-cols-2">

                            <select
                                value={leadType}
                                onChange={(event) => setLeadType(event.target.value)}
                                className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="ALL">All Lead Types</option>
                                <option value="DIRECT">Direct Leads</option>
                                <option value="EXECUTIVE">Executive Leads</option>
                            </select>

                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">All Lead Status</option>
                                <option value="NEW">New</option>
                                <option value="HOT">Hot</option>
                                <option value="WARM">Warm</option>
                                <option value="COLD">Cold</option>
                            </select>

                        </div>


                        {hasFilters && (
                            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">

                                <p className="text-xs font-medium text-slate-400">
                                    Filters are active
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-800"
                                >
                                    <Icon type="x" className="h-3.5 w-3.5" />
                                    Clear filters
                                </button>

                            </div>
                        )}

                    </section>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (

                        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                <Icon
                                    type="alert"
                                    className="h-4 w-4"
                                />

                            </div>


                            <div>

                                <p className="text-sm font-bold text-red-800">

                                    Unable to load leads

                                </p>


                                <p className="mt-1 text-xs text-red-600">

                                    {error}

                                </p>

                            </div>

                        </div>

                    )}


                    {/* ==================================================
                        LEADS TABLE
                    ================================================== */}

                    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                        {/* HEADER */}

                        <div className="border-b border-slate-100 px-5 py-5">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <h2 className="text-lg font-black text-slate-950">

                                            {followUpFilter ===
                                            "ALL"
                                                ? "Team Leads"
                                                : `${FOLLOW_UP_CONFIG[
                                                    followUpFilter
                                                ]?.label} Follow-ups`
                                            }

                                        </h2>


                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600">

                                            {
                                                displayedLeads.length
                                            }

                                        </span>

                                    </div>


                                    <p className="mt-1 text-xs text-slate-400">

                                        Follow-up status is
                                        provided by the server.

                                    </p>

                                </div>


                                {followUpFilter !==
                                    "ALL" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFollowUpFilter(
                                                "ALL"
                                            )
                                        }
                                        className="w-fit rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                                    >

                                        View all leads

                                    </button>

                                )}

                            </div>

                        </div>


                        {/* LOADING */}

                        {loading ? (

                            <div className="flex min-h-[360px] items-center justify-center">

                                <div className="text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">

                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />

                                    </div>


                                    <p className="mt-4 text-sm font-bold text-slate-700">

                                        Loading leads...

                                    </p>


                                    <p className="mt-1 text-xs text-slate-400">

                                        Getting the latest team data

                                    </p>

                                </div>

                            </div>

                        ) : displayedLeads.length ===
                        0 ? (

                            /* EMPTY */

                            <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                    <Icon
                                        type="users"
                                        className="h-7 w-7"
                                    />

                                </div>


                                <h3 className="mt-5 text-base font-black text-slate-800">

                                    No leads found

                                </h3>


                                <p className="mt-1 max-w-sm text-sm text-slate-400">

                                    {followUpFilter !==
                                    "ALL"
                                        ? `There are no ${FOLLOW_UP_CONFIG[
                                            followUpFilter
                                        ]?.label.toLowerCase()} follow-ups right now.`
                                        : "No leads match your current filters."
                                    }

                                </p>


                                {hasFilters && (

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                                    >

                                        Clear Filters

                                    </button>

                                )}

                            </div>

                        ) : (

                            /* TABLE */

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1150px]">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50/70">

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Lead
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Contact
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Program
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Owner
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Lead Status
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Follow-up
                                            </th>

                                            <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                                                Created
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {paginatedLeads.map(
                                            (lead) => {

                                                const leadStatus =
                                                    LEAD_STATUS_CONFIG[
                                                        lead.status
                                                    ] ||
                                                    LEAD_STATUS_CONFIG.NEW;


                                                // IMPORTANT:
                                                // Comes directly from backend.

                                                const followUpStatus =
                                                    lead.followUpStatus ||
                                                    "NONE";


                                                const followUp =
                                                    FOLLOW_UP_CONFIG[
                                                        followUpStatus
                                                    ] ||
                                                    FOLLOW_UP_CONFIG.NONE;


                                                const owner =
                                                    lead.leadOwner;


                                                return (

                                                    <tr
                                                        key={
                                                            lead._id
                                                        }
                                                        className="group transition-colors hover:bg-blue-50/30"
                                                    >


                                                        {/* LEAD */}

                                                        <td className="px-5 py-5">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-xs font-black text-white shadow-sm">

                                                                    {getInitials(
                                                                        lead.name
                                                                    )}

                                                                </div>


                                                                <div className="min-w-0">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleViewLead(
                                                                                lead
                                                                            )
                                                                        }
                                                                        className="max-w-[190px] truncate text-left text-sm font-black text-slate-800 transition hover:text-blue-600"
                                                                    >

                                                                        {lead.name ||
                                                                            "-"}

                                                                    </button>


                                                                    <p className="mt-1 text-xs text-slate-400">

                                                                        {lead.gender ||
                                                                            "-"}

                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* CONTACT */}

                                                        <td className="px-5 py-5">

                                                            <div className="space-y-2">

                                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">

                                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">

                                                                        <Icon
                                                                            type="phone"
                                                                            className="h-3.5 w-3.5"
                                                                        />

                                                                    </span>


                                                                    {lead.contact ||
                                                                        "-"}

                                                                </div>


                                                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400">

                                                                        <Icon
                                                                            type="mail"
                                                                            className="h-3.5 w-3.5"
                                                                        />

                                                                    </span>


                                                                    <span className="max-w-[190px] truncate">

                                                                        {lead.email ||
                                                                            "-"}

                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* PROGRAM */}

                                                        <td className="px-5 py-5">

                                                            <p className="text-sm font-bold text-slate-700">

                                                                {lead.programInterest ||
                                                                    "-"}

                                                            </p>


                                                            <span
                                                                className={`
                                                                    mt-1.5
                                                                    inline-flex
                                                                    rounded-full
                                                                    px-2 py-1
                                                                    text-[10px]
                                                                    font-black
                                                                    ${
                                                                        lead.leadType ===
                                                                        "IT"
                                                                            ? "bg-blue-50 text-blue-600"
                                                                            : "bg-purple-50 text-purple-600"
                                                                    }
                                                                `}
                                                            >

                                                                {lead.leadType ||
                                                                    "-"}

                                                            </span>

                                                        </td>


                                                        {/* OWNER */}

                                                        <td className="px-5 py-5">

                                                            {owner ? (

                                                                <div className="flex items-center gap-2.5">

                                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-[10px] font-black text-white">

                                                                        {getInitials(
                                                                            owner.name
                                                                        )}

                                                                    </div>


                                                                    <div className="min-w-0">

                                                                        <p className="max-w-[130px] truncate text-xs font-black text-slate-700">

                                                                            {owner.name ||
                                                                                "-"}

                                                                        </p>


                                                                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">

                                                                            {owner.role ||
                                                                                "Owner"}

                                                                        </p>

                                                                    </div>

                                                                </div>

                                                            ) : (

                                                                <span className="inline-flex items-center rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">

                                                                    Unassigned

                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* LEAD STATUS */}

                                                        <td className="px-5 py-5">

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-2
                                                                    rounded-full
                                                                    border
                                                                    px-3 py-1.5
                                                                    text-xs
                                                                    font-black
                                                                    ${leadStatus.className}
                                                                `}
                                                            >

                                                                <span
                                                                    className={`
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        ${leadStatus.dot}
                                                                    `}
                                                                />


                                                                {
                                                                    leadStatus.label
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* FOLLOW-UP */}

                                                        <td className="px-5 py-5">

                                                            <div className="space-y-2">


                                                                <span
                                                                    className={`
                                                                        inline-flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-full
                                                                        border
                                                                        px-3 py-1.5
                                                                        text-xs
                                                                        font-black
                                                                        ${followUp.className}
                                                                    `}
                                                                >

                                                                    <span
                                                                        className={`
                                                                            h-1.5
                                                                            w-1.5
                                                                            rounded-full
                                                                            ${followUp.dot}
                                                                        `}
                                                                    />


                                                                    <Icon
                                                                        type={
                                                                            followUp.icon
                                                                        }
                                                                        className="h-3.5 w-3.5"
                                                                    />


                                                                    {
                                                                        followUp.label
                                                                    }

                                                                </span>


                                                                {lead.followUpAt && (

                                                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">

                                                                        <Icon
                                                                            type="calendar"
                                                                            className="h-3.5 w-3.5"
                                                                        />


                                                                        <span>

                                                                            {formatFollowUpDate(
                                                                                lead.followUpAt
                                                                            )}

                                                                        </span>

                                                                    </div>

                                                                )}


                                                                {followUpStatus ===
                                                                    "COMPLETED" &&
                                                                    lead.followUpCompletedAt && (

                                                                        <p className="text-[10px] font-semibold text-emerald-600">

                                                                            Completed{" "}
                                                                            {formatDate(
                                                                                lead.followUpCompletedAt
                                                                            )}

                                                                        </p>

                                                                    )}

                                                            </div>

                                                        </td>


                                                        {/* CREATED */}

                                                        <td className="px-5 py-5">

                                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">

                                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">

                                                                    <Icon
                                                                        type="calendar"
                                                                        className="h-3.5 w-3.5"
                                                                    />

                                                                </span>


                                                                {formatDate(
                                                                    lead.createdAt
                                                                )}

                                                            </div>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}


                        {/* PAGINATION */}

                        {!loading &&
                            totalDisplayedLeads > 0 && (
                                <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                    <p className="text-xs font-medium text-slate-400">
                                        Showing{" "}
                                        <span className="font-black text-slate-700">
                                            {(page - 1) *
                                                ITEMS_PER_PAGE +
                                                1}
                                        </span>
                                        {" – "}
                                        <span className="font-black text-slate-700">
                                            {Math.min(
                                                page *
                                                    ITEMS_PER_PAGE,
                                                totalDisplayedLeads
                                            )}
                                        </span>
                                        {" of "}
                                        <span className="font-black text-slate-700">
                                            {totalDisplayedLeads}
                                        </span>{" "}
                                        leads
                                    </p>

                                    <div className="flex items-center gap-1.5 overflow-x-auto">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (currentPage) =>
                                                        Math.max(
                                                            1,
                                                            currentPage - 1
                                                        )
                                                )
                                            }
                                            disabled={page === 1}
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <span className="text-base leading-none">
                                                ‹
                                            </span>
                                            Previous
                                        </button>

                                        {Array.from(
                                            {
                                                length: totalPages
                                            },
                                            (_, index) =>
                                                index + 1
                                        )
                                            .slice(
                                                Math.max(
                                                    0,
                                                    page - 3
                                                ),
                                                Math.max(
                                                    0,
                                                    page - 3
                                                ) + 5
                                            )
                                            .map(
                                                (pageNumber) => (
                                                    <button
                                                        key={
                                                            pageNumber
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setPage(
                                                                pageNumber
                                                            )
                                                        }
                                                        className={`
                                                            inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-black transition
                                                            ${
                                                                pageNumber ===
                                                                page
                                                                    ? "bg-[#102236] text-white shadow-sm"
                                                                    : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </button>
                                                )
                                            )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (currentPage) =>
                                                        Math.min(
                                                            totalPages,
                                                            currentPage + 1
                                                        )
                                                )
                                            }
                                            disabled={
                                                page ===
                                                totalPages
                                            }
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                            <span className="text-base leading-none">
                                                ›
                                            </span>
                                        </button>

                                    </div>

                                </div>
                            )}

                        {/* FOOTER */}

                        {!loading &&
                            totalDisplayedLeads > 0 && (

                                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3">

                                    <p className="text-xs text-slate-400">

                                        Showing{" "}

                                        <span className="font-black text-slate-700">

                                            {
                                                totalDisplayedLeads
                                            }

                                        </span>{" "}

                                        filtered leads

                                    </p>


                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">

                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                        Backend status synced

                                    </div>

                                </div>

                            )}

                    </section>

                </main>

            </div>

        );

    }