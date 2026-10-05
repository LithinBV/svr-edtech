import React, { useMemo } from "react";

/* =========================================================
   PROGRAM ICON
========================================================= */

const ProgramIcon = ({ type }) => {
    const icons = {
        fullstack: (
            <>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </>
        ),

        analysis: (
            <>
                <line x1="4" y1="19" x2="4" y2="5" />
                <line x1="4" y1="19" x2="20" y2="19" />
                <rect x="7" y="12" width="3" height="5" />
                <rect x="12" y="9" width="3" height="8" />
                <rect x="17" y="6" width="3" height="11" />
            </>
        ),

        dataScience: (
            <>
                <circle cx="12" cy="12" r="3" />
                <circle cx="5" cy="7" r="2" />
                <circle cx="19" cy="7" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />

                <line x1="7" y1="8" x2="10" y2="10" />
                <line x1="17" y1="8" x2="14" y2="10" />
                <line x1="8" y1="17" x2="10" y2="14" />
                <line x1="16" y1="17" x2="14" y2="14" />
            </>
        ),

        hr: (
            <>
                <circle cx="12" cy="8" r="3" />
                <path d="M5 21a7 7 0 0 1 14 0" />
            </>
        ),

        dm: (
            <>
                <path d="M4 5h16v14H4z" />
                <path d="M8 9h8" />
                <path d="M8 13h5" />
                <path d="M8 17h3" />
            </>
        ),
    };

    return (
        <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {icons[type] || icons.analysis}
        </svg>
    );
};


/* =========================================================
   PROGRAM TYPE
========================================================= */

const getProgramType = (program = "") => {
    const value = program.toLowerCase();

    if (value.includes("full")) return "fullstack";
    if (value.includes("analysis")) return "analysis";
    if (value.includes("science")) return "dataScience";
    if (value === "hr") return "hr";
    if (value === "dm") return "dm";

    return "analysis";
};


/* =========================================================
   PROGRAM COLORS
========================================================= */

const colors = {
    fullstack: {
        icon: "bg-blue-50 text-blue-600",
        bar: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
    },

    analysis: {
        icon: "bg-emerald-50 text-emerald-600",
        bar: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
    },

    dataScience: {
        icon: "bg-violet-50 text-violet-600",
        bar: "bg-violet-500",
        badge: "bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
    },

    hr: {
        icon: "bg-amber-50 text-amber-600",
        bar: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
    },

    dm: {
        icon: "bg-rose-50 text-rose-600",
        bar: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700",
        dot: "bg-rose-500",
    },
};


/* =========================================================
   ANIMATED SUMMARY CARD
========================================================= */

const SummaryCard = ({
    label,
    value,
    description,
    icon,
    accent = "blue",
}) => {
    const accentMap = {
        blue: {
            line: "bg-blue-500",
            icon: "bg-blue-50 text-blue-600",
            value: "text-[#102236]",
        },

        yellow: {
            line: "bg-[#F6C945]",
            icon: "bg-yellow-50 text-yellow-600",
            value: "text-[#102236]",
        },

        violet: {
            line: "bg-violet-500",
            icon: "bg-violet-50 text-violet-600",
            value: "text-[#102236]",
        },
    };

    const theme = accentMap[accent] || accentMap.blue;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div
                className={`absolute left-0 top-0 h-1 w-full ${theme.line} transition-all duration-500 group-hover:h-1.5`}
            />

            <div className="p-5">
                <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {label}
                        </p>

                        <p
                            className={`mt-2 text-3xl font-black ${theme.value} transition-transform duration-300 group-hover:scale-105 origin-left`}
                        >
                            {value}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {description}
                        </p>
                    </div>

                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.icon} transition-all duration-300 group-hover:rotate-3 group-hover:scale-110`}
                    >
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};


/* =========================================================
   IT / NON-IT CARD
========================================================= */

const CategoryCard = ({
    title,
    value,
    description,
    percentage,
    type,
}) => {
    const isIT = type === "IT";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

            {/* Top accent */}
            <div
                className={`absolute left-0 top-0 h-1 w-full transition-all duration-500 group-hover:h-1.5 ${
                    isIT ? "bg-[#F6C945]" : "bg-violet-500"
                }`}
            />

            <div className="p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            {title}
                        </p>

                        <p className="mt-2 text-4xl font-black text-[#102236] transition-transform duration-300 group-hover:scale-105 origin-left">
                            {value}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            {description}
                        </p>
                    </div>

                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                            isIT
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-violet-50 text-violet-600"
                        }`}
                    >
                        <ProgramIcon
                            type={isIT ? "fullstack" : "hr"}
                        />
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isIT
                                    ? "bg-[#F6C945]"
                                    : "bg-violet-500"
                            }`}
                            style={{
                                width: `${percentage}%`,
                            }}
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                            Share of total
                        </span>

                        <span
                            className={`text-xs font-black ${
                                isIT
                                    ? "text-yellow-600"
                                    : "text-violet-600"
                            }`}
                        >
                            {percentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const AnalyticsProgramWise = ({ data = [] }) => {

    const safeData = Array.isArray(data) ? data : [];


    /* =====================================================
       NORMALIZE DATA
    ===================================================== */

    const normalizedData = useMemo(() => {
        return safeData
            .map((item) => ({
                program:
                    item.program ||
                    item.programInterest ||
                    item.name ||
                    "Unknown",

                count:
                    Number(
                        item.count ??
                        item.total ??
                        item.value ??
                        0
                    ) || 0,

                type:
                    item.leadType ||
                    item.type ||
                    null,
            }))
            .sort((a, b) => b.count - a.count);
    }, [safeData]);


    /* =====================================================
       TOTAL
    ===================================================== */

    const total = useMemo(() => {
        return normalizedData.reduce(
            (sum, item) => sum + item.count,
            0
        );
    }, [normalizedData]);


    /* =====================================================
       IT TOTAL
    ===================================================== */

    const itTotal = useMemo(() => {
        return normalizedData
            .filter(
                (item) =>
                    item.type?.toUpperCase() === "IT"
            )
            .reduce(
                (sum, item) => sum + item.count,
                0
            );
    }, [normalizedData]);


    /* =====================================================
       NON IT TOTAL
    ===================================================== */

    const nonItTotal = useMemo(() => {
        return normalizedData
            .filter(
                (item) =>
                    item.type?.toUpperCase() === "NON-IT"
            )
            .reduce(
                (sum, item) => sum + item.count,
                0
            );
    }, [normalizedData]);


    /* =====================================================
       TOP PROGRAM
    ===================================================== */

    const highestProgram =
        normalizedData.length > 0
            ? normalizedData[0]
            : null;


    /* =====================================================
       MAX PROGRAM VALUE
    ===================================================== */

    const maxValue = Math.max(
        ...normalizedData.map(
            (item) => item.count
        ),
        1
    );


    const itPercentage =
        total > 0
            ? (itTotal / total) * 100
            : 0;

    const nonItPercentage =
        total > 0
            ? (nonItTotal / total) * 100
            : 0;


    return (
        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-1">

                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#F6C945]" />

                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#102236]">
                        Program Wise Analytics
                    </p>
                </div>

                <h2 className="mt-1 text-2xl font-black text-[#102236] sm:text-3xl">
                    Program Interest
                </h2>

                <p className="text-sm text-slate-500">
                    Understand which programs are attracting the most leads.
                </p>
            </div>


            {/* =================================================
                IT / NON IT
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                <CategoryCard
                    title="IT Leads"
                    value={itTotal}
                    description="Full Stack, Data Analysis & Data Science"
                    percentage={itPercentage}
                    type="IT"
                />

                <CategoryCard
                    title="Non-IT Leads"
                    value={nonItTotal}
                    description="HR & DM programs"
                    percentage={nonItPercentage}
                    type="NON-IT"
                />

            </div>


            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <SummaryCard
                    label="Total Program Leads"
                    value={total}
                    description="Across all programs"
                    accent="blue"
                    icon={
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
                            <path d="M4 19V5" />
                            <path d="M4 19h16" />
                            <rect x="7" y="11" width="3" height="5" />
                            <rect x="12" y="8" width="3" height="8" />
                            <rect x="17" y="5" width="3" height="11" />
                        </svg>
                    }
                />

                <SummaryCard
                    label="Programs"
                    value={normalizedData.length}
                    description="Programs with lead data"
                    accent="yellow"
                    icon={
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
                            <circle cx="12" cy="12" r="3" />
                            <circle cx="5" cy="7" r="2" />
                            <circle cx="19" cy="7" r="2" />
                            <line x1="7" y1="8" x2="10" y2="10" />
                            <line x1="17" y1="8" x2="14" y2="10" />
                        </svg>
                    }
                />

                <SummaryCard
                    label="Top Program"
                    value={
                        highestProgram?.program ||
                        "No data"
                    }
                    description={`${highestProgram?.count || 0} leads`}
                    accent="violet"
                    icon={
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
                            <path d="M12 2l2.8 6.2L21 9l-4.5 4.4L17.5 20 12 17l-5.5 3 1-6.6L3 9l6.2-.8L12 2z" />
                        </svg>
                    }
                />

            </div>


            {/* =================================================
                PROGRAM PERFORMANCE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Header */}
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <div className="flex items-center justify-between gap-4">

                        <div>
                            <h3 className="text-lg font-black text-[#102236]">
                                Program Performance
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Lead distribution across programs.
                            </p>
                        </div>

                        <div className="hidden items-center gap-2 rounded-full bg-[#102236] px-3 py-1.5 sm:flex">
                            <span className="h-2 w-2 rounded-full bg-[#F6C945]" />

                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                                {total} Leads
                            </span>
                        </div>

                    </div>

                </div>


                {/* Graph */}
                <div className="p-5 sm:p-6">

                    {normalizedData.length === 0 ? (

                        <div className="flex h-64 flex-col items-center justify-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <ProgramIcon type="analysis" />
                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-600">
                                No program data available
                            </p>

                            <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                                Program-wise lead data will appear here once available.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {normalizedData.map(
                                (item, index) => {

                                    const type =
                                        getProgramType(
                                            item.program
                                        );

                                    const color =
                                        colors[type];

                                    const percentage =
                                        total > 0
                                            ? (
                                                (item.count /
                                                    total) *
                                                100
                                            ).toFixed(1)
                                            : "0.0";

                                    const width =
                                        (item.count /
                                            maxValue) *
                                        100;

                                    return (
                                        <div
                                            key={`${item.program}-${index}`}
                                            className="group"
                                        >

                                            {/* Program heading */}
                                            <div className="mb-2 flex items-center gap-3">

                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${color.icon}`}
                                                >
                                                    <ProgramIcon
                                                        type={type}
                                                    />
                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <div className="flex items-center justify-between gap-3">

                                                        <div className="flex min-w-0 items-center gap-2">

                                                            <span className="truncate text-sm font-bold text-slate-800">
                                                                {item.program}
                                                            </span>

                                                            {index === 0 && (
                                                                <span className="hidden shrink-0 rounded-full bg-yellow-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-yellow-700 sm:inline-flex">
                                                                    Top
                                                                </span>
                                                            )}

                                                        </div>

                                                        <div className="flex shrink-0 items-center gap-2">

                                                            <span className="text-sm font-black text-[#102236]">
                                                                {item.count}
                                                            </span>

                                                            <span className="hidden text-[11px] text-slate-400 sm:inline">
                                                                ({percentage}%)
                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* Bar */}
                                                    <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-slate-100">

                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${color.bar}`}
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />

                                                        {/* Yellow highlight */}
                                                        {index === 0 && (
                                                            <div
                                                                className="absolute left-0 top-0 h-full rounded-full bg-[#F6C945]/20"
                                                                style={{
                                                                    width: `${width}%`,
                                                                }}
                                                            />
                                                        )}

                                                    </div>


                                                    <div className="mt-1 flex justify-end">
                                                        <span className="text-[10px] text-slate-400">
                                                            {percentage}% of leads
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
                PROGRAM BREAKDOWN TABLE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                    <div className="flex items-center justify-between gap-3">

                        <div>
                            <h3 className="text-lg font-black text-[#102236]">
                                Program Breakdown
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Detailed program-wise lead distribution.
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M8 6h13" />
                                <path d="M8 12h13" />
                                <path d="M8 18h13" />
                                <path d="M3 6h.01" />
                                <path d="M3 12h.01" />
                                <path d="M3 18h.01" />
                            </svg>

                        </div>

                    </div>

                </div>


                {normalizedData.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[650px]">

                            <thead>
                                <tr className="bg-[#102236]">

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        #
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        Program
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        Type
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        Leads
                                    </th>

                                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                        Share
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {normalizedData.map(
                                    (item, index) => {

                                        const percentage =
                                            total > 0
                                                ? (
                                                    (item.count /
                                                        total) *
                                                    100
                                                ).toFixed(1)
                                                : "0.0";

                                        const type =
                                            getProgramType(
                                                item.program
                                            );

                                        const color =
                                            colors[type];

                                        return (
                                            <tr
                                                key={`${item.program}-${index}`}
                                                className="group border-t border-slate-100 transition-colors duration-200 hover:bg-yellow-50/40"
                                            >

                                                <td className="px-5 py-4">

                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-400 transition-colors group-hover:bg-[#102236] group-hover:text-[#F6C945]">
                                                        {index + 1}
                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <span
                                                            className={`h-2 w-2 rounded-full ${color.dot}`}
                                                        />

                                                        <span className="text-sm font-bold text-slate-700">
                                                            {item.program}
                                                        </span>

                                                    </div>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                                            item.type?.toUpperCase() === "IT"
                                                                ? "bg-blue-50 text-blue-700"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        {item.type || "—"}
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <span className="text-sm font-black text-[#102236]">
                                                        {item.count}
                                                    </span>

                                                </td>


                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">

                                                            <div
                                                                className={`h-full rounded-full ${color.bar}`}
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                }}
                                                            />

                                                        </div>

                                                        <span className="text-xs font-bold text-slate-500">
                                                            {percentage}%
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

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <ProgramIcon type="analysis" />
                        </div>

                        <p className="mt-3 text-sm font-bold text-slate-500">
                            No program information available.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
};


export default AnalyticsProgramWise;