import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:3000")
    .replace(/\/$/, "") + "/api";

/* ============================================================
   FOLLOW-UP STATUS
   Backend is the source of truth
============================================================ */

const getFollowUpStatus = (lead) => {
    return String(
        lead?.followUpStatus || "NO_FOLLOW_UP"
    ).toUpperCase();
};

/* ============================================================
   DATE
============================================================ */

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

/* ============================================================
   OWNER
============================================================ */

const getOwnerName = (lead) => {
    const owner =
        lead?.leadOwner ??
        lead?.owner;

    if (!owner) {
        return "-";
    }

    if (typeof owner === "string") {
        return owner;
    }

    return (
        owner?.name ||
        owner?.fullName ||
        owner?.email ||
        "-"
    );
};

/* ============================================================
   LEAD STATUS
============================================================ */

const getLeadStatus = (lead) => {
    return String(
        lead?.status || "NEW"
    ).toUpperCase();
};

const getLeadStatusClasses = (status) => {
    switch (status) {
        case "HOT":
            return "bg-red-50 text-red-700 border-red-200";

        case "WARM":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "COLD":
            return "bg-slate-50 text-slate-600 border-slate-200";

        case "NEW":
            return "bg-[#FECA42]/10 text-[#9A7600] border-[#FECA42]/30";

        default:
            return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const getLeadAvatarClasses = (status) => {
    switch (status) {
        case "HOT":
            return "bg-red-50 text-red-700 ring-red-200";

        case "WARM":
            return "bg-amber-50 text-amber-700 ring-amber-200";

        case "COLD":
            return "bg-slate-100 text-slate-600 ring-slate-200";

        case "NEW":
            return "bg-[#FECA42]/15 text-[#9A7600] ring-[#FECA42]/30";

        default:
            return "bg-gray-100 text-gray-600 ring-gray-200";
    }
};

const getLeadRowClasses = (status) => {
    switch (status) {
        case "HOT":
            return "border-l-4 border-l-red-500 hover:bg-red-50/40";

        case "WARM":
            return "border-l-4 border-l-amber-500 hover:bg-amber-50/40";

        case "COLD":
            return "border-l-4 border-l-slate-400 hover:bg-slate-50";

        case "NEW":
            return "border-l-4 border-l-[#FECA42] hover:bg-[#FECA42]/5";

        default:
            return "border-l-4 border-l-gray-200 hover:bg-gray-50";
    }
};

const formatLeadStatus = (status) => {
    if (!status) return "-";

    return status
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};

/* ============================================================
   FOLLOW-UP COLORS
============================================================ */

const getFollowUpClasses = (status) => {
    switch (status) {
        case "TODAY":
            return "bg-[#FECA42]/15 text-[#8A6900] border-[#FECA42]/30";

        case "UPCOMING":
            return "bg-[#102236]/5 text-[#102236] border-[#102236]/15";

        case "MISSED":
            return "bg-red-50 text-red-700 border-red-200";

        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        default:
            return "bg-gray-50 text-gray-600 border-gray-200";
    }
};

const getFollowUpDot = (status) => {
    switch (status) {
        case "TODAY":
            return "bg-[#FECA42]";

        case "UPCOMING":
            return "bg-[#102236]";

        case "MISSED":
            return "bg-red-500";

        case "COMPLETED":
            return "bg-emerald-500";

        default:
            return "bg-gray-400";
    }
};

const getFollowUpLabel = (status) => {
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

/* ============================================================
   ICON
============================================================ */

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
        case "follow":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        case "search":
            return (
                <svg {...common}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...common}>
                    <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                    <path d="M4 4v5h5" />
                    <path d="M20 13a8.1 8.1 0 0 1-15.5 2" />
                    <path d="M20 20v-5h-5" />
                </svg>
            );

        case "phone":
            return (
                <svg {...common}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
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

        case "check":
            return (
                <svg {...common}>
                    <path d="m5 12 4 4L19 6" />
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

        default:
            return null;
    }
};

/* ============================================================
   EXECUTIVE FOLLOW UPS
============================================================ */

const ExecutiveFollowUps = () => {
    const navigate = useNavigate();

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    /*
       ALL is now the default tab
    */
    const [activeTab, setActiveTab] = useState("ALL");

    /* ========================================================
       TOKEN
    ======================================================== */

    const getToken = () => {
        return (
            localStorage.getItem("executiveToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    };

    /* ========================================================
       LOAD FOLLOW UPS
    ======================================================== */

    const loadFollowUps = useCallback(
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

                const response = await fetch(
                    `${API_BASE}/leads/follow-ups`,
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
                    data = await response.json();
                } catch {
                    data = {};
                }

                /* ==================================================
                   AUTH ERROR
                ================================================== */

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    localStorage.removeItem(
                        "executiveToken"
                    );

                    localStorage.removeItem(
                        "executiveRefreshToken"
                    );

                    localStorage.removeItem(
                        "executiveUserType"
                    );

                    localStorage.removeItem(
                        "executiveUserName"
                    );

                    localStorage.removeItem(
                        "executiveInstitutionId"
                    );

                    const genericType =
                        localStorage.getItem(
                            "userType"
                        );

                    if (
                        genericType ===
                            "EXECUTIVE" ||
                        genericType ===
                            "USER_EXECUTIVE"
                    ) {
                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "accessToken"
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
                    }

                    navigate("/login", {
                        replace: true,
                    });

                    return;
                }

                /* ==================================================
                   OTHER ERROR
                ================================================== */

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Failed to load follow-ups."
                    );
                }

                /* ==================================================
                   DATA
                ================================================== */

                const fetchedLeads =
                    Array.isArray(data?.leads)
                        ? data.leads
                        : [];

                setLeads(fetchedLeads);
            } catch (err) {
                console.error(
                    "Follow-ups loading error:",
                    err
                );

                setLeads([]);

                setError(
                    err?.message ||
                        "Unable to load follow-ups."
                );
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
        loadFollowUps();
    }, [loadFollowUps]);

    /* ========================================================
       NORMALIZE BACKEND DATA
    ======================================================== */

    const classifiedLeads = useMemo(() => {
        return leads.map((lead) => ({
            ...lead,

            followUpStatus:
                getFollowUpStatus(lead),

            name:
                lead?.name ??
                lead?.leadName ??
                "Unnamed Lead",

            contact:
                lead?.contact ??
                lead?.phone ??
                lead?.leadContact ??
                "-",

            email:
                lead?.email ??
                lead?.leadEmail ??
                "",

            leadOwner:
                lead?.leadOwner ??
                lead?.owner ??
                null,

            displayFollowUpAt:
                lead?.displayFollowUpAt ??
                lead?.followUpAt ??
                null,
        }));
    }, [leads]);

    /* ========================================================
       COUNTS
    ======================================================== */

    const counts = useMemo(() => {
        return {
            all: classifiedLeads.length,

            today: classifiedLeads.filter(
                (lead) =>
                    lead.followUpStatus ===
                    "TODAY"
            ).length,

            upcoming: classifiedLeads.filter(
                (lead) =>
                    lead.followUpStatus ===
                    "UPCOMING"
            ).length,

            missed: classifiedLeads.filter(
                (lead) =>
                    lead.followUpStatus ===
                    "MISSED"
            ).length,

            completed: classifiedLeads.filter(
                (lead) =>
                    lead.followUpStatus ===
                    "COMPLETED"
            ).length,
        };
    }, [classifiedLeads]);

    /* ========================================================
       SEARCH + TAB
    ======================================================== */

    const filteredLeads = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        const filtered = classifiedLeads.filter(
            (lead) => {
                /*
                   IMPORTANT:
                   ALL allows every follow-up.
                */
                if (
                    activeTab !== "ALL" &&
                    lead.followUpStatus !==
                        activeTab
                ) {
                    return false;
                }

                if (!searchValue) {
                    return true;
                }

                const values = [
                    lead?.name,
                    lead?.leadName,
                    lead?.email,
                    lead?.leadEmail,
                    lead?.contact,
                    lead?.phone,
                    lead?.leadContact,
                    lead?.collegeName,
                    lead?.college,
                    lead?.department,
                    lead?.state,
                    lead?.district,
                    lead?.programInterest,
                    lead?.program,

                    typeof lead?.leadOwner ===
                    "string"
                        ? lead.leadOwner
                        : lead?.leadOwner?.name,

                    typeof lead?.owner ===
                    "string"
                        ? lead.owner
                        : lead?.owner?.name,

                    lead?.leadOwner?.email,
                    lead?.owner?.email,
                ];

                return values.some(
                    (value) =>
                        String(value || "")
                            .toLowerCase()
                            .includes(
                                searchValue
                            )
                );
            }
        );

        return filtered.sort((a, b) => {
            const aDate =
                new Date(
                    a.displayFollowUpAt ||
                        a.followUpAt ||
                        a.followUpCompletedAt ||
                        0
                ).getTime();

            const bDate =
                new Date(
                    b.displayFollowUpAt ||
                        b.followUpAt ||
                        b.followUpCompletedAt ||
                        0
                ).getTime();

            /* ==================================================
               ALL FOLLOW-UPS SORTING
               Today
               Upcoming
               Missed
               Completed
            ================================================== */

            if (activeTab === "ALL") {
                const statusOrder = {
                    TODAY: 1,
                    UPCOMING: 2,
                    MISSED: 3,
                    COMPLETED: 4,
                };

                const aOrder =
                    statusOrder[
                        a.followUpStatus
                    ] || 99;

                const bOrder =
                    statusOrder[
                        b.followUpStatus
                    ] || 99;

                if (aOrder !== bOrder) {
                    return (
                        aOrder - bOrder
                    );
                }

                /*
                   Within the same status,
                   sort by date.
                */

                if (
                    a.followUpStatus ===
                        "COMPLETED"
                ) {
                    const aCompleted =
                        new Date(
                            a.followUpCompletedAt ||
                                a.displayFollowUpAt ||
                                a.followUpAt ||
                                0
                        ).getTime();

                    const bCompleted =
                        new Date(
                            b.followUpCompletedAt ||
                                b.displayFollowUpAt ||
                                b.followUpAt ||
                                0
                        ).getTime();

                    return (
                        bCompleted -
                        aCompleted
                    );
                }

                return aDate - bDate;
            }

            /* ==================================================
               COMPLETED
            ================================================== */

            if (
                activeTab ===
                "COMPLETED"
            ) {
                const aCompleted =
                    new Date(
                        a.followUpCompletedAt ||
                            a.displayFollowUpAt ||
                            a.followUpAt ||
                            0
                    ).getTime();

                const bCompleted =
                    new Date(
                        b.followUpCompletedAt ||
                            b.displayFollowUpAt ||
                            b.followUpAt ||
                            0
                    ).getTime();

                return (
                    bCompleted -
                    aCompleted
                );
            }

            /* ==================================================
               TODAY / UPCOMING
            ================================================== */

            if (
                activeTab === "TODAY" ||
                activeTab === "UPCOMING"
            ) {
                return (
                    aDate - bDate
                );
            }

            /* ==================================================
               MISSED
            ================================================== */

            return bDate - aDate;
        });
    }, [
        classifiedLeads,
        activeTab,
        search,
    ]);

    /* ========================================================
       UI PAGINATION
       Backend returns all follow-ups.
       Pagination is display-only on the frontend.
    ======================================================== */

    const ITEMS_PER_PAGE = 50;
    const [page, setPage] = useState(1);

    const total = filteredLeads.length;
    const totalPages = Math.max(
        1,
        Math.ceil(total / ITEMS_PER_PAGE)
    );

    useEffect(() => {
        setPage(1);
    }, [activeTab, search]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const paginatedItems = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;

        return filteredLeads.slice(
            start,
            start + ITEMS_PER_PAGE
        );
    }, [filteredLeads, page]);

    /* ========================================================
       TAB
    ======================================================== */

    const renderTab = (
        key,
        label,
        count
    ) => {
        const active =
            activeTab === key;

        return (
            <button
                type="button"
                onClick={() =>
                    setActiveTab(key)
                }
                className={`
                    relative
                    flex
                    items-center
                    gap-2
                    border-b-2
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    transition-all
                    duration-200
                    ${
                        active
                            ? "border-[#FECA42] text-[#102236]"
                            : "border-transparent text-gray-500 hover:text-[#102236]"
                    }
                `}
            >
                {label}

                <span
                    className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        ${
                            active
                                ? "bg-[#FECA42] text-[#102236]"
                                : "bg-gray-100 text-gray-500"
                        }
                    `}
                >
                    {count}
                </span>
            </button>
        );
    };

    const activeTabLabel =
        activeTab === "ALL"
            ? "All Follow-ups"
            : getFollowUpLabel(
                  activeTab
              );

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <main className="min-h-screen">

                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <header
                    className="
                        sticky
                        top-0
                        z-20
                        border-b
                        border-gray-200
                        bg-white/95
                        px-4
                        py-4
                        shadow-sm
                        backdrop-blur
                        sm:px-6
                        lg:px-8
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >
                        <div>
                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#9A7600]
                                "
                            >
                                Executive Portal
                            </p>

                            <h1
                                className="
                                    mt-1
                                    text-xl
                                    font-extrabold
                                    text-[#102236]
                                    sm:text-2xl
                                "
                            >
                                Follow-ups
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={loadFollowUps}
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#102236]
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                shadow-sm
                                transition-all
                                hover:bg-[#1A344D]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                sm:px-5
                            "
                        >
                            <Icon
                                type="refresh"
                                className={`
                                    mr-2
                                    h-4
                                    w-4
                                    ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                `}
                            />

                            Refresh
                        </button>
                    </div>
                </header>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <section
                    className="
                        p-4
                        sm:p-5
                        lg:p-8
                    "
                >

                    {/* ==================================================
                        HERO
                    ================================================== */}

                    <div
                        className="
                            relative
                            mb-6
                            overflow-hidden
                            rounded-3xl
                            bg-[#102236]
                            p-6
                            text-white
                            shadow-xl
                            lg:p-8
                        "
                    >
                        <div
                            className="
                                absolute
                                -right-16
                                -top-20
                                h-64
                                w-64
                                rounded-full
                                bg-[#FECA42]/10
                                blur-2xl
                            "
                        />

                        <div
                            className="
                                absolute
                                -bottom-24
                                right-24
                                h-56
                                w-56
                                rounded-full
                                bg-[#FECA42]/10
                                blur-2xl
                            "
                        />

                        <div className="relative">
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    lg:flex-row
                                    lg:items-center
                                    lg:justify-between
                                "
                            >
                                <div>
                                    <div
                                        className="
                                            mb-3
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        "
                                    >
                                        <span
                                            className="
                                                rounded-full
                                                bg-[#FECA42]/15
                                                px-3
                                                py-1
                                                text-xs
                                                font-semibold
                                                text-[#FECA42]
                                            "
                                        >
                                            Follow-up Management
                                        </span>

                                        <span
                                            className="
                                                rounded-full
                                                bg-white/10
                                                px-3
                                                py-1
                                                text-xs
                                                font-semibold
                                                text-gray-200
                                            "
                                        >
                                            {counts.today} Today
                                        </span>
                                    </div>

                                    <h2
                                        className="
                                            text-2xl
                                            font-extrabold
                                            sm:text-3xl
                                        "
                                    >
                                        Stay on top of
                                        follow-ups
                                    </h2>

                                    <p
                                        className="
                                            mt-2
                                            max-w-xl
                                            text-sm
                                            leading-6
                                            text-gray-300
                                        "
                                    >
                                        Keep track of
                                        your today,
                                        upcoming,
                                        missed and
                                        completed
                                        follow-ups from
                                        one place.
                                    </p>
                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-2
                                        gap-3
                                        sm:grid-cols-4
                                    "
                                >
                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            px-4
                                            py-3
                                        "
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            Today
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-[#FECA42]">
                                            {counts.today}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            px-4
                                            py-3
                                        "
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            Upcoming
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-white">
                                            {counts.upcoming}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            px-4
                                            py-3
                                        "
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            Missed
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-red-300">
                                            {counts.missed}
                                        </p>
                                    </div>

                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            px-4
                                            py-3
                                        "
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                            Completed
                                        </p>

                                        <p className="mt-1 text-xl font-extrabold text-emerald-300">
                                            {counts.completed}
                                        </p>
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
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                border-red-200
                                bg-red-50
                                p-4
                                text-sm
                                text-red-700
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-100
                                    font-bold
                                "
                            >
                                !
                            </div>

                            <div>
                                <p className="font-bold">
                                    Something went wrong
                                </p>

                                <p className="mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ==================================================
                        STATS
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >
                        {/* TODAY */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "TODAY"
                                )
                            }
                            className={`
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                p-5
                                text-left
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-lg
                                ${
                                    activeTab ===
                                    "TODAY"
                                        ? "border-[#FECA42] bg-[#FECA42]/10 ring-2 ring-[#FECA42]/20"
                                        : "border-gray-200 bg-white hover:border-[#FECA42]/40"
                                }
                            `}
                        >
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    h-24
                                    w-24
                                    rounded-bl-full
                                    bg-[#FECA42]/10
                                "
                            />

                            <div
                                className="
                                    relative
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-sm font-semibold text-[#9A7600]">
                                        Today
                                    </p>

                                    <h3 className="mt-2 text-3xl font-extrabold text-[#102236]">
                                        {counts.today}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Follow-ups due today
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
                                        bg-[#FECA42]/15
                                        text-[#9A7600]
                                        transition
                                        group-hover:scale-110
                                    "
                                >
                                    <Icon
                                        type="follow"
                                        className="h-6 w-6"
                                    />
                                </div>
                            </div>
                        </button>

                        {/* UPCOMING */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "UPCOMING"
                                )
                            }
                            className={`
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                p-5
                                text-left
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-lg
                                ${
                                    activeTab ===
                                    "UPCOMING"
                                        ? "border-[#102236] bg-[#102236]/5 ring-2 ring-[#102236]/10"
                                        : "border-gray-200 bg-white hover:border-[#102236]/30"
                                }
                            `}
                        >
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    h-24
                                    w-24
                                    rounded-bl-full
                                    bg-[#102236]/5
                                "
                            />

                            <div
                                className="
                                    relative
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-sm font-semibold text-[#102236]">
                                        Upcoming
                                    </p>

                                    <h3 className="mt-2 text-3xl font-extrabold text-[#102236]">
                                        {counts.upcoming}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Scheduled follow-ups
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
                                        bg-[#102236]/5
                                        text-[#102236]
                                        transition
                                        group-hover:scale-110
                                    "
                                >
                                    <Icon
                                        type="follow"
                                        className="h-6 w-6"
                                    />
                                </div>
                            </div>
                        </button>

                        {/* MISSED */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "MISSED"
                                )
                            }
                            className={`
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                p-5
                                text-left
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-lg
                                ${
                                    activeTab ===
                                    "MISSED"
                                        ? "border-red-300 bg-red-50 ring-2 ring-red-100"
                                        : "border-gray-200 bg-white hover:border-red-200"
                                }
                            `}
                        >
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    h-24
                                    w-24
                                    rounded-bl-full
                                    bg-red-50
                                "
                            />

                            <div
                                className="
                                    relative
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-sm font-semibold text-red-600">
                                        Missed
                                    </p>

                                    <h3 className="mt-2 text-3xl font-extrabold text-red-700">
                                        {counts.missed}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Need attention
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
                                        group-hover:scale-110
                                    "
                                >
                                    <Icon
                                        type="follow"
                                        className="h-6 w-6"
                                    />
                                </div>
                            </div>
                        </button>

                        {/* COMPLETED */}

                        <button
                            type="button"
                            onClick={() =>
                                setActiveTab(
                                    "COMPLETED"
                                )
                            }
                            className={`
                                group
                                relative
                                overflow-hidden
                                rounded-2xl
                                border
                                p-5
                                text-left
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-lg
                                ${
                                    activeTab ===
                                    "COMPLETED"
                                        ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100"
                                        : "border-gray-200 bg-white hover:border-emerald-200"
                                }
                            `}
                        >
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-0
                                    h-24
                                    w-24
                                    rounded-bl-full
                                    bg-emerald-50
                                "
                            />

                            <div
                                className="
                                    relative
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-sm font-semibold text-emerald-600">
                                        Completed
                                    </p>

                                    <h3 className="mt-2 text-3xl font-extrabold text-emerald-700">
                                        {counts.completed}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Successfully completed
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
                                        bg-emerald-50
                                        text-emerald-600
                                        transition
                                        group-hover:scale-110
                                    "
                                >
                                    <Icon
                                        type="check"
                                        className="h-6 w-6"
                                    />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* ==================================================
                        MAIN TABLE PANEL
                    ================================================== */}

                    <div
                        className="
                            mt-6
                            overflow-hidden
                            rounded-3xl
                            border
                            border-gray-200
                            bg-white
                            shadow-sm
                        "
                    >

                        {/* ==================================================
                            TOP BAR
                        ================================================== */}

                        <div
                            className="
                                border-b
                                border-gray-200
                                px-4
                                pt-2
                                sm:px-6
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    xl:flex-row
                                    xl:items-center
                                    xl:justify-between
                                "
                            >

                                {/* TABS */}

                                <div
                                    className="
                                        flex
                                        min-w-0
                                        overflow-x-auto
                                        scrollbar-hide
                                    "
                                >
                                    {/* ALL FOLLOW-UPS */}

                                    {renderTab(
                                        "ALL",
                                        "All Follow-ups",
                                        counts.all
                                    )}

                                    {renderTab(
                                        "TODAY",
                                        "Today",
                                        counts.today
                                    )}

                                    {renderTab(
                                        "UPCOMING",
                                        "Upcoming",
                                        counts.upcoming
                                    )}

                                    {renderTab(
                                        "MISSED",
                                        "Missed",
                                        counts.missed
                                    )}

                                    {renderTab(
                                        "COMPLETED",
                                        "Completed",
                                        counts.completed
                                    )}
                                </div>

                                {/* SEARCH */}

                                <div className="pb-3 xl:pb-2">
                                    <div
                                        className="
                                            relative
                                            w-full
                                            sm:w-[300px]
                                        "
                                    >
                                        <Icon
                                            type="search"
                                            className="
                                                pointer-events-none
                                                absolute
                                                left-3
                                                top-1/2
                                                h-4
                                                w-4
                                                -translate-y-1/2
                                                text-gray-400
                                            "
                                        />

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
                                            placeholder="Search follow-ups..."
                                            className="
                                                h-11
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                pl-10
                                                pr-4
                                                text-sm
                                                font-medium
                                                text-gray-700
                                                outline-none
                                                transition
                                                placeholder:text-gray-400
                                                focus:border-[#FECA42]
                                                focus:bg-white
                                                focus:ring-2
                                                focus:ring-[#FECA42]/20
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==================================================
                            TABLE HEADER INFO
                        ================================================== */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-2
                                border-b
                                border-gray-100
                                px-5
                                py-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-6
                            "
                        >
                            <div>
                                <h2
                                    className="
                                        text-lg
                                        font-extrabold
                                        text-[#102236]
                                    "
                                >
                                    {activeTabLabel}
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    {filteredLeads.length}{" "}
                                    follow-up
                                    {filteredLeads.length ===
                                    1
                                        ? ""
                                        : "s"}{" "}
                                    found
                                </p>
                            </div>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                                        text-xs
                                        font-bold
                                        text-[#9A7600]
                                        hover:underline
                                    "
                                >
                                    Clear search
                                </button>
                            )}
                        </div>

                        {/* ==================================================
                            LOADING
                        ================================================== */}

                        {loading ? (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="
                                                    h-16
                                                    animate-pulse
                                                    rounded-xl
                                                    bg-gray-100
                                                "
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        ) : filteredLeads.length ===
                          0 ? (
                            /* ==================================================
                               EMPTY
                            ================================================== */

                            <div
                                className="
                                    flex
                                    min-h-[360px]
                                    flex-col
                                    items-center
                                    justify-center
                                    px-6
                                    text-center
                                "
                            >
                                <div
                                    className="
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-[#102236]/5
                                        text-[#102236]
                                    "
                                >
                                    <Icon
                                        type="follow"
                                        className="h-8 w-8"
                                    />
                                </div>

                                <h3
                                    className="
                                        mt-5
                                        text-lg
                                        font-extrabold
                                        text-[#102236]
                                    "
                                >
                                    No follow-ups found
                                </h3>

                                <p
                                    className="
                                        mt-2
                                        max-w-md
                                        text-sm
                                        leading-6
                                        text-gray-500
                                    "
                                >
                                    {search
                                        ? "No follow-ups match your search. Try a different name, phone number, college or owner."
                                        : activeTab ===
                                          "ALL"
                                        ? "There are no follow-ups available right now."
                                        : `There are no ${activeTabLabel.toLowerCase()} follow-ups right now.`}
                                </p>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch(
                                                ""
                                            )
                                        }
                                        className="
                                            mt-5
                                            rounded-xl
                                            bg-[#102236]
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-white
                                            transition
                                            hover:bg-[#1A344D]
                                        "
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* ==================================================
                               TABLE
                            ================================================== */

                            <div className="overflow-x-auto">
                                <table className="min-w-[1200px] w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/70">
                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Lead
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Contact
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                College
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Program
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Owner
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Follow-up
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedItems.map(
                                            (
                                                lead
                                            ) => {
                                                const leadId =
                                                    lead?._id ||
                                                    lead?.id;

                                                const name =
                                                    lead?.name ||
                                                    lead?.leadName ||
                                                    "Unnamed Lead";

                                                const contact =
                                                    lead?.contact ||
                                                    lead?.phone ||
                                                    lead?.leadContact ||
                                                    "-";

                                                const college =
                                                    lead?.collegeName ||
                                                    lead?.college ||
                                                    "-";

                                                const program =
                                                    lead?.programInterest ||
                                                    lead?.program ||
                                                    "-";

                                                const owner =
                                                    getOwnerName(
                                                        lead
                                                    );

                                                const leadStatus =
                                                    getLeadStatus(
                                                        lead
                                                    );

                                                const followUpStatus =
                                                    lead.followUpStatus;

                                                const followUpDate =
                                                    lead?.displayFollowUpAt ||
                                                    lead?.followUpAt ||
                                                    lead?.followUpCompletedAt;

                                                return (
                                                    <tr
                                                        key={
                                                            leadId
                                                        }
                                                        className={`
                                                            border-b
                                                            border-gray-100
                                                            transition-all
                                                            duration-200
                                                            ${getLeadRowClasses(
                                                                leadStatus
                                                            )}
                                                        `}
                                                    >
                                                        {/* LEAD */}

                                                        <td className="px-5 py-5">
                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-3
                                                                "
                                                            >
                                                                <div
                                                                    className={`
                                                                        flex
                                                                        h-11
                                                                        w-11
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-xl
                                                                        font-extrabold
                                                                        ring-2
                                                                        ${getLeadAvatarClasses(
                                                                            leadStatus
                                                                        )}
                                                                    `}
                                                                >
                                                                    {name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/leads/${leadId}`
                                                                            )
                                                                        }
                                                                        className="
                                                                            block
                                                                            max-w-[220px]
                                                                            truncate
                                                                            text-left
                                                                            text-sm
                                                                            font-extrabold
                                                                            text-gray-900
                                                                            transition
                                                                            hover:text-[#9A7600]
                                                                        "
                                                                    >
                                                                        {
                                                                            name
                                                                        }
                                                                    </button>

                                                                    {lead?.email && (
                                                                        <div
                                                                            className="
                                                                                mt-1
                                                                                flex
                                                                                max-w-[220px]
                                                                                items-center
                                                                                gap-1.5
                                                                            "
                                                                        >
                                                                            <Icon
                                                                                type="email"
                                                                                className="
                                                                                    h-3.5
                                                                                    w-3.5
                                                                                    shrink-0
                                                                                    text-gray-400
                                                                                "
                                                                            />

                                                                            <p
                                                                                className="
                                                                                    truncate
                                                                                    text-xs
                                                                                    text-gray-400
                                                                                "
                                                                            >
                                                                                {
                                                                                    lead.email
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* CONTACT */}

                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-8
                                                                        w-8
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-lg
                                                                        bg-emerald-50
                                                                        text-emerald-600
                                                                    "
                                                                >
                                                                    <Icon
                                                                        type="phone"
                                                                        className="h-4 w-4"
                                                                    />
                                                                </span>

                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {
                                                                        contact
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* COLLEGE */}

                                                        <td className="px-5 py-5">
                                                            <div className="flex max-w-[220px] items-center gap-2">
                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-8
                                                                        w-8
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-lg
                                                                        bg-[#FECA42]/10
                                                                        text-[#9A7600]
                                                                    "
                                                                >
                                                                    <Icon
                                                                        type="building"
                                                                        className="h-4 w-4"
                                                                    />
                                                                </span>

                                                                <span
                                                                    className="
                                                                        truncate
                                                                        text-sm
                                                                        font-medium
                                                                        text-gray-700
                                                                    "
                                                                >
                                                                    {
                                                                        college
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* PROGRAM */}

                                                        <td className="px-5 py-5">
                                                            <p
                                                                className="
                                                                    max-w-[180px]
                                                                    truncate
                                                                    text-sm
                                                                    font-medium
                                                                    text-gray-600
                                                                "
                                                            >
                                                                {
                                                                    program
                                                                }
                                                            </p>
                                                        </td>

                                                        {/* OWNER */}

                                                        <td className="max-w-[180px] px-5 py-5">
                                                            <p
                                                                className="
                                                                    truncate
                                                                    text-sm
                                                                    font-medium
                                                                    text-gray-600
                                                                "
                                                            >
                                                                {
                                                                    owner
                                                                }
                                                            </p>
                                                        </td>

                                                        {/* FOLLOW-UP */}

                                                        <td className="px-5 py-5">
                                                            <div className="min-w-[190px]">
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={`
                                                                            h-2.5
                                                                            w-2.5
                                                                            shrink-0
                                                                            rounded-full
                                                                            ${getFollowUpDot(
                                                                                followUpStatus
                                                                            )}
                                                                        `}
                                                                    />

                                                                    <p
                                                                        className={`
                                                                            text-sm
                                                                            ${
                                                                                followUpStatus ===
                                                                                "MISSED"
                                                                                    ? "font-extrabold text-red-600"
                                                                                    : followUpStatus ===
                                                                                      "COMPLETED"
                                                                                    ? "font-medium text-gray-400"
                                                                                    : "font-bold text-gray-700"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {formatDateTime(
                                                                            followUpDate
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                {followUpStatus ===
                                                                    "COMPLETED" &&
                                                                    lead?.followUpCompletedAt && (
                                                                        <p className="mt-1 pl-4 text-[11px] text-gray-400">
                                                                            Completed{" "}
                                                                            {formatDateTime(
                                                                                lead.followUpCompletedAt
                                                                            )}
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </td>

                                                        {/* STATUS */}

                                                        <td className="px-5 py-5">
                                                            <div
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-2
                                                                    rounded-full
                                                                    border
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-bold
                                                                    ${getFollowUpClasses(
                                                                        followUpStatus
                                                                    )}
                                                                `}
                                                            >
                                                                <span
                                                                    className={`
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        ${getFollowUpDot(
                                                                            followUpStatus
                                                                        )}
                                                                    `}
                                                                />

                                                                {
                                                                    getFollowUpLabel(
                                                                        followUpStatus
                                                                    )
                                                                }
                                                            </div>

                                                            <div className="mt-2">
                                                                <span
                                                                    className={`
                                                                        inline-flex
                                                                        rounded-md
                                                                        border
                                                                        px-2
                                                                        py-1
                                                                        text-[10px]
                                                                        font-bold
                                                                        ${getLeadStatusClasses(
                                                                            leadStatus
                                                                        )}
                                                                    `}
                                                                >
                                                                    {
                                                                        formatLeadStatus(
                                                                            leadStatus
                                                                        )
                                                                    }
                                                                </span>
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

                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    {!loading &&
                        filteredLeads.length > 0 &&
                        totalPages > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:px-6">
                            <p className="text-xs font-medium text-gray-500">
                                Showing {" "}
                                <span className="font-bold text-gray-700">
                                    {(page - 1) * ITEMS_PER_PAGE + 1}
                                </span>
                                {" – "}
                                <span className="font-bold text-gray-700">
                                    {Math.min(page * ITEMS_PER_PAGE, total)}
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
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                    className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-[#FECA42] hover:bg-[#FECA42]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, index) => index + 1)
                                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                    .map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => setPage(pageNumber)}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-bold transition ${
                                                pageNumber === page
                                                    ? "bg-[#102236] text-white shadow-sm"
                                                    : "border border-gray-200 bg-white text-gray-700 hover:border-[#FECA42] hover:bg-[#FECA42]/10"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page === totalPages}
                                    className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-[#FECA42] hover:bg-[#FECA42]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ==================================================
                        FOOTER
                    ================================================== */}

                    {!loading &&
                        filteredLeads.length > 0 && (
                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                border-t
                                border-gray-100
                                bg-gray-50/60
                                px-5
                                py-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-6
                            "
                        >
                            <p className="text-xs font-medium text-gray-500">
                                Showing{" "}
                                <span className="font-bold text-gray-700">
                                    {(page - 1) * ITEMS_PER_PAGE + 1}
                                </span>
                                {" – "}
                                <span className="font-bold text-gray-700">
                                    {Math.min(page * ITEMS_PER_PAGE, total)}
                                </span>
                                {" of "}
                                <span className="font-bold text-gray-700">
                                    {total}
                                </span>{" "}
                                follow-ups
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#FECA42]" />
                                <span className="text-xs font-medium text-gray-500">
                                    Follow-up management
                                </span>
                            </div>
                        </div>
                    )}
                    </div>
                </section>

                {/* ==================================================
                    PAGE FOOTER
                ================================================== */}

                <footer
                    className="
                        px-4
                        pb-6
                        sm:px-6
                        lg:px-8
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            border-t
                            border-gray-200
                            pt-5
                            text-xs
                            text-gray-400
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <p>
                            Executive Portal
                        </p>

                        <p>
                            Follow-up Management
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default ExecutiveFollowUps;