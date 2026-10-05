import React, { useMemo, useState } from "react";

/* =========================================================
   ICON
========================================================= */

const Icon = ({ type, size = 20 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        case "trend":
            return (
                <svg {...common}>
                    <path d="M3 3v18h18" />
                    <path d="m7 16 4-5 3 3 5-7" />
                </svg>
            );

        case "average":
            return (
                <svg {...common}>
                    <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
            );

        case "peak":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1" />
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

        case "activity":
            return (
                <svg {...common}>
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                </svg>
            );

        case "arrow":
            return (
                <svg {...common}>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </svg>
            );

        default:
            return null;
    }
};


/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    accent,
}) => {

    const accentStyles = {
        blue: {
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            line: "bg-blue-500",
            hover: "group-hover:text-blue-600",
        },

        green: {
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            line: "bg-emerald-500",
            hover: "group-hover:text-emerald-600",
        },

        yellow: {
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
            line: "bg-[#F6C945]",
            hover: "group-hover:text-[#C89D00]",
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
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-5
                shadow-[0_4px_18px_rgba(15,23,42,0.04)]
                hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]
                hover:-translate-y-0.5
                transition-all
                duration-300
                overflow-hidden
            "
        >

            {/* TOP ACCENT */}

            <div
                className={`
                    absolute
                    top-0
                    left-0
                    right-0
                    h-[3px]
                    ${style.line}
                `}
            />


            <div className="flex items-start justify-between">

                {/* ICON */}

                <div
                    className={`
                        w-10
                        h-10
                        rounded-xl
                        ${style.iconBg}
                        ${style.iconColor}
                        flex
                        items-center
                        justify-center
                        transition-transform
                        duration-300
                        group-hover:scale-105
                    `}
                >
                    <Icon
                        type={icon}
                        size={19}
                    />
                </div>


                {/* ARROW */}

                <div
                    className={`
                        w-7
                        h-7
                        rounded-lg
                        bg-slate-50
                        text-slate-300
                        flex
                        items-center
                        justify-center
                        ${style.hover}
                        transition
                    `}
                >
                    <Icon
                        type="arrow"
                        size={13}
                    />
                </div>

            </div>


            {/* CONTENT */}

            <div className="mt-5">

                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {title}
                </p>

                <div className="flex items-baseline gap-2 mt-1">

                    <p className="text-3xl font-black tracking-tight text-[#102236]">
                        {value}
                    </p>

                </div>

                <p className="text-xs text-slate-400 mt-1">
                    {subtitle}
                </p>

            </div>

        </div>
    );
};


/* =========================================================
   LEAD TREND CHART
========================================================= */

const LeadTrendChart = ({ data = [] }) => {

    const [activePoint, setActivePoint] =
        useState(null);


    const chartWidth = 900;
    const chartHeight = 340;

    const paddingLeft = 48;
    const paddingRight = 25;
    const paddingTop = 28;
    const paddingBottom = 52;

    const width =
        chartWidth -
        paddingLeft -
        paddingRight;

    const height =
        chartHeight -
        paddingTop -
        paddingBottom;


    const safeData = Array.isArray(data)
        ? data
        : [];


    const maxValue = Math.max(
        ...safeData.map(
            (item) =>
                Number(item.count) || 0
        ),
        5
    );


    const points = safeData.map(
        (item, index) => {

            const x =
                paddingLeft +
                (
                    index /
                    Math.max(
                        safeData.length - 1,
                        1
                    )
                ) *
                    width;


            const y =
                paddingTop +
                height -
                (
                    (
                        Number(item.count) ||
                        0
                    ) /
                    maxValue
                ) *
                    height;


            return {
                ...item,
                x,
                y,
                value:
                    Number(item.count) || 0,
            };
        }
    );


    const linePoints = points
        .map(
            (point) =>
                `${point.x},${point.y}`
        )
        .join(" ");


    const areaPoints = `
        ${paddingLeft},${paddingTop + height}
        ${linePoints}
        ${paddingLeft + width},${paddingTop + height}
    `;


    if (!safeData.length) {

        return (
            <div className="h-72 flex flex-col items-center justify-center">

                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center">

                    <Icon
                        type="trend"
                        size={23}
                    />

                </div>

                <p className="text-sm font-bold text-slate-500 mt-3">
                    No lead data available
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Try selecting another date range
                </p>

            </div>
        );
    }


    return (

        <div className="w-full overflow-x-auto">

            <div className="min-w-[680px]">

                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible"
                >

                    <defs>

                        {/* AREA GRADIENT */}

                        <linearGradient
                            id="leadTrendArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stopColor="#4F7CFF"
                                stopOpacity="0.20"
                            />

                            <stop
                                offset="65%"
                                stopColor="#4F7CFF"
                                stopOpacity="0.07"
                            />

                            <stop
                                offset="100%"
                                stopColor="#4F7CFF"
                                stopOpacity="0"
                            />

                        </linearGradient>


                        {/* LINE GRADIENT */}

                        <linearGradient
                            id="leadTrendLine"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >

                            <stop
                                offset="0%"
                                stopColor="#102236"
                            />

                            <stop
                                offset="65%"
                                stopColor="#365D9C"
                            />

                            <stop
                                offset="100%"
                                stopColor="#4F7CFF"
                            />

                        </linearGradient>


                        {/* SHADOW */}

                        <filter
                            id="leadLineShadow"
                            x="-20%"
                            y="-20%"
                            width="140%"
                            height="140%"
                        >

                            <feDropShadow
                                dx="0"
                                dy="4"
                                stdDeviation="4"
                                floodColor="#102236"
                                floodOpacity="0.12"
                            />

                        </filter>

                    </defs>


                    {/* GRID */}

                    {[0, 1, 2, 3, 4].map(
                        (line) => {

                            const y =
                                paddingTop +
                                (
                                    height / 4
                                ) *
                                    line;


                            return (
                                <g key={line}>

                                    <line
                                        x1={paddingLeft}
                                        y1={y}
                                        x2={
                                            paddingLeft +
                                            width
                                        }
                                        y2={y}
                                        stroke="#E8EDF3"
                                        strokeDasharray="4 6"
                                    />


                                    <text
                                        x="8"
                                        y={y + 4}
                                        fontSize="10"
                                        fontWeight="600"
                                        fill="#94A3B8"
                                    >
                                        {Math.round(
                                            maxValue -
                                                (
                                                    maxValue /
                                                    4
                                                ) *
                                                    line
                                        )}
                                    </text>

                                </g>
                            );
                        }
                    )}


                    {/* AREA */}

                    <polygon
                        points={areaPoints}
                        fill="url(#leadTrendArea)"
                    />


                    {/* MAIN LINE */}

                    <polyline
                        points={linePoints}
                        fill="none"
                        stroke="url(#leadTrendLine)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#leadLineShadow)"
                    />


                    {/* POINTS */}

                    {points.map(
                        (point, index) => {

                            const active =
                                activePoint ===
                                index;


                            return (

                                <g
                                    key={index}
                                    onMouseEnter={() =>
                                        setActivePoint(
                                            index
                                        )
                                    }
                                    onMouseLeave={() =>
                                        setActivePoint(
                                            null
                                        )
                                    }
                                    className="cursor-pointer"
                                >

                                    {/* HOVER GLOW */}

                                    {active && (
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="14"
                                            fill="#F6C945"
                                            opacity="0.16"
                                        />
                                    )}


                                    {/* OUTER POINT */}

                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={
                                            active
                                                ? 7
                                                : 5
                                        }
                                        fill="white"
                                        stroke={
                                            active
                                                ? "#F6C945"
                                                : "#4F7CFF"
                                        }
                                        strokeWidth="3"
                                    />


                                    {/* INNER POINT */}

                                    <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r={
                                            active
                                                ? 3
                                                : 2
                                        }
                                        fill={
                                            active
                                                ? "#F6C945"
                                                : "#102236"
                                        }
                                    />


                                    {/* TOOLTIP */}

                                    {active && (

                                        <g>

                                            <rect
                                                x={
                                                    point.x -
                                                    50
                                                }
                                                y={
                                                    point.y -
                                                    66
                                                }
                                                width="100"
                                                height="48"
                                                rx="9"
                                                fill="#102236"
                                            />


                                            <text
                                                x={
                                                    point.x
                                                }
                                                y={
                                                    point.y -
                                                    46
                                                }
                                                textAnchor="middle"
                                                fontSize="9"
                                                fontWeight="600"
                                                fill="#AAB7C6"
                                            >
                                                {point.date}
                                            </text>


                                            <text
                                                x={
                                                    point.x
                                                }
                                                y={
                                                    point.y -
                                                    27
                                                }
                                                textAnchor="middle"
                                                fontSize="13"
                                                fontWeight="800"
                                                fill="white"
                                            >
                                                {point.value} leads
                                            </text>

                                        </g>

                                    )}


                                    {/* DATE */}

                                    <text
                                        x={point.x}
                                        y={
                                            chartHeight -
                                            18
                                        }
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="600"
                                        fill="#64748B"
                                    >
                                        {String(
                                            point.date ||
                                                ""
                                        ).slice(5)}
                                    </text>

                                </g>
                            );
                        }
                    )}

                </svg>

            </div>

        </div>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const AnalyticsDateWise = ({
    data = [],
    range = "7days",
}) => {

    const safeData = Array.isArray(data)
        ? data
        : [];


    /* =====================================================
       TOTAL
    ===================================================== */

    const total = useMemo(
        () =>
            safeData.reduce(
                (sum, item) =>
                    sum +
                    (
                        Number(
                            item.count
                        ) || 0
                    ),
                0
            ),
        [safeData]
    );


    /* =====================================================
       HIGHEST DAY
    ===================================================== */

    const highestDay = useMemo(() => {

        if (!safeData.length)
            return null;


        return safeData.reduce(
            (highest, current) =>
                Number(
                    current.count || 0
                ) >
                Number(
                    highest.count || 0
                )
                    ? current
                    : highest
        );

    }, [safeData]);


    /* =====================================================
       AVERAGE
    ===================================================== */

    const average = safeData.length
        ? (
              total /
              safeData.length
          ).toFixed(1)
        : "0";


    /* =====================================================
       RANGE LABEL
    ===================================================== */

    const rangeLabel = {
        today: "Today",
        yesterday: "Yesterday",
        "7days": "Last 7 Days",
        "15days": "Last 15 Days",
        "30days": "Last 30 Days",
        "7weeks": "Last 7 Weeks",
        "3months": "Last 3 Months",
        "6months": "Last 6 Months",
        month: "This Month",
        year: "This Year",
        lastyear: "Last Year",
    }[range] || "Selected Period";


    /* =====================================================
       TABLE MAX
    ===================================================== */

    const maxCount = Math.max(
        ...safeData.map(
            (item) =>
                Number(item.count) || 0
        ),
        1
    );


    return (

        <div className="space-y-6">

            {/* =================================================
                HEADER
                NO BANNER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

                <div>

                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F7CFF]">
                        Date Wise Analytics
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-black text-[#102236] mt-1 tracking-tight">
                        Lead Activity by Date
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                        Track how many leads were created during the selected period.
                    </p>

                </div>


                <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">

                    <span className="w-2 h-2 rounded-full bg-[#F6C945]" />

                    <span className="text-xs font-bold text-slate-600">
                        {rangeLabel}
                    </span>

                </div>

            </div>


            {/* =================================================
                SUMMARY BOXES
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <StatCard
                    title="Total Created"
                    value={total}
                    subtitle={rangeLabel}
                    icon="trend"
                    accent="blue"
                />


                <StatCard
                    title="Daily Average"
                    value={average}
                    subtitle="Leads per day"
                    icon="average"
                    accent="green"
                />


                <StatCard
                    title="Peak Day"
                    value={
                        highestDay?.count ||
                        0
                    }
                    subtitle="Highest daily leads"
                    icon="peak"
                    accent="yellow"
                />

            </div>


            {/* =================================================
                GRAPH
            ================================================= */}

            <div className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-[0_6px_25px_rgba(15,23,42,0.045)]
                overflow-hidden
            ">

                {/* GRAPH HEADER */}

                <div className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    border-slate-100
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                ">

                    <div>

                        <div className="flex items-center gap-2.5">

                            <div className="
                                w-9
                                h-9
                                rounded-xl
                                bg-[#102236]
                                text-[#F6C945]
                                flex
                                items-center
                                justify-center
                            ">

                                <Icon
                                    type="trend"
                                    size={17}
                                />

                            </div>

                            <div>

                                <h3 className="text-base sm:text-lg font-black text-[#102236]">
                                    Lead Creation Trend
                                </h3>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    Daily lead creation for{" "}
                                    {rangeLabel.toLowerCase()}.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* LEGEND */}

                    <div className="
                        flex
                        items-center
                        gap-2
                        px-3
                        py-2
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-100
                    ">

                        <span className="
                            w-2.5
                            h-2.5
                            rounded-full
                            bg-[#4F7CFF]
                        " />

                        <span className="text-xs font-bold text-slate-500">
                            Leads Created
                        </span>

                    </div>

                </div>


                {/* CHART */}

                <div className="px-4 sm:px-6 pt-4 pb-5">

                    <LeadTrendChart
                        data={safeData}
                    />

                </div>

            </div>


            {/* =================================================
                DAILY BREAKDOWN
            ================================================= */}

            <div className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-[0_6px_25px_rgba(15,23,42,0.04)]
                overflow-hidden
            ">

                {/* TABLE HEADER */}

                <div className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    border-slate-100
                ">

                    <h3 className="text-base sm:text-lg font-black text-[#102236]">
                        Daily Breakdown
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Lead count for each date.
                    </p>

                </div>


                {safeData.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[560px]">

                            <thead>

                                <tr className="bg-slate-50/80">

                                    <th className="
                                        px-5
                                        sm:px-6
                                        py-3.5
                                        text-left
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-400
                                    ">
                                        Date
                                    </th>


                                    <th className="
                                        px-5
                                        py-3.5
                                        text-left
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-400
                                    ">
                                        Leads
                                    </th>


                                    <th className="
                                        px-5
                                        py-3.5
                                        text-left
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-400
                                    ">
                                        Share
                                    </th>


                                    <th className="
                                        px-5
                                        sm:px-6
                                        py-3.5
                                        text-left
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-400
                                    ">
                                        Activity
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {safeData.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const count =
                                            Number(
                                                item.count
                                            ) || 0;


                                        const share =
                                            total > 0
                                                ? (
                                                      (
                                                          count /
                                                          total
                                                      ) *
                                                      100
                                                  ).toFixed(
                                                      1
                                                  )
                                                : "0.0";


                                        const barWidth =
                                            (
                                                count /
                                                maxCount
                                            ) *
                                            100;


                                        const isPeak =
                                            count ===
                                                Number(
                                                    highestDay?.count
                                                ) &&
                                            count > 0;


                                        return (

                                            <tr
                                                key={`${item.date}-${index}`}
                                                className="
                                                    border-t
                                                    border-slate-100
                                                    hover:bg-slate-50/70
                                                    transition-colors
                                                    duration-200
                                                "
                                            >

                                                {/* DATE */}

                                                <td className="
                                                    px-5
                                                    sm:px-6
                                                    py-4
                                                ">

                                                    <div className="flex items-center gap-2.5">

                                                        <div className="
                                                            w-8
                                                            h-8
                                                            rounded-lg
                                                            bg-slate-50
                                                            text-slate-400
                                                            flex
                                                            items-center
                                                            justify-center
                                                        ">

                                                            <Icon
                                                                type="calendar"
                                                                size={15}
                                                            />

                                                        </div>


                                                        <div>

                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {item.date ||
                                                                    "-"}
                                                            </p>

                                                            {isPeak && (

                                                                <span className="text-[9px] font-black uppercase tracking-wider text-[#C89D00]">
                                                                    Peak
                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* LEADS */}

                                                <td className="px-5 py-4">

                                                    <span className="
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        min-w-[42px]
                                                        px-2.5
                                                        py-1.5
                                                        rounded-lg
                                                        bg-[#102236]
                                                        text-white
                                                        text-xs
                                                        font-black
                                                    ">
                                                        {count}
                                                    </span>

                                                </td>


                                                {/* SHARE */}

                                                <td className="px-5 py-4">

                                                    <span className="text-sm font-bold text-slate-600">
                                                        {share}%
                                                    </span>

                                                </td>


                                                {/* ACTIVITY */}

                                                <td className="
                                                    px-5
                                                    sm:px-6
                                                    py-4
                                                ">

                                                    <div className="flex items-center gap-3">

                                                        <div className="
                                                            w-28
                                                            sm:w-48
                                                            h-1.5
                                                            rounded-full
                                                            bg-slate-100
                                                            overflow-hidden
                                                        ">

                                                            <div
                                                                className="
                                                                    h-full
                                                                    rounded-full
                                                                    bg-gradient-to-r
                                                                    from-[#102236]
                                                                    via-[#365D9C]
                                                                    to-[#4F7CFF]
                                                                    transition-all
                                                                    duration-500
                                                                "
                                                                style={{
                                                                    width: `${barWidth}%`,
                                                                }}
                                                            />

                                                        </div>

                                                        <span className="text-[10px] font-semibold text-slate-400">
                                                            {count > 0
                                                                ? "Active"
                                                                : "No leads"}
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

                ) : (

                    <div className="p-10 text-center">

                        <div className="
                            w-12
                            h-12
                            mx-auto
                            rounded-xl
                            bg-slate-50
                            text-slate-300
                            flex
                            items-center
                            justify-center
                        ">

                            <Icon
                                type="trend"
                                size={22}
                            />

                        </div>

                        <p className="text-sm font-bold text-slate-500 mt-3">
                            No daily data available.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
};


export default AnalyticsDateWise;