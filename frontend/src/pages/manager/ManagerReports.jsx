import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const MANAGER_TEAM_ENDPOINT = `${API_URL}/api/manager/leads/executives`;
const MANAGER_LEADS_ENDPOINT = `${API_URL}/api/manager/leads`;
const MANAGER_FOLLOWUPS_ENDPOINT = `${API_URL}/api/manager/leads/follow-ups`;

function getStoredToken() {
    return (
        localStorage.getItem("managerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken")
    );
}

function getInitials(name = "Manager") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "M";

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function normalizeStatus(value) {
    return String(value || "NEW").toUpperCase();
}

function getOwnerId(lead) {
    return (
        lead?.leadOwner?._id ||
        lead?.leadOwner?.id ||
        lead?.leadOwner ||
        null
    );
}

function getOwnerName(lead) {
    return (
        lead?.leadOwner?.name ||
        lead?.owner?.name ||
        lead?.ownerName ||
        "Unassigned"
    );
}

function getSource(lead) {
    return lead?.leadSource || lead?.source || "Unknown";
}

function getProgram(lead) {
    return (
        lead?.programInterest ||
        lead?.program ||
        lead?.course ||
        "Unknown"
    );
}

function getRemark(lead) {
    return String(
        lead?.latestRemark ||
        lead?.remarks ||
        ""
    )
        .trim()
        .toUpperCase();
}

function getFollowUpStatus(record) {
    const status = String(
        record?.followUpStatus ||
        record?.statusFollowUp ||
        ""
    ).toUpperCase();

    if (status === "OVERDUE") return "MISSED";

    if (
        ["COMPLETED", "TODAY", "UPCOMING", "MISSED"].includes(
            status
        )
    ) {
        return status;
    }

    return "";
}

function isTrue(value) {
    return value === true || value === "true";
}

function getFollowUpDate(record) {
    const value =
        record?.displayFollowUpAt ||
        record?.followUpAt ||
        record?.followUpDate ||
        record?.followupAt ||
        record?.nextFollowUpAt;

    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function getCompletedDate(record) {
    if (!record?.followUpCompletedAt) {
        return null;
    }

    const date = new Date(
        record.followUpCompletedAt
    );

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

/*
 * The manager follow-up endpoint is the source for the
 * backend status. This fallback only handles records that
 * are intentionally excluded by the backend.
 *
 * IMPORTANT:
 * - A future follow-up after a completion is UPCOMING.
 * - A follow-up on today's calendar date is TODAY even if
 *   its time has already passed.
 * - Only dates before today are MISSED.
 */
function deriveFollowUpStatus(record) {
    const backendStatus =
        getFollowUpStatus(record);

    if (backendStatus === "COMPLETED") {
        const followUpDate =
            getFollowUpDate(record);

        const completedAt =
            getCompletedDate(record);

        // A newer follow-up replaces the old completion.
        if (
            isTrue(record?.followUpCompleted) &&
            followUpDate &&
            completedAt &&
            followUpDate > completedAt
        ) {
            // Continue below and classify the new date.
        } else {
            return "COMPLETED";
        }
    }

    const followUpDate =
        getFollowUpDate(record);

    if (!followUpDate) {
        return isTrue(record?.followUpCompleted)
            ? "COMPLETED"
            : "";
    }

    const completedAt =
        getCompletedDate(record);

    // Completed current follow-up + a newer follow-up:
    // the newer date is the active follow-up.
    if (
        isTrue(record?.followUpCompleted) &&
        completedAt &&
        followUpDate <= completedAt
    ) {
        return "COMPLETED";
    }

    // Use calendar-day boundaries, not current time.
    const now = new Date();

    const startOfToday =
        new Date(now);

    startOfToday.setHours(
        0,
        0,
        0,
        0
    );

    const startOfTomorrow =
        new Date(startOfToday);

    startOfTomorrow.setDate(
        startOfTomorrow.getDate() + 1
    );

    if (
        followUpDate >= startOfToday &&
        followUpDate < startOfTomorrow
    ) {
        return "TODAY";
    }

    if (followUpDate >= startOfTomorrow) {
        return "UPCOMING";
    }

    return "MISSED";
}

function Icon({
    type,
    className = "h-5 w-5"
}) {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    const paths = {
        users: (
            <>
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
            </>
        ),

        team: (
            <>
                <circle cx="12" cy="7" r="3" />
                <path d="M5 21a7 7 0 0114 0" />
                <path d="M18 4.5a3 3 0 010 5.8" />
                <path d="M21 18a5 5 0 00-2.4-4.3" />
            </>
        ),

        leads: (
            <>
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="16"
                    rx="2"
                />
                <path d="M7 8h10M7 12h10M7 16h6" />
            </>
        ),

        chart: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="M7 15l3-4 3 2 5-7" />
            </>
        ),

        check: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12l2.5 2.5L16 9" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        fire: (
            <>
                <path d="M12 3s4 4 4 8a4 4 0 01-8 0c0-2 1-4 2-6" />
                <path d="M12 13c1 1 1.5 2 1.5 3a1.5 1.5 0 01-3 0c0-1 .5-2 1.5-3z" />
            </>
        ),

        refresh: (
            <>
                <path d="M20 11a8 8 0 00-14.9-3" />
                <path d="M4 4v4h4" />
                <path d="M4 13a8 8 0 0014.9 3" />
                <path d="M20 20v-4h-4" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
            </>
        ),

        mail: (
            <>
                <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                />
                <path d="M3 7l9 6 9-6" />
            </>
        ),

        calendar: (
            <>
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </>
        ),

        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0116 0" />
            </>
        ),

        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
            </>
        ),
    };

    return (
        <svg {...common}>
            {paths[type] || (
                <circle cx="12" cy="12" r="9" />
            )}
        </svg>
    );
}

function Card({
    children,
    className = ""
}) {
    return (
        <div
            className={`rounded-3xl border border-slate-200/80 bg-white shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
    tone = "blue"
}) {
    const tones = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        rose: "bg-rose-50 text-rose-600 border-rose-100",
        slate: "bg-slate-50 text-slate-600 border-slate-200",
    };

    return (
        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
                className={`absolute inset-x-0 top-0 h-1 ${
                    tones[tone]
                        .split(" ")[0]
                        .replace("bg-", "bg-")
                }`}
            />

            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tones[tone]}`}
                >
                    <Icon
                        type={icon}
                        className="h-6 w-6"
                    />
                </div>
            </div>
        </Card>
    );
}

function Section({
    title,
    subtitle,
    icon,
    right,
    children
}) {
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Icon
                                type={icon}
                                className="h-5 w-5"
                            />
                        </div>
                    )}

                    <div>
                        <h2 className="text-base font-black text-slate-900">
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-1 text-xs font-medium text-slate-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {right}
            </div>

            <div className="p-5 sm:p-6">
                {children}
            </div>
        </Card>
    );
}

function Badge({
    children,
    tone = "slate"
}) {
    const styles = {
        blue: "bg-blue-50 text-blue-700 ring-blue-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        orange: "bg-orange-50 text-orange-700 ring-orange-100",
        red: "bg-red-50 text-red-700 ring-red-100",
        violet: "bg-violet-50 text-violet-700 ring-violet-100",
        slate: "bg-slate-100 text-slate-600 ring-slate-200",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${styles[tone]}`}
        >
            {children}
        </span>
    );
}

function FollowUpBadge({ status }) {
    const map = {
        COMPLETED: ["emerald", "Completed"],
        TODAY: ["blue", "Today"],
        UPCOMING: ["violet", "Upcoming"],
        MISSED: ["red", "Missed"],
        OVERDUE: ["red", "Missed"],
    };

    const [tone, label] =
        map[status] || [
            "slate",
            "No follow-up"
        ];

    return (
        <Badge tone={tone}>
            {label}
        </Badge>
    );
}

function Progress({
    value,
    color = "bg-blue-500"
}) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{
                    width: `${Math.max(
                        0,
                        Math.min(100, value)
                    )}%`,
                }}
            />
        </div>
    );
}

function Empty({ text }) {
    return (
        <div className="flex min-h-[150px] items-center justify-center text-center">
            <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                    <Icon type="chart" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-400">
                    {text}
                </p>
            </div>
        </div>
    );
}

function ManagerReports() {
    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [leads, setLeads] =
        useState([]);

    const [followUps, setFollowUps] =
        useState([]);

    const [teamData, setTeamData] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [followUpFilter, setFollowUpFilter] =
        useState("ALL");

    const fetchReports = async (
        refresh = false
    ) => {
        try {
            refresh
                ? setRefreshing(true)
                : setLoading(true);

            setError("");

            const token =
                getStoredToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please login again."
                );
            }

            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            };

            const [
                leadsResponse,
                followUpsResponse,
                teamResponse,
            ] = await Promise.allSettled([
                fetch(
                    MANAGER_LEADS_ENDPOINT,
                    { headers }
                ),

                fetch(
                    MANAGER_FOLLOWUPS_ENDPOINT,
                    { headers }
                ),

                fetch(
                    MANAGER_TEAM_ENDPOINT,
                    { headers }
                ),
            ]);

            if (
                leadsResponse.status !==
                "fulfilled"
            ) {
                throw new Error(
                    "Unable to connect to manager leads API."
                );
            }

            const leadsJson =
                await leadsResponse.value.json();

            if (!leadsResponse.value.ok) {
                throw new Error(
                    leadsJson?.message ||
                        "Failed to fetch manager leads."
                );
            }

            const receivedLeads =
                Array.isArray(leadsJson)
                    ? leadsJson
                    : leadsJson?.leads ||
                      leadsJson?.data ||
                      leadsJson?.results ||
                      [];

            setLeads(
                Array.isArray(receivedLeads)
                    ? receivedLeads
                    : []
            );

            if (
                followUpsResponse.status ===
                "fulfilled"
            ) {
                const json =
                    await followUpsResponse.value.json();

                if (
                    followUpsResponse.value.ok
                ) {
                    setFollowUps(
                        Array.isArray(
                            json?.followUps
                        )
                            ? json.followUps
                            : []
                    );
                }
            }

            if (
                teamResponse.status ===
                "fulfilled"
            ) {
                const json =
                    await teamResponse.value.json();

                if (
                    teamResponse.value.ok &&
                    json?.success !== false
                ) {
                    setTeamData(json);
                }
            }
        } catch (err) {
            console.error(
                "Manager report fetch error:",
                err
            );

            setError(
                err?.message ||
                    "Unable to load manager report."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports(false);
    }, []);

    const manager =
        teamData || {};

    /*
     * IMPORTANT:
     * /api/manager/leads/executives returns:
     *
     * {
     *   success: true,
     *   managerId: "...",
     *   team: {
     *      id: "...",
     *      name: "..."
     *   },
     *   count: 2,
     *   executives: [...]
     * }
     *
     * Therefore Executive Performance must use
     * teamData.executives.
     */
    const executives =
        Array.isArray(
            teamData?.executives
        )
            ? teamData.executives
            : [];

    const managerName =
        manager?.name ||
        manager?.manager?.name ||
        "Manager";

    const managerEmail =
        manager?.email ||
        manager?.manager?.email ||
        "Manager account";

    const teamName =
        manager?.team?.name ||
        (typeof manager?.team ===
        "string"
            ? manager.team
            : "Manager Team");

    /*
     * Backend sources used by this report:
     *
     * 1. /api/manager/leads/executives
     *    -> executives assigned to the logged-in manager
     *
     * 2. /api/manager/leads
     *    -> all leads visible to this manager:
     *       unassigned + manager-owned + executive-owned
     *
     * 3. /api/manager/leads/follow-ups
     *    -> manager + executive follow-ups with backend
     *       followUpStatus and displayFollowUpAt
     */

    const followUpByLeadId =
        useMemo(() => {
            const map =
                new Map();

            followUps.forEach(
                (item) => {
                    const id =
                        String(
                            item?.leadId ||
                                item?._id ||
                                item?.id ||
                                ""
                        );

                    if (id) {
                        map.set(
                            id,
                            item
                        );
                    }
                }
            );

            return map;
        }, [followUps]);

    /*
     * Build ONE authoritative report record per lead.
     */
    const reportFollowUpRecords =
        useMemo(() => {
            return leads
                .map((lead) => {
                    const id =
                        String(
                            lead?._id ||
                                lead?.id ||
                                ""
                        );

                    const backendRecord =
                        followUpByLeadId.get(
                            id
                        );

                    if (
                        backendRecord
                    ) {
                        return {
                            ...lead,
                            ...backendRecord,
                            _reportLeadId:
                                id,
                            _reportStatus:
                                deriveFollowUpStatus(
                                    backendRecord
                                ),
                        };
                    }

                    /*
                     * No backend follow-up record.
                     *
                     * Only include the lead if its own lead
                     * data proves that it has/had a follow-up.
                     */
                    if (
                        !lead?.followUpAt &&
                        !lead?.followUpCompletedAt &&
                        !isTrue(
                            lead?.followUpCompleted
                        )
                    ) {
                        return null;
                    }

                    return {
                        ...lead,
                        _reportLeadId:
                            id,
                        _reportStatus:
                            deriveFollowUpStatus(
                                lead
                            ),
                        displayFollowUpAt:
                            lead?.followUpAt ||
                            lead?.followUpCompletedAt ||
                            null,
                    };
                })
                .filter(
                    (record) =>
                        record &&
                        record._reportStatus
                );
        }, [
            leads,
            followUpByLeadId,
        ]);

    const getReportFollowUpStatus =
        (lead) => {
            const id =
                String(
                    lead?._id ||
                        lead?.id ||
                        ""
                );

            const record =
                reportFollowUpRecords.find(
                    (item) =>
                        String(
                            item?._reportLeadId
                        ) === id
                );

            return (
                record?._reportStatus ||
                deriveFollowUpStatus(
                    lead
                ) ||
                ""
            );
        };

    const filteredLeads =
        useMemo(() => {
            const q =
                search
                    .trim()
                    .toLowerCase();

            return leads.filter(
                (lead) => {
                    const matchesSearch =
                        !q ||
                        [
                            lead?.name,
                            lead?.email,
                            lead?.contact,
                            getOwnerName(
                                lead
                            ),
                            getSource(lead),
                            getProgram(
                                lead
                            ),
                        ]
                            .filter(Boolean)
                            .some(
                                (value) =>
                                    String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            q
                                        )
                            );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        normalizeStatus(
                            lead?.status
                        ) ===
                            statusFilter;

                    const matchesFollowUp =
                        followUpFilter ===
                            "ALL" ||
                        getReportFollowUpStatus(
                            lead
                        ) ===
                            followUpFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesFollowUp
                    );
                }
            );
        }, [
            leads,
            search,
            statusFilter,
            followUpFilter,
            reportFollowUpRecords,
        ]);

    function isEnrolledLead(
        lead
    ) {
        return (
            getRemark(lead) ===
                "ENROLLED" ||
            normalizeStatus(
                lead?.status
            ) === "ENROLLED"
        );
    }

    const report =
        useMemo(() => {
            const total =
                leads.length;

            const newLeads =
                leads.filter(
                    (lead) =>
                        normalizeStatus(
                            lead?.status
                        ) === "NEW"
                ).length;

            const hot =
                leads.filter(
                    (lead) =>
                        normalizeStatus(
                            lead?.status
                        ) === "HOT"
                ).length;

            const warm =
                leads.filter(
                    (lead) =>
                        normalizeStatus(
                            lead?.status
                        ) === "WARM"
                ).length;

            const cold =
                leads.filter(
                    (lead) =>
                        normalizeStatus(
                            lead?.status
                        ) === "COLD"
                ).length;

            const enrolled =
                leads.filter(
                    isEnrolledLead
                ).length;

            const completed =
                reportFollowUpRecords.filter(
                    (record) =>
                        record._reportStatus ===
                        "COMPLETED"
                ).length;

            const today =
                reportFollowUpRecords.filter(
                    (record) =>
                        record._reportStatus ===
                        "TODAY"
                ).length;

            const upcoming =
                reportFollowUpRecords.filter(
                    (record) =>
                        record._reportStatus ===
                        "UPCOMING"
                ).length;

            const missed =
                reportFollowUpRecords.filter(
                    (record) =>
                        record._reportStatus ===
                        "MISSED"
                ).length;

            /*
             * Upcoming is NOT due.
             *
             * completed 1 + today 3 + missed 0
             * = 4 due
             *
             * completion = 1 / 4 = 25%
             */
            const due =
                completed +
                today +
                missed;

            const completionRate =
                due > 0
                    ? Math.round(
                          (completed /
                              due) *
                              100
                      )
                    : 0;

            const conversionRate =
                total > 0
                    ? Math.round(
                          (enrolled /
                              total) *
                              100
                      )
                    : 0;

            return {
                total,
                newLeads,
                hot,
                warm,
                cold,
                enrolled,
                completed,
                today,
                upcoming,
                missed,
                due,
                completionRate,
                conversionRate,
            };
        }, [
            leads,
            reportFollowUpRecords,
        ]);

    const executiveReport =
        useMemo(() => {
            return executives.map(
                (executive) => {
                    const id =
                        String(
                            executive?._id ||
                                executive?.id ||
                                executive?.userId ||
                                ""
                        );

                    const ownLeads =
                        leads.filter(
                            (lead) =>
                                String(
                                    getOwnerId(
                                        lead
                                    ) || ""
                                ) === id
                        );

                    const ownFollowUps =
                        reportFollowUpRecords.filter(
                            (record) =>
                                String(
                                    getOwnerId(
                                        record
                                    ) || ""
                                ) === id
                        );

                    const completed =
                        ownFollowUps.filter(
                            (record) =>
                                record._reportStatus ===
                                "COMPLETED"
                        ).length;

                    const today =
                        ownFollowUps.filter(
                            (record) =>
                                record._reportStatus ===
                                "TODAY"
                        ).length;

                    const upcoming =
                        ownFollowUps.filter(
                            (record) =>
                                record._reportStatus ===
                                "UPCOMING"
                        ).length;

                    const missed =
                        ownFollowUps.filter(
                            (record) =>
                                record._reportStatus ===
                                "MISSED"
                        ).length;

                    const due =
                        completed +
                        today +
                        missed;

                    const completionRate =
                        due > 0
                            ? Math.round(
                                  (completed /
                                      due) *
                                      100
                              )
                            : 0;

                    const enrolled =
                        ownLeads.filter(
                            isEnrolledLead
                        ).length;

                    const hot =
                        ownLeads.filter(
                            (lead) =>
                                normalizeStatus(
                                    lead?.status
                                ) ===
                                "HOT"
                        ).length;

                    const warm =
                        ownLeads.filter(
                            (lead) =>
                                normalizeStatus(
                                    lead?.status
                                ) ===
                                "WARM"
                        ).length;

                    const cold =
                        ownLeads.filter(
                            (lead) =>
                                normalizeStatus(
                                    lead?.status
                                ) ===
                                "COLD"
                        ).length;

                    const newLeads =
                        ownLeads.filter(
                            (lead) =>
                                normalizeStatus(
                                    lead?.status
                                ) ===
                                "NEW"
                        ).length;

                    return {
                        ...executive,
                        id,
                        total:
                            ownLeads.length,
                        enrolled,
                        completed,
                        today,
                        upcoming,
                        missed,
                        due,
                        completionRate,
                        hot,
                        warm,
                        cold,
                        newLeads,
                    };
                }
            );
        }, [
            executives,
            leads,
            reportFollowUpRecords,
        ]);

    const sourceReport =
        useMemo(() => {
            const map =
                new Map();

            leads.forEach(
                (lead) => {
                    const source =
                        getSource(
                            lead
                        );

                    map.set(
                        source,
                        (map.get(
                            source
                        ) || 0) + 1
                    );
                }
            );

            return Array.from(
                map.entries()
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 10);
        }, [leads]);

    const programReport =
        useMemo(() => {
            const map =
                new Map();

            leads.forEach(
                (lead) => {
                    const program =
                        getProgram(
                            lead
                        );

                    map.set(
                        program,
                        (map.get(
                            program
                        ) || 0) + 1
                    );
                }
            );

            return Array.from(
                map.entries()
            )
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 10);
        }, [leads]);

    const recentLeads =
        useMemo(() => {
            return filteredLeads
                .slice()
                .sort(
                    (a, b) => {
                        const da =
                            new Date(
                                a?.createdAt ||
                                    0
                            ).getTime();

                        const db =
                            new Date(
                                b?.createdAt ||
                                    0
                            ).getTime();

                        return db - da;
                    }
                )
                .slice(0, 50);
        }, [
            filteredLeads,
        ]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] p-3 sm:p-5 lg:p-7">
                <div className="mx-auto max-w-7xl space-y-5">
                    <div className="h-56 rounded-[2rem] bg-slate-200 animate-pulse" />

                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                        {[1, 2, 3, 4, 5].map(
                            (i) => (
                                <div
                                    key={i}
                                    className="h-32 rounded-3xl bg-slate-200 animate-pulse"
                                />
                            )
                        )}
                    </div>

                    <div className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] p-3 sm:p-5 lg:p-7">
            <div className="mx-auto max-w-7xl space-y-5">

                {/* HEADER */}
                <div className="relative overflow-hidden rounded-[2rem] bg-[#00323F] p-6 text-white shadow-xl sm:p-8">

                    <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

                    <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-black ring-1 ring-white/20 backdrop-blur">
                                {getInitials(
                                    managerName
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
                                    Manager Report
                                </p>

                                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                                    {managerName}
                                </h1>

                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-blue-100">

                                    <span className="flex items-center gap-1.5">
                                        <Icon
                                            type="mail"
                                            className="h-3.5 w-3.5"
                                        />
                                        {managerEmail}
                                    </span>

                                    <span className="flex items-center gap-1.5">
                                        <Icon
                                            type="team"
                                            className="h-3.5 w-3.5"
                                        />
                                        {teamName}
                                    </span>

                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() =>
                                fetchReports(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
                        >
                            <Icon
                                type="refresh"
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh report"}
                        </button>
                    </div>

                    <div className="relative mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                                Team
                            </p>

                            <p className="mt-1 text-xl font-black">
                                {teamData?.count ??
                                    executives.length}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                                Active
                            </p>

                            <p className="mt-1 text-xl font-black text-emerald-300">
                                {executives.filter(
                                    (executive) =>
                                        String(
                                            executive?.activityStatus ||
                                                executive?.status ||
                                                ""
                                        ).toUpperCase() ===
                                        "ACTIVE"
                                ).length}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                                Leads
                            </p>

                            <p className="mt-1 text-xl font-black">
                                {report.total}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                                Conversion
                            </p>

                            <p className="mt-1 text-xl font-black text-emerald-300">
                                {report.conversionRate}%
                            </p>
                        </div>

                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {/* STAT CARDS */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

                    <StatCard
                        title="Total Leads"
                        value={
                            report.total
                        }
                        subtitle="Manager + team"
                        icon="leads"
                        tone="blue"
                    />

                    <StatCard
                        title="New Leads"
                        value={
                            report.newLeads
                        }
                        subtitle="Fresh pipeline"
                        icon="leads"
                        tone="violet"
                    />

                    <StatCard
                        title="Hot Leads"
                        value={
                            report.hot
                        }
                        subtitle="High priority"
                        icon="fire"
                        tone="rose"
                    />

                    <StatCard
                        title="Enrolled"
                        value={
                            report.enrolled
                        }
                        subtitle="Converted leads"
                        icon="check"
                        tone="emerald"
                    />

                    <StatCard
                        title="Follow-up Rate"
                        value={`${report.completionRate}%`}
                        subtitle={`${report.completed} completed / ${report.due} due`}
                        icon="chart"
                        tone="orange"
                    />

                </div>

                {/* LEAD PIPELINE */}
                <Section
                    title="Lead Pipeline"
                    subtitle="Current lead distribution from the manager API"
                    icon="chart"
                >
                    <div className="grid gap-5 lg:grid-cols-4">

                        {[
                            [
                                "NEW",
                                report.newLeads,
                                "bg-blue-500",
                            ],
                            [
                                "HOT",
                                report.hot,
                                "bg-red-500",
                            ],
                            [
                                "WARM",
                                report.warm,
                                "bg-orange-500",
                            ],
                            [
                                "COLD",
                                report.cold,
                                "bg-slate-500",
                            ],
                        ].map(
                            ([
                                label,
                                count,
                                color,
                            ]) => {
                                const pct =
                                    report.total
                                        ? Math.round(
                                              (count /
                                                  report.total) *
                                                  100
                                          )
                                        : 0;

                                return (
                                    <div
                                        key={
                                            label
                                        }
                                        className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-500">
                                                {
                                                    label
                                                }
                                            </span>

                                            <span className="text-sm font-black text-slate-900">
                                                {
                                                    count
                                                }
                                            </span>
                                        </div>

                                        <div className="mt-3">
                                            <Progress
                                                value={
                                                    pct
                                                }
                                                color={
                                                    color
                                                }
                                            />
                                        </div>

                                        <p className="mt-2 text-[11px] font-semibold text-slate-400">
                                            {
                                                pct
                                            }
                                            % of all leads
                                        </p>
                                    </div>
                                );
                            }
                        )}

                    </div>
                </Section>

                {/* FOLLOW-UP + TEAM */}
                <div className="grid gap-5 lg:grid-cols-2">

                    <Section
                        title="Follow-up Performance"
                        subtitle="Status is taken from the manager follow-up API"
                        icon="calendar"
                    >
                        <div className="grid grid-cols-2 gap-3">

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                                    Today
                                </p>

                                <p className="mt-1 text-2xl font-black text-blue-700">
                                    {
                                        report.today
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-violet-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                                    Upcoming
                                </p>

                                <p className="mt-1 text-2xl font-black text-violet-700">
                                    {
                                        report.upcoming
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                                    Completed
                                </p>

                                <p className="mt-1 text-2xl font-black text-emerald-700">
                                    {
                                        report.completed
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-red-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                                    Missed
                                </p>

                                <p className="mt-1 text-2xl font-black text-red-700">
                                    {
                                        report.missed
                                    }
                                </p>
                            </div>

                        </div>

                        <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-blue-50 p-5">

                            <div className="flex items-end justify-between">

                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                                        Completion rate
                                    </p>

                                    <p className="mt-1 text-3xl font-black text-slate-900">
                                        {
                                            report.completionRate
                                        }%
                                    </p>
                                </div>

                                <p className="text-xs font-bold text-slate-400">
                                    Completed / due
                                </p>

                            </div>

                            <div className="mt-4">
                                <Progress
                                    value={
                                        report.completionRate
                                    }
                                    color="bg-emerald-500"
                                />
                            </div>

                            <p className="mt-2 text-[11px] font-semibold text-slate-400">
                                Upcoming follow-ups are excluded from the percentage.
                            </p>

                        </div>
                    </Section>

                    <Section
                        title="Team Activity"
                        subtitle="Executive account and activity information"
                        icon="users"
                    >
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Members
                                </p>

                                <p className="mt-1 text-2xl font-black">
                                    {teamData?.count ??
                                        executives.length}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-emerald-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                                    Active
                                </p>

                                <p className="mt-1 text-2xl font-black text-emerald-700">
                                    {
                                        executives.filter(
                                            (executive) =>
                                                String(
                                                    executive?.activityStatus ||
                                                        executive?.status ||
                                                        ""
                                                ).toUpperCase() ===
                                                "ACTIVE"
                                        ).length
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-red-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                                    Inactive
                                </p>

                                <p className="mt-1 text-2xl font-black text-red-700">
                                    {
                                        executives.filter(
                                            (executive) =>
                                                String(
                                                    executive?.activityStatus ||
                                                        executive?.status ||
                                                        ""
                                                ).toUpperCase() !==
                                                "ACTIVE"
                                        ).length
                                    }
                                </p>
                            </div>

                            <div className="rounded-2xl bg-blue-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                                    Team leads
                                </p>

                                <p className="mt-1 text-2xl font-black text-blue-700">
                                    {
                                        report.total
                                    }
                                </p>
                            </div>

                        </div>
                    </Section>

                </div>

                {/* EXECUTIVE PERFORMANCE */}
                <Section
                    title="Executive Performance"
                    subtitle="Lead ownership and results for every executive returned by the manager API"
                    icon="team"
                >

                    {executiveReport.length === 0 ? (
                        <Empty text="No executives found in this manager team." />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {executiveReport.map(
                                (ex) => (
                                    <div
                                        key={String(
                                            ex._id ||
                                                ex.id
                                        )}
                                        className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                                    >

                                        <div className="flex items-center justify-between gap-3">

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-black text-white">
                                                    {getInitials(
                                                        ex.name
                                                    )}
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-black text-slate-900">
                                                        {ex.name ||
                                                            "Executive"}
                                                    </p>

                                                    <p className="truncate text-[11px] font-medium text-slate-400">
                                                        {ex.email ||
                                                            "-"}
                                                    </p>

                                                </div>

                                            </div>

                                            <Badge
                                                tone={
                                                    String(
                                                        ex.activityStatus ||
                                                            ex.status
                                                    ).toUpperCase() ===
                                                    "ACTIVE"
                                                        ? "emerald"
                                                        : "slate"
                                                }
                                            >
                                                {ex.activityStatus ||
                                                    ex.status ||
                                                    "-"}
                                            </Badge>

                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">

                                            <div className="rounded-xl bg-white p-3">
                                                <p className="text-[9px] font-black uppercase text-slate-400">
                                                    Leads
                                                </p>

                                                <p className="mt-1 text-lg font-black">
                                                    {
                                                        ex.total
                                                    }
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-white p-3">
                                                <p className="text-[9px] font-black uppercase text-slate-400">
                                                    Enrolled
                                                </p>

                                                <p className="mt-1 text-lg font-black text-emerald-600">
                                                    {
                                                        ex.enrolled
                                                    }
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-white p-3">
                                                <p className="text-[9px] font-black uppercase text-slate-400">
                                                    Completed
                                                </p>

                                                <p className="mt-1 text-lg font-black text-emerald-600">
                                                    {
                                                        ex.completed
                                                    }
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-white p-3">
                                                <p className="text-[9px] font-black uppercase text-slate-400">
                                                    Rate
                                                </p>

                                                <p className="mt-1 text-lg font-black text-blue-600">
                                                    {
                                                        ex.completionRate
                                                    }%
                                                </p>
                                            </div>

                                        </div>

                                        <div className="mt-4">

                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>
                                                    Follow-up completion
                                                </span>

                                                <span>
                                                    {
                                                        ex.completionRate
                                                    }%
                                                </span>
                                            </div>

                                            <div className="mt-2">
                                                <Progress
                                                    value={
                                                        ex.completionRate
                                                    }
                                                    color="bg-blue-500"
                                                />
                                            </div>

                                        </div>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </Section>

                {/* SOURCE + PROGRAM */}
                <div className="grid gap-5 lg:grid-cols-2">

                    <Section
                        title="Lead Sources"
                        subtitle="Where the manager's leads came from"
                        icon="chart"
                    >
                        {sourceReport.length ? (
                            <div className="space-y-4">

                                {sourceReport.map(
                                    ([
                                        name,
                                        count,
                                    ]) => {
                                        const pct =
                                            report.total
                                                ? Math.round(
                                                      (count /
                                                          report.total) *
                                                          100
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                key={
                                                    name
                                                }
                                            >

                                                <div className="mb-2 flex justify-between">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {
                                                            name
                                                        }
                                                    </span>

                                                    <span className="text-xs font-black text-slate-400">
                                                        {
                                                            count
                                                        }{" "}
                                                        ·{" "}
                                                        {
                                                            pct
                                                        }%
                                                    </span>
                                                </div>

                                                <Progress
                                                    value={
                                                        pct
                                                    }
                                                    color="bg-violet-500"
                                                />

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        ) : (
                            <Empty text="No source data available." />
                        )}
                    </Section>

                    <Section
                        title="Program Interest"
                        subtitle="Distribution of requested programs"
                        icon="leads"
                    >
                        {programReport.length ? (
                            <div className="space-y-4">

                                {programReport.map(
                                    ([
                                        name,
                                        count,
                                    ]) => {
                                        const pct =
                                            report.total
                                                ? Math.round(
                                                      (count /
                                                          report.total) *
                                                          100
                                                  )
                                                : 0;

                                        return (
                                            <div
                                                key={
                                                    name
                                                }
                                            >

                                                <div className="mb-2 flex justify-between">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {
                                                            name
                                                        }
                                                    </span>

                                                    <span className="text-xs font-black text-slate-400">
                                                        {
                                                            count
                                                        }{" "}
                                                        ·{" "}
                                                        {
                                                            pct
                                                        }%
                                                    </span>
                                                </div>

                                                <Progress
                                                    value={
                                                        pct
                                                    }
                                                    color="bg-blue-500"
                                                />

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        ) : (
                            <Empty text="No program data available." />
                        )}
                    </Section>

                </div>

                {/* LEAD REGISTER */}
                <Section
                    title="Report Lead Register"
                    subtitle="Search and inspect the lead data used in this report"
                    icon="leads"
                    right={
                        <div className="flex flex-col gap-2 sm:flex-row">

                            <div className="relative">

                                <Icon
                                    type="search"
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={
                                        search
                                    }
                                    onChange={(e) =>
                                        setSearch(
                                            e.target
                                                .value
                                        )
                                    }
                                    placeholder="Search leads..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 sm:w-52"
                                />

                            </div>

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target
                                            .value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none"
                            >
                                <option value="ALL">
                                    All status
                                </option>

                                <option value="NEW">
                                    New
                                </option>

                                <option value="HOT">
                                    Hot
                                </option>

                                <option value="WARM">
                                    Warm
                                </option>

                                <option value="COLD">
                                    Cold
                                </option>
                            </select>

                            <select
                                value={
                                    followUpFilter
                                }
                                onChange={(e) =>
                                    setFollowUpFilter(
                                        e.target
                                            .value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none"
                            >
                                <option value="ALL">
                                    All follow-ups
                                </option>

                                <option value="TODAY">
                                    Today
                                </option>

                                <option value="UPCOMING">
                                    Upcoming
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="MISSED">
                                    Missed
                                </option>
                            </select>

                        </div>
                    }
                >

                    {recentLeads.length ===
                    0 ? (
                        <Empty text="No leads match the selected filters." />
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="min-w-[900px] w-full">

                                <thead>
                                    <tr className="border-b border-slate-100 text-left">

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Lead
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Owner
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Status
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Program
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Follow-up
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Created
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {recentLeads.map(
                                        (lead) => (
                                            <tr
                                                key={String(
                                                    lead._id ||
                                                        lead.id
                                                )}
                                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                                            >

                                                <td className="px-3 py-4">

                                                    <p className="text-sm font-black text-slate-900">
                                                        {lead.name ||
                                                            "Unnamed"}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        {lead.email ||
                                                            lead.contact ||
                                                            "-"}
                                                    </p>

                                                </td>

                                                <td className="px-3 py-4 text-sm font-semibold text-slate-600">
                                                    {getOwnerName(
                                                        lead
                                                    )}
                                                </td>

                                                <td className="px-3 py-4">

                                                    <Badge
                                                        tone={
                                                            normalizeStatus(
                                                                lead.status
                                                            ) ===
                                                            "HOT"
                                                                ? "red"
                                                                : normalizeStatus(
                                                                      lead.status
                                                                  ) ===
                                                                  "WARM"
                                                                ? "orange"
                                                                : normalizeStatus(
                                                                      lead.status
                                                                  ) ===
                                                                  "COLD"
                                                                ? "slate"
                                                                : "blue"
                                                        }
                                                    >
                                                        {normalizeStatus(
                                                            lead.status
                                                        )}
                                                    </Badge>

                                                </td>

                                                <td className="px-3 py-4 text-sm font-semibold text-slate-600">
                                                    {getProgram(
                                                        lead
                                                    )}
                                                </td>

                                                <td className="px-3 py-4">

                                                    <div className="flex flex-col items-start gap-1">

                                                        <FollowUpBadge
                                                            status={getReportFollowUpStatus(
                                                                lead
                                                            )}
                                                        />

                                                        <span className="text-[10px] font-medium text-slate-400">
                                                            {formatDateTime(
                                                                reportFollowUpRecords.find(
                                                                    (
                                                                        item
                                                                    ) =>
                                                                        String(
                                                                            item?._reportLeadId
                                                                        ) ===
                                                                        String(
                                                                            lead?._id ||
                                                                                lead?.id
                                                                        )
                                                                )
                                                                    ?.displayFollowUpAt ||
                                                                    lead?.followUpAt ||
                                                                    lead?.followUpCompletedAt
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>

                                                <td className="px-3 py-4 text-xs font-semibold text-slate-500">
                                                    {formatDate(
                                                        lead.createdAt
                                                    )}
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>
                            </table>

                        </div>
                    )}

                </Section>

                {/* FOLLOW-UP REGISTER */}
                <Section
                    title="Follow-up Register"
                    subtitle="Manager + executive follow-ups used by the report"
                    icon="calendar"
                >

                    {reportFollowUpRecords.length ===
                    0 ? (
                        <Empty text="No follow-up records found." />
                    ) : (
                        <div className="overflow-x-auto">

                            <table className="min-w-[900px] w-full">

                                <thead>
                                    <tr className="border-b border-slate-100 text-left">

                                        <th className="px-3 py-3 text-[10px] font-black uppercase text-slate-400">
                                            Lead
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase text-slate-400">
                                            Owner
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase text-slate-400">
                                            Status
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase text-slate-400">
                                            Follow-up Date
                                        </th>

                                        <th className="px-3 py-3 text-[10px] font-black uppercase text-slate-400">
                                            Completed At
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {reportFollowUpRecords
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) => {
                                                const da =
                                                    getFollowUpDate(
                                                        a
                                                    )?.getTime() ||
                                                    getCompletedDate(
                                                        a
                                                    )?.getTime() ||
                                                    0;

                                                const db =
                                                    getFollowUpDate(
                                                        b
                                                    )?.getTime() ||
                                                    getCompletedDate(
                                                        b
                                                    )?.getTime() ||
                                                    0;

                                                return (
                                                    db -
                                                    da
                                                );
                                            }
                                        )
                                        .map(
                                            (
                                                item
                                            ) => (
                                                <tr
                                                    key={String(
                                                        item?._reportLeadId ||
                                                            item?._id ||
                                                            item?.id
                                                    )}
                                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                                                >

                                                    <td className="px-3 py-4">

                                                        <p className="text-sm font-black text-slate-900">
                                                            {item?.leadName ||
                                                                item?.name ||
                                                                "Unnamed"}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            {item?.leadEmail ||
                                                                item?.email ||
                                                                item?.leadContact ||
                                                                item?.contact ||
                                                                "-"}
                                                        </p>

                                                    </td>

                                                    <td className="px-3 py-4 text-sm font-semibold text-slate-600">
                                                        {getOwnerName(
                                                            item
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-4">

                                                        <FollowUpBadge
                                                            status={
                                                                item._reportStatus
                                                            }
                                                        />

                                                    </td>

                                                    <td className="px-3 py-4 text-xs font-semibold text-slate-500">
                                                        {formatDateTime(
                                                            item?.displayFollowUpAt ||
                                                                item?.followUpAt
                                                        )}
                                                    </td>

                                                    <td className="px-3 py-4 text-xs font-semibold text-slate-500">
                                                        {formatDateTime(
                                                            item?.followUpCompletedAt
                                                        )}
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </Section>

                {/* SUMMARY */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-900 p-5 text-white shadow-lg sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                                Report Summary
                            </p>

                            <p className="mt-2 text-sm font-semibold text-blue-100">
                                {report.total} leads ·{" "}
                                {report.enrolled} enrolled ·{" "}
                                {report.completed} completed follow-ups ·{" "}
                                {report.missed} missed follow-ups
                            </p>

                        </div>

                        <div className="rounded-2xl bg-white/10 px-5 py-3 text-center ring-1 ring-white/10">

                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                                Completion
                            </p>

                            <p className="mt-1 text-2xl font-black">
                                {report.completionRate}%
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default ManagerReports;