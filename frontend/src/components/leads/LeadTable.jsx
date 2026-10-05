import React from "react";

// ============================================================
// STATUS LABEL
// ============================================================

const getStatusLabel = (status) => {
    const normalized = String(status || "NEW").toUpperCase();

    switch (normalized) {
        case "NEW":
            return "New";

        case "COLD":
            return "Cold";

        case "WARM":
            return "Warm";

        case "HOT":
            return "Hot";

        default:
            return normalized
                ? normalized
                      .toLowerCase()
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                      )
                : "New";
    }
};

// ============================================================
// STATUS STYLE
// ============================================================

const getStatusClasses = (status) => {
    const normalized = String(status || "NEW").toUpperCase();

    switch (normalized) {
       case "NEW":
    return "bg-sky-50 text-sky-600 ring-sky-200";

        case "COLD":
            return "bg-slate-100 text-slate-700 ring-slate-200";

        case "WARM":
            return "bg-amber-50 text-amber-700 ring-amber-200";

        case "HOT":
            return "bg-red-50 text-red-700 ring-red-200";

        default:
            return "bg-slate-100 text-slate-600 ring-slate-200";
    }
};

// ============================================================
// DATE VALIDATION
// ============================================================

const isValidDate = (value) => {
    if (!value) {
        return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
};

// ============================================================
// CHECK IF DATE IS TODAY
// ============================================================

const isToday = (value) => {
    if (!isValidDate(value)) {
        return false;
    }

    const date = new Date(value);
    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
    );
};

// ============================================================
// NEW FOLLOW-UP CHECK
// ============================================================

const hasNewFollowUp = (lead) => {
    if (lead?.followUpCompleted !== true) {
        return false;
    }

    if (!isValidDate(lead?.followUpCompletedAt)) {
        return false;
    }

    if (!isValidDate(lead?.followUpAt)) {
        return false;
    }

    return (
        new Date(lead.followUpAt).getTime() >
        new Date(lead.followUpCompletedAt).getTime()
    );
};

// ============================================================
// COMPLETED TODAY + NEW FOLLOW-UP
// ============================================================

const isCompletedTodayWithNewFollowUp = (lead) => {
    if (!lead) {
        return false;
    }

    if (lead?.followUpCompleted !== true) {
        return false;
    }

    if (!isValidDate(lead?.followUpCompletedAt)) {
        return false;
    }

    if (!isValidDate(lead?.followUpAt)) {
        return false;
    }

    if (!hasNewFollowUp(lead)) {
        return false;
    }

    return isToday(lead.followUpCompletedAt);
};

// ============================================================
// ACTIVE FOLLOW-UP CHECK
// ============================================================

const isActiveFollowUp = (lead) => {
    if (!isValidDate(lead?.followUpAt)) {
        return false;
    }

    if (lead?.followUpCompleted !== true) {
        return true;
    }

    return hasNewFollowUp(lead);
};

// ============================================================
// FOLLOW-UP STATUS
// ============================================================

const getFollowUpStatus = (lead) => {
    if (!lead) {
        return "NONE";
    }

    if (isCompletedTodayWithNewFollowUp(lead)) {
        return "COMPLETED";
    }

    if (
        lead.followUpCompleted === true &&
        !hasNewFollowUp(lead)
    ) {
        return "COMPLETED";
    }

    const latestRemark = String(
        lead.latestRemark || ""
    ).toUpperCase();

    const closedOutcomes = [
        "ENROLLED",
        "NOT_INTERESTED",
    ];

    if (closedOutcomes.includes(latestRemark)) {
        return "COMPLETED";
    }

    if (!isActiveFollowUp(lead)) {
        return "NONE";
    }

    const followUpDate = new Date(
        lead.followUpAt
    );

    if (Number.isNaN(followUpDate.getTime())) {
        return "NONE";
    }

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(
        startOfToday
    );

    startOfTomorrow.setDate(
        startOfTomorrow.getDate() + 1
    );

    if (followUpDate >= startOfTomorrow) {
        return "UPCOMING";
    }

    if (
        followUpDate >= startOfToday &&
        followUpDate <= now
    ) {
        return "MISSED";
    }

    if (
        followUpDate >= startOfToday &&
        followUpDate < startOfTomorrow
    ) {
        return "TODAY";
    }

    return "MISSED";
};

// ============================================================
// FOLLOW-UP LABEL
// ============================================================

const getFollowUpLabel = (status) => {
    switch (status) {
        case "UPCOMING":
            return "Upcoming";

        case "TODAY":
            return "Today";

        case "MISSED":
            return "Missed";

        case "COMPLETED":
            return "Completed";

        default:
            return "No Follow-up";
    }
};

// ============================================================
// FOLLOW-UP STYLE
// ============================================================

const getFollowUpClasses = (status) => {
    switch (status) {
        case "UPCOMING":
            return "bg-blue-50 text-blue-700 ring-blue-200";

        case "TODAY":
            return "bg-[#F6C945]/20 text-[#8a6b00] ring-[#F6C945]/40";

        case "MISSED":
            return "bg-red-50 text-red-700 ring-red-200";

        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700 ring-emerald-200";

        default:
            return "bg-slate-100 text-slate-500 ring-slate-200";
    }
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    try {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

// ============================================================
// FORMAT FOLLOW-UP DATE + TIME
// ============================================================

const formatFollowUpDateTime = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    try {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return "-";
    }
};

// ============================================================
// GET LEAD ID
// ============================================================

const getLeadId = (lead) => {
    return (
        lead?._id ||
        lead?.id ||
        lead?.leadId ||
        ""
    );
};

// ============================================================
// GET LEAD OWNER
// ============================================================

const getLeadOwner = (lead) => {
    if (!lead?.leadOwner) {
        return "-";
    }

    if (typeof lead.leadOwner === "string") {
        return lead.leadOwner;
    }

    return (
        lead.leadOwner?.name ||
        lead.leadOwner?.email ||
        "-"
    );
};

// ============================================================
// LEAD TABLE
// ============================================================

const LeadTable = ({
    leads = [],
    loading = false,
    onViewLead,
}) => {
    // ========================================================
    // OPEN LEAD
    // ========================================================

    const handleLeadClick = (lead) => {
        if (!lead) {
            return;
        }

        if (typeof onViewLead === "function") {
            onViewLead(lead);
        }
    };

    // ========================================================
    // TABLE HEADER
    // ========================================================

    const tableHeader = (
        <thead>
            <tr className="border-b border-[#F6C945]/30 bg-[#102236]">
                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Name
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Contact
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Program
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Owner
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Lead Status
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Follow-up
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Next Follow-up
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                    Created
                </th>
            </tr>
        </thead>
    );

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="w-full overflow-x-auto">
                <table className="min-w-[1150px] w-full">
                    {tableHeader}

                    <tbody>
                        {[1, 2, 3, 4, 5].map((item) => (
                            <tr
                                key={item}
                                className="border-b border-slate-100"
                            >
                                <td className="px-5 py-5">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-7 w-16 animate-pulse rounded-lg bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // ========================================================
    // EMPTY STATE
    // ========================================================

    if (!Array.isArray(leads) || leads.length === 0) {
        return (
            <div className="flex min-h-[320px] items-center justify-center px-6">
                <div className="text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102236] text-[#F6C945] shadow-sm">
                        <svg
                            className="h-7 w-7"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 20h5v-2a4 4 0 00-4-4h-1m-4 6H6a4 4 0 01-4-4v-1a4 4 0 014-4h8a4 4 0 014 4v1a4 4 0 01-4 4zM8 7a3 3 0 100-6 3 3 0 000 6zm8 1a3 3 0 100-6 3 3 0 000 6z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-base font-bold text-[#102236]">
                        No leads found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        There are no leads to display.
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================
    // MAIN TABLE
    // ========================================================

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-[1150px] w-full border-collapse">
                {tableHeader}

                <tbody className="divide-y divide-slate-100 bg-white">
                    {leads.map((lead, index) => {
                        const leadId = getLeadId(lead);

                        // =================================================
                        // LEAD STATUS
                        // =================================================

                        const status = String(
                            lead?.status || "NEW"
                        ).toUpperCase();

                        const statusLabel =
                            getStatusLabel(status);

                        const statusClasses =
                            getStatusClasses(status);

                        // =================================================
                        // FOLLOW-UP STATUS
                        // =================================================

                        const followUpStatus =
                            getFollowUpStatus(lead);

                        const followUpLabel =
                            getFollowUpLabel(
                                followUpStatus
                            );

                        const followUpClasses =
                            getFollowUpClasses(
                                followUpStatus
                            );

                        // =================================================
                        // LEAD DATA
                        // =================================================

                        const name =
                            lead?.name ||
                            "Unnamed Lead";

                        const contact =
                            lead?.contact ||
                            lead?.phone ||
                            "-";

                        const email =
                            lead?.email || "";

                        const program =
                            lead?.programInterest ||
                            "-";

                        const owner =
                            getLeadOwner(lead);

                        const createdAt =
                            lead?.createdAt ||
                            lead?.created ||
                            lead?.date;

                        // =================================================
                        // FOLLOW-UP
                        // =================================================

                        const followUpAt =
                            lead?.followUpAt || null;

                        const newFollowUpExists =
                            hasNewFollowUp(lead);

                        const completedAt =
                            lead?.followUpCompletedAt ||
                            null;

                        const showCompletedDate =
                            isCompletedTodayWithNewFollowUp(
                                lead
                            );

                        return (
                            <tr
                                key={
                                    leadId ||
                                    `${name}-${index}`
                                }
                                className="group transition-colors duration-200 hover:bg-slate-50"
                            >
                                {/* =================================================
                                    NAME
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleLeadClick(
                                                lead
                                            )
                                        }
                                        className="text-left"
                                        aria-label={`Open ${name}`}
                                    >
                                        <div className="font-bold text-[#102236] transition-colors group-hover:text-[#8a6b00]">
                                            {name}
                                        </div>

                                        {email && (
                                            <div className="mt-1 max-w-[240px] truncate text-[11px] text-slate-400">
                                                {email}
                                            </div>
                                        )}
                                    </button>
                                </td>

                                {/* =================================================
                                    CONTACT
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <div className="text-sm font-medium text-slate-700">
                                        {contact}
                                    </div>
                                </td>

                                {/* =================================================
                                    PROGRAM
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <div className="max-w-[180px] truncate text-sm font-medium text-slate-700">
                                        {program}
                                    </div>
                                </td>

                                {/* =================================================
                                    OWNER
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <div className="max-w-[160px] truncate text-sm font-medium text-slate-600">
                                        {owner}
                                    </div>
                                </td>

                                {/* =================================================
                                    LEAD STATUS
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            px-2.5
                                            py-1.5
                                            text-[11px]
                                            font-bold
                                            ring-1
                                            ring-inset
                                            ${statusClasses}
                                        `}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                        {statusLabel}
                                    </span>
                                </td>

                                {/* =================================================
                                    FOLLOW-UP STATUS
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            px-2.5
                                            py-1.5
                                            text-[11px]
                                            font-bold
                                            ring-1
                                            ring-inset
                                            ${followUpClasses}
                                        `}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                        {followUpLabel}
                                    </span>
                                </td>

                                {/* =================================================
                                    NEXT FOLLOW-UP
                                ================================================= */}

                                <td className="px-5 py-4">
                                    {followUpStatus ===
                                        "COMPLETED" &&
                                    completedAt &&
                                    (
                                        showCompletedDate ||
                                        !newFollowUpExists
                                    ) ? (
                                        <div>
                                            <div className="text-sm font-bold text-emerald-600">
                                                Completed
                                            </div>

                                            <div className="mt-1 text-[11px] text-slate-400">
                                                {formatFollowUpDateTime(
                                                    completedAt
                                                )}
                                            </div>
                                        </div>
                                    ) : followUpAt ? (
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">
                                                {formatFollowUpDateTime(
                                                    followUpAt
                                                )}
                                            </div>

                                            {newFollowUpExists && (
                                                <div className="mt-1 inline-flex rounded-md bg-[#102236]/5 px-2 py-0.5 text-[10px] font-bold text-[#102236]">
                                                    New follow-up
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm font-medium text-slate-400">
                                            No follow-up
                                        </div>
                                    )}
                                </td>

                                {/* =================================================
                                    CREATED
                                ================================================= */}

                                <td className="px-5 py-4">
                                    <div className="text-sm font-medium text-slate-500">
                                        {formatDate(
                                            createdAt
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default LeadTable;