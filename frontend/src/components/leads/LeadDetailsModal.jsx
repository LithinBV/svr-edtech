import React from "react";
import LeadStatusBadge from "./LeadStatusBadge";

const LeadDetailsModal = ({
    lead,
    show,
    onClose,
}) => {
    if (!show || !lead) {
        return null;
    }

    /* =========================================================
       DATE FORMATTERS
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /* =========================================================
       OWNER
    ========================================================= */

    const ownerName =
        lead.leadOwner?.name ||
        lead.leadOwner?.fullName ||
        lead.leadOwner?.email ||
        "Unassigned";

    const ownerEmail =
        lead.leadOwner?.email || "-";

    const ownerRole =
        lead.leadOwner?.role ||
        lead.leadOwner?.userType ||
        "-";

    return (
        <>
            {/* =================================================
                ANIMATION
            ================================================= */}

            <style>
                {`
                    @keyframes leadModalOverlay {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes leadModalEnter {
                        from {
                            opacity: 0;
                            transform: translateY(12px) scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}
            </style>

            {/* =================================================
                OVERLAY
            ================================================= */}

            <div
                className="
                    fixed
                    inset-0
                    z-50
                    flex
                    items-center
                    justify-center
                    bg-[#102236]/60
                    px-4
                    py-6
                    backdrop-blur-[2px]
                    animate-[leadModalOverlay_0.2s_ease-out]
                "
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                {/* =================================================
                    MODAL
                ================================================= */}

                <div
                    className="
                        flex
                        w-full
                        max-w-4xl
                        max-h-[90vh]
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-2xl
                        animate-[leadModalEnter_0.25s_ease-out]
                    "
                >
                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div
                        className="
                            relative
                            shrink-0
                            overflow-hidden
                            bg-[#102236]
                            px-5
                            py-5
                            sm:px-6
                        "
                    >
                        {/* Yellow top accent */}

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                h-1
                                w-full
                                bg-[#F6C945]
                            "
                        />

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                {/* Icon */}

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#F6C945]
                                        text-[#102236]
                                    "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                                        <circle
                                            cx="8.5"
                                            cy="7"
                                            r="4"
                                        />

                                        <path d="M17 11l2 2 4-4" />
                                    </svg>
                                </div>

                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-bold text-white sm:text-xl">
                                        Lead Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                                        View complete information about this lead.
                                    </p>
                                </div>
                            </div>

                            {/* Close */}

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-white/10
                                    text-slate-300
                                    transition
                                    duration-200
                                    hover:border-[#F6C945]/40
                                    hover:bg-white/10
                                    hover:text-[#F6C945]
                                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6l12 12M18 6 6 18"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================= */}

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[#F7F9FC] px-4 py-5 sm:px-6 sm:py-6">

                        {/* =================================================
                            BASIC INFORMATION
                        ================================================= */}

                        <section className="mb-6">
                            <SectionHeader
                                title="Basic Information"
                                description="Personal and academic details"
                            />

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >
                                <InfoItem
                                    label="Name"
                                    value={lead.name}
                                />

                                <InfoItem
                                    label="Email"
                                    value={lead.email}
                                />

                                <InfoItem
                                    label="Contact"
                                    value={lead.contact}
                                />

                                <InfoItem
                                    label="State"
                                    value={lead.state}
                                />

                                <InfoItem
                                    label="District"
                                    value={lead.district}
                                />

                                <InfoItem
                                    label="College"
                                    value={lead.collegeName}
                                />

                                <InfoItem
                                    label="Department"
                                    value={lead.department}
                                />

                                <InfoItem
                                    label="UG Year of Passout"
                                    value={lead.ugYearOfPassout}
                                />

                                <InfoItem
                                    label="PG Year of Passout"
                                    value={
                                        lead.pgYearOfPassout ||
                                        "Not provided"
                                    }
                                />
                            </div>
                        </section>

                        {/* =================================================
                            LEAD INFORMATION
                        ================================================= */}

                        <section className="mb-6">
                            <SectionHeader
                                title="Lead Information"
                                description="Assignment and interest details"
                            />

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >
                                <InfoItem
                                    label="Lead Owner"
                                    value={ownerName}
                                    highlighted
                                />

                                <InfoItem
                                    label="Owner Email"
                                    value={ownerEmail}
                                />

                                <InfoItem
                                    label="Owner Role"
                                    value={ownerRole}
                                />

                                <InfoItem
                                    label="Lead Source"
                                    value={lead.leadSource}
                                />

                                <InfoItem
                                    label="Lead Type"
                                    value={lead.leadType}
                                />

                                <InfoItem
                                    label="Program / Interest"
                                    value={lead.programInterest}
                                />
                            </div>
                        </section>

                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <section className="mb-6">
                            <SectionHeader
                                title="Lead Status"
                                description="Current lead pipeline status"
                            />

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-4
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >
                                <div>
                                    <p className="text-sm font-semibold text-[#102236]">
                                        Current Status
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        This is the current stage of the lead.
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <LeadStatusBadge
                                        status={lead.status}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            DATES
                        ================================================= */}

                        <section>
                            <SectionHeader
                                title="Activity"
                                description="Lead creation and update information"
                            />

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    sm:grid-cols-2
                                "
                            >
                                <InfoItem
                                    label="Created"
                                    value={formatDateTime(
                                        lead.createdAt
                                    )}
                                />

                                <InfoItem
                                    label="Last Updated"
                                    value={formatDateTime(
                                        lead.updatedAt
                                    )}
                                />
                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                        className="
                            flex
                            shrink-0
                            items-center
                            justify-end
                            border-t
                            border-slate-200
                            bg-white
                            px-4
                            py-4
                            sm:px-6
                        "
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-lg
                                bg-[#102236]
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                duration-200
                                hover:bg-[#1A344D]
                                active:scale-[0.98]
                            "
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

/* =============================================================
   SECTION HEADER
============================================================= */

const SectionHeader = ({
    title,
    description,
}) => {
    return (
        <div className="mb-4 flex items-start gap-3">
            <div
                className="
                    mt-0.5
                    h-8
                    w-1
                    shrink-0
                    rounded-full
                    bg-[#F6C945]
                "
            />

            <div>
                <h3 className="text-base font-bold text-[#102236] sm:text-lg">
                    {title}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

/* =============================================================
   INFO ITEM
============================================================= */

const InfoItem = ({
    label,
    value,
    highlighted = false,
}) => {
    const displayValue =
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
            ? value
            : "-";

    return (
        <div
            className={`
                group
                rounded-xl
                border
                px-4
                py-3
                transition-all
                duration-200

                ${
                    highlighted
                        ? "border-[#F6C945]/60 bg-[#FFFBEA] hover:border-[#F6C945]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                }
            `}
        >
            <p
                className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                "
            >
                {label}
            </p>

            <p
                className={`
                    mt-1.5
                    break-words
                    text-sm
                    font-semibold
                    ${
                        highlighted
                            ? "text-[#102236]"
                            : "text-slate-700"
                    }
                `}
            >
                {displayValue}
            </p>
        </div>
    );
};

export default LeadDetailsModal;