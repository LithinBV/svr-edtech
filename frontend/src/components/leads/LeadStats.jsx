import React from "react";
import { useNavigate } from "react-router-dom";

const LeadStats = ({
    totalLeads = 0,
    newLeads = 0,
    hotLeads = 0,
    warmLeads = 0,
    coldLeads = 0,
    missedLeads = 0,
}) => {
    const navigate = useNavigate();

    const stats = [
        {
            label: "Total Leads",
            value: totalLeads,
            path: "/all-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm5 0a3 3 0 100-6 3 3 0 000 6z"
                    />
                </svg>
            ),
            accent: "#4F7CFF",
            soft: "bg-blue-50",
            text: "text-blue-600",
        },

        {
            label: "New Leads",
            value: newLeads,
            path: "/new-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14M5 12h14"
                    />
                </svg>
            ),
            accent: "#22C55E",
            soft: "bg-green-50",
            text: "text-green-600",
        },

        {
            label: "Hot Leads",
            value: hotLeads,
            path: "/hot-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3c.5 3-1 4.5-2.5 6C8 10.5 7 12 7 14a5 5 0 0010 0c0-2.5-1.5-4.5-3-6-1 2-2 2.5-2 4 0-1.5-.5-3-1.5-4.5C10 5.5 11 4 12 3z"
                    />
                </svg>
            ),
            accent: "#EF4444",
            soft: "bg-red-50",
            text: "text-red-500",
        },

        {
            label: "Warm Leads",
            value: warmLeads,
            path: "/warm-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v18M5 10l7 7 7-7"
                    />
                </svg>
            ),
            accent: "#F59E0B",
            soft: "bg-amber-50",
            text: "text-amber-600",
        },

        {
            label: "Cold Leads",
            value: coldLeads,
            path: "/cold-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v18M5 8l7 7 7-7"
                    />
                </svg>
            ),
            accent: "#06B6D4",
            soft: "bg-cyan-50",
            text: "text-cyan-600",
        },

        {
            label: "Missed Leads",
            value: missedLeads,
            path: "/missed-leads",
            icon: (
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >
                    <circle cx="12" cy="12" r="9" />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 7v5l3 2"
                    />
                </svg>
            ),
            accent: "#8B5CF6",
            soft: "bg-violet-50",
            text: "text-violet-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
                <button
                    key={stat.label}
                    type="button"
                    onClick={() => navigate(stat.path)}
                    style={{
                        "--card-accent": stat.accent,
                    }}
                    className="
                        group
                        relative
                        min-h-[178px]
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-slate-200
                        bg-white
                        text-left
                        shadow-[0_4px_18px_rgba(15,23,42,0.05)]
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-[#102236]
                        hover:bg-[#102236]
                        hover:shadow-[0_18px_35px_rgba(15,34,54,0.20)]
                        active:scale-[0.98]
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#F6C945]
                        focus:ring-offset-2
                    "
                >
                    {/* Colored top accent */}
                    <div
                        className="
                            absolute
                            left-0
                            right-0
                            top-0
                            h-[4px]
                            transition-all
                            duration-300
                            group-hover:h-[5px]
                        "
                        style={{
                            backgroundColor: stat.accent,
                        }}
                    />

                    {/* Decorative glow */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-8
                            -top-8
                            h-24
                            w-24
                            rounded-full
                            opacity-[0.08]
                            transition-all
                            duration-500
                            group-hover:scale-[1.7]
                            group-hover:opacity-[0.14]
                        "
                        style={{
                            backgroundColor: stat.accent,
                        }}
                    />

                    <div className="relative flex h-full flex-col p-4">
                        {/* Top row */}
                        <div className="flex items-center justify-between">
                            {/* Icon */}
                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${stat.soft}
                                    ${stat.text}
                                    transition-all
                                    duration-300
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                    group-hover:scale-105
                                `}
                            >
                                {stat.icon}
                            </div>

                            {/* Arrow */}
                            <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-slate-100
                                    text-slate-400
                                    transition-all
                                    duration-300
                                    group-hover:bg-white/10
                                    group-hover:text-[#F6C945]
                                "
                            >
                                <svg
                                    className="
                                        h-4
                                        w-4
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Value */}
                        <div className="mt-5">
                            <p
                                className="
                                    text-[30px]
                                    font-black
                                    leading-none
                                    tracking-tight
                                    text-[#102236]
                                    transition-colors
                                    duration-300
                                    group-hover:text-white
                                "
                            >
                                {stat.value}
                            </p>

                            <p
                                className="
                                    mt-2
                                    text-[11px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]
                                    text-slate-500
                                    transition-colors
                                    duration-300
                                    group-hover:text-slate-300
                                "
                            >
                                {stat.label}
                            </p>
                        </div>

                        {/* Bottom */}
                        <div
                            className="
                                mt-auto
                                flex
                                items-center
                                justify-between
                                border-t
                                border-slate-100
                                pt-3
                                transition-colors
                                duration-300
                                group-hover:border-white/10
                            "
                        >
                            <span
                                className="
                                    text-[11px]
                                    font-semibold
                                    text-slate-500
                                    transition-colors
                                    duration-300
                                    group-hover:text-white
                                "
                            >
                                View leads
                            </span>

                            <span
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    font-bold
                                    text-slate-400
                                    transition-all
                                    duration-300
                                    group-hover:text-[#F6C945]
                                "
                            >
                                Open
                                <svg
                                    className="
                                        h-3
                                        w-3
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 12h14M13 6l6 6-6 6"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default LeadStats;