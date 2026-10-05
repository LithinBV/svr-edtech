import React from "react";

const LeadStatusBadge = ({ status, temperature }) => {
    const normalizedStatus = String(status || "")
        .trim()
        .toUpperCase()
        .replace(/_/g, "-");

    const normalizedTemperature = String(temperature || "")
        .trim()
        .toUpperCase();

    let leadTemperature = "";

    if (["HOT", "WARM", "COLD"].includes(normalizedTemperature)) {
        leadTemperature = normalizedTemperature;
    } else if (["HOT", "WARM", "COLD"].includes(normalizedStatus)) {
        leadTemperature = normalizedStatus;
    }

    const temperatureStyles = {
        HOT: {
            label: "Hot",
            className: "bg-red-50 text-red-700 ring-red-200",
        },
        WARM: {
            label: "Warm",
            className: "bg-amber-50 text-amber-700 ring-amber-200",
        },
        COLD: {
            label: "Cold",
            className: "bg-blue-50 text-blue-700 ring-blue-200",
        },
    };

    const statusStyles = {
        NEW: {
            label: "New",
            className: "bg-slate-50 text-slate-700 ring-slate-200",
        },
        CONVERTED: {
            label: "Converted",
            className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        },
        LOST: {
            label: "Lost",
            className: "bg-slate-100 text-slate-600 ring-slate-200",
        },
        "FOLLOW-UP": {
            label: "Follow-up",
            className: "bg-purple-50 text-purple-700 ring-purple-200",
        },
        CONNECTED: {
            label: "Connected",
            className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
        },
        "CONTACT ATTEMPTED": {
            label: "Contact Attempted",
            className: "bg-violet-50 text-violet-700 ring-violet-200",
        },
        INTERESTED: {
            label: "Interested",
            className: "bg-cyan-50 text-cyan-700 ring-cyan-200",
        },
    };

    const style =
        temperatureStyles[leadTemperature] ||
        statusStyles[normalizedStatus] || {
            label: status || "New",
            className: "bg-slate-50 text-slate-600 ring-slate-200",
        };

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-xs
                font-bold
                ring-1
                ring-inset
                ${style.className}
            `}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {style.label}
        </span>
    );
};

export default LeadStatusBadge;