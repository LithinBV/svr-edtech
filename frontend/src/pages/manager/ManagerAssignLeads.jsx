import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// CONFIG
// ============================================================

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// ICON
// ============================================================

function Icon({ type, className = "h-5 w-5" }) {
    const common = {
        className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        case "search":
            return (
                <svg {...common}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...common}>
                    <path d="M20 11a8.1 8.1 0 0 0-15.5-3M4 4v4h4" />
                    <path d="M4 13a8.1 8.1 0 0 0 15.5 3M20 20v-4h-4" />
                </svg>
            );

        case "users":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "assign":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M16 11l3 3 3-3" />
                </svg>
            );

        case "check":
            return (
                <svg {...common}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "close":
            return (
                <svg {...common}>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </svg>
            );

        case "chevron":
            return (
                <svg {...common}>
                    <path d="m6 9 6 6 6-6" />
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
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}

// ============================================================
// HELPERS
// ============================================================

function getToken() {
    return (
        localStorage.getItem("managerToken") ||
        localStorage.getItem("token") ||
        ""
    );
}

function getInitials(name) {
    if (!name) return "L";

    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return "L";
    }

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function getOwnerName(lead) {
    const owner = lead?.leadOwner;

    if (!owner) {
        return "Manager";
    }

    if (typeof owner === "string") {
        return "Team member";
    }

    return owner.name || "Team member";
}

function getOwnerType(lead) {
    const owner = lead?.leadOwner;

    if (!owner) {
        return "Manager";
    }

    if (typeof owner === "string") {
        return "Owner";
    }

    const role = String(
        owner.userType || owner.role || ""
    ).toUpperCase();

    if (role === "EXECUTIVE") {
        return "Executive";
    }

    if (role === "MANAGER") {
        return "Manager";
    }

    return "Owner";
}

function getStatusClass(status) {
    const value = String(status || "NEW").toUpperCase();

    if (value === "NEW") {
        return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    }

    if (value === "CONTACTED") {
        return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    }

    if (value === "INTERESTED") {
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    }

    if (value === "CONVERTED") {
        return "bg-green-50 text-green-700 ring-1 ring-green-200";
    }

    if (value === "LOST") {
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    }

    if (value === "HOT") {
        return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    }

    if (value === "WARM") {
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }

    if (value === "COLD") {
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }

    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

async function getResponseData(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return {
            success: false,
            message: text || "Unexpected server response.",
        };
    }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ManagerAssignLeads() {
    const navigate = useNavigate();

    // ========================================================
    // STATE
    // ========================================================

    const [leads, setLeads] = useState([]);
    const [executives, setExecutives] = useState([]);
    const [managers, setManagers] = useState([]);

    const [selectedLeads, setSelectedLeads] = useState([]);

    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [selectedManager, setSelectedManager] = useState("");

    const [search, setSearch] = useState("");

    // UI-only pagination
    const ITEMS_PER_PAGE = 50;
    const [page, setPage] = useState(1);

    // Custom selection count
    const [selectCount, setSelectCount] = useState("");

    // ALL / MY / EXECUTIVE
    const [leadFilter, setLeadFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showExecutiveMenu, setShowExecutiveMenu] =
        useState(false);

    const [showManagerMenu, setShowManagerMenu] =
        useState(false);

    // ========================================================
    // FETCH LEADS
    // ========================================================

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const params = new URLSearchParams();

            if (search.trim()) {
                params.set("search", search.trim());
            }

            const query = params.toString();

            const response = await fetch(
                `${API_URL}/api/manager/leads${
                    query ? `?${query}` : ""
                }`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await getResponseData(response);

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("managerToken");
                localStorage.removeItem("token");

                navigate("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch manager leads."
                );
            }

            const fetchedLeads = Array.isArray(data.leads)
                ? data.leads
                : [];

            setLeads(fetchedLeads);

            // Remove selected IDs that no longer exist
            // after ownership has changed.
            setSelectedLeads((current) =>
                current.filter((id) =>
                    fetchedLeads.some(
                        (lead) =>
                            String(lead._id) === String(id)
                    )
                )
            );
        } catch (err) {
            console.error(
                "Fetch manager leads error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load manager leads."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // FETCH EXECUTIVES
    // ========================================================

    const fetchExecutives = async () => {
        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/manager/leads/executives`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await getResponseData(response);

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("managerToken");
                localStorage.removeItem("token");

                navigate("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch executives."
                );
            }

            setExecutives(
                Array.isArray(data.executives)
                    ? data.executives
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch executives error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load executives."
            );
        }
    };

    // ========================================================
    // FETCH OTHER MANAGERS
    // ========================================================

    const fetchManagers = async () => {
        try {
            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/manager/leads/managers`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await getResponseData(response);

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("managerToken");
                localStorage.removeItem("token");

                navigate("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to fetch managers."
                );
            }

            setManagers(
                Array.isArray(data.managers)
                    ? data.managers
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch managers error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load managers."
            );
        }
    };

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        fetchExecutives();
        fetchManagers();
    }, []);

    // ========================================================
    // SEARCH
    // ========================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLeads();
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    // ========================================================
    // OWNER ROLE
    // ========================================================

    const getLeadOwnerRole = (lead) => {
        const owner = lead?.leadOwner;

        if (!owner) {
            return "MANAGER";
        }

        if (typeof owner === "string") {
            return "UNKNOWN";
        }

        return String(
            owner.userType || owner.role || ""
        ).toUpperCase();
    };

    // ========================================================
    // MY LEADS
    //
    // Leads directly owned by the current manager.
    // Unowned leads are also treated as manager available.
    // ========================================================

    const myLeads = leads.filter((lead) => {
        const ownerRole = getLeadOwnerRole(lead);

        return (
            ownerRole === "MANAGER" ||
            !lead?.leadOwner
        );
    });

    // ========================================================
    // EXECUTIVE LEADS
    //
    // Leads currently owned by one of the manager's
    // executives.
    // ========================================================

    const executiveLeads = leads.filter((lead) => {
        return (
            getLeadOwnerRole(lead) === "EXECUTIVE"
        );
    });

    // ========================================================
    // FILTERED LEADS
    // ========================================================

    const availableLeads = leads.filter((lead) => {
        const ownerRole = getLeadOwnerRole(lead);

        // My Leads
        if (leadFilter === "MY") {
            return (
                ownerRole === "MANAGER" ||
                !lead?.leadOwner
            );
        }

        // Executive Leads
        if (leadFilter === "EXECUTIVE") {
            return ownerRole === "EXECUTIVE";
        }

        // All Leads
        return (
            ownerRole === "MANAGER" ||
            ownerRole === "EXECUTIVE" ||
            !lead?.leadOwner
        );
    });

    // ========================================================
    // UI-ONLY PAGINATION
    // ========================================================

    const total = availableLeads.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            total / ITEMS_PER_PAGE
        )
    );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        leadFilter,
    ]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [
        page,
        totalPages,
    ]);

    const paginatedLeads = availableLeads.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    // ========================================================
    // SELECTED STATUS
    // ========================================================

    const allSelected =
        availableLeads.length > 0 &&
        availableLeads.every((lead) =>
            selectedLeads.includes(
                String(lead._id)
            )
        );

    // ========================================================
    // SELECTED EXECUTIVE
    // ========================================================

    const selectedExecutiveObject =
        executives.find(
            (executive) =>
                String(executive._id) ===
                String(selectedExecutive)
        );

    // ========================================================
    // SELECTED MANAGER
    // ========================================================

    const selectedManagerObject =
        managers.find(
            (manager) =>
                String(manager._id) ===
                String(selectedManager)
        );

    // ========================================================
    // SELECTED ASSIGNEE
    // ========================================================

    const selectedAssigneeId =
        selectedManager || selectedExecutive;

    // ========================================================
    // SELECT ALL
    // ========================================================

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedLeads([]);
            return;
        }

        setSelectedLeads(
            availableLeads.map((lead) =>
                String(lead._id)
            )
        );
    };

    // ========================================================
    // CUSTOM SELECT FIRST N LEADS
    // ========================================================

    const selectFirstN = (value = selectCount) => {
        const requestedCount = Math.max(
            0,
            Math.floor(
                Number(value) || 0
            )
        );

        const safeCount = Math.min(
            requestedCount,
            availableLeads.length
        );

        const ids = availableLeads
            .slice(0, safeCount)
            .map((lead) => String(lead._id));

        setSelectedLeads(ids);

        setSelectCount(
            requestedCount > 0
                ? String(safeCount)
                : ""
        );

        setPage(1);
    };

    // ========================================================
    // SELECT SINGLE LEAD
    // ========================================================

    const toggleLead = (leadId) => {
        const id = String(leadId);

        setSelectedLeads((current) => {
            if (current.includes(id)) {
                return current.filter(
                    (item) => item !== id
                );
            }

            return [...current, id];
        });
    };

    // ========================================================
    // ASSIGN / TRANSFER LEADS
    // ========================================================

    const handleAssign = async () => {
        setError("");
        setSuccess("");

        if (selectedLeads.length === 0) {
            setError(
                "Please select at least one lead."
            );

            return;
        }

        if (!selectedAssigneeId) {
            setError(
                "Please select a manager or executive."
            );

            return;
        }

        try {
            setAssigning(true);

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/manager/leads/assign-bulk`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        leadIds: selectedLeads,
                        leadOwner:
                            selectedAssigneeId,
                    }),
                }
            );

            const data =
                await getResponseData(response);

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem(
                    "managerToken"
                );

                localStorage.removeItem(
                    "token"
                );

                navigate("/login");
                return;
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                        "Failed to assign leads."
                );
            }

            setSuccess(
                data.message ||
                    `${selectedLeads.length} lead(s) assigned successfully.`
            );

            setSelectedLeads([]);
            setSelectCount("");

            setSelectedExecutive("");
            setSelectedManager("");

            setShowExecutiveMenu(false);
            setShowManagerMenu(false);

            // Refresh the list.
            //
            // The leadOwner is changed by the backend.
            // No new lead is created.
            //
            // If transferred to another manager,
            // it disappears from this manager's list.
            await fetchLeads();
        } catch (err) {
            console.error(
                "Assign leads error:",
                err
            );

            setError(
                err.message ||
                    "Unable to assign leads."
            );
        } finally {
            setAssigning(false);
        }
    };

    // ========================================================
    // CLEAR SELECTION
    // ========================================================

    const clearSelection = () => {
        setSelectedLeads([]);
        setSelectCount("");

        setSelectedExecutive("");
        setSelectedManager("");

        setShowExecutiveMenu(false);
        setShowManagerMenu(false);

        setError("");
        setSuccess("");
    };

    // ========================================================
    // CHANGE FILTER
    // ========================================================

    const changeLeadFilter = (filter) => {
        setLeadFilter(filter);
        setSelectCount("");
        setPage(1);

        // Prevent old selections from another filter
        // remaining selected.
        setSelectedLeads([]);

        setError("");
        setSuccess("");
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==================================================
                DECORATIVE BACKGROUND
            ================================================== */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />

                <div className="absolute -right-32 top-72 h-96 w-96 rounded-full bg-violet-200/20 blur-3xl" />

            </div>

            <main className="relative mx-auto max-w-[1550px] px-4 py-5 sm:px-6 lg:px-8">

                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#102236] shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                    <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

                    <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-5 px-5 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-9 lg:py-8">

                        <div>

                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">

                                <span className="h-2 w-2 rounded-full bg-[#FECA42]" />

                                Manager Workspace

                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Assign Leads
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                Manage your leads and your executive
                                leads. Assign them to another manager
                                or to an executive in your team.
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                fetchLeads();
                                fetchExecutives();
                                fetchManagers();
                            }}
                            disabled={
                                loading || assigning
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#FECA42] bg-[#FECA42] px-5 py-3 text-sm font-bold text-[#102236] shadow-lg shadow-yellow-500/10 transition hover:-translate-y-0.5 hover:bg-[#ffd65f] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            <Icon
                                type="refresh"
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Refresh

                        </button>

                    </div>

                </section>

                {/* ==================================================
                    ALERTS
                ================================================== */}

                {error && (
                    <div className="mb-5 flex items-start justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                            className="ml-4 rounded-lg p-1 text-rose-500 hover:bg-rose-100"
                        >
                            <Icon
                                type="close"
                                className="h-4 w-4"
                            />
                        </button>

                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">

                        <span>
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                            className="ml-4 rounded-lg p-1 text-emerald-500 hover:bg-emerald-100"
                        >
                            <Icon
                                type="close"
                                className="h-4 w-4"
                            />
                        </button>

                    </div>
                )}

                {/* ==================================================
                    SEARCH
                ================================================== */}

                <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] sm:p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <p className="text-sm font-bold text-slate-900">
                                Find leads
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Search by name, email, contact,
                                college or program.
                            </p>

                        </div>

                        <div className="relative w-full lg:max-w-md">

                            <Icon
                                type="search"
                                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search leads..."
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                </section>

                {/* ==================================================
                    ASSIGNMENT PANEL
                ================================================== */}

                {selectedLeads.length > 0 && (
                    <section className="relative z-40 mb-6 overflow-visible rounded-3xl border border-blue-100 bg-white shadow-[0_15px_45px_rgba(37,99,235,0.10)]">

                        <div className="p-5 sm:p-6">

                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                                {/* SELECTED INFO */}

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">

                                        <Icon
                                            type="assign"
                                            className="h-5 w-5"
                                        />

                                    </div>

                                    <div>

                                        <p className="text-sm font-bold text-slate-900">

                                            {selectedLeads.length}

                                            {" "}
                                            lead
                                            {selectedLeads.length !==
                                            1
                                                ? "s"
                                                : ""}

                                            {" "}
                                            selected

                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Choose a manager or executive
                                            to assign the selected leads.
                                        </p>

                                    </div>

                                </div>

                                {/* ASSIGN CONTROLS */}

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                                    {/* ==================================================
                                        MANAGER DROPDOWN
                                    ================================================== */}

                                    <div className="relative min-w-[230px]">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowManagerMenu(
                                                    (value) =>
                                                        !value
                                                );

                                                setShowExecutiveMenu(
                                                    false
                                                );
                                            }}
                                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition ${
                                                selectedManagerObject
                                                    ? "border-blue-300 bg-blue-50/50"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">

                                                    {selectedManagerObject
                                                        ? getInitials(
                                                              selectedManagerObject.name
                                                          )
                                                        : "M"}

                                                </div>

                                                <span
                                                    className={
                                                        selectedManagerObject
                                                            ? "truncate font-semibold text-slate-900"
                                                            : "text-slate-500"
                                                    }
                                                >
                                                    {selectedManagerObject
                                                        ? selectedManagerObject.name
                                                        : "Select manager"}
                                                </span>

                                            </div>

                                            <Icon
                                                type="chevron"
                                                className="h-4 w-4 shrink-0 text-slate-400"
                                            />

                                        </button>

                                        {showManagerMenu && (
                                            <div className="absolute right-0 z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl">

                                                {managers.length ===
                                                0 ? (
                                                    <div className="px-4 py-4 text-sm text-slate-500">
                                                        No managers
                                                        available.
                                                    </div>
                                                ) : (
                                                    managers.map(
                                                        (
                                                            manager
                                                        ) => (
                                                            <button
                                                                key={
                                                                    manager._id
                                                                }
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedManager(
                                                                        String(
                                                                            manager._id
                                                                        )
                                                                    );

                                                                    setSelectedExecutive(
                                                                        ""
                                                                    );

                                                                    setShowManagerMenu(
                                                                        false
                                                                    );
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                                                            >

                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                                                                    {getInitials(
                                                                        manager.name
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0 flex-1">

                                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                                        {
                                                                            manager.name
                                                                        }
                                                                    </p>

                                                                    <p className="truncate text-xs text-slate-500">
                                                                        {
                                                                            manager.email
                                                                        }
                                                                    </p>

                                                                </div>

                                                                {String(
                                                                    manager._id
                                                                ) ===
                                                                    String(
                                                                        selectedManager
                                                                    ) && (
                                                                    <Icon
                                                                        type="check"
                                                                        className="h-4 w-4 text-blue-600"
                                                                    />
                                                                )}

                                                            </button>
                                                        )
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {/* ==================================================
                                        EXECUTIVE DROPDOWN
                                    ================================================== */}

                                    <div className="relative min-w-[230px]">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowExecutiveMenu(
                                                    (value) =>
                                                        !value
                                                );

                                                setShowManagerMenu(
                                                    false
                                                );
                                            }}
                                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition ${
                                                selectedExecutiveObject
                                                    ? "border-violet-300 bg-violet-50/50"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-violet-700">

                                                    {selectedExecutiveObject
                                                        ? getInitials(
                                                              selectedExecutiveObject.name
                                                          )
                                                        : "E"}

                                                </div>

                                                <span
                                                    className={
                                                        selectedExecutiveObject
                                                            ? "truncate font-semibold text-slate-900"
                                                            : "text-slate-500"
                                                    }
                                                >
                                                    {selectedExecutiveObject
                                                        ? selectedExecutiveObject.name
                                                        : "Select executive"}
                                                </span>

                                            </div>

                                            <Icon
                                                type="chevron"
                                                className="h-4 w-4 shrink-0 text-slate-400"
                                            />

                                        </button>

                                        {showExecutiveMenu && (
                                            <div className="absolute right-0 z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl">

                                                {executives.length ===
                                                0 ? (
                                                    <div className="px-4 py-4 text-sm text-slate-500">
                                                        No executives
                                                        available.
                                                    </div>
                                                ) : (
                                                    executives.map(
                                                        (
                                                            executive
                                                        ) => (
                                                            <button
                                                                key={
                                                                    executive._id
                                                                }
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedExecutive(
                                                                        String(
                                                                            executive._id
                                                                        )
                                                                    );

                                                                    setSelectedManager(
                                                                        ""
                                                                    );

                                                                    setShowExecutiveMenu(
                                                                        false
                                                                    );
                                                                }}
                                                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                                                            >

                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-bold text-violet-700">
                                                                    {getInitials(
                                                                        executive.name
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0 flex-1">

                                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                                        {
                                                                            executive.name
                                                                        }
                                                                    </p>

                                                                    <p className="truncate text-xs text-slate-500">
                                                                        {
                                                                            executive.email
                                                                        }
                                                                    </p>

                                                                </div>

                                                                {String(
                                                                    executive._id
                                                                ) ===
                                                                    String(
                                                                        selectedExecutive
                                                                    ) && (
                                                                    <Icon
                                                                        type="check"
                                                                        className="h-4 w-4 text-blue-600"
                                                                    />
                                                                )}

                                                            </button>
                                                        )
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {/* ==================================================
                                        ASSIGN BUTTON
                                    ================================================== */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleAssign
                                        }
                                        disabled={
                                            assigning ||
                                            !selectedAssigneeId
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102236] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#172d45] disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <Icon
                                            type="assign"
                                            className="h-4 w-4"
                                        />

                                        {assigning
                                            ? "Assigning..."
                                            : "Assign Leads"}

                                    </button>

                                    {/* ==================================================
                                        CLEAR
                                    ================================================== */}

                                    <button
                                        type="button"
                                        onClick={
                                            clearSelection
                                        }
                                        disabled={
                                            assigning
                                        }
                                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Clear
                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

                {/* ==================================================
                    LEADS
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.07)]">

                    {/* ==================================================
                        LEAD HEADER
                    ================================================== */}

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">

                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                    <Icon
                                        type="users"
                                        className="h-5 w-5"
                                    />

                                </div>

                                <div>

                                    <h2 className="text-lg font-bold text-slate-900">
                                        Manager Leads
                                    </h2>

                                    <p className="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">
                                        View your leads and your executive
                                        leads. Use the filters to manage them
                                        separately, then assign them to
                                        another manager or your executives.
                                    </p>

                                </div>

                            </div>

                            {/* ==================================================
                                FILTERS
                            ================================================== */}

                            <div className="flex flex-wrap items-center gap-2">

                                {/* ALL */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        changeLeadFilter(
                                            "ALL"
                                        )
                                    }
                                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                        leadFilter ===
                                        "ALL"
                                            ? "bg-[#102236] text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >

                                    All Leads

                                    <span className="ml-1.5 opacity-70">
                                        {leads.length}
                                    </span>

                                </button>

                                {/* MY LEADS */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        changeLeadFilter(
                                            "MY"
                                        )
                                    }
                                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                        leadFilter ===
                                        "MY"
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >

                                    My Leads

                                    <span className="ml-1.5 opacity-70">
                                        {myLeads.length}
                                    </span>

                                </button>

                                {/* EXECUTIVE LEADS */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        changeLeadFilter(
                                            "EXECUTIVE"
                                        )
                                    }
                                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                        leadFilter ===
                                        "EXECUTIVE"
                                            ? "bg-violet-600 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >

                                    Executive Leads

                                    <span className="ml-1.5 opacity-70">
                                        {
                                            executiveLeads.length
                                        }
                                    </span>

                                </button>

                                {/* SELECT ALL */}

                                {availableLeads.length >
                                    0 && (
                                    <button
                                        type="button"
                                        onClick={
                                            toggleSelectAll
                                        }
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        {allSelected
                                            ? "Clear all"
                                            : "Select all"}
                                    </button>
                                )}

                                {/* CUSTOM SELECT COUNT */}
                                {availableLeads.length >
                                    0 && (
                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
                                        <input
                                            type="number"
                                            min="1"
                                            max={
                                                availableLeads.length
                                            }
                                            value={selectCount}
                                            onChange={(event) => {
                                                const value =
                                                    event.target.value;

                                                setSelectCount(value);

                                                if (
                                                    value === ""
                                                ) {
                                                    setSelectedLeads([]);
                                                    return;
                                                }

                                                const numericValue =
                                                    Number(value);

                                                if (
                                                    Number.isFinite(
                                                        numericValue
                                                    ) &&
                                                    numericValue > 0
                                                ) {
                                                    selectFirstN(
                                                        numericValue
                                                    );
                                                }
                                            }}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key ===
                                                    "Enter"
                                                ) {
                                                    selectFirstN();
                                                }
                                            }}
                                            placeholder="50"
                                            className="w-20 rounded-lg bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                selectFirstN()
                                            }
                                            disabled={
                                                assigning ||
                                                availableLeads.length ===
                                                    0 ||
                                                !selectCount
                                            }
                                            className="rounded-lg bg-[#102236] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#172d45] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Select
                                        </button>
                                    </div>
                                )}

                            </div>

                        </div>

                    </div>

                    {/* ==================================================
                        LOADING
                    ================================================== */}

                    {loading ? (
                        <div className="flex min-h-[340px] items-center justify-center">

                            <div className="text-center">

                                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                                <p className="mt-4 text-sm font-medium text-slate-500">
                                    Loading leads...
                                </p>

                            </div>

                        </div>
                    ) : availableLeads.length ===
                      0 ? (
                        <div className="flex min-h-[340px] items-center justify-center px-6">

                            <div className="text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                    <Icon
                                        type="users"
                                        className="h-7 w-7"
                                    />

                                </div>

                                <h3 className="mt-5 text-base font-bold text-slate-900">
                                    No leads found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    No leads are available for
                                    the selected filter, or your
                                    search did not return any
                                    results.
                                </p>

                            </div>

                        </div>
                    ) : (
                        <>
                            {/* ==================================================
                                DESKTOP TABLE
                            ================================================== */}

                            <div className="hidden overflow-x-auto lg:block">

                                <table className="w-full min-w-[1100px]">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50/80">

                                            <th className="w-14 px-5 py-4 text-center">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        allSelected
                                                    }
                                                    onChange={
                                                        toggleSelectAll
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />

                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Lead
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Contact
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                College
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Program
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Owner
                                            </th>

                                            <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {paginatedLeads.map(
                                            (lead) => {
                                                const selected =
                                                    selectedLeads.includes(
                                                        String(
                                                            lead._id
                                                        )
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            lead._id
                                                        }
                                                        className={`transition ${
                                                            selected
                                                                ? "bg-blue-50/60"
                                                                : "hover:bg-slate-50/70"
                                                        }`}
                                                    >

                                                        {/* CHECKBOX */}

                                                        <td className="px-5 py-4 text-center">

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selected
                                                                }
                                                                onChange={() =>
                                                                    toggleLead(
                                                                        lead._id
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />

                                                        </td>

                                                        {/* LEAD */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-xs font-bold text-slate-700">

                                                                    {getInitials(
                                                                        lead.name
                                                                    )}

                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="max-w-[220px] truncate text-sm font-bold text-slate-900">
                                                                        {lead.name ||
                                                                            "Unnamed lead"}
                                                                    </p>

                                                                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                                                                        {lead.email ||
                                                                            "No email"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* CONTACT */}

                                                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                                                            {lead.contact ||
                                                                "—"}
                                                        </td>

                                                        {/* COLLEGE */}

                                                        <td className="max-w-[220px] px-5 py-4">

                                                            <p className="truncate text-sm font-medium text-slate-700">
                                                                {lead.collegeName ||
                                                                    "—"}
                                                            </p>

                                                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                                                {lead.department ||
                                                                    "—"}
                                                            </p>

                                                        </td>

                                                        {/* PROGRAM */}

                                                        <td className="px-5 py-4">

                                                            <span className="inline-flex rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                                                                {lead.programInterest ||
                                                                    "—"}
                                                            </span>

                                                        </td>

                                                        {/* OWNER */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-2">

                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">

                                                                    {getInitials(
                                                                        getOwnerName(
                                                                            lead
                                                                        )
                                                                    )}

                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="max-w-[140px] truncate text-xs font-semibold text-slate-700">
                                                                        {getOwnerName(
                                                                            lead
                                                                        )}
                                                                    </p>

                                                                    <span
                                                                        className={`mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                                                            getOwnerType(
                                                                                lead
                                                                            ) ===
                                                                            "Executive"
                                                                                ? "bg-violet-50 text-violet-600"
                                                                                : "bg-blue-50 text-blue-600"
                                                                        }`}
                                                                    >
                                                                        {getOwnerType(
                                                                            lead
                                                                        )}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>

                                                        {/* STATUS */}

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-bold ${getStatusClass(
                                                                    lead.status
                                                                )}`}
                                                            >
                                                                {lead.status ||
                                                                    "NEW"}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            {/* ==================================================
                                MOBILE
                            ================================================== */}

                            <div className="divide-y divide-slate-100 lg:hidden">

                                {paginatedLeads.map(
                                    (lead) => {
                                        const selected =
                                            selectedLeads.includes(
                                                String(
                                                    lead._id
                                                )
                                            );

                                        return (
                                            <div
                                                key={
                                                    lead._id
                                                }
                                                className={`p-4 sm:p-5 ${
                                                    selected
                                                        ? "bg-blue-50/60"
                                                        : ""
                                                }`}
                                            >

                                                <div className="flex gap-3">

                                                    {/* CHECKBOX */}

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            selected
                                                        }
                                                        onChange={() =>
                                                            toggleLead(
                                                                lead._id
                                                            )
                                                        }
                                                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex items-start justify-between gap-3">

                                                            <div className="flex min-w-0 items-center gap-3">

                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-xs font-bold text-slate-700">

                                                                    {getInitials(
                                                                        lead.name
                                                                    )}

                                                                </div>

                                                                <div className="min-w-0">

                                                                    <p className="truncate text-sm font-bold text-slate-900">
                                                                        {lead.name ||
                                                                            "Unnamed lead"}
                                                                    </p>

                                                                    <p className="truncate text-xs text-slate-500">
                                                                        {lead.email ||
                                                                            "No email"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                            <span
                                                                className={`shrink-0 rounded-xl px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                                                    lead.status
                                                                )}`}
                                                            >
                                                                {lead.status ||
                                                                    "NEW"}
                                                            </span>

                                                        </div>

                                                        {/* MOBILE DETAILS */}

                                                        <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-3">

                                                            {/* CONTACT */}

                                                            <div>

                                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                    Contact
                                                                </p>

                                                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                                                    {lead.contact ||
                                                                        "—"}
                                                                </p>

                                                            </div>

                                                            {/* PROGRAM */}

                                                            <div>

                                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                    Program
                                                                </p>

                                                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                                                    {lead.programInterest ||
                                                                        "—"}
                                                                </p>

                                                            </div>

                                                            {/* COLLEGE */}

                                                            <div className="col-span-2">

                                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                    College
                                                                </p>

                                                                <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                                                                    {lead.collegeName ||
                                                                        "—"}
                                                                </p>

                                                            </div>

                                                            {/* OWNER */}

                                                            <div className="col-span-2">

                                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                                    Current Owner
                                                                </p>

                                                                <div className="mt-1 flex items-center gap-2">

                                                                    <p className="truncate text-xs font-semibold text-slate-700">
                                                                        {getOwnerName(
                                                                            lead
                                                                        )}
                                                                    </p>

                                                                    <span
                                                                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                                                            getOwnerType(
                                                                                lead
                                                                            ) ===
                                                                            "Executive"
                                                                                ? "bg-violet-50 text-violet-600"
                                                                                : "bg-blue-50 text-blue-600"
                                                                        }`}
                                                                    >
                                                                        {getOwnerType(
                                                                            lead
                                                                        )}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                            {/* ==================================================
                                UI PAGINATION
                            ================================================== */}

                            {availableLeads.length > 0 && (
                                <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <div className="text-sm text-slate-500">
                                        Showing{" "}
                                        <span className="font-semibold text-slate-800">
                                            {(page - 1) *
                                                ITEMS_PER_PAGE +
                                                1}
                                        </span>
                                        {" – "}
                                        <span className="font-semibold text-slate-800">
                                            {Math.min(
                                                page *
                                                    ITEMS_PER_PAGE,
                                                total
                                            )}
                                        </span>
                                        {" of "}
                                        <span className="font-semibold text-slate-800">
                                            {total}
                                        </span>{" "}
                                        leads
                                    </div>

                                    <div className="flex items-center gap-1.5 overflow-x-auto">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (current) =>
                                                        Math.max(
                                                            1,
                                                            current - 1
                                                        )
                                                )
                                            }
                                            disabled={page === 1}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    totalPages,
                                                    5
                                                ),
                                            },
                                            (_, index) => {
                                                let pageNumber;

                                                if (
                                                    totalPages <=
                                                    5
                                                ) {
                                                    pageNumber =
                                                        index + 1;
                                                } else {
                                                    const start =
                                                        Math.min(
                                                            Math.max(
                                                                1,
                                                                page - 2
                                                            ),
                                                            totalPages -
                                                                4
                                                        );

                                                    pageNumber =
                                                        start +
                                                        index;
                                                }

                                                return (
                                                    <button
                                                        key={
                                                            pageNumber
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setPage(
                                                                pageNumber
                                                            )
                                                        }
                                                        className={`min-w-9 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                                            pageNumber ===
                                                            page
                                                                ? "bg-[#102236] text-white"
                                                                : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                                                        }`}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </button>
                                                );
                                            }
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (current) =>
                                                        Math.min(
                                                            totalPages,
                                                            current + 1
                                                        )
                                                )
                                            }
                                            disabled={
                                                page ===
                                                totalPages
                                            }
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                </section>

            </main>

        </div>
    );
}