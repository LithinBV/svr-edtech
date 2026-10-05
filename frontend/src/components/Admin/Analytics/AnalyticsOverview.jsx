import React, { useMemo } from "react";


/* =========================================================
   ICON
========================================================= */

const Icon = ({ type, size = 22 }) => {
    const icons = {
        leads: (
            <>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </>
        ),

        fire: (
            <path d="M12 22c4.5 0 8-3.1 8-7.5 0-3.4-2.1-5.7-4.7-8.5-.7 2.1-2 3.4-3.3 4.1.1-3.4-1.2-6.1-3.4-8.1.1 3.6-4.6 6.4-4.6 11.2C4 18.3 7.5 22 12 22Z" />
        ),

        calendar: (
            <>
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </>
        ),

        trend: (
            <>
                <polyline points="3 17 9 11 13 15 21 7" />
                <polyline points="15 7 21 7 21 13" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
            </>
        ),

        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <polyline points="8 12 11 15 16 9" />
            </>
        ),

        warning: (
            <>
                <path d="M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </>
        ),

        arrow: (
            <>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </>
        ),

        chart: (
            <>
                <line x1="4" y1="19" x2="4" y2="5" />
                <line x1="4" y1="19" x2="20" y2="19" />
                <polyline points="7 15 11 11 14 13 19 7" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[type]}
        </svg>
    );
};


/* =========================================================
   KPI CARD
========================================================= */

const KpiCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
    accent,
}) => {
    return (
        <div className="group relative overflow-hidden bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

            <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`}
            />

            <div className="flex items-start justify-between">

                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor}`}
                >
                    <Icon
                        type={icon}
                        size={22}
                    />
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#102236] group-hover:bg-slate-100 transition">
                    <Icon
                        type="arrow"
                        size={15}
                    />
                </div>

            </div>

            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 mt-5">
                {title}
            </p>

            <p className="text-3xl font-black text-[#102236] mt-1">
                {value}
            </p>

            <p className="text-xs text-slate-400 mt-1">
                {subtitle}
            </p>

        </div>
    );
};


/* =========================================================
   DONUT CHART
========================================================= */

const DonutChart = ({ status }) => {

    const total =
        status.new +
        status.hot +
        status.warm +
        status.cold;

    const values = [
        {
            label: "New",
            value: status.new,
            color: "#3B82F6",
        },
        {
            label: "Hot",
            value: status.hot,
            color: "#EF4444",
        },
        {
            label: "Warm",
            value: status.warm,
            color: "#F59E0B",
        },
        {
            label: "Cold",
            value: status.cold,
            color: "#06B6D4",
        },
    ];

    const radius = 74;

    const circumference =
        2 * Math.PI * radius;

    let offset = 0;

    return (
        <div className="flex flex-col lg:flex-row items-center gap-8">

            <div className="relative w-56 h-56 shrink-0">

                <svg
                    width="224"
                    height="224"
                    viewBox="0 0 224 224"
                    className="-rotate-90"
                >

                    <circle
                        cx="112"
                        cy="112"
                        r={radius}
                        fill="none"
                        stroke="#EEF2F7"
                        strokeWidth="25"
                    />

                    {total > 0 &&
                        values.map((item) => {

                            const length =
                                (item.value /
                                    total) *
                                circumference;

                            const currentOffset =
                                offset;

                            offset += length;

                            return (
                                <circle
                                    key={item.label}
                                    cx="112"
                                    cy="112"
                                    r={radius}
                                    fill="none"
                                    stroke={item.color}
                                    strokeWidth="25"
                                    strokeDasharray={`${length} ${circumference - length}`}
                                    strokeDashoffset={
                                        -currentOffset
                                    }
                                    strokeLinecap="round"
                                />
                            );
                        })}

                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">

                    <span className="text-4xl font-black text-[#102236]">
                        {total}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Total Leads
                    </span>

                </div>

            </div>


            <div className="w-full space-y-4">

                {values.map((item) => {

                    const percentage =
                        total > 0
                            ? (
                                (item.value /
                                    total) *
                                100
                            ).toFixed(1)
                            : "0.0";

                    return (
                        <div
                            key={item.label}
                            className="flex items-center gap-3"
                        >

                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{
                                    backgroundColor:
                                        item.color,
                                }}
                            />

                            <span className="text-sm font-semibold text-slate-600 flex-1">
                                {item.label}
                            </span>

                            <span className="text-sm font-black text-[#102236]">
                                {item.value}
                            </span>

                            <span className="text-xs text-slate-400 w-12 text-right">
                                {percentage}%
                            </span>

                        </div>
                    );
                })}

            </div>

        </div>
    );
};


/* =========================================================
   FOLLOW-UP GAUGE
========================================================= */

const FollowUpGauge = ({ followUps }) => {

    const total =
        Number(followUps.total || 0);

    const completed =
        Number(followUps.completed || 0);

    const missed =
        Number(followUps.overdue || 0);

    const percentage =
        total > 0
            ? Math.min(
                Math.round(
                    (completed / total) * 100
                ),
                100
            )
            : 0;

    const radius = 82;

    const circumference =
        Math.PI * radius;

    const progress =
        (percentage / 100) *
        circumference;

    return (
        <div className="flex flex-col items-center justify-center">

            <div className="relative w-full max-w-[310px]">

                <svg
                    viewBox="0 0 220 130"
                    className="w-full"
                >

                    <path
                        d="M 28 110 A 82 82 0 0 1 192 110"
                        fill="none"
                        stroke="#E8EDF3"
                        strokeWidth="18"
                        strokeLinecap="round"
                    />

                    <path
                        d="M 28 110 A 82 82 0 0 1 192 110"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${progress} ${circumference}`}
                    />

                </svg>

                <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">

                    <span className="text-4xl font-black text-[#102236]">
                        {percentage}%
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400">
                        Completion
                    </span>

                </div>

            </div>


            <div className="grid grid-cols-3 gap-3 w-full mt-4">

                <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-3">

                    <p className="text-lg font-black text-[#102236]">
                        {total}
                    </p>

                    <p className="text-[10px] uppercase font-black text-slate-400">
                        Total
                    </p>

                </div>


                <div className="text-center bg-emerald-50 border border-emerald-100 rounded-2xl p-3">

                    <p className="text-lg font-black text-emerald-600">
                        {completed}
                    </p>

                    <p className="text-[10px] uppercase font-black text-emerald-500">
                        Done
                    </p>

                </div>


                <div className="text-center bg-rose-50 border border-rose-100 rounded-2xl p-3">

                    <p className="text-lg font-black text-rose-600">
                        {missed}
                    </p>

                    <p className="text-[10px] uppercase font-black text-rose-500">
                        Missed
                    </p>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   CONVERSION FUNNEL
========================================================= */

const ConversionFunnel = ({ conversion }) => {

    const stages = [
        {
            label: "Interested",
            value: Number(
                conversion.interested || 0
            ),
            color: "from-blue-600 to-blue-400",
        },

        {
            label: "Walking In",
            value: Number(
                conversion.walkingIn || 0
            ),
            color: "from-indigo-600 to-indigo-400",
        },

        {
            label: "Enrolled",
            value: Number(
                conversion.enrolled || 0
            ),
            color: "from-emerald-600 to-emerald-400",
        },
    ];

    const max =
        Math.max(
            ...stages.map(
                (item) => item.value
            ),
            1
        );

    return (
        <div className="space-y-5">

            {stages.map((stage) => {

                const width =
                    stage.value > 0
                        ? Math.max(
                            (stage.value / max) *
                            100,
                            8
                        )
                        : 3;

                return (
                    <div
                        key={stage.label}
                        className="flex items-center gap-4"
                    >

                        <div className="w-24 sm:w-28 text-sm font-bold text-slate-600">
                            {stage.label}
                        </div>

                        <div className="flex-1">

                            <div className="h-10 bg-slate-100 rounded-xl overflow-hidden">

                                <div
                                    className={`h-full rounded-xl bg-gradient-to-r ${stage.color} flex items-center px-4 transition-all duration-700`}
                                    style={{
                                        width: `${width}%`,
                                    }}
                                >

                                    {stage.value > 0 && (
                                        <span className="text-sm font-black text-white">
                                            {stage.value}
                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>

                        <div className="w-10 text-right text-sm font-black text-[#102236]">
                            {stage.value}
                        </div>

                    </div>
                );
            })}


            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">

                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">
                        Not Interested
                    </p>

                    <p className="text-2xl font-black text-rose-700 mt-1">
                        {conversion.notInterested || 0}
                    </p>

                </div>


                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">

                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        RNR
                    </p>

                    <p className="text-2xl font-black text-slate-700 mt-1">
                        {conversion.rnr || 0}
                    </p>

                </div>

            </div>

        </div>
    );
};


/* =========================================================
   OUTCOME BAR CHART
========================================================= */

const OutcomeChart = ({ conversion }) => {

    const items = [
        {
            label: "Interested",
            value: Number(
                conversion.interested || 0
            ),
            className: "bg-blue-500",
        },

        {
            label: "Walking In",
            value: Number(
                conversion.walkingIn || 0
            ),
            className: "bg-indigo-500",
        },

        {
            label: "Enrolled",
            value: Number(
                conversion.enrolled || 0
            ),
            className: "bg-emerald-500",
        },

        {
            label: "Not Interested",
            value: Number(
                conversion.notInterested || 0
            ),
            className: "bg-rose-500",
        },

        {
            label: "RNR",
            value: Number(
                conversion.rnr || 0
            ),
            className: "bg-slate-400",
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
        <div className="space-y-5">

            {items.map((item) => {

                const width =
                    (item.value / max) *
                    100;

                return (
                    <div key={item.label}>

                        <div className="flex justify-between mb-2">

                            <span className="text-sm font-semibold text-slate-600">
                                {item.label}
                            </span>

                            <span className="text-sm font-black text-[#102236]">
                                {item.value}
                            </span>

                        </div>

                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">

                            <div
                                className={`h-full rounded-full ${item.className} transition-all duration-700`}
                                style={{
                                    width: `${width}%`,
                                }}
                            />

                        </div>

                    </div>
                );
            })}

        </div>
    );
};


/* =========================================================
   MAIN OVERVIEW
========================================================= */

const AnalyticsOverview = ({
    analytics = {},
    dateData = [],
}) => {

    const totalLeads =
        Number(
            analytics.totalLeads
        ) || 0;


    /* =====================================================
       STATUS
    ===================================================== */

    const status = {
        new: Number(
            analytics.status?.new || 0
        ),

        hot: Number(
            analytics.status?.hot || 0
        ),

        warm: Number(
            analytics.status?.warm || 0
        ),

        cold: Number(
            analytics.status?.cold || 0
        ),
    };


    /* =====================================================
       FOLLOW UPS
    ===================================================== */

    const followUps = {
        total: Number(
            analytics.followUps?.total || 0
        ),

        completed: Number(
            analytics.followUps?.completed || 0
        ),

        overdue: Number(
            analytics.followUps?.overdue || 0
        ),
    };


    /* =====================================================
       CONVERSION
    ===================================================== */

    const conversion = {
        interested: Number(
            analytics.conversion?.interested || 0
        ),

        walkingIn: Number(
            analytics.conversion?.walkingIn || 0
        ),

        enrolled: Number(
            analytics.conversion?.enrolled || 0
        ),

        notInterested: Number(
            analytics.conversion?.notInterested || 0
        ),

        rnr: Number(
            analytics.conversion?.rnr || 0
        ),
    };


    /* =====================================================
       DATE-WISE DATA

       Controller returns:
       [
           {
               date,
               count
           }
       ]
    ===================================================== */

    const trendData = useMemo(() => {

        if (!Array.isArray(dateData)) {
            return [];
        }

        return dateData.map((item) => ({
            date:
                item.date ||
                item.day ||
                item._id ||
                "",

            value:
                Number(
                    item.count ??
                    item.total ??
                    item.leads ??
                    0
                ) || 0,
        }));

    }, [dateData]);


    /* =====================================================
       TODAY COUNT
    ===================================================== */

    const todayCount = useMemo(() => {

        if (!trendData.length) {
            return 0;
        }

        const now = new Date();

        const todayKey =
            `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-${String(
                now.getDate()
            ).padStart(2, "0")}`;

        let total = 0;

        trendData.forEach((item) => {

            const raw =
                String(item.date || "");

            const datePart =
                raw.length >= 10
                    ? raw.slice(0, 10)
                    : raw;

            if (datePart === todayKey) {
                total += Number(
                    item.value || 0
                );
            }
        });

        return total;

    }, [trendData]);


    /* =====================================================
       ENROLLMENT RATE
    ===================================================== */

    const enrollmentRate =
        totalLeads > 0
            ? (
                (conversion.enrolled /
                    totalLeads) *
                100
            ).toFixed(1)
            : "0.0";


    /* =====================================================
       INTEREST RATE
    ===================================================== */

    const interestedRate =
        totalLeads > 0
            ? (
                (conversion.interested /
                    totalLeads) *
                100
            ).toFixed(1)
            : "0.0";


    /* =====================================================
       MAX TREND
    ===================================================== */

    const maxTrend =
        Math.max(
            ...trendData.map(
                (item) => item.value
            ),
            1
        );


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="space-y-6">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

                <div>

                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#102236]">
                        Analytics Overview
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#102236] mt-1">
                        Lead Performance
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Monitor leads, follow-ups and conversion activity.
                    </p>

                </div>

                <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">

                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                        Period
                    </p>

                    <p className="text-xs font-bold text-[#102236] mt-0.5">
                        Selected range
                    </p>

                </div>

            </div>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <KpiCard
                    title="Total Leads"
                    value={totalLeads}
                    subtitle="Leads in selected period"
                    icon="leads"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    accent="bg-blue-500"
                />

                <KpiCard
                    title="Hot Leads"
                    value={status.hot}
                    subtitle={`${status.warm} warm leads`}
                    icon="fire"
                    iconBg="bg-rose-50"
                    iconColor="text-rose-600"
                    accent="bg-rose-500"
                />

                <KpiCard
                    title="Today's Leads"
                    value={todayCount}
                    subtitle="Created today"
                    icon="calendar"
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    accent="bg-emerald-500"
                />

                <KpiCard
                    title="Enrolled"
                    value={conversion.enrolled}
                    subtitle={`${enrollmentRate}% of selected leads`}
                    icon="trend"
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                    accent="bg-violet-500"
                />

            </div>


            {/* =================================================
                STATUS + FOLLOW-UP
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                {/* LEAD STATUS */}

                <div className="bg-white border border-slate-200 rounded-[26px] p-5 sm:p-6 shadow-sm">

                    <div className="flex items-start justify-between mb-6">

                        <div>

                            <h3 className="text-lg font-black text-[#102236]">
                                Lead Status
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Distribution of leads in the selected period.
                            </p>

                        </div>

                        <div className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                            Live Data
                        </div>

                    </div>

                    <DonutChart
                        status={status}
                    />

                </div>


                {/* FOLLOW-UP */}

                <div className="bg-white border border-slate-200 rounded-[26px] p-5 sm:p-6 shadow-sm">

                    <div className="flex items-start justify-between mb-2">

                        <div>

                            <h3 className="text-lg font-black text-[#102236]">
                                Follow-up Performance
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                                Completion and missed follow-up overview.
                            </p>

                        </div>

                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                            <Icon
                                type="check"
                                size={20}
                            />

                        </div>

                    </div>

                    <FollowUpGauge
                        followUps={followUps}
                    />

                </div>

            </div>


            {/* =================================================
                LEAD TREND
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-[26px] p-5 sm:p-6 shadow-sm">

                {/* HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                    <div>

                        <div className="flex items-center gap-2">

                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

                                <Icon
                                    type="trend"
                                    size={18}
                                />

                            </div>

                            <div>

                                <h3 className="text-lg font-black text-[#102236]">
                                    Lead Trend
                                </h3>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    Daily lead creation activity
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* LEGEND */}

                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-2">

                            <span className="w-2.5 h-2.5 rounded-full bg-[#4F7CFF]" />

                            <span className="text-xs font-bold text-slate-500">
                                Leads
                            </span>

                        </div>

                        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">

                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Total
                            </span>

                            <span className="ml-2 text-sm font-black text-[#102236]">
                                {totalLeads}
                            </span>

                        </div>

                    </div>

                </div>


                {/* CHART */}

                {trendData.length === 0 ? (

                    <div className="h-64 flex flex-col items-center justify-center">

                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center">

                            <Icon
                                type="chart"
                                size={24}
                            />

                        </div>

                        <p className="text-sm font-bold text-slate-400 mt-3">
                            No lead activity
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            No date-wise data available for this period.
                        </p>

                    </div>

                ) : (

                    <div className="relative">


                        {/* GRID */}

                        <div className="absolute inset-0 h-56 flex flex-col justify-between pointer-events-none">

                            <div className="border-t border-dashed border-slate-100" />

                            <div className="border-t border-dashed border-slate-100" />

                            <div className="border-t border-dashed border-slate-100" />

                            <div className="border-t border-dashed border-slate-100" />

                            <div className="border-t border-slate-100" />

                        </div>


                        {/* CHART AREA */}

                        <div className="relative h-56 overflow-x-auto pb-2">

                            <div
                                className="h-full flex items-end gap-2 sm:gap-3 min-w-full"
                                style={{
                                    minWidth: `${Math.max(
                                        trendData.length * 48,
                                        100
                                    )}px`,
                                }}
                            >

                                {trendData.map(
                                    (item, index) => {

                                        const height =
                                            maxTrend > 0
                                                ? (
                                                    item.value /
                                                    maxTrend
                                                ) * 100
                                                : 0;

                                        return (

                                            <div
                                                key={`${item.date}-${index}`}
                                                className="relative flex-1 min-w-[38px] h-full flex flex-col justify-end items-center group"
                                            >

                                                {/* TOOLTIP */}

                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">

                                                    <div className="bg-[#102236] text-white rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">

                                                        <p className="text-[10px] font-bold text-slate-300">
                                                            {String(
                                                                item.date
                                                            ).slice(-5)}
                                                        </p>

                                                        <p className="text-sm font-black">
                                                            {item.value} leads
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* BAR */}

                                                <div
                                                    className="relative w-full max-w-[34px] rounded-t-xl bg-gradient-to-t from-[#102236] via-[#365D9C] to-[#4F7CFF] transition-all duration-500 group-hover:from-[#F6C945] group-hover:via-[#F7B928] group-hover:to-[#F59E0B]"
                                                    style={{
                                                        height: `${Math.max(
                                                            height,
                                                            item.value > 0
                                                                ? 5
                                                                : 1
                                                        )}%`,
                                                    }}
                                                >

                                                    {/* TOP DOT */}

                                                    {item.value > 0 && (

                                                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-[3px] border-[#4F7CFF] group-hover:border-[#F6C945] transition" />

                                                    )}

                                                </div>

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {/* DATE LABELS */}

                        <div className="flex gap-2 sm:gap-3 overflow-x-auto pt-3 mt-1 border-t border-slate-100">

                            {trendData.map(
                                (item, index) => (

                                    <div
                                        key={`${item.date}-label-${index}`}
                                        className="flex-1 min-w-[38px] text-center"
                                    >

                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 whitespace-nowrap">

                                            {String(
                                                item.date
                                            ).slice(-5)}

                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

            </div>


            {/* =================================================
                CONVERSION + OUTCOME
            ================================================= */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">


                {/* CONVERSION */}

                <div className="bg-white border border-slate-200 rounded-[26px] p-5 sm:p-6 shadow-sm">

                    <div className="mb-6">

                        <h3 className="text-lg font-black text-[#102236]">
                            Conversion Funnel
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Lead movement through key outcomes.
                        </p>

                    </div>

                    <ConversionFunnel
                        conversion={conversion}
                    />

                </div>


                {/* OUTCOMES */}

                <div className="bg-white border border-slate-200 rounded-[26px] p-5 sm:p-6 shadow-sm">

                    <div className="mb-6">

                        <h3 className="text-lg font-black text-[#102236]">
                            Lead Outcomes
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Latest recorded lead outcomes.
                        </p>

                    </div>

                    <OutcomeChart
                        conversion={conversion}
                    />

                </div>

            </div>


            {/* =================================================
                QUICK INSIGHTS
            ================================================= */}

            <div className="bg-[#102236] rounded-[26px] p-5 sm:p-6 shadow-[0_18px_45px_rgba(16,34,54,0.16)]">

                <div className="flex items-center gap-3 mb-5">

                    <div className="w-10 h-10 rounded-xl bg-[#F6C945]/10 text-[#F6C945] flex items-center justify-center">

                        <Icon
                            type="trend"
                            size={19}
                        />

                    </div>

                    <div>

                        <h3 className="text-lg font-black text-white">
                            Quick Insights
                        </h3>

                        <p className="text-xs text-slate-400">
                            Based on the selected analytics period.
                        </p>

                    </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                    {/* LEAD ACTIVITY */}

                    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">

                        <div className="flex items-center gap-2 text-blue-300">

                            <Icon
                                type="leads"
                                size={17}
                            />

                            <span className="text-[10px] font-black uppercase tracking-wider">
                                Lead Activity
                            </span>

                        </div>

                        <p className="text-2xl font-black text-white mt-3">
                            {todayCount}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            leads created today
                        </p>

                    </div>


                    {/* INTEREST RATE */}

                    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">

                        <div className="flex items-center gap-2 text-emerald-300">

                            <Icon
                                type="trend"
                                size={17}
                            />

                            <span className="text-[10px] font-black uppercase tracking-wider">
                                Interest Rate
                            </span>

                        </div>

                        <p className="text-2xl font-black text-white mt-3">
                            {interestedRate}%
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            selected leads marked interested
                        </p>

                    </div>


                    {/* MISSED */}

                    <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">

                        <div className="flex items-center gap-2 text-rose-300">

                            <Icon
                                type="warning"
                                size={17}
                            />

                            <span className="text-[10px] font-black uppercase tracking-wider">
                                Attention
                            </span>

                        </div>

                        <p className="text-2xl font-black text-white mt-3">
                            {followUps.overdue}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            missed follow-ups
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};


export default AnalyticsOverview;