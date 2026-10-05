import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import LeadStats from "./LeadStats";
import LeadFilters from "./LeadFilters";
import LeadTable from "./LeadTable";

const LeadPageLayout = ({
    title = "Leads",
    description = "",
    leads = [],
    statsLeads,
    loading = false,
    error = "",

    search = "",
    statusFilter = "ALL",

    ownerFilter = "ALL",
    teamFilter = "ALL",

    owners = [],
    teams = [],

    onSearchChange,
    onStatusChange,
    onOwnerChange,
    onTeamChange,

    onRefresh,
    onViewLead,

    showStats = true,
    headerAction = null,

    showStatusFilter = false,
    showOwnerFilter = true,
    showTeamFilter = true,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const safeLeads = Array.isArray(leads) ? leads : [];

    const safeStatsLeads = Array.isArray(statsLeads)
        ? statsLeads
        : safeLeads;

    const getStatus = (lead) => {
        return String(lead?.status || "")
            .trim()
            .toUpperCase()
            .replace(/_/g, "-");
    };

    const getTemperature = (lead) => {
        const possibleValues = [
            lead?.temperature,
            lead?.leadTemperature,
            lead?.priority,
        ];

        for (const value of possibleValues) {
            const normalized = String(value || "")
                .trim()
                .toUpperCase();

            if (["HOT", "WARM", "COLD"].includes(normalized)) {
                return normalized;
            }
        }

        const status = getStatus(lead);

        if (["HOT", "WARM", "COLD"].includes(status)) {
            return status;
        }

        return "";
    };

    const getFollowUpStatus = (lead) => {
        return String(
            lead?.followUpStatus ||
                lead?.followupStatus ||
                ""
        )
            .trim()
            .toUpperCase()
            .replace(/_/g, "-");
    };

    const totalLeads = safeStatsLeads.length;

    const newLeads = safeStatsLeads.filter(
        (lead) => getStatus(lead) === "NEW"
    ).length;

    const hotLeads = safeStatsLeads.filter(
        (lead) => getTemperature(lead) === "HOT"
    ).length;

    const warmLeads = safeStatsLeads.filter(
        (lead) => getTemperature(lead) === "WARM"
    ).length;

    const coldLeads = safeStatsLeads.filter(
        (lead) => getTemperature(lead) === "COLD"
    ).length;

    const missedLeads = safeStatsLeads.filter(
        (lead) => getFollowUpStatus(lead) === "MISSED"
    ).length;

    const handleBack = () => {
        if (location.pathname !== "/all-leads") {
            navigate("/all-leads");
            return;
        }

        navigate("/admin-dashboard");
    };

    return (
        <div className="min-h-[calc(100vh-70px)] bg-[#f3f6fb]">
            <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">

                {/* PAGE HEADER */}

                <div className="mb-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-500
                                        transition
                                        hover:border-[#F6C945]
                                        hover:bg-[#102236]
                                        hover:text-[#F6C945]
                                    "
                                    title="Back"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-[#102236]">
                                        {title}
                                    </h1>

                                    {description && (
                                        <p className="mt-1 text-sm text-slate-500">
                                            {description}
                                        </p>
                                    )}
                                </div>

                            </div>
                        </div>

                        {headerAction && (
                            <div>
                                {headerAction}
                            </div>
                        )}

                    </div>
                </div>

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                        <p className="text-sm font-semibold text-red-700">
                            Something went wrong
                        </p>

                        <p className="mt-1 text-sm text-red-600">
                            {error}
                        </p>
                    </div>
                )}

                {/* STATS */}

                {showStats && (
                    <div className="mb-6">
                        <LeadStats
                            totalLeads={totalLeads}
                            newLeads={newLeads}
                            hotLeads={hotLeads}
                            warmLeads={warmLeads}
                            coldLeads={coldLeads}
                            missedLeads={missedLeads}
                        />
                    </div>
                )}

                {/* FILTERS */}

                <div className="mb-5">
                    <LeadFilters
                        search={search}
                        statusFilter={statusFilter}
                        ownerFilter={ownerFilter}
                        teamFilter={teamFilter}
                        owners={Array.isArray(owners) ? owners : []}
                        teams={Array.isArray(teams) ? teams : []}
                        onSearchChange={onSearchChange}
                        onStatusChange={onStatusChange}
                        onOwnerChange={onOwnerChange}
                        onTeamChange={onTeamChange}
                        onRefresh={onRefresh}
                        loading={loading}
                        showStatusFilter={showStatusFilter}
                        showOwnerFilter={showOwnerFilter}
                        showTeamFilter={showTeamFilter}
                    />
                </div>

                {/* LEAD LIST HEADER */}

                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[#102236]">
                            Lead List
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500">
                            {loading
                                ? "Loading leads..."
                                : `${safeLeads.length} ${
                                      safeLeads.length === 1
                                          ? "lead"
                                          : "leads"
                                  } found`}
                        </p>
                    </div>

                    {!loading && safeLeads.length > 0 && (
                        <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                            {safeLeads.length} Records
                        </div>
                    )}
                </div>

                {/* TABLE */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <LeadTable
                        leads={safeLeads}
                        loading={loading}
                        onViewLead={onViewLead}
                    />
                </div>

            </main>
        </div>
    );
};

export default LeadPageLayout;