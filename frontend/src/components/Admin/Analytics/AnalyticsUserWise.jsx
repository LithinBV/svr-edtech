import React, { useMemo } from "react";


/* =========================================================
   USER ICON
========================================================= */

const UserIcon = ({ type = "user" }) => {
    const icons = {
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
            </>
        ),

        leads: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),

        trend: (
            <>
                <polyline points="3 17 9 11 13 15 21 7" />
                <polyline points="15 7 21 7 21 13" />
            </>
        ),

        trophy: (
            <>
                <path d="M8 21h8" />
                <path d="M12 17v4" />
                <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
                <path d="M6 6H3v2a4 4 0 0 0 4 4" />
                <path d="M18 6h3v2a4 4 0 0 1-4 4" />
            </>
        ),

        chart: (
            <>
                <line x1="4" y1="19" x2="4" y2="5" />
                <line x1="4" y1="19" x2="21" y2="19" />
                <rect x="7" y="12" width="3" height="5" />
                <rect x="12" y="9" width="3" height="8" />
                <rect x="17" y="6" width="3" height="11" />
            </>
        ),
    };

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[type] || icons.user}
        </svg>
    );
};


/* =========================================================
   NORMALIZE USER DATA
========================================================= */

const normalizeUser = (item) => {

    const user =
        item.user ||
        item.owner ||
        item.executive ||
        {};

    return {
        id:
            item._id ||
            item.id ||
            user._id ||
            user.id ||
            Math.random(),

        name:
            item.name ||
            item.userName ||
            item.ownerName ||
            item.executiveName ||
            user.name ||
            user.userName ||
            "Unknown User",

        email:
            item.email ||
            user.email ||
            "",

        total:
            Number(
                item.total ??
                item.totalLeads ??
                item.leads ??
                item.count ??
                0
            ) || 0,

        newLeads:
            Number(
                item.new ??
                item.newLeads ??
                item.status?.new ??
                0
            ) || 0,

        hot:
            Number(
                item.hot ??
                item.hotLeads ??
                item.status?.hot ??
                0
            ) || 0,

        warm:
            Number(
                item.warm ??
                item.warmLeads ??
                item.status?.warm ??
                0
            ) || 0,

        cold:
            Number(
                item.cold ??
                item.coldLeads ??
                item.status?.cold ??
                0
            ) || 0,
    };
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
    label,
    value,
    description,
    accent,
    icon,
}) => {

    const accentStyles = {
        blue: {
            line: "bg-blue-500",
            icon: "bg-blue-50 text-blue-600",
        },

        yellow: {
            line: "bg-[#F6C945]",
            icon: "bg-yellow-50 text-yellow-600",
        },

        green: {
            line: "bg-emerald-500",
            icon: "bg-emerald-50 text-emerald-600",
        },

        violet: {
            line: "bg-violet-500",
            icon: "bg-violet-50 text-violet-600",
        },
    };

    const style =
        accentStyles[accent] ||
        accentStyles.blue;

    return (
        <div
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
            "
        >

            {/* Top accent */}
            <div
                className={`
                    absolute
                    left-0
                    top-0
                    h-1
                    w-full
                    transition-all
                    duration-500
                    group-hover:h-1.5
                    ${style.line}
                `}
            />

            <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {label}
                        </p>

                        <p
                            className="
                                mt-2
                                origin-left
                                text-3xl
                                font-black
                                text-[#102236]
                                transition-transform
                                duration-300
                                group-hover:scale-105
                            "
                        >
                            {value}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {description}
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
                            rounded-xl
                            transition-all
                            duration-300
                            group-hover:scale-110
                            group-hover:rotate-3
                            ${style.icon}
                        `}
                    >
                        {icon}
                    </div>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   USER AVATAR
========================================================= */

const UserAvatar = ({
    name,
    size = "normal",
}) => {

    const initials = (name || "U")
        .trim()
        .split(" ")
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0)
        )
        .join("")
        .toUpperCase();

    const sizeClass =
        size === "large"
            ? "h-14 w-14 rounded-2xl text-lg"
            : "h-10 w-10 rounded-xl text-xs";

    return (
        <div
            className={`
                flex
                shrink-0
                items-center
                justify-center
                bg-[#102236]
                font-black
                text-[#F6C945]
                ${sizeClass}
            `}
        >
            {initials}
        </div>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const AnalyticsUserWise = ({ data = [] }) => {

    /* =====================================================
       NORMALIZE USERS
    ===================================================== */

    const users = useMemo(() => {

        if (!Array.isArray(data)) {
            return [];
        }

        return data
            .map(normalizeUser)
            .sort(
                (a, b) =>
                    b.total - a.total
            );

    }, [data]);


    /* =====================================================
       TOTAL LEADS
    ===================================================== */

    const totalLeads = useMemo(
        () =>
            users.reduce(
                (sum, user) =>
                    sum + user.total,
                0
            ),
        [users]
    );


    /* =====================================================
       TOP USER
    ===================================================== */

    const topUser =
        users.length > 0
            ? users[0]
            : null;


    /* =====================================================
       AVERAGE LEADS
    ===================================================== */

    const averageLeads = users.length
        ? (
            totalLeads /
            users.length
        ).toFixed(1)
        : "0";


    /* =====================================================
       MAX LEADS
    ===================================================== */

    const maxLeads = Math.max(
        ...users.map(
            (user) => user.total
        ),
        1
    );


    return (
        <div className="space-y-6">


            {/* =================================================
                HEADER
            ================================================= */}

            <div>

                <div className="flex items-center gap-2">

                    <div className="h-2 w-2 rounded-full bg-[#F6C945]" />

                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#102236]">
                        User Wise Analytics
                    </p>

                </div>


                <h2 className="mt-1 text-2xl font-black text-[#102236] sm:text-3xl">
                    Team Performance
                </h2>


                <p className="mt-1 text-sm text-slate-500">
                    Compare lead ownership and lead status across users.
                </p>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >

                {/* Active Users */}

                <SummaryCard
                    label="Active Users"
                    value={users.length}
                    description="Users with analytics data"
                    accent="blue"
                    icon={
                        <UserIcon type="user" />
                    }
                />


                {/* Assigned Leads */}

                <SummaryCard
                    label="Assigned Leads"
                    value={totalLeads}
                    description="Across all users"
                    accent="yellow"
                    icon={
                        <UserIcon type="leads" />
                    }
                />


                {/* Average */}

                <SummaryCard
                    label="Average"
                    value={averageLeads}
                    description="Leads per user"
                    accent="green"
                    icon={
                        <UserIcon type="trend" />
                    }
                />


                {/* Top User */}

                <SummaryCard
                    label="Top User"
                    value={
                        topUser
                            ? topUser.total
                            : 0
                    }
                    description={
                        topUser
                            ? topUser.name
                            : "No user data"
                    }
                    accent="violet"
                    icon={
                        <UserIcon type="trophy" />
                    }
                />

            </div>


            {/* =================================================
                TOP USER
            ================================================= */}

            {topUser && (

                <div
                    className="
                        group
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                        transition-all
                        duration-300
                        hover:shadow-lg
                    "
                >

                    {/* Yellow accent */}

                    <div className="absolute left-0 top-0 h-1 w-full bg-[#F6C945]" />


                    <div className="p-5 sm:p-6">

                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            {/* User */}

                            <div className="flex min-w-0 items-center gap-4">

                                <UserAvatar
                                    name={topUser.name}
                                    size="large"
                                />


                                <div className="min-w-0">

                                    <div className="flex items-center gap-2">

                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                            Highest Lead Ownership
                                        </p>

                                        <span
                                            className="
                                                rounded-full
                                                bg-yellow-50
                                                px-2
                                                py-0.5
                                                text-[9px]
                                                font-black
                                                uppercase
                                                tracking-wide
                                                text-yellow-700
                                            "
                                        >
                                            Top
                                        </span>

                                    </div>


                                    <h3 className="mt-1 truncate text-xl font-black text-[#102236]">
                                        {topUser.name}
                                    </h3>


                                    {topUser.email && (
                                        <p className="mt-1 truncate text-xs text-slate-400">
                                            {topUser.email}
                                        </p>
                                    )}

                                </div>

                            </div>


                            {/* Lead count */}

                            <div className="flex items-center gap-3">

                                <div className="rounded-xl bg-[#102236] px-5 py-3">

                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        Assigned Leads
                                    </p>

                                    <p className="mt-0.5 text-2xl font-black text-white">
                                        {topUser.total}
                                    </p>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-yellow-50
                                        text-yellow-600
                                        transition-transform
                                        duration-300
                                        group-hover:scale-110
                                    "
                                >
                                    <UserIcon type="trophy" />
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                USER LEAD DISTRIBUTION
            ================================================= */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >

                {/* Header */}

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <div className="flex items-center justify-between gap-4">

                        <div>

                            <h3 className="text-lg font-black text-[#102236]">
                                User Lead Distribution
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Number of leads assigned to each user.
                            </p>

                        </div>


                        <div
                            className="
                                hidden
                                items-center
                                gap-2
                                rounded-full
                                bg-[#102236]
                                px-3
                                py-1.5
                                sm:flex
                            "
                        >

                            <span className="h-2 w-2 rounded-full bg-[#F6C945]" />

                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                {totalLeads} Leads
                            </span>

                        </div>

                    </div>

                </div>


                {/* Content */}

                <div className="p-5 sm:p-6">

                    {users.length === 0 ? (

                        /* EMPTY */

                        <div className="flex h-64 flex-col items-center justify-center">

                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-slate-100
                                    text-slate-400
                                "
                            >
                                <UserIcon type="user" />
                            </div>


                            <p className="mt-4 text-sm font-bold text-slate-600">
                                No user data available
                            </p>


                            <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                                User-wise analytics data will appear here once available.
                            </p>

                        </div>

                    ) : (

                        /* USERS */

                        <div className="space-y-5">

                            {users.map(
                                (user, index) => {

                                    const percentage =
                                        totalLeads > 0
                                            ? (
                                                (user.total /
                                                    totalLeads) *
                                                100
                                            ).toFixed(1)
                                            : "0.0";


                                    const width =
                                        (user.total /
                                            maxLeads) *
                                        100;


                                    return (
                                        <div
                                            key={user.id}
                                            className="group"
                                        >

                                            <div className="flex items-center gap-3">

                                                {/* Avatar */}

                                                <UserAvatar
                                                    name={user.name}
                                                />


                                                <div className="min-w-0 flex-1">

                                                    {/* Name */}

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            gap-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                min-w-0
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <span className="truncate text-sm font-bold text-slate-800">
                                                                {user.name}
                                                            </span>


                                                            {index === 0 && (
                                                                <span
                                                                    className="
                                                                        hidden
                                                                        rounded-full
                                                                        bg-yellow-50
                                                                        px-2
                                                                        py-0.5
                                                                        text-[9px]
                                                                        font-black
                                                                        uppercase
                                                                        tracking-wide
                                                                        text-yellow-700
                                                                        sm:inline-flex
                                                                    "
                                                                >
                                                                    Top
                                                                </span>
                                                            )}

                                                        </div>


                                                        <span className="shrink-0 text-sm font-black text-[#102236]">
                                                            {user.total}
                                                        </span>

                                                    </div>


                                                    {/* Bar */}

                                                    <div
                                                        className="
                                                            relative
                                                            mt-2
                                                            h-3
                                                            overflow-hidden
                                                            rounded-full
                                                            bg-slate-100
                                                        "
                                                    >

                                                        <div
                                                            className={`
                                                                h-full
                                                                rounded-full
                                                                transition-all
                                                                duration-1000
                                                                ease-out
                                                                ${
                                                                    index === 0
                                                                        ? "bg-[#F6C945]"
                                                                        : "bg-[#102236]"
                                                                }
                                                            `}
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />

                                                    </div>


                                                    {/* Percentage */}

                                                    <div className="mt-1 flex justify-end">

                                                        <span className="text-[10px] text-slate-400">
                                                            {percentage}% of team leads
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            </div>


            {/* =================================================
                USER STATUS BREAKDOWN
            ================================================= */}

            {users.length > 0 && (

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                    "
                >

                    {/* Header */}

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <h3 className="text-lg font-black text-[#102236]">
                                    User Status Breakdown
                                </h3>

                                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                    Lead status distribution for each user.
                                </p>

                            </div>


                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-yellow-50
                                    text-yellow-600
                                "
                            >
                                <UserIcon type="chart" />
                            </div>

                        </div>

                    </div>


                    {/* User status cards */}

                    <div className="space-y-4 p-5 sm:p-6">

                        {users.map((user) => {

                            const userTotal =
                                user.total || 1;


                            const newPercentage =
                                (user.newLeads /
                                    userTotal) *
                                100;


                            const hotPercentage =
                                (user.hot /
                                    userTotal) *
                                100;


                            const warmPercentage =
                                (user.warm /
                                    userTotal) *
                                100;


                            const coldPercentage =
                                (user.cold /
                                    userTotal) *
                                100;


                            return (
                                <div
                                    key={user.id}
                                    className="
                                        group
                                        rounded-2xl
                                        border
                                        border-slate-100
                                        p-4
                                        transition-all
                                        duration-300
                                        hover:border-slate-200
                                        hover:shadow-sm
                                    "
                                >

                                    {/* User heading */}

                                    <div className="mb-4 flex items-center justify-between">

                                        <div className="flex min-w-0 items-center gap-3">

                                            <UserAvatar
                                                name={user.name}
                                            />

                                            <span className="truncate text-sm font-bold text-slate-800">
                                                {user.name}
                                            </span>

                                        </div>


                                        <span className="text-sm font-black text-[#102236]">
                                            {user.total}
                                        </span>

                                    </div>


                                    {/* Status bar */}

                                    <div
                                        className="
                                            flex
                                            h-3
                                            overflow-hidden
                                            rounded-full
                                            bg-slate-100
                                        "
                                    >

                                        {user.newLeads > 0 && (
                                            <div
                                                className="bg-blue-500 transition-all duration-700"
                                                title={`New: ${user.newLeads}`}
                                                style={{
                                                    width: `${newPercentage}%`,
                                                }}
                                            />
                                        )}


                                        {user.hot > 0 && (
                                            <div
                                                className="bg-rose-500 transition-all duration-700"
                                                title={`Hot: ${user.hot}`}
                                                style={{
                                                    width: `${hotPercentage}%`,
                                                }}
                                            />
                                        )}


                                        {user.warm > 0 && (
                                            <div
                                                className="bg-amber-500 transition-all duration-700"
                                                title={`Warm: ${user.warm}`}
                                                style={{
                                                    width: `${warmPercentage}%`,
                                                }}
                                            />
                                        )}


                                        {user.cold > 0 && (
                                            <div
                                                className="bg-cyan-500 transition-all duration-700"
                                                title={`Cold: ${user.cold}`}
                                                style={{
                                                    width: `${coldPercentage}%`,
                                                }}
                                            />
                                        )}

                                    </div>


                                    {/* Status numbers */}

                                    <div
                                        className="
                                            mt-3
                                            grid
                                            grid-cols-4
                                            gap-2
                                        "
                                    >

                                        {/* NEW */}

                                        <div className="rounded-lg bg-blue-50/70 py-2 text-center transition-all duration-200 hover:bg-blue-50">

                                            <p className="text-sm font-black text-blue-600">
                                                {user.newLeads}
                                            </p>

                                            <p className="text-[9px] font-bold uppercase text-slate-400">
                                                New
                                            </p>

                                        </div>


                                        {/* HOT */}

                                        <div className="rounded-lg bg-rose-50/70 py-2 text-center transition-all duration-200 hover:bg-rose-50">

                                            <p className="text-sm font-black text-rose-600">
                                                {user.hot}
                                            </p>

                                            <p className="text-[9px] font-bold uppercase text-slate-400">
                                                Hot
                                            </p>

                                        </div>


                                        {/* WARM */}

                                        <div className="rounded-lg bg-amber-50/70 py-2 text-center transition-all duration-200 hover:bg-amber-50">

                                            <p className="text-sm font-black text-amber-600">
                                                {user.warm}
                                            </p>

                                            <p className="text-[9px] font-bold uppercase text-slate-400">
                                                Warm
                                            </p>

                                        </div>


                                        {/* COLD */}

                                        <div className="rounded-lg bg-cyan-50/70 py-2 text-center transition-all duration-200 hover:bg-cyan-50">

                                            <p className="text-sm font-black text-cyan-600">
                                                {user.cold}
                                            </p>

                                            <p className="text-[9px] font-bold uppercase text-slate-400">
                                                Cold
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>

            )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {users.length === 0 && (

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        p-8
                        text-center
                        shadow-sm
                    "
                >

                    <div
                        className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-slate-100
                            text-slate-400
                        "
                    >
                        <UserIcon type="user" />
                    </div>


                    <h3 className="mt-4 text-base font-black text-[#102236]">
                        No user analytics available
                    </h3>


                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                        No user-wise lead data was returned for the selected date range.
                    </p>

                </div>

            )}

        </div>
    );
};


export default AnalyticsUserWise;