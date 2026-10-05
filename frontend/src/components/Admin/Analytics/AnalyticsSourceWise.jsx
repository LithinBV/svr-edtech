import React, { useMemo } from "react";

/* =========================================================
   SOURCE ICON
========================================================= */

const SourceIcon = ({ type, size = 19 }) => {

    const icons = {

        meta: (
            <>
                <path d="M4 15c0-4 2-7 5-7 2.5 0 3.5 3 5 5s2.5 5 5 5c1.2 0 2-1 2-2" />
                <path d="M4 15c0 2 1 3 2.5 3 2.5 0 3.5-4 5-7s2.5-5 5-5c2.5 0 3.5 6 3.5 6" />
            </>
        ),

        college: (
            <>
                <path d="m3 10 9-5 9 5-9 5-9-5Z" />
                <path d="M7 12v5c3 2 7 2 10 0v-5" />
                <path d="M21 10v6" />
            </>
        ),

        linkedin: (
            <>
                <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                />
                <path d="M8 10v6" />
                <path d="M8 8v.01" />
                <path d="M12 16v-3a2 2 0 0 1 4 0v3" />
                <path d="M12 10v6" />
            </>
        ),

        referral: (
            <>
                <circle
                    cx="8"
                    cy="8"
                    r="3"
                />
                <circle
                    cx="16"
                    cy="16"
                    r="3"
                />
                <path d="m10.5 10.5 3 3" />
            </>
        ),

        inbound: (
            <>
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
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
            {icons[type] || icons.inbound}
        </svg>
    );
};


/* =========================================================
   SOURCE TYPE
========================================================= */

const getSourceType = (source = "") => {

    const value =
        String(source).toLowerCase();


    if (
        value.includes("meta") ||
        value.includes("fb")
    ) {
        return "meta";
    }


    if (
        value.includes("college")
    ) {
        return "college";
    }


    if (
        value.includes("linkedin")
    ) {
        return "linkedin";
    }


    if (
        value.includes("referral")
    ) {
        return "referral";
    }


    return "inbound";
};


/* =========================================================
   SOURCE COLORS
========================================================= */

const sourceColors = {

    meta: {
        icon:
            "bg-blue-50 text-blue-600",
        bar:
            "bg-[#4F7CFF]",
        badge:
            "bg-blue-50 text-blue-700",
        dot:
            "bg-[#4F7CFF]",
    },

    college: {
        icon:
            "bg-violet-50 text-violet-600",
        bar:
            "bg-violet-500",
        badge:
            "bg-violet-50 text-violet-700",
        dot:
            "bg-violet-500",
    },

    linkedin: {
        icon:
            "bg-sky-50 text-sky-600",
        bar:
            "bg-sky-500",
        badge:
            "bg-sky-50 text-sky-700",
        dot:
            "bg-sky-500",
    },

    referral: {
        icon:
            "bg-emerald-50 text-emerald-600",
        bar:
            "bg-emerald-500",
        badge:
            "bg-emerald-50 text-emerald-700",
        dot:
            "bg-emerald-500",
    },

    inbound: {
        icon:
            "bg-yellow-50 text-yellow-600",
        bar:
            "bg-[#F6C945]",
        badge:
            "bg-yellow-50 text-yellow-700",
        dot:
            "bg-[#F6C945]",
    },
};


/* =========================================================
   SMALL ICONS
========================================================= */

const MetricIcon = ({ type, size = 19 }) => {

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


    if (type === "total") {
        return (
            <svg {...common}>
                <path d="M3 3v18h18" />
                <path d="m7 16 4-5 3 3 5-7" />
            </svg>
        );
    }


    if (type === "sources") {
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
                    r="1"
                />
            </svg>
        );
    }


    return (
        <svg {...common}>
            <polyline points="3 17 9 11 13 15 21 7" />
            <polyline points="15 7 21 7 21 13" />
        </svg>
    );
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

    const styles = {

        blue: {
            icon:
                "bg-blue-50 text-blue-600",
            line:
                "bg-[#4F7CFF]",
        },

        violet: {
            icon:
                "bg-violet-50 text-violet-600",
            line:
                "bg-violet-500",
        },

        yellow: {
            icon:
                "bg-yellow-50 text-yellow-600",
            line:
                "bg-[#F6C945]",
        },
    };


    const style =
        styles[accent] ||
        styles.blue;


    return (
        <div
            className="
                group
                relative
                overflow-hidden
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-5
                shadow-[0_4px_18px_rgba(15,23,42,0.04)]
                hover:-translate-y-0.5
                hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]
                transition-all
                duration-300
            "
        >

            {/* TOP LINE */}

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


            {/* ICON */}

            <div className="flex items-start justify-between">

                <div
                    className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${style.icon}
                        group-hover:scale-105
                        transition-transform
                    `}
                >
                    <MetricIcon
                        type={icon}
                    />
                </div>


                <span className="
                    w-7
                    h-7
                    rounded-lg
                    bg-slate-50
                    text-slate-300
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                ">
                    •••
                </span>

            </div>


            {/* TEXT */}

            <div className="mt-5">

                <p className="
                    text-[11px]
                    uppercase
                    tracking-[0.13em]
                    font-bold
                    text-slate-400
                ">
                    {title}
                </p>


                <p className="
                    text-3xl
                    font-black
                    tracking-tight
                    text-[#102236]
                    mt-1
                ">
                    {value}
                </p>


                <p className="
                    text-xs
                    text-slate-400
                    mt-1
                ">
                    {subtitle}
                </p>

            </div>

        </div>
    );
};


/* =========================================================
   MAIN
========================================================= */

const AnalyticsSourceWise = ({
    data = [],
}) => {

    const safeData =
        Array.isArray(data)
            ? data
            : [];


    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const normalizedData =
        useMemo(() => {

            return safeData
                .map((item) => ({

                    source:
                        item.source ||
                        item.leadSource ||
                        item.name ||
                        "Unknown",

                    count:
                        Number(
                            item.count ??
                            item.total ??
                            item.value ??
                            0
                        ) || 0,

                }))
                .sort(
                    (a, b) =>
                        b.count -
                        a.count
                );

        }, [safeData]);


    /* =====================================================
       TOTAL
    ===================================================== */

    const total =
        useMemo(() => {

            return normalizedData.reduce(
                (sum, item) =>
                    sum + item.count,
                0
            );

        }, [normalizedData]);


    /* =====================================================
       HIGHEST SOURCE
    ===================================================== */

    const highestSource =
        normalizedData.length > 0
            ? normalizedData[0]
            : null;


    /* =====================================================
       AVERAGE
    ===================================================== */

    const average =
        normalizedData.length > 0
            ? (
                  total /
                  normalizedData.length
              ).toFixed(1)
            : "0";


    /* =====================================================
       MAX VALUE
    ===================================================== */

    const maxValue =
        Math.max(
            ...normalizedData.map(
                (item) =>
                    item.count
            ),
            1
        );


    return (

        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                flex-col
                sm:flex-row
                sm:items-end
                sm:justify-between
                gap-3
            ">

                <div>

                    <p className="
                        text-[11px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-[#4F7CFF]
                    ">
                        Source Wise Analytics
                    </p>


                    <h2 className="
                        text-2xl
                        sm:text-3xl
                        font-black
                        text-[#102236]
                        mt-1
                        tracking-tight
                    ">
                        Lead Sources
                    </h2>


                    <p className="
                        text-sm
                        text-slate-400
                        mt-1
                    ">
                        Understand which channels are generating your leads.
                    </p>

                </div>


                <div className="
                    inline-flex
                    items-center
                    gap-2
                    self-start
                    sm:self-auto
                    px-3.5
                    py-2
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    shadow-sm
                ">

                    <span className="
                        w-2
                        h-2
                        rounded-full
                        bg-[#F6C945]
                    " />

                    <span className="
                        text-xs
                        font-bold
                        text-slate-600
                    ">
                        {normalizedData.length} Sources
                    </span>

                </div>

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-4
            ">

                <StatCard
                    title="Total Leads"
                    value={total}
                    subtitle="From all sources"
                    icon="total"
                    accent="blue"
                />


                <StatCard
                    title="Active Sources"
                    value={
                        normalizedData.length
                    }
                    subtitle="Lead channels"
                    icon="sources"
                    accent="violet"
                />


                <StatCard
                    title="Average"
                    value={average}
                    subtitle="Leads per source"
                    icon="average"
                    accent="yellow"
                />

            </div>


            {/* =================================================
                SOURCE PERFORMANCE
            ================================================= */}

            <div className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-[0_6px_25px_rgba(15,23,42,0.045)]
                overflow-hidden
            ">

                {/* HEADER */}

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

                        <div className="
                            flex
                            items-center
                            gap-2.5
                        ">

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

                                <MetricIcon
                                    type="total"
                                    size={17}
                                />

                            </div>


                            <div>

                                <h3 className="
                                    text-base
                                    sm:text-lg
                                    font-black
                                    text-[#102236]
                                ">
                                    Source Performance
                                </h3>


                                <p className="
                                    text-xs
                                    text-slate-400
                                    mt-0.5
                                ">
                                    Lead volume generated by each source.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="
                        px-3
                        py-2
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-100
                        text-xs
                        font-bold
                        text-slate-500
                    ">

                        {normalizedData.length} channels

                    </div>

                </div>


                {/* SOURCE LIST */}

                <div className="
                    p-5
                    sm:p-6
                ">

                    {normalizedData.length === 0 ? (

                        <div className="
                            h-64
                            flex
                            flex-col
                            items-center
                            justify-center
                        ">

                            <div className="
                                w-12
                                h-12
                                rounded-xl
                                bg-slate-50
                                text-slate-300
                                flex
                                items-center
                                justify-center
                            ">

                                <MetricIcon
                                    type="total"
                                    size={23}
                                />

                            </div>


                            <p className="
                                text-sm
                                font-bold
                                text-slate-500
                                mt-3
                            ">
                                No source data available
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {normalizedData.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const type =
                                        getSourceType(
                                            item.source
                                        );


                                    const colors =
                                        sourceColors[
                                            type
                                        ];


                                    const percentage =
                                        total > 0
                                            ? (
                                                  (
                                                      item.count /
                                                      total
                                                  ) *
                                                  100
                                              ).toFixed(
                                                  1
                                              )
                                            : "0.0";


                                    const width =
                                        (
                                            item.count /
                                            maxValue
                                        ) *
                                        100;


                                    return (

                                        <div
                                            key={
                                                item.source
                                            }
                                            className="
                                                group
                                            "
                                        >

                                            {/* SOURCE HEADER */}

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

                                                <div
                                                    className={`
                                                        w-10
                                                        h-10
                                                        rounded-xl
                                                        flex
                                                        items-center
                                                        justify-center
                                                        shrink-0
                                                        ${colors.icon}
                                                        group-hover:scale-105
                                                        transition
                                                    `}
                                                >

                                                    <SourceIcon
                                                        type={
                                                            type
                                                        }
                                                        size={
                                                            18
                                                        }
                                                    />

                                                </div>


                                                <div className="
                                                    min-w-0
                                                    flex-1
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                        <div className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            min-w-0
                                                        ">

                                                            <span className="
                                                                text-sm
                                                                font-bold
                                                                text-slate-700
                                                                truncate
                                                            ">
                                                                {
                                                                    item.source
                                                                }
                                                            </span>


                                                            {index ===
                                                                0 && (

                                                                <span className="
                                                                    hidden
                                                                    sm:inline-flex
                                                                    px-2
                                                                    py-0.5
                                                                    rounded-full
                                                                    bg-[#F6C945]/20
                                                                    text-[#9A7700]
                                                                    text-[9px]
                                                                    font-black
                                                                    uppercase
                                                                    tracking-wider
                                                                ">
                                                                    Top
                                                                </span>

                                                            )}

                                                        </div>


                                                        <div className="
                                                            text-right
                                                            shrink-0
                                                        ">

                                                            <span className="
                                                                text-sm
                                                                font-black
                                                                text-[#102236]
                                                            ">
                                                                {
                                                                    item.count
                                                                }
                                                            </span>


                                                            <span className="
                                                                text-xs
                                                                text-slate-400
                                                                ml-1
                                                            ">
                                                                (
                                                                {
                                                                    percentage
                                                                }
                                                                %)
                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* BAR */}

                                                    <div className="
                                                        h-2.5
                                                        bg-slate-100
                                                        rounded-full
                                                        overflow-hidden
                                                        mt-2
                                                    ">

                                                        <div
                                                            className={`
                                                                h-full
                                                                rounded-full
                                                                ${colors.bar}
                                                                transition-all
                                                                duration-700
                                                                group-hover:opacity-80
                                                            `}
                                                            style={{
                                                                width:
                                                                    `${width}%`,
                                                            }}
                                                        />

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
                SOURCE BREAKDOWN
            ================================================= */}

            <div className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-[0_6px_25px_rgba(15,23,42,0.04)]
                overflow-hidden
            ">

                <div className="
                    px-5
                    sm:px-6
                    py-5
                    border-b
                    border-slate-100
                ">

                    <h3 className="
                        text-base
                        sm:text-lg
                        font-black
                        text-[#102236]
                    ">
                        Source Breakdown
                    </h3>


                    <p className="
                        text-xs
                        sm:text-sm
                        text-slate-400
                        mt-1
                    ">
                        Detailed lead distribution by source.
                    </p>

                </div>


                {normalizedData.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="
                            w-full
                            min-w-[600px]
                        ">

                            <thead>

                                <tr className="
                                    bg-slate-50/80
                                ">

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
                                        #
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
                                        Source
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
                                        py-3.5
                                        text-left
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-400
                                    ">
                                        Distribution
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {normalizedData.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const percentage =
                                            total > 0
                                                ? (
                                                      (
                                                          item.count /
                                                          total
                                                      ) *
                                                      100
                                                  ).toFixed(
                                                      1
                                                  )
                                                : "0.0";


                                        const type =
                                            getSourceType(
                                                item.source
                                            );


                                        const colors =
                                            sourceColors[
                                                type
                                            ];


                                        return (

                                            <tr
                                                key={
                                                    item.source
                                                }
                                                className="
                                                    border-t
                                                    border-slate-100
                                                    hover:bg-slate-50/70
                                                    transition
                                                "
                                            >

                                                {/* NUMBER */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        text-xs
                                                        font-black
                                                        text-slate-400
                                                    ">
                                                        {String(
                                                            index +
                                                                1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>

                                                </td>


                                                {/* SOURCE */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    ">

                                                        <div
                                                            className={`
                                                                w-9
                                                                h-9
                                                                rounded-lg
                                                                flex
                                                                items-center
                                                                justify-center
                                                                ${colors.icon}
                                                            `}
                                                        >

                                                            <SourceIcon
                                                                type={
                                                                    type
                                                                }
                                                                size={
                                                                    17
                                                                }
                                                            />

                                                        </div>


                                                        <span className="
                                                            text-sm
                                                            font-bold
                                                            text-slate-700
                                                        ">
                                                            {
                                                                item.source
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* LEADS */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span className="
                                                        text-sm
                                                        font-black
                                                        text-[#102236]
                                                    ">
                                                        {
                                                            item.count
                                                        }
                                                    </span>

                                                </td>


                                                {/* SHARE */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            px-2.5
                                                            py-1
                                                            rounded-lg
                                                            text-xs
                                                            font-bold
                                                            ${colors.badge}
                                                        `}
                                                    >
                                                        {
                                                            percentage
                                                        }
                                                        %
                                                    </span>

                                                </td>


                                                {/* DISTRIBUTION */}

                                                <td className="
                                                    px-5
                                                    py-4
                                                ">

                                                    <div className="
                                                        w-32
                                                        sm:w-48
                                                        h-1.5
                                                        rounded-full
                                                        bg-slate-100
                                                        overflow-hidden
                                                    ">

                                                        <div
                                                            className={`
                                                                h-full
                                                                rounded-full
                                                                ${colors.bar}
                                                            `}
                                                            style={{
                                                                width:
                                                                    `${percentage}%`,
                                                            }}
                                                        />

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

                    <div className="
                        p-10
                        text-center
                    ">

                        <p className="
                            text-sm
                            font-bold
                            text-slate-400
                        ">
                            No source information available.
                        </p>

                    </div>

                )}

            </div>


            {/* =================================================
                TOP SOURCE
                SAME INFORMATION, SMALLER DESIGN
            ================================================= */}

            {highestSource && (

                <div className="
                    bg-[#102236]
                    border
                    border-[#102236]
                    rounded-2xl
                    px-5
                    sm:px-6
                    py-5
                    shadow-[0_8px_25px_rgba(16,34,54,0.10)]
                ">

                    <div className="
                        flex
                        items-center
                        gap-4
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-white/10
                            text-[#F6C945]
                            flex
                            items-center
                            justify-center
                            shrink-0
                        ">

                            <SourceIcon
                                type={getSourceType(
                                    highestSource.source
                                )}
                                size={20}
                            />

                        </div>


                        <div className="min-w-0">

                            <p className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.14em]
                                text-slate-400
                            ">
                                Highest Lead Source
                            </p>


                            <div className="
                                flex
                                flex-wrap
                                items-baseline
                                gap-2
                                mt-0.5
                            ">

                                <h3 className="
                                    text-lg
                                    sm:text-xl
                                    font-black
                                    text-white
                                ">
                                    {
                                        highestSource.source
                                    }
                                </h3>


                                <span className="
                                    text-xs
                                    text-slate-400
                                ">
                                    {
                                        highestSource.count
                                    }{" "}
                                    leads
                                </span>

                            </div>

                        </div>


                        {/* PERCENTAGE */}

                        <div className="
                            ml-auto
                            shrink-0
                            text-right
                        ">

                            <p className="
                                text-lg
                                font-black
                                text-[#F6C945]
                            ">
                                {total > 0
                                    ? (
                                          (
                                              highestSource.count /
                                              total
                                          ) *
                                          100
                                      ).toFixed(
                                          1
                                      )
                                    : "0.0"}
                                %
                            </p>

                            <p className="
                                hidden
                                sm:block
                                text-[9px]
                                uppercase
                                tracking-wider
                                text-slate-500
                            ">
                                Share
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AnalyticsSourceWise;