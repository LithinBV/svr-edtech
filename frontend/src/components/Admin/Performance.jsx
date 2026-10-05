import { useEffect, useMemo, useState } from "react";


// ============================================================
// API
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || "";


// ============================================================
// PERFORMANCE
// ============================================================

function Performance() {

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ========================================================
    // STATS
    // ========================================================

    const [stats, setStats] = useState({

        // Users
        totalUsers: 0,
        managers: 0,
        executives: 0,
        activeUsers: 0,
        inactiveUsers: 0,

        // Leads
        totalLeads: 0,
        newLeads: 0,
        hotLeads: 0,
        warmLeads: 0,
        coldLeads: 0,
        enrolledLeads: 0,

        // Follow-ups
        followUps: 0,
        completedFollowUps: 0,
        pendingFollowUps: 0,
        todayFollowUps: 0,
        missedFollowUps: 0,
        upcomingFollowUps: 0,
    });


    // ========================================================
    // GET TOKEN
    // ========================================================

    const getToken = () => {

        const keys = [

            "managerToken",
            "token",
            "accessToken",
            "access_token",
            "jwt",
            "authToken",

        ];


        for (const key of keys) {

            const token =
                localStorage.getItem(key);


            if (token) {

                return token;

            }

        }


        return null;

    };


    // ========================================================
    // LOAD PERFORMANCE
    // ========================================================

    const loadPerformance = async () => {

        try {

            setLoading(true);

            setError("");


            // ==================================================
            // TOKEN
            // ==================================================

            const token = getToken();


            if (!token) {

                throw new Error(
                    "Authentication token not found."
                );

            }


            // ==================================================
            // HEADERS
            // ==================================================

            const headers = {

                Authorization:
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json",

            };


            // ==================================================
            // FETCH PERFORMANCE + FOLLOW-UPS
            // ==================================================
            //
            // PERFORMANCE API:
            // Users + Leads
            //
            // FOLLOW-UP API:
            // Actual follow-up controller
            //
            // ==================================================

            const [
                performanceResponse,
                followUpResponse,
            ] = await Promise.all([

                fetch(
                    `${API_URL}/api/performance/overview`,
                    {
                        method: "GET",
                        headers,
                    }
                ),

                fetch(
                    `${API_URL}/api/leads/follow-ups`,
                    {
                        method: "GET",
                        headers,
                    }
                ),

            ]);


            // ==================================================
            // PARSE
            // ==================================================

            const performanceData =
                await performanceResponse.json();


            const followUpData =
                await followUpResponse.json();


            // ==================================================
            // PERFORMANCE API CHECK
            // ==================================================

            if (!performanceResponse.ok) {

                throw new Error(
                    performanceData?.message ||
                    "Unable to load performance data."
                );

            }


            if (!performanceData?.success) {

                throw new Error(
                    performanceData?.message ||
                    "Unable to load performance data."
                );

            }


            // ==================================================
            // FOLLOW-UP API CHECK
            // ==================================================

            if (!followUpResponse.ok) {

                throw new Error(
                    followUpData?.message ||
                    "Unable to load follow-up data."
                );

            }


            if (!followUpData?.success) {

                throw new Error(
                    followUpData?.message ||
                    "Unable to load follow-up data."
                );

            }


            // ==================================================
            // FOLLOW-UP LEADS
            // ==================================================

            const followUpLeads =
                Array.isArray(
                    followUpData?.leads
                )
                    ? followUpData.leads
                    : [];


            // ==================================================
            // FOLLOW-UP STATUS COUNTERS
            // ==================================================

            let completedFollowUps = 0;

            let todayFollowUps = 0;

            let missedFollowUps = 0;

            let upcomingFollowUps = 0;


            // ==================================================
            // USE STATUS FROM FOLLOW-UP CONTROLLER
            // ==================================================
            //
            // We DO NOT calculate the status here.
            //
            // The existing followUpController already returns:
            //
            // COMPLETED
            // TODAY
            // MISSED
            // UPCOMING
            //
            // ==================================================

            followUpLeads.forEach((lead) => {

                const status =
                    String(
                        lead?.followUpStatus || ""
                    )
                        .trim()
                        .toUpperCase();


                switch (status) {

                    case "COMPLETED":

                        completedFollowUps++;

                        break;


                    case "TODAY":

                        todayFollowUps++;

                        break;


                    case "MISSED":

                        missedFollowUps++;

                        break;


                    case "UPCOMING":

                        upcomingFollowUps++;

                        break;


                    default:

                        break;

                }

            });


            // ==================================================
            // TOTAL FOLLOW-UPS
            // ==================================================
            //
            // Use the count returned by the actual
            // follow-up controller.
            //
            // ==================================================

            const totalFollowUps =
                Number.isFinite(
                    Number(followUpData?.count)
                )
                    ? Number(followUpData.count)
                    : followUpLeads.length;


            // ==================================================
            // PENDING FOLLOW-UPS
            // ==================================================
            //
            // Pending:
            //
            // TODAY
            // MISSED
            // UPCOMING
            //
            // ==================================================

            const pendingFollowUps =
                todayFollowUps +
                missedFollowUps +
                upcomingFollowUps;


            // ==================================================
            // SET STATS
            // ==================================================

            setStats({

                // ----------------------------------------------
                // USERS
                // ----------------------------------------------

                totalUsers:
                    Number(
                        performanceData?.users?.total || 0
                    ),

                managers:
                    Number(
                        performanceData?.users?.managers || 0
                    ),

                executives:
                    Number(
                        performanceData?.users?.executives || 0
                    ),

                activeUsers:
                    Number(
                        performanceData?.users?.active || 0
                    ),

                inactiveUsers:
                    Number(
                        performanceData?.users?.inactive || 0
                    ),


                // ----------------------------------------------
                // LEADS
                // ----------------------------------------------

                totalLeads:
                    Number(
                        performanceData?.leads?.total || 0
                    ),

                newLeads:
                    Number(
                        performanceData?.leads?.new || 0
                    ),

                hotLeads:
                    Number(
                        performanceData?.leads?.hot || 0
                    ),

                warmLeads:
                    Number(
                        performanceData?.leads?.warm || 0
                    ),

                coldLeads:
                    Number(
                        performanceData?.leads?.cold || 0
                    ),

                enrolledLeads:
                    Number(
                        performanceData?.leads?.enrolled || 0
                    ),


                // ----------------------------------------------
                // FOLLOW-UPS
                // ----------------------------------------------

                followUps:
                    totalFollowUps,

                completedFollowUps:
                    completedFollowUps,

                pendingFollowUps:
                    pendingFollowUps,

                todayFollowUps:
                    todayFollowUps,

                missedFollowUps:
                    missedFollowUps,

                upcomingFollowUps:
                    upcomingFollowUps,

            });


        } catch (err) {

            console.error(
                "Performance loading error:",
                err
            );


            setError(
                err?.message ||
                "Unable to load performance data."
            );


        } finally {

            setLoading(false);

        }

    };


    // ========================================================
    // LOAD ON PAGE OPEN
    // ========================================================

    useEffect(() => {

        loadPerformance();

    }, []);


    // ========================================================
    // CALCULATIONS
    // ========================================================

    const enrollmentRate = useMemo(() => {

        if (!stats.totalLeads) {

            return 0;

        }


        return Math.round(
            (
                stats.enrolledLeads /
                stats.totalLeads
            ) * 100
        );

    }, [
        stats.totalLeads,
        stats.enrolledLeads,
    ]);


    const followUpCompletionRate =
        useMemo(() => {

            if (!stats.followUps) {

                return 0;

            }


            return Math.round(
                (
                    stats.completedFollowUps /
                    stats.followUps
                ) * 100
            );

        }, [
            stats.followUps,
            stats.completedFollowUps,
        ]);


    const activeUserRate = useMemo(() => {

        if (!stats.totalUsers) {

            return 0;

        }


        return Math.round(
            (
                stats.activeUsers /
                stats.totalUsers
            ) * 100
        );

    }, [
        stats.totalUsers,
        stats.activeUsers,
    ]);


    // ========================================================
    // NUMBER FORMAT
    // ========================================================

    const formatNumber = (value) => {

        return Number(
            value || 0
        ).toLocaleString("en-IN");

    };


    // ========================================================
    // ICON
    // ========================================================

    const Icon = ({
        type,
        className = "h-6 w-6",
    }) => {

        const common = {

            viewBox: "0 0 24 24",

            fill: "none",

            className,

            stroke: "currentColor",

            strokeWidth: "1.8",

            strokeLinecap: "round",

            strokeLinejoin: "round",

        };


        switch (type) {

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


            case "manager":

                return (

                    <svg {...common}>

                        <circle
                            cx="12"
                            cy="7"
                            r="4"
                        />

                        <path d="M5 21a7 7 0 0 1 14 0" />

                    </svg>

                );


            case "lead":

                return (

                    <svg {...common}>

                        <path d="M4 19V5" />

                        <path d="M4 19h16" />

                        <path d="m7 15 4-4 3 2 5-6" />

                        <path d="M16 7h3v3" />

                    </svg>

                );


            case "fire":

                return (

                    <svg {...common}>

                        <path d="M12 22c4.5-1.5 7-4.6 7-9 0-3.4-1.7-6.1-4.8-8.8.1 2.5-.7 4.1-2.1 5.2-.2-2.7-1.5-4.8-4-6.4.2 3.2-2.1 5.5-2.1 9.1 0 4.4 2.5 7.5 6 9.9Z" />

                    </svg>

                );


            case "check":

                return (

                    <svg {...common}>

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />

                        <path d="m8 12 2.5 2.5L16 9" />

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


            case "target":

                return (

                    <svg {...common}>

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />

                        <circle
                            cx="12"
                            cy="12"
                            r="5"
                        />

                        <circle
                            cx="12"
                            cy="12"
                            r="1.5"
                        />

                    </svg>

                );


            case "activity":

                return (

                    <svg {...common}>

                        <path d="M3 12h4l2-7 4 14 2-7h6" />

                    </svg>

                );


            case "refresh":

                return (

                    <svg {...common}>

                        <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />

                        <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />

                    </svg>

                );


            default:

                return (

                    <svg {...common}>

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />

                    </svg>

                );

        }

    };


    // ========================================================
    // KPI CARD
    // ========================================================

    const KpiCard = ({
        title,
        value,
        subtitle,
        icon,
        accent,
        percentage,
    }) => {

        return (

            <div
                className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_10px_35px_rgba(16,34,54,0.06)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[0_20px_45px_rgba(16,34,54,0.12)]
                "
            >

                <div
                    className={`
                        pointer-events-none
                        absolute
                        -right-8
                        -top-8
                        h-28
                        w-28
                        rounded-full
                        ${accent.glow}
                    `}
                />

                <div className="relative">

                    <div className="flex items-start justify-between">

                        <div
                            className={`
                                flex
                                h-13
                                w-13
                                items-center
                                justify-center
                                rounded-2xl
                                ${accent.bg}
                                ${accent.text}
                            `}
                        >

                            <Icon
                                type={icon}
                                className="h-6 w-6"
                            />

                        </div>


                        {percentage !== undefined && (

                            <span
                                className={`
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-extrabold
                                    ${accent.badge}
                                `}
                            >
                                {percentage}%
                            </span>

                        )}

                    </div>


                    <p
                        className="
                            mt-5
                            text-xs
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                        "
                    >
                        {title}
                    </p>


                    <p
                        className="
                            mt-1
                            text-3xl
                            font-black
                            tracking-tight
                            text-[#102236]
                            sm:text-4xl
                        "
                    >
                        {formatNumber(value)}
                    </p>


                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                </div>

            </div>

        );

    };


    // ========================================================
    // PROGRESS BAR
    // ========================================================

    const ProgressBar = ({
        label,
        value,
        total,
        color,
        textColor,
    }) => {

        const percentage =
            total > 0
                ? Math.round(
                    (value / total) * 100
                )
                : 0;


        return (

            <div>

                <div
                    className="
                        mb-2
                        flex
                        items-center
                        justify-between
                    "
                >

                    <span
                        className="
                            text-xs
                            font-bold
                            text-slate-600
                        "
                    >
                        {label}
                    </span>


                    <span
                        className={`
                            text-xs
                            font-extrabold
                            ${textColor}
                        `}
                    >
                        {value} · {percentage}%
                    </span>

                </div>


                <div
                    className="
                        h-2.5
                        overflow-hidden
                        rounded-full
                        bg-slate-100
                    "
                >

                    <div
                        className={`
                            h-full
                            rounded-full
                            ${color}
                            transition-all
                            duration-700
                        `}
                        style={{
                            width:
                                `${Math.min(
                                    percentage,
                                    100
                                )}%`,
                        }}
                    />

                </div>

            </div>

        );

    };


    // ========================================================
    // LEAD GRAPH
    // ========================================================

    const LeadGraph = () => {

        const items = [

            {
                label: "New",
                value: stats.newLeads,
                color: "bg-blue-500",
                light: "bg-blue-50",
                text: "text-blue-600",
            },

            {
                label: "Hot",
                value: stats.hotLeads,
                color: "bg-red-500",
                light: "bg-red-50",
                text: "text-red-600",
            },

            {
                label: "Warm",
                value: stats.warmLeads,
                color: "bg-amber-500",
                light: "bg-amber-50",
                text: "text-amber-600",
            },

            {
                label: "Cold",
                value: stats.coldLeads,
                color: "bg-cyan-500",
                light: "bg-cyan-50",
                text: "text-cyan-600",
            },

            {
                label: "Enrolled",
                value: stats.enrolledLeads,
                color: "bg-emerald-500",
                light: "bg-emerald-50",
                text: "text-emerald-600",
            },

        ];


        const max =
            Math.max(
                ...items.map(
                    (item) => item.value
                ),
                1
            );


        return (

            <div
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_10px_35px_rgba(16,34,54,0.05)]
                    sm:p-6
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-[10px]
                                font-extrabold
                                uppercase
                                tracking-[0.18em]
                                text-[#F6C945]
                            "
                        >
                            Lead Distribution
                        </p>


                        <h3
                            className="
                                mt-1
                                text-xl
                                font-black
                                text-[#102236]
                            "
                        >
                            Lead Pipeline
                        </h3>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >
                            Current distribution of leads by
                            status.
                        </p>

                    </div>


                    <div
                        className="
                            rounded-2xl
                            bg-[#102236]
                            px-4
                            py-3
                        "
                    >

                        <p
                            className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-wider
                                text-slate-400
                            "
                        >
                            Total Leads
                        </p>


                        <p
                            className="
                                mt-0.5
                                text-xl
                                font-black
                                text-[#F6C945]
                            "
                        >
                            {formatNumber(
                                stats.totalLeads
                            )}
                        </p>

                    </div>

                </div>


                <div
                    className="
                        mt-8
                        flex
                        h-64
                        items-end
                        justify-between
                        gap-3
                        border-b
                        border-slate-100
                        px-1
                        sm:gap-6
                    "
                >

                    {items.map((item) => {

                        const height =
                            item.value > 0
                                ? Math.max(
                                    (
                                        item.value /
                                        max
                                    ) * 100,
                                    8
                                )
                                : 4;


                        return (

                            <div
                                key={item.label}
                                className="
                                    flex
                                    h-full
                                    flex-1
                                    flex-col
                                    items-center
                                    justify-end
                                "
                            >

                                <div className="mb-2 text-center">

                                    <span
                                        className="
                                            text-xs
                                            font-extrabold
                                            text-[#102236]
                                        "
                                    >
                                        {formatNumber(
                                            item.value
                                        )}
                                    </span>

                                </div>


                                <div
                                    className="
                                        relative
                                        flex
                                        h-[80%]
                                        w-full
                                        max-w-14
                                        items-end
                                        overflow-hidden
                                        rounded-t-2xl
                                        bg-slate-50
                                    "
                                >

                                    <div
                                        className={`
                                            w-full
                                            rounded-t-2xl
                                            ${item.color}
                                            transition-all
                                            duration-700
                                        `}
                                        style={{
                                            height:
                                                `${height}%`,
                                        }}
                                    />

                                </div>


                                <div
                                    className={`
                                        mt-3
                                        rounded-lg
                                        px-2
                                        py-1
                                        ${item.light}
                                    `}
                                >

                                    <span
                                        className={`
                                            text-[9px]
                                            font-extrabold
                                            uppercase
                                            tracking-wide
                                            ${item.text}
                                        `}
                                    >
                                        {item.label}
                                    </span>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        );

    };


    // ========================================================
    // FOLLOW-UP GRAPH
    // ========================================================

    const FollowUpGraph = () => {

        const completed =
            stats.completedFollowUps;

        const today =
            stats.todayFollowUps;

        const missed =
            stats.missedFollowUps;

        const upcoming =
            stats.upcomingFollowUps;

        const pending =
            stats.pendingFollowUps;

        const total =
            stats.followUps;


        // ====================================================
        // PERCENTAGES
        // ====================================================

        const completedPercentage =
            total > 0
                ? Math.round(
                    (completed / total) * 100
                )
                : 0;


        const todayPercentage =
            total > 0
                ? Math.round(
                    (today / total) * 100
                )
                : 0;


        const missedPercentage =
            total > 0
                ? Math.round(
                    (missed / total) * 100
                )
                : 0;


        const completedEnd =
            completedPercentage;

        const todayEnd =
            completedEnd +
            todayPercentage;

        const missedEnd =
            todayEnd +
            missedPercentage;


        return (

            <div
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-[0_10px_35px_rgba(16,34,54,0.05)]
                    sm:p-6
                "
            >

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-3
                    "
                >

                    <div>

                        <p
                            className="
                                text-[10px]
                                font-extrabold
                                uppercase
                                tracking-[0.18em]
                                text-[#F6C945]
                            "
                        >
                            Follow-up Activity
                        </p>


                        <h3
                            className="
                                mt-1
                                text-xl
                                font-black
                                text-[#102236]
                            "
                        >
                            Follow-up Performance
                        </h3>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >
                            Completed, today, missed and
                            upcoming follow-ups.
                        </p>

                    </div>


                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#102236]
                            text-[#F6C945]
                        "
                    >

                        <Icon
                            type="activity"
                            className="h-5 w-5"
                        />

                    </div>

                </div>


                <div
                    className="
                        mt-8
                        flex
                        flex-col
                        items-center
                        gap-8
                        sm:flex-row
                    "
                >

                    {/* ======================================
                        DONUT
                    ====================================== */}

                    <div
                        className="
                            relative
                            flex
                            h-48
                            w-48
                            shrink-0
                            items-center
                            justify-center
                        "
                    >

                        <div
                            className="
                                absolute
                                inset-0
                                rounded-full
                            "
                            style={{
                                background:
                                    total > 0
                                        ? `conic-gradient(
                                            #10B981 0% ${completedEnd}%,
                                            #3B82F6 ${completedEnd}% ${todayEnd}%,
                                            #EF4444 ${todayEnd}% ${missedEnd}%,
                                            #6366F1 ${missedEnd}% 100%
                                        )`
                                        : "#E5E7EB",
                            }}
                        />


                        <div
                            className="
                                absolute
                                inset-[14px]
                                rounded-full
                                bg-white
                            "
                        />


                        <div
                            className="
                                relative
                                text-center
                            "
                        >

                            <p
                                className="
                                    text-3xl
                                    font-black
                                    text-[#102236]
                                "
                            >
                                {completedPercentage}%
                            </p>


                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-slate-400
                                "
                            >
                                Completed
                            </p>

                        </div>

                    </div>


                    {/* ======================================
                        STATUS
                    ====================================== */}

                    <div
                        className="
                            w-full
                            space-y-3
                        "
                    >

                        {/* COMPLETED */}

                        <FollowUpStatusRow
                            label="Completed"
                            value={completed}
                            bg="bg-emerald-50"
                            dot="bg-emerald-500"
                            text="text-emerald-700"
                            valueText="text-emerald-800"
                        />


                        {/* TODAY */}

                        <FollowUpStatusRow
                            label="Today"
                            value={today}
                            bg="bg-blue-50"
                            dot="bg-blue-500"
                            text="text-blue-700"
                            valueText="text-blue-800"
                        />


                        {/* MISSED */}

                        <FollowUpStatusRow
                            label="Missed"
                            value={missed}
                            bg="bg-red-50"
                            dot="bg-red-500"
                            text="text-red-700"
                            valueText="text-red-800"
                        />


                        {/* UPCOMING */}

                        <FollowUpStatusRow
                            label="Upcoming"
                            value={upcoming}
                            bg="bg-indigo-50"
                            dot="bg-indigo-500"
                            text="text-indigo-700"
                            valueText="text-indigo-800"
                        />


                        {/* PENDING */}

                        <div
                            className="
                                mt-2
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                bg-amber-50
                                p-3.5
                            "
                        >

                            <span
                                className="
                                    text-sm
                                    font-bold
                                    text-amber-700
                                "
                            >
                                Pending Total
                            </span>


                            <span
                                className="
                                    text-lg
                                    font-black
                                    text-amber-800
                                "
                            >
                                {pending}
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        );

    };


    // ========================================================
    // FOLLOW-UP STATUS ROW
    // ========================================================

    const FollowUpStatusRow = ({
        label,
        value,
        bg,
        dot,
        text,
        valueText,
    }) => {

        return (

            <div
                className={`
                    rounded-2xl
                    p-3.5
                    ${bg}
                `}
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className={`
                                h-2.5
                                w-2.5
                                rounded-full
                                ${dot}
                            `}
                        />


                        <span
                            className={`
                                text-sm
                                font-bold
                                ${text}
                            `}
                        >
                            {label}
                        </span>

                    </div>


                    <span
                        className={`
                            text-lg
                            font-black
                            ${valueText}
                        `}
                    >
                        {value}
                    </span>

                </div>

            </div>

        );

    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-full
                    bg-[#F5F7FA]
                    px-4
                    py-6
                    sm:px-6
                    lg:px-8
                "
            >

                <div className="space-y-7">

                    <div
                        className="
                            h-64
                            animate-pulse
                            rounded-[2rem]
                            bg-[#102236]/10
                        "
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        {[1, 2, 3, 4].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="
                                        h-48
                                        animate-pulse
                                        rounded-3xl
                                        bg-slate-200
                                    "
                                />

                            )
                        )}

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-6
                            lg:grid-cols-2
                        "
                    >

                        <div
                            className="
                                h-[430px]
                                animate-pulse
                                rounded-3xl
                                bg-slate-200
                            "
                        />


                        <div
                            className="
                                h-[430px]
                                animate-pulse
                                rounded-3xl
                                bg-slate-200
                            "
                        />

                    </div>

                </div>

            </div>

        );

    }


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <div
            className="
                min-h-full
                bg-[#F5F7FA]
            "
        >

            <main
                className="
                    px-4
                    py-5
                    sm:px-6
                    lg:px-8
                    lg:py-7
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <section
                    className="
                        relative
                        mb-7
                        overflow-hidden
                        rounded-[2rem]
                        bg-[#102236]
                        shadow-[0_20px_60px_rgba(16,34,54,0.18)]
                    "
                >

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-20
                            -top-28
                            h-80
                            w-80
                            rounded-full
                            border-[45px]
                            border-white/[0.035]
                        "
                    />


                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-24
                            right-40
                            h-64
                            w-64
                            rounded-full
                            bg-[#F6C945]/[0.07]
                            blur-3xl
                        "
                    />


                    <div
                        className="
                            pointer-events-none
                            absolute
                            -left-24
                            bottom-[-100px]
                            h-60
                            w-60
                            rounded-full
                            border-[35px]
                            border-[#F6C945]/[0.035]
                        "
                    />


                    <div
                        className="
                            relative
                            z-10
                            p-6
                            sm:p-8
                            lg:p-9
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-7
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-14
                                        w-14
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-[#F6C945]
                                        text-[#102236]
                                        shadow-xl
                                    "
                                >

                                    <Icon
                                        type="activity"
                                        className="h-7 w-7"
                                    />

                                </div>


                                <div>

                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <h1
                                            className="
                                                text-2xl
                                                font-black
                                                tracking-tight
                                                text-white
                                                sm:text-3xl
                                                lg:text-4xl
                                            "
                                        >
                                            Performance
                                        </h1>


                                        <span
                                            className="
                                                rounded-full
                                                bg-[#F6C945]/15
                                                px-3
                                                py-1
                                                text-[9px]
                                                font-extrabold
                                                uppercase
                                                tracking-[0.16em]
                                                text-[#F6C945]
                                            "
                                        >
                                            Analytics
                                        </span>

                                    </div>


                                    <p
                                        className="
                                            mt-2
                                            max-w-2xl
                                            text-sm
                                            leading-6
                                            text-slate-300
                                        "
                                    >
                                        Track your team's users,
                                        leads, follow-ups and
                                        enrollment performance
                                        from one place.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={loadPerformance}
                                disabled={loading}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/15
                                    bg-white/5
                                    px-5
                                    py-3
                                    text-sm
                                    font-bold
                                    text-white
                                    transition-all
                                    duration-200
                                    hover:border-white/25
                                    hover:bg-white/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                <Icon
                                    type="refresh"
                                    className={`
                                        h-4
                                        w-4
                                        ${loading
                                            ? "animate-spin"
                                            : ""
                                        }
                                    `}
                                />

                                Refresh Data

                            </button>

                        </div>


                        {/* ==========================================
                            MINI METRICS
                        ========================================== */}

                        <div
                            className="
                                mt-7
                                grid
                                grid-cols-2
                                gap-3
                                sm:grid-cols-4
                            "
                        >

                            <MiniMetric
                                label="Users"
                                value={stats.totalUsers}
                            />

                            <MiniMetric
                                label="Leads"
                                value={stats.totalLeads}
                            />

                            <MiniMetric
                                label="Enrolled"
                                value={stats.enrolledLeads}
                                highlight
                            />

                            <MiniMetric
                                label="Completion"
                                value={`${followUpCompletionRate}%`}
                                success
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
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

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-100
                                    text-red-500
                                "
                            >

                                <span
                                    className="
                                        text-lg
                                        font-black
                                    "
                                >
                                    !
                                </span>

                            </div>


                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-extrabold
                                        text-red-800
                                    "
                                >
                                    Performance data unavailable
                                </p>


                                <p
                                    className="
                                        text-xs
                                        text-red-600
                                    "
                                >
                                    {error}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={loadPerformance}
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


                {/* ==================================================
                    TEAM OVERVIEW
                ================================================== */}

                <section>

                    <SectionHeading
                        eyebrow="Team Overview"
                        title="Workforce Performance"
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        <KpiCard
                            title="Total Users"
                            value={stats.totalUsers}
                            subtitle="Managers and executives"
                            icon="users"
                            accent={{
                                bg: "bg-blue-50",
                                text: "text-blue-600",
                                glow: "bg-blue-100/50",
                                badge: "bg-blue-50 text-blue-600",
                            }}
                        />


                        <KpiCard
                            title="Managers"
                            value={stats.managers}
                            subtitle="Managers in system"
                            icon="manager"
                            accent={{
                                bg: "bg-violet-50",
                                text: "text-violet-600",
                                glow: "bg-violet-100/50",
                                badge: "bg-violet-50 text-violet-600",
                            }}
                        />


                        <KpiCard
                            title="Executives"
                            value={stats.executives}
                            subtitle="Executives in system"
                            icon="users"
                            accent={{
                                bg: "bg-cyan-50",
                                text: "text-cyan-600",
                                glow: "bg-cyan-100/50",
                                badge: "bg-cyan-50 text-cyan-600",
                            }}
                        />


                        <KpiCard
                            title="Active Users"
                            value={stats.activeUsers}
                            subtitle="Currently active accounts"
                            icon="check"
                            percentage={activeUserRate}
                            accent={{
                                bg: "bg-emerald-50",
                                text: "text-emerald-600",
                                glow: "bg-emerald-100/50",
                                badge: "bg-emerald-50 text-emerald-600",
                            }}
                        />

                    </div>

                </section>


                {/* ==================================================
                    USER STATUS
                ================================================== */}

                <section
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        gap-6
                        lg:grid-cols-2
                    "
                >

                    {/* ACTIVE / INACTIVE */}

                    <div
                        className="
                            rounded-3xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-[0_10px_35px_rgba(16,34,54,0.05)]
                            sm:p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-[10px]
                                        font-extrabold
                                        uppercase
                                        tracking-[0.18em]
                                        text-[#F6C945]
                                    "
                                >
                                    Account Health
                                </p>


                                <h3
                                    className="
                                        mt-1
                                        text-xl
                                        font-black
                                        text-[#102236]
                                    "
                                >
                                    Active vs Inactive
                                </h3>

                            </div>


                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-emerald-50
                                    text-emerald-600
                                "
                            >

                                <Icon
                                    type="check"
                                    className="h-5 w-5"
                                />

                            </div>

                        </div>


                        <div className="mt-7">

                            <div
                                className="
                                    mb-2
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span
                                    className="
                                        text-xs
                                        font-bold
                                        text-slate-500
                                    "
                                >
                                    Active accounts
                                </span>


                                <span
                                    className="
                                        text-sm
                                        font-black
                                        text-emerald-600
                                    "
                                >
                                    {stats.activeUsers}
                                </span>

                            </div>


                            <div
                                className="
                                    h-4
                                    overflow-hidden
                                    rounded-full
                                    bg-slate-100
                                "
                            >

                                <div
                                    className="
                                        h-full
                                        rounded-full
                                        bg-gradient-to-r
                                        from-emerald-400
                                        to-emerald-600
                                        transition-all
                                        duration-700
                                    "
                                    style={{
                                        width:
                                            `${activeUserRate}%`,
                                    }}
                                />

                            </div>


                            <div
                                className="
                                    mt-5
                                    grid
                                    grid-cols-2
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        rounded-2xl
                                        bg-emerald-50
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            text-emerald-600
                                        "
                                    >
                                        Active
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            text-2xl
                                            font-black
                                            text-emerald-800
                                        "
                                    >
                                        {stats.activeUsers}
                                    </p>

                                </div>


                                <div
                                    className="
                                        rounded-2xl
                                        bg-slate-100
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                        "
                                    >
                                        Inactive
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            text-2xl
                                            font-black
                                            text-slate-700
                                        "
                                    >
                                        {stats.inactiveUsers}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* MANAGERS / EXECUTIVES */}

                    <div
                        className="
                            rounded-3xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-[0_10px_35px_rgba(16,34,54,0.05)]
                            sm:p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-[10px]
                                        font-extrabold
                                        uppercase
                                        tracking-[0.18em]
                                        text-[#F6C945]
                                    "
                                >
                                    Team Structure
                                </p>


                                <h3
                                    className="
                                        mt-1
                                        text-xl
                                        font-black
                                        text-[#102236]
                                    "
                                >
                                    Managers & Executives
                                </h3>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    bg-[#102236]
                                    px-4
                                    py-2.5
                                    text-center
                                "
                            >

                                <p
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    "
                                >
                                    Total
                                </p>


                                <p
                                    className="
                                        text-lg
                                        font-black
                                        text-[#F6C945]
                                    "
                                >
                                    {stats.totalUsers}
                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                mt-7
                                space-y-5
                            "
                        >

                            <ProgressBar
                                label="Managers"
                                value={stats.managers}
                                total={stats.totalUsers}
                                color="bg-violet-500"
                                textColor="text-violet-600"
                            />


                            <ProgressBar
                                label="Executives"
                                value={stats.executives}
                                total={stats.totalUsers}
                                color="bg-cyan-500"
                                textColor="text-cyan-600"
                            />

                        </div>


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
                                    bg-violet-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-violet-600
                                    "
                                >
                                    Managers
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-2xl
                                        font-black
                                        text-violet-800
                                    "
                                >
                                    {stats.managers}
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    bg-cyan-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-cyan-600
                                    "
                                >
                                    Executives
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-2xl
                                        font-black
                                        text-cyan-800
                                    "
                                >
                                    {stats.executives}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    LEAD PERFORMANCE
                ================================================== */}

                <section className="mt-8">

                    <SectionHeading
                        eyebrow="Lead Performance"
                        title="Lead Pipeline"
                        description="Understand the current lead distribution and enrollment activity."
                    />


                    <LeadGraph />


                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-1
                            gap-5
                            sm:grid-cols-2
                            xl:grid-cols-4
                        "
                    >

                        <KpiCard
                            title="Total Leads"
                            value={stats.totalLeads}
                            subtitle="All leads"
                            icon="lead"
                            accent={{
                                bg: "bg-blue-50",
                                text: "text-blue-600",
                                glow: "bg-blue-100/50",
                                badge: "bg-blue-50 text-blue-600",
                            }}
                        />


                        <KpiCard
                            title="Hot Leads"
                            value={stats.hotLeads}
                            subtitle="High priority"
                            icon="fire"
                            accent={{
                                bg: "bg-red-50",
                                text: "text-red-600",
                                glow: "bg-red-100/50",
                                badge: "bg-red-50 text-red-600",
                            }}
                        />


                        <KpiCard
                            title="Enrolled"
                            value={stats.enrolledLeads}
                            subtitle="Successfully enrolled"
                            icon="target"
                            percentage={enrollmentRate}
                            accent={{
                                bg: "bg-emerald-50",
                                text: "text-emerald-600",
                                glow: "bg-emerald-100/50",
                                badge: "bg-emerald-50 text-emerald-600",
                            }}
                        />


                        <KpiCard
                            title="Warm Leads"
                            value={stats.warmLeads}
                            subtitle="Interested leads"
                            icon="activity"
                            accent={{
                                bg: "bg-amber-50",
                                text: "text-amber-600",
                                glow: "bg-amber-100/50",
                                badge: "bg-amber-50 text-amber-600",
                            }}
                        />

                    </div>

                </section>


                {/* ==================================================
                    FOLLOW-UP PERFORMANCE
                ================================================== */}

                <section className="mt-8">

                    <SectionHeading
                        eyebrow="Follow-up Performance"
                        title="Follow-up Activity"
                        description="Exact follow-up status fetched from the existing follow-up controller."
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-6
                            lg:grid-cols-2
                        "
                    >

                        <FollowUpGraph />


                        {/* ==========================================
                            FOLLOW-UP SUMMARY
                        ========================================== */}

                        <div
                            className="
                                relative
                                overflow-hidden
                                rounded-3xl
                                bg-[#102236]
                                p-6
                                shadow-[0_18px_45px_rgba(16,34,54,0.14)]
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
                                    border-[25px]
                                    border-white/[0.04]
                                "
                            />


                            <div className="relative">

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <div>

                                        <p
                                            className="
                                                text-[10px]
                                                font-extrabold
                                                uppercase
                                                tracking-[0.18em]
                                                text-[#F6C945]
                                            "
                                        >
                                            Performance Summary
                                        </p>


                                        <h3
                                            className="
                                                mt-1
                                                text-2xl
                                                font-black
                                                text-white
                                            "
                                        >
                                            Follow-up Snapshot
                                        </h3>

                                    </div>


                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-[#F6C945]
                                            text-[#102236]
                                        "
                                    >

                                        <Icon
                                            type="target"
                                            className="h-6 w-6"
                                        />

                                    </div>

                                </div>


                                <div
                                    className="
                                        mt-7
                                        space-y-3
                                    "
                                >

                                    <DarkMetric
                                        label="Total Follow-ups"
                                        subtitle="From follow-up controller"
                                        value={stats.followUps}
                                        icon="activity"
                                        color="text-blue-400"
                                        bg="bg-blue-400/10"
                                    />


                                    <DarkMetric
                                        label="Completed"
                                        subtitle="Completed follow-ups"
                                        value={stats.completedFollowUps}
                                        icon="check"
                                        color="text-emerald-400"
                                        bg="bg-emerald-400/10"
                                    />


                                    <DarkMetric
                                        label="Today"
                                        subtitle="Follow-ups scheduled today"
                                        value={stats.todayFollowUps}
                                        icon="clock"
                                        color="text-blue-400"
                                        bg="bg-blue-400/10"
                                    />


                                    <DarkMetric
                                        label="Missed"
                                        subtitle="Past follow-ups requiring action"
                                        value={stats.missedFollowUps}
                                        icon="clock"
                                        color="text-red-400"
                                        bg="bg-red-400/10"
                                    />


                                    <DarkMetric
                                        label="Upcoming"
                                        subtitle="Future follow-ups"
                                        value={stats.upcomingFollowUps}
                                        icon="target"
                                        color="text-indigo-400"
                                        bg="bg-indigo-400/10"
                                    />


                                    <DarkMetric
                                        label="Pending"
                                        subtitle="Today + missed + upcoming"
                                        value={stats.pendingFollowUps}
                                        icon="clock"
                                        color="text-amber-400"
                                        bg="bg-amber-400/10"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FINAL LEAD STATUS
                ================================================== */}

                <section
                    className="
                        mt-8
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-[0_10px_35px_rgba(16,34,54,0.05)]
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-end
                            sm:justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-[10px]
                                    font-extrabold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#F6C945]
                                "
                            >
                                Lead Status
                            </p>


                            <h3
                                className="
                                    mt-1
                                    text-xl
                                    font-black
                                    text-[#102236]
                                "
                            >
                                Pipeline Breakdown
                            </h3>

                        </div>


                        <p
                            className="
                                text-xs
                                text-slate-400
                            "
                        >
                            Based on current performance data
                        </p>

                    </div>


                    <div
                        className="
                            mt-6
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        <LeadStatusCard
                            label="New"
                            value={stats.newLeads}
                            total={stats.totalLeads}
                            border="border-blue-100"
                            bg="bg-blue-50"
                            text="text-blue-700"
                            valueText="text-blue-800"
                            barBg="bg-blue-100"
                            bar="bg-blue-500"
                        />


                        <LeadStatusCard
                            label="Hot"
                            value={stats.hotLeads}
                            total={stats.totalLeads}
                            border="border-red-100"
                            bg="bg-red-50"
                            text="text-red-700"
                            valueText="text-red-800"
                            barBg="bg-red-100"
                            bar="bg-red-500"
                        />


                        <LeadStatusCard
                            label="Warm"
                            value={stats.warmLeads}
                            total={stats.totalLeads}
                            border="border-amber-100"
                            bg="bg-amber-50"
                            text="text-amber-700"
                            valueText="text-amber-800"
                            barBg="bg-amber-100"
                            bar="bg-amber-500"
                        />


                        <LeadStatusCard
                            label="Cold"
                            value={stats.coldLeads}
                            total={stats.totalLeads}
                            border="border-cyan-100"
                            bg="bg-cyan-50"
                            text="text-cyan-700"
                            valueText="text-cyan-800"
                            barBg="bg-cyan-100"
                            bar="bg-cyan-500"
                        />

                    </div>

                </section>

            </main>

        </div>

    );

}


// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({
    label,
    value,
    highlight = false,
    success = false,
}) {

    return (

        <div
            className="
                rounded-2xl
                border
                border-white/10
                bg-white/[0.06]
                p-4
            "
        >

            <p
                className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                "
            >
                {label}
            </p>


            <p
                className={`
                    mt-1
                    text-2xl
                    font-black
                    ${
                        highlight
                            ? "text-[#F6C945]"
                            : success
                                ? "text-emerald-400"
                                : "text-white"
                    }
                `}
            >
                {value}
            </p>

        </div>

    );

}


// ============================================================
// SECTION HEADING
// ============================================================

function SectionHeading({
    eyebrow,
    title,
    description,
}) {

    return (

        <div className="mb-5">

            <p
                className="
                    text-[10px]
                    font-extrabold
                    uppercase
                    tracking-[0.2em]
                    text-[#F6C945]
                "
            >
                {eyebrow}
            </p>


            <h2
                className="
                    mt-1
                    text-2xl
                    font-black
                    tracking-tight
                    text-[#102236]
                "
            >
                {title}
            </h2>


            {description && (

                <p
                    className="
                        mt-1
                        text-sm
                        text-slate-500
                    "
                >
                    {description}
                </p>

            )}

        </div>

    );

}


// ============================================================
// DARK METRIC
// ============================================================

function DarkMetric({
    label,
    subtitle,
    value,
    icon,
    color,
    bg,
}) {

    return (

        <div
            className="
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-white/10
                bg-white/[0.06]
                p-4
            "
        >

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
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        ${bg}
                        ${color}
                    `}
                >

                    <MetricIcon
                        type={icon}
                    />

                </div>


                <div>

                    <p
                        className="
                            text-xs
                            font-bold
                            text-white
                        "
                    >
                        {label}
                    </p>


                    <p
                        className="
                            text-[10px]
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                </div>

            </div>


            <p
                className={`
                    text-xl
                    font-black
                    ${color}
                `}
            >
                {value}
            </p>

        </div>

    );

}


// ============================================================
// METRIC ICON
// ============================================================

function MetricIcon({
    type,
}) {

    const props = {

        viewBox: "0 0 24 24",

        fill: "none",

        className: "h-4 w-4",

        stroke: "currentColor",

        strokeWidth: "1.8",

        strokeLinecap: "round",

        strokeLinejoin: "round",

    };


    if (type === "check") {

        return (

            <svg {...props}>

                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path d="m8 12 2.5 2.5L16 9" />

            </svg>

        );

    }


    if (type === "clock") {

        return (

            <svg {...props}>

                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path d="M12 7v5l3 2" />

            </svg>

        );

    }


    if (type === "target") {

        return (

            <svg {...props}>

                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="5"
                />

            </svg>

        );

    }


    return (

        <svg {...props}>

            <path d="M3 12h4l2-7 4 14 2-7h6" />

        </svg>

    );

}


// ============================================================
// LEAD STATUS CARD
// ============================================================

function LeadStatusCard({
    label,
    value,
    total,
    border,
    bg,
    text,
    valueText,
    barBg,
    bar,
}) {

    const percentage =
        total > 0
            ? Math.min(
                (value / total) * 100,
                100
            )
            : 0;


    return (

        <div
            className={`
                rounded-2xl
                border
                p-4
                ${border}
                ${bg}
            `}
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >

                <span
                    className={`
                        text-xs
                        font-extrabold
                        ${text}
                    `}
                >
                    {label}
                </span>


                <span
                    className={`
                        text-lg
                        font-black
                        ${valueText}
                    `}
                >
                    {value}
                </span>

            </div>


            <div
                className={`
                    mt-3
                    h-1.5
                    overflow-hidden
                    rounded-full
                    ${barBg}
                `}
            >

                <div
                    className={`
                        h-full
                        rounded-full
                        ${bar}
                    `}
                    style={{
                        width:
                            `${percentage}%`,
                    }}
                />

            </div>

        </div>

    );

}


export default Performance;