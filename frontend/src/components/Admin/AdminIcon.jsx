import React from "react";

const AdminIcon = ({ type, className = "h-5 w-5" }) => {
    const commonProps = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        xmlns: "http://www.w3.org/2000/svg",
    };

    switch (type) {
        case "dashboard":
            return (
                <svg {...commonProps}>
                    <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        strokeWidth="1.8"
                    />
                    <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        strokeWidth="1.8"
                    />
                    <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                        strokeWidth="1.8"
                    />
                    <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                        strokeWidth="1.8"
                    />
                </svg>
            );

        case "leads":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1"
                    />
                    <circle
                        cx="10"
                        cy="7"
                        r="4"
                        strokeWidth="1.8"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M17 8v6m3-3h-6"
                    />
                </svg>
            );

        case "users":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                    />
                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                        strokeWidth="1.8"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    />
                </svg>
            );

        case "clock":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        strokeWidth="1.8"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M12 7v5l3 2"
                    />
                </svg>
            );

        case "analytics":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M4 19V5"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M4 19h16"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M8 16v-4"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M12 16V8"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M16 16V5"
                    />
                </svg>
            );

        case "settings":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="12"
                        r="3"
                        strokeWidth="1.8"
                    />

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06-1.4 1.4-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21h-2v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06-1.4-1.4.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.51-1H7v-2h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06 1.4-1.4.06.06A1.65 1.65 0 0012 8.6V8h2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06 1.4 1.4-.06.06A1.65 1.65 0 0019.4 15z"
                    />
                </svg>
            );

        case "profile":
            return (
                <svg {...commonProps}>
                    <circle
                        cx="12"
                        cy="7"
                        r="4"
                        strokeWidth="1.8"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M4 21a8 8 0 0116 0"
                    />
                </svg>
            );

        case "logout":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M10 17l5-5-5-5"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M15 12H3"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M21 19V5a2 2 0 00-2-2h-7"
                    />
                </svg>
            );

        case "close":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            );

        case "arrow":
            return (
                <svg {...commonProps}>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 18l6-6-6-6"
                    />
                </svg>
            );

        default:
            return null;
    }
};

export default AdminIcon;