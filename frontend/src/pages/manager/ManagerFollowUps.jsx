import React, {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    CircleAlert,
    Clock3,
    Mail,
    Phone,
    RefreshCw,
    Search,
    Sparkles,
    User,
    Users,
    X
} from "lucide-react";


// ============================================================
// API
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "";


// ============================================================
// AUTH TOKEN
// ============================================================

const getAuthToken = () => {
    return (
        localStorage.getItem("managerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken") ||
        ""
    );
};


// ============================================================
// AUTHENTICATED FETCH
// ============================================================

const authenticatedFetch = async (
    url,
    options = {}
) => {
    const token = getAuthToken();

    const headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });
};


// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
    ALL: {
        label: "All Follow-Ups",
        shortLabel: "ALL",
        description: "All team follow-ups",
        icon: Users,
        badge:
            "bg-slate-500/10 text-gray-600 border-slate-400/20",
        dot: "bg-slate-400",
        card:
            "from-slate-500/15 via-slate-500/5 to-transparent",
        iconBox:
            "bg-slate-500/10 text-gray-600"
    },

    TODAY: {
        label: "Today",
        shortLabel: "TODAY",
        description: "Needs attention today",
        icon: Clock3,
        badge:
            "bg-cyan-500/10 text-blue-600 border-blue-200",
        dot: "bg-blue-600",
        card:
            "from-cyan-500/15 via-cyan-500/5 to-transparent",
        iconBox:
            "bg-cyan-500/15 text-blue-600"
    },

    UPCOMING: {
        label: "Upcoming",
        shortLabel: "UPCOMING",
        description: "Scheduled for later",
        icon: CalendarDays,
        badge:
            "bg-purple-50 text-purple-600 border-purple-200",
        dot: "bg-violet-400",
        card:
            "from-violet-500/15 via-violet-500/5 to-transparent",
        iconBox:
            "bg-violet-500/15 text-purple-600"
    },

    MISSED: {
        label: "Missed",
        shortLabel: "MISSED",
        description: "Past and not completed",
        icon: CircleAlert,
        badge:
            "bg-red-50 text-rose-300 border-red-200",
        dot: "bg-rose-400",
        card:
            "from-rose-500/15 via-rose-500/5 to-transparent",
        iconBox:
            "bg-rose-500/15 text-rose-300"
    },

    COMPLETED: {
        label: "Completed Today",
        shortLabel: "COMPLETED",
        description: "Completed during today",
        icon: CheckCircle2,
        badge:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-400",
        card:
            "from-emerald-500/15 via-emerald-500/5 to-transparent",
        iconBox:
            "bg-emerald-500/15 text-emerald-700"
    },

    NONE: {
        label: "No Follow-Up",
        shortLabel: "NONE",
        description: "No follow-up scheduled",
        icon: CalendarDays,
        badge:
            "bg-slate-500/10 text-gray-600 border-slate-400/20",
        dot: "bg-slate-400",
        card:
            "from-slate-500/10 via-slate-500/5 to-transparent",
        iconBox:
            "bg-slate-500/10 text-gray-600"
    }
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const ManagerFollowUps = () => {
    const navigate = useNavigate();

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const [followUps, setFollowUps] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("ALL");

    const [executiveFilter, setExecutiveFilter] = useState("ALL");

    const [selectedLead, setSelectedLead] = useState(null);


   // --------------------------------------------------------
// FETCH FOLLOW-UPS
// --------------------------------------------------------

const fetchFollowUps = useCallback(
    async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/manager/leads/follow-ups`
                );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        `Failed to fetch manager follow-ups. Status: ${response.status}`
                );
            }

            // Backend returns:
            // {
            //     success: true,
            //     count: 2,
            //     leads: [...]
            // }

            const list = Array.isArray(data?.leads)
                ? data.leads
                : Array.isArray(data?.followUps)
                ? data.followUps
                : [];

            console.log(
                "MANAGER FOLLOW-UPS RESPONSE:",
                data
            );

            console.log(
                "MANAGER FOLLOW-UPS DATA:",
                list
            );

            setFollowUps(list);

        } catch (err) {
            console.error(
                "Manager follow-ups error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to load follow-ups"
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    },
    []
);


// --------------------------------------------------------
// INITIAL FETCH
// --------------------------------------------------------

useEffect(() => {
    fetchFollowUps(true);
}, [fetchFollowUps]);


// ========================================================
// DATA HELPERS
// ========================================================

const getLeadName = (item) => {
    return (
        item?.leadName ||
        item?.lead?.name ||
        "Unnamed Lead"
    );
};


const getLeadContact = (item) => {
    return (
        item?.leadContact ||
        item?.lead?.phone ||
        item?.phone ||
        "No phone number"
    );
};


const getLeadEmail = (item) => {
    return (
        item?.leadEmail ||
        item?.lead?.email ||
        "No email"
    );
};


const getLeadOwner = (item) => {
    return (
        item?.owner?.name ||
        item?.leadOwner?.name ||
        "Unassigned"
    );
};


const getLeadOwnerEmail = (item) => {
    return (
        item?.owner?.email ||
        item?.leadOwner?.email ||
        ""
    );
};


const getLeadOwnerRole = (item) => {
    return (
        item?.owner?.role ||
        item?.leadOwner?.role ||
        "Executive"
    );
};


const getLeadId = (item) => {
    return (
        item?.leadId ||
        item?.lead?._id ||
        item?._id ||
        ""
    );
};


    // --------------------------------------------------------
    // BACKEND STATUS
    // --------------------------------------------------------
    //
    // IMPORTANT:
    // Status is NOT calculated here.
    //
    // Backend returns:
    // TODAY
    // UPCOMING
    // MISSED
    // COMPLETED
    //
    // --------------------------------------------------------

    const getStatus = (item) => {
        const status =
            item?.followUpStatus;

        if (
            status &&
            STATUS_CONFIG[status]
        ) {
            return status;
        }

        return "NONE";
    };


    // --------------------------------------------------------
    // DISPLAY DATE
    // --------------------------------------------------------

    const getDisplayDate = (item) => {
        return (
            item?.displayFollowUpAt ||
            null
        );
    };


    // --------------------------------------------------------
    // NEXT FOLLOW-UP
    // --------------------------------------------------------

    const getNextFollowUpDate = (item) => {
        if (
            item?.followUpStatus !==
            "COMPLETED"
        ) {
            return null;
        }

        if (
            item?.hasNewFollowUp !== true
        ) {
            return null;
        }

        if (!item?.followUpAt) {
            return null;
        }

        return item.followUpAt;
    };


    // ========================================================
    // DATE FUNCTIONS
    // ========================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Not scheduled";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Invalid date";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const formatTime = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "Not scheduled";
        }

        return `${formatDate(
            dateValue
        )} • ${formatTime(dateValue)}`;
    };


    // ========================================================
    // REMARK
    // ========================================================

    const getRemark = (item) => {
        return (
            item?.remark ||
            item?.followUpRemark ||
            item?.notes ||
            item?.followUpNotes ||
            ""
        );
    };


    // ========================================================
    // FILTERED FOLLOW-UPS
    // ========================================================

    const executives = useMemo(() => {
        const unique = new Map();

        followUps.forEach((item) => {
            const owner =
                item?.owner ||
                item?.leadOwner;

            const ownerId =
                owner?._id ||
                item?.leadOwner;

            const ownerName =
                owner?.name;

            if (
                ownerId &&
                ownerName
            ) {
                unique.set(
                    String(ownerId),
                    {
                        _id: ownerId,
                        name: ownerName
                    }
                );
            }
        });

        return Array.from(
            unique.values()
        ).sort((a, b) =>
            String(a.name).localeCompare(
                String(b.name)
            )
        );
    }, [followUps]);


    const filteredFollowUps = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return followUps.filter(
            (item) => {
                const status =
                    getStatus(item);

                if (
                    filter !== "ALL" &&
                    status !== filter
                ) {
                    return false;
                }

                if (
                    executiveFilter !== "ALL"
                ) {
                    const owner =
                        item?.owner ||
                        item?.leadOwner;

                    const ownerId =
                        owner?._id ||
                        item?.leadOwner;

                    if (
                        String(ownerId) !==
                        String(executiveFilter)
                    ) {
                        return false;
                    }
                }

                if (!query) {
                    return true;
                }

                const searchableText = [
                    getLeadName(item),
                    getLeadContact(item),
                    getLeadEmail(item),
                    getLeadOwner(item),
                    getLeadOwnerEmail(item),
                    getRemark(item),
                    status
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    query
                );
            }
        );
    }, [
        followUps,
        search,
        filter,
        executiveFilter
    ]);


    // ========================================================
    // UI PAGINATION
    // Backend returns all follow-ups.
    // Pagination is display-only on the frontend.
    // ========================================================

    const ITEMS_PER_PAGE = 50;

    const [page, setPage] = useState(1);

    const total = filteredFollowUps.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            total / ITEMS_PER_PAGE
        )
    );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        filter,
        executiveFilter
    ]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [
        page,
        totalPages
    ]);

    const paginatedItems = useMemo(() => {
        const start =
            (page - 1) *
            ITEMS_PER_PAGE;

        return filteredFollowUps.slice(
            start,
            start + ITEMS_PER_PAGE
        );
    }, [
        filteredFollowUps,
        page
    ]);


    // ========================================================
    // COUNTS
    // ========================================================

    const counts = useMemo(() => {
        const result = {
            ALL: followUps.length,
            TODAY: 0,
            UPCOMING: 0,
            MISSED: 0,
            COMPLETED: 0,
            NONE: 0
        };

        followUps.forEach(
            (item) => {
                const status =
                    getStatus(item);

                if (
                    Object.prototype.hasOwnProperty.call(
                        result,
                        status
                    )
                ) {
                    result[status] += 1;
                }
            }
        );

        return result;
    }, [followUps]);


    // ========================================================
    // OPEN LEAD
    // ========================================================

    const openLead = (item) => {
        const leadId =
            getLeadId(item);

        if (!leadId) {
            return;
        }

        navigate(
            `/leads/${leadId}`
        );
    };


    // ========================================================
    // STATUS BADGE
    // ========================================================

    const StatusBadge = ({
        status,
        large = false
    }) => {
        const config =
            STATUS_CONFIG[status] ||
            STATUS_CONFIG.NONE;

        const Icon = config.icon;

        return (
            <div
                className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    ${config.badge}
                    ${
                        large
                            ? "px-3.5 py-2"
                            : "px-3 py-1.5"
                    }
                    text-xs
                    font-semibold
                    tracking-wide
                `}
            >
                <Icon
                    size={
                        large
                            ? 15
                            : 14
                    }
                    strokeWidth={2.2}
                />

                <span>
                    {config.shortLabel}
                </span>
            </div>
        );
    };


    // ========================================================
    // STAT CARD
    // ========================================================

    const StatCard = ({
        title,
        count,
        status
    }) => {
        const config =
            STATUS_CONFIG[status] ||
            STATUS_CONFIG.NONE;

        const Icon = config.icon;

        return (
            <button
                type="button"
                onClick={() =>
                    setFilter(status)
                }
                className={`
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-gradient-to-br
                    ${config.card}
                    p-5
                    text-left
                    shadow-sm
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-gray-300
                    hover:shadow-lg
                `}
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-24
                        w-24
                        rounded-full
                        bg-gray-100
                        blur-2xl
                    "
                />

                <div className="relative flex items-start justify-between">

                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            {count}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                            {config.description}
                        </p>
                    </div>

                    <div
                        className={`
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            ${config.iconBox}
                        `}
                    >
                        <Icon
                            size={21}
                            strokeWidth={2}
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-500 transition group-hover:text-gray-600">
                    View{" "}
                    {title.toLowerCase()}

                    <ChevronRight
                        size={14}
                        className="transition group-hover:translate-x-0.5"
                    />
                </div>
            </button>
        );
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] text-gray-900">

                <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

                    <div className="animate-pulse space-y-6">

                        <div className="h-48 rounded-3xl bg-gray-200" />

                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

                            {Array.from({
                                length: 5
                            }).map(
                                (_, index) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="h-36 rounded-2xl bg-gray-200"
                                    />
                                )
                            )}

                        </div>

                        <div className="h-[500px] rounded-3xl bg-gray-200" />

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // MAIN
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* ================================================= */}
            {/* BACKGROUND */}
            {/* ================================================= */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-[10%] top-[-180px] h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[120px]" />

                <div className="absolute right-[5%] top-[25%] h-[350px] w-[350px] rounded-full bg-purple-50 blur-[120px]" />

                <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-emerald-50 blur-[120px]" />

            </div>


            <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* ================================================= */}
                {/* HERO */}
                {/* ================================================= */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        border
                        border-gray-200
                        bg-[#102236]
                        p-6
                        shadow-[0_25px_80px_rgba(0,0,0,0.3)]
                        sm:p-8
                    "
                >

                    <div className="pointer-events-none absolute inset-0">

                        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

                        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-purple-400/10 blur-3xl" />

                    </div>


                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                        <div className="max-w-3xl">

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600/10 px-3 py-1.5 text-xs font-semibold text-blue-600">
                                <Sparkles size={14} />
                                Manager Workspace
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                Follow-Ups
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                                Keep track of your
                                team's follow-up
                                activity, upcoming
                                conversations,
                                missed tasks and
                                completed
                                follow-ups.
                            </p>

                            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-gray-500">

                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    Backend status synced
                                </span>

                                <span className="hidden h-4 w-px bg-white/10 sm:block" />

                                <span>
                                    {
                                        followUps.length
                                    }{" "}
                                    total
                                    follow-ups
                                </span>

                            </div>

                        </div>


                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={() =>
                                fetchFollowUps(
                                    false
                                )
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
                                border
                                border-[#FECA42]
                                bg-[#FECA42]
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                text-[#102236]
                                shadow-lg
                                shadow-[#FECA42]/20
                                backdrop-blur
                                transition
                                hover:border-[#e8b52f]
                                hover:bg-[#e8b52f]
                                hover:text-[#102236]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <RefreshCw
                                size={16}
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}

                        </button>

                    </div>

                </section>


                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">

                    <StatCard
                        title="All Follow-Ups"
                        count={
                            counts.ALL
                        }
                        status="ALL"
                    />

                    <StatCard
                        title="Today"
                        count={
                            counts.TODAY
                        }
                        status="TODAY"
                    />

                    <StatCard
                        title="Upcoming"
                        count={
                            counts.UPCOMING
                        }
                        status="UPCOMING"
                    />

                    <StatCard
                        title="Missed"
                        count={
                            counts.MISSED
                        }
                        status="MISSED"
                    />

                    <StatCard
                        title="Completed"
                        count={
                            counts.COMPLETED
                        }
                        status="COMPLETED"
                    />

                </section>


                {/* ================================================= */}
                {/* SEARCH / FILTER */}
                {/* ================================================= */}

                <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-[0_20px_70px_rgba(0,0,0,0.18)] sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        {/* SEARCH */}

                        <div className="relative w-full xl:max-w-md">

                            <Search
                                size={18}
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-500
                                "
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Search lead, owner, phone, email..."
                                className="
                                    h-12
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    pl-11
                                    pr-10
                                    text-sm
                                    text-gray-900
                                    outline-none
                                    placeholder:text-gray-400
                                    transition
                                    focus:border-blue-400
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch(
                                            ""
                                        )
                                    }
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        rounded-lg
                                        p-1
                                        text-gray-500
                                        transition
                                        hover:bg-gray-100
                                        hover:text-gray-900
                                    "
                                >
                                    <X
                                        size={
                                            16
                                        }
                                    />
                                </button>
                            )}

                        </div>


                        {/* FILTERS */}

                        <div className="flex gap-2 overflow-x-auto pb-1">

                            {[
                                {
                                    key: "ALL",
                                    label: "All",
                                    count:
                                        counts.ALL
                                },
                                {
                                    key: "TODAY",
                                    label: "Today",
                                    count:
                                        counts.TODAY
                                },
                                {
                                    key: "UPCOMING",
                                    label: "Upcoming",
                                    count:
                                        counts.UPCOMING
                                },
                                {
                                    key: "MISSED",
                                    label: "Missed",
                                    count:
                                        counts.MISSED
                                },
                                {
                                    key: "COMPLETED",
                                    label: "Completed",
                                    count:
                                        counts.COMPLETED
                                }
                            ].map(
                                (item) => {
                                    const active =
                                        filter ===
                                        item.key;

                                    return (
                                        <button
                                            key={
                                                item.key
                                            }
                                            type="button"
                                            onClick={() =>
                                                setFilter(
                                                    item.key
                                                )
                                            }
                                            className={`
                                                inline-flex
                                                shrink-0
                                                items-center
                                                gap-2
                                                rounded-xl
                                                border
                                                px-3.5
                                                py-2.5
                                                text-xs
                                                font-semibold
                                                transition
                                                ${
                                                    active
                                                        ? "border-blue-300 bg-blue-600/10 text-blue-700"
                                                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                                                }
                                            `}
                                        >

                                            {
                                                item.label
                                            }

                                            <span
                                                className={`
                                                    rounded-md
                                                    px-1.5
                                                    py-0.5
                                                    text-[10px]
                                                    ${
                                                        active
                                                            ? "bg-blue-600/15 text-blue-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }
                                                `}
                                            >
                                                {
                                                    item.count
                                                }
                                            </span>

                                        </button>
                                    );
                                }
                            )}

                            {/* EXECUTIVE FILTER */}

                            <div className="relative min-w-[190px] shrink-0">

                                <Users
                                    size={15}
                                    className="
                                        pointer-events-none
                                        absolute
                                        left-3.5
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                    "
                                />

                                <select
                                    value={executiveFilter}
                                    onChange={(e) =>
                                        setExecutiveFilter(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        h-10
                                        w-full
                                        appearance-none
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-gray-50
                                        pl-10
                                        pr-9
                                        text-xs
                                        font-semibold
                                        text-gray-600
                                        outline-none
                                        transition
                                        focus:border-blue-300
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                >

                                    <option value="ALL">
                                        All Executives
                                    </option>

                                    {executives.map(
                                        (executive) => (
                                            <option
                                                key={
                                                    executive._id
                                                }
                                                value={
                                                    executive._id
                                                }
                                            >
                                                {
                                                    executive.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                                <ChevronDown
                                    size={15}
                                    className="
                                        pointer-events-none
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-gray-400
                                    "
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* ================================================= */}
                {/* ERROR */}
                {/* ================================================= */}

                {error && (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

                        <AlertCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="min-w-0 flex-1">

                            <p className="text-sm font-semibold">
                                Unable to load
                                follow-ups
                            </p>

                            <p className="mt-1 text-xs text-red-500">
                                {error}
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                fetchFollowUps(
                                    true
                                )
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                            Retry
                        </button>

                    </div>
                )}


                {/* ================================================= */}
                {/* RESULT HEADER */}
                {/* ================================================= */}

                <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-lg font-bold text-gray-900">
                            {filter ===
                            "ALL"
                                ? "All Follow-Ups"
                                : `${
                                      STATUS_CONFIG[
                                          filter
                                      ]
                                          ?.label ||
                                      filter
                                  } Follow-Ups`}
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">

                            Showing{" "}

                            <span className="font-semibold text-gray-600">
                                {
                                    filteredFollowUps.length
                                }
                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-gray-600">
                                {
                                    followUps.length
                                }
                            </span>

                            {" "}follow-ups

                        </p>

                    </div>


                    {(search ||
                        filter !==
                            "ALL" ||
                        executiveFilter !==
                            "ALL") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch(
                                    ""
                                );
                                setFilter(
                                    "ALL"
                                );
                                setExecutiveFilter(
                                    "ALL"
                                );
                            }}
                            className="self-start text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                            Clear filters
                        </button>
                    )}

                </div>


                {/* ================================================= */}
                {/* EMPTY */}
                {/* ================================================= */}

                {filteredFollowUps.length ===
                0 ? (
                    <div className="mt-5 rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                            <CalendarDays
                                size={28}
                            />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-gray-900">
                            No follow-ups
                            found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            {search ||
                            filter !==
                                "ALL"
                                ? "Try changing your search or filter to find the follow-up you are looking for."
                                : "There are currently no manager follow-ups available."}
                        </p>

                        {(search ||
                            filter !==
                                "ALL" ||
                            executiveFilter !==
                                "ALL") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch(
                                        ""
                                    );
                                    setFilter(
                                        "ALL"
                                    );
                                    setExecutiveFilter(
                                        "ALL"
                                    );
                                }}
                                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Clear
                                Filters
                            </button>
                        )}

                    </div>
                ) : (
                    <>
                        {/* ============================================= */}
                        {/* DESKTOP TABLE */}
                        {/* ============================================= */}

                        <div className="mt-5 hidden overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] lg:block">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1100px] bg-white">

                                    <thead>

                                        <tr className="border-b border-gray-200 bg-white">

                                            <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Lead
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Owner
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Contact
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Follow-Up
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-white/[0.06]">

                                        {paginatedItems.map(
                                            (
                                                item,
                                                index
                                            ) => {
                                                const status =
                                                    getStatus(
                                                        item
                                                    );

                                                const nextDate =
                                                    getNextFollowUpDate(
                                                        item
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            getLeadId(
                                                                item
                                                            ) ||
                                                            index
                                                        }
                                                        className="group transition hover:bg-white"
                                                    >

                                                        {/* LEAD */}

                                                        <td className="px-6 py-5">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openLead(
                                                                        item
                                                                    )
                                                                }
                                                                className="group/lead flex min-w-0 items-center gap-3 text-left"
                                                            >

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-blue-600/10 text-blue-600">
                                                                    <User
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-semibold text-gray-900 group-hover/lead:text-blue-600">
                                                                        {getLeadName(
                                                                            item
                                                                        )}
                                                                    </p>

                                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                                        Lead
                                                                        #
                                                                        {String(
                                                                            getLeadId(
                                                                                item
                                                                            )
                                                                        ).slice(
                                                                            -8
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </button>

                                                        </td>


                                                        {/* OWNER */}

                                                        <td className="px-5 py-5">

                                                            <div className="flex items-center gap-2.5">

                                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                                                    <Users
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-medium text-gray-700">
                                                                        {getLeadOwner(
                                                                            item
                                                                        )}
                                                                    </p>

                                                                    <p className="truncate text-[11px] text-gray-400">
                                                                        {getLeadOwnerRole(
                                                                            item
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* CONTACT */}

                                                        <td className="px-5 py-5">

                                                            <div className="space-y-1.5">

                                                                <div className="flex items-center gap-2 text-xs text-gray-600">

                                                                    <Phone
                                                                        size={
                                                                            13
                                                                        }
                                                                        className="text-gray-400"
                                                                    />

                                                                    <span>
                                                                        {getLeadContact(
                                                                            item
                                                                        )}
                                                                    </span>

                                                                </div>

                                                                <div className="flex max-w-[220px] items-center gap-2 text-xs text-gray-500">

                                                                    <Mail
                                                                        size={
                                                                            13
                                                                        }
                                                                        className="shrink-0 text-gray-400"
                                                                    />

                                                                    <span className="truncate">
                                                                        {getLeadEmail(
                                                                            item
                                                                        )}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* FOLLOW-UP */}

                                                        <td className="px-5 py-5">

                                                            <div>

                                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">

                                                                    <CalendarDays
                                                                        size={
                                                                            15
                                                                        }
                                                                        className="text-gray-500"
                                                                    />

                                                                    <span>
                                                                        {formatDate(
                                                                            getDisplayDate(
                                                                                item
                                                                            )
                                                                        )}
                                                                    </span>

                                                                </div>

                                                                {formatTime(
                                                                    getDisplayDate(
                                                                        item
                                                                    )
                                                                ) && (
                                                                    <p className="ml-6 mt-1 text-xs text-gray-500">
                                                                        {formatTime(
                                                                            getDisplayDate(
                                                                                item
                                                                            )
                                                                        )}
                                                                    </p>
                                                                )}

                                                                {nextDate && (
                                                                    <div className="ml-6 mt-2 text-[11px] text-emerald-700">
                                                                        Next:
                                                                        {" "}
                                                                        {formatDateTime(
                                                                            nextDate
                                                                        )}
                                                                    </div>
                                                                )}

                                                            </div>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td className="px-5 py-5">

                                                            <StatusBadge
                                                                status={
                                                                    status
                                                                }
                                                            />

                                                            {status ===
                                                                "COMPLETED" && (
                                                                <p className="mt-2 text-[11px] text-emerald-600">
                                                                    Completed
                                                                    today
                                                                </p>
                                                            )}

                                                        </td>


                                                        {/* ACTION */}

                                                        <td className="px-5 py-5 text-right">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openLead(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-xl
                                                                    border
                                                                    border-gray-200
                                                                    bg-gray-100
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-semibold
                                                                    text-gray-600
                                                                    transition
                                                                    hover:border-blue-300
                                                                    hover:bg-blue-600/10
                                                                    hover:text-blue-700
                                                                "
                                                            >
                                                                Open
                                                                Lead

                                                                <ArrowRight
                                                                    size={
                                                                        14
                                                                    }
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

                        </div>


                        {/* ============================================= */}
                        {/* MOBILE / TABLET */}
                        {/* ============================================= */}

                        <div className="mt-5 grid gap-4 lg:hidden">

                            {paginatedItems.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const status =
                                        getStatus(
                                            item
                                        );

                                    const config =
                                        STATUS_CONFIG[
                                            status
                                        ] ||
                                        STATUS_CONFIG.NONE;

                                    const StatusIcon =
                                        config.icon;

                                    const nextDate =
                                        getNextFollowUpDate(
                                            item
                                        );

                                    return (
                                        <article
                                            key={
                                                getLeadId(
                                                    item
                                                ) ||
                                                index
                                            }
                                            className="
                                                group
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-gray-200
                                                bg-white
                                                p-4
                                                shadow-[0_15px_50px_rgba(0,0,0,0.15)]
                                                transition
                                                hover:border-gray-300
                                                hover:bg-gray-50
                                                sm:p-5
                                            "
                                        >

                                            {/* TOP */}

                                            <div className="flex items-start justify-between gap-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openLead(
                                                            item
                                                        )
                                                    }
                                                    className="flex min-w-0 items-center gap-3 text-left"
                                                >

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-blue-600/10 text-blue-600">
                                                        <User
                                                            size={
                                                                19
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <h3 className="truncate text-sm font-bold text-gray-900 group-hover:text-blue-600">
                                                            {getLeadName(
                                                                item
                                                            )}
                                                        </h3>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {getLeadOwner(
                                                                item
                                                            )}
                                                        </p>

                                                    </div>

                                                </button>


                                                <StatusBadge
                                                    status={
                                                        status
                                                    }
                                                />

                                            </div>


                                            {/* FOLLOW-UP DATE */}

                                            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-3.5">

                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">

                                                    <StatusIcon
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {status ===
                                                    "COMPLETED"
                                                        ? "Completed"
                                                        : "Scheduled Follow-Up"}

                                                </div>

                                                <p className="mt-2 text-sm font-semibold text-gray-700">
                                                    {formatDate(
                                                        getDisplayDate(
                                                            item
                                                        )
                                                    )}
                                                </p>

                                                {formatTime(
                                                    getDisplayDate(
                                                        item
                                                    )
                                                ) && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatTime(
                                                            getDisplayDate(
                                                                item
                                                            )
                                                        )}
                                                    </p>
                                                )}

                                                {nextDate && (
                                                    <div className="mt-3 border-t border-gray-100 pt-3">

                                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                                            Next
                                                            Follow-Up
                                                        </p>

                                                        <p className="mt-1 text-xs font-medium text-emerald-700">
                                                            {formatDateTime(
                                                                nextDate
                                                            )}
                                                        </p>

                                                    </div>
                                                )}

                                            </div>


                                            {/* CONTACT */}

                                            <div className="mt-4 grid gap-2 sm:grid-cols-2">

                                                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5">

                                                    <Phone
                                                        size={
                                                            14
                                                        }
                                                        className="shrink-0 text-gray-400"
                                                    />

                                                    <span className="truncate text-xs text-gray-500">
                                                        {getLeadContact(
                                                            item
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5">

                                                    <Mail
                                                        size={
                                                            14
                                                        }
                                                        className="shrink-0 text-gray-400"
                                                    />

                                                    <span className="truncate text-xs text-gray-500">
                                                        {getLeadEmail(
                                                            item
                                                        )}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* REMARK */}

                                            {getRemark(
                                                item
                                            ) && (
                                                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                        Remark
                                                    </p>

                                                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
                                                        {getRemark(
                                                            item
                                                        )}
                                                    </p>

                                                </div>
                                            )}


                                            {/* ACTION */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openLead(
                                                        item
                                                    )
                                                }
                                                className="
                                                    mt-4
                                                    flex
                                                    w-full
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    rounded-xl
                                                    border
                                                    border-blue-200
                                                    bg-blue-600/10
                                                    px-4
                                                    py-3
                                                    text-xs
                                                    font-semibold
                                                    text-blue-700
                                                    transition
                                                    hover:border-blue-300
                                                    hover:bg-blue-600/15
                                                "
                                            >
                                                Open Lead

                                                <ArrowRight
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>

                                        </article>
                                    );
                                }
                            )}

                        </div>
                    </>
                )}


                {/* ================================================= */}
                {/* PAGINATION */}
                {/* ================================================= */}

                {!loading &&
                    filteredFollowUps.length > 0 && (
                        <div className="
                            mt-6
                            flex
                            flex-col
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            px-5
                            py-4
                            shadow-sm
                            sm:flex-row
                        ">
                            <p className="text-xs font-medium text-gray-500">
                                Showing{" "}
                                <span className="font-bold text-gray-700">
                                    {(page - 1) *
                                        ITEMS_PER_PAGE +
                                        1}
                                </span>
                                {" – "}
                                <span className="font-bold text-gray-700">
                                    {Math.min(
                                        page *
                                            ITEMS_PER_PAGE,
                                        total
                                    )}
                                </span>
                                {" of "}
                                <span className="font-bold text-gray-700">
                                    {total}
                                </span>{" "}
                                follow-ups
                            </p>

                            <div className="flex items-center gap-1.5 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((currentPage) =>
                                            Math.max(
                                                1,
                                                currentPage - 1
                                            )
                                        )
                                    }
                                    disabled={page === 1}
                                    className="
                                        inline-flex
                                        h-9
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                        transition
                                        hover:border-blue-300
                                        hover:bg-blue-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <span>‹</span>
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
                                                    inline-flex
                                                    h-9
                                                    min-w-9
                                                    items-center
                                                    justify-center
                                                    rounded-lg
                                                    px-3
                                                    text-xs
                                                    font-bold
                                                    transition
                                                    ${
                                                        pageNumber ===
                                                        page
                                                            ? "bg-[#102236] text-white"
                                                            : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
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
                                        setPage((currentPage) =>
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
                                    className="
                                        inline-flex
                                        h-9
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border
                                        border-gray-200
                                        bg-white
                                        px-3
                                        text-xs
                                        font-semibold
                                        text-gray-700
                                        transition
                                        hover:border-blue-300
                                        hover:bg-blue-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    Next
                                    <span>›</span>
                                </button>
                            </div>
                        </div>
                    )}


                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-100 py-5 text-center text-[11px] text-gray-400 sm:flex-row sm:text-left">

                    <span>
                        Manager Follow-Ups
                    </span>

                    <span>
                        Status is synced from the backend
                    </span>

                </div>

            </div>


            {/* ================================================= */}
            {/* OPTIONAL SELECTED LEAD MODAL */}
            {/* ================================================= */}

            {selectedLead && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-black/50
                        p-4
                        backdrop-blur-sm
                    "
                    onClick={() =>
                        setSelectedLead(
                            null
                        )
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            rounded-3xl
                            border
                            border-gray-200
                            bg-white
                            p-6
                            shadow-2xl
                        "
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                                    Follow-Up
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-gray-900">
                                    {getLeadName(
                                        selectedLead
                                    )}
                                </h3>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedLead(
                                        null
                                    )
                                }
                                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <div className="mt-6">

                            <StatusBadge
                                status={getStatus(
                                    selectedLead
                                )}
                                large
                            />

                        </div>


                        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">

                            <p className="text-xs text-gray-500">
                                Follow-Up Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                {formatDateTime(
                                    getDisplayDate(
                                        selectedLead
                                    )
                                )}
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() => {
                                openLead(
                                    selectedLead
                                );

                                setSelectedLead(
                                    null
                                );
                            }}
                            className="
                                mt-5
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-4
                                py-3
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:bg-blue-700
                            "
                        >
                            Open Lead

                            <ArrowRight
                                size={16}
                            />

                        </button>

                    </div>

                </div>
            )}

        </div>
    );
};


export default ManagerFollowUps;