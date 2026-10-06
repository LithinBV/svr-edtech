import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
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
        strokeLinejoin: "round"
    };

    switch (type) {
        case "users":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );

        case "userPlus":
            return (
                <svg {...common}>
                    <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                </svg>
            );

        case "check":
            return (
                <svg {...common}>
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );

        case "x":
            return (
                <svg {...common}>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                </svg>
            );

        case "activity":
            return (
                <svg {...common}>
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                </svg>
            );

        case "clock":
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...common}>
                    <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
                    <path d="M4 4v4h4" />
                    <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
                    <path d="M20 20v-4h-4" />
                </svg>
            );

        case "briefcase":
            return (
                <svg {...common}>
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M3 12h18" />
                    <path d="M10 12v2h4v-2" />
                </svg>
            );

        case "mail":
            return (
                <svg {...common}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
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
            return null;
    }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function ManagerTeam() {
    const [members, setMembers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [activeMembers, setActiveMembers] = useState(0);
    const [inactiveMembers, setInactiveMembers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // GET TOKEN
    // ==========================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token")
        );
    };

    // ==========================================
    // FETCH TEAM
    // ==========================================

    const fetchTeam = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Authentication token not found. Please login again."
                );
                return;
            }

            const url = `${API_BASE_URL}/api/manager/my-team`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            const contentType =
                response.headers.get("content-type") || "";

            let data;

            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(
                    `Server returned ${response.status}: ${text}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Request failed with status ${response.status}`
                );
            }

            setMembers(data.members || []);
            setTotalMembers(data.totalMembers || 0);
            setActiveMembers(data.activeMembers || 0);
            setInactiveMembers(data.inactiveMembers || 0);
        } catch (error) {
            console.error("Fetch Manager Team Error:", error);

            setError(
                error.message ||
                    "Failed to load team"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // LOAD TEAM
    // ==========================================

    useEffect(() => {
        fetchTeam();
    }, []);

    // ==========================================
    // FORMAT LAST ACTIVITY
    // ==========================================

    const formatLastActivity = (lastActivityAt) => {
        if (!lastActivityAt) {
            return "Never";
        }

        const date = new Date(lastActivityAt);

        if (Number.isNaN(date.getTime())) {
            return "Unknown";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // ==========================================
    // BADGES
    // ==========================================

    const ActivityBadge = ({ status }) => {
        const isActive = status === "ACTIVE";

        return (
            <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${
                        isActive
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                    }`}
                />
                {isActive ? "Active" : "Inactive"}
            </span>
        );
    };

    const AccountStatusBadge = ({ status }) => {
        const isActive = status === "ACTIVE";

        return (
            <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${
                    isActive
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                }`}
            >
                {isActive ? "Active" : "Inactive"}
            </span>
        );
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-3xl bg-[#102236] p-6 shadow-xl sm:p-8">
                        <div className="animate-pulse">
                            <div className="h-3 w-28 rounded-full bg-white/10" />
                            <div className="mt-4 h-10 w-64 rounded-xl bg-white/10" />
                            <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-white/10" />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                            />
                        ))}
                    </div>

                    <div className="mt-6 h-80 animate-pulse rounded-3xl border border-slate-200 bg-white" />
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            {/* Decorative background */}
            <div className="pointer-events-none fixed -left-24 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
            <div className="pointer-events-none fixed -right-24 top-96 h-80 w-80 rounded-full bg-violet-200/25 blur-3xl" />

            <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                {/* ==================================================
                    HERO
                ================================================== */}

                <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#102236] shadow-[0_24px_70px_rgba(16,34,54,0.18)]">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
                    <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                Manager Portal
                            </div>

                            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                My Team
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                                View and monitor your team members,
                                activity and account status in one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchTeam}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#FECA42] bg-[#FECA42] px-5 text-sm font-black text-[#102236] shadow-[0_8px_24px_rgba(254,202,66,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#e8b52f] hover:shadow-lg"
                        >
                            <Icon
                                type="refresh"
                                className={`h-4 w-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </button>
                    </div>
                </section>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm">
                        {error}
                    </div>
                )}

                {/* ==================================================
                    STATS
                ================================================== */}

                <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-200/60 blur-3xl transition-transform duration-500 group-hover:scale-125" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Total Members
                                </p>

                                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                    {totalMembers}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                    Members in your team
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700">
                                <Icon type="users" className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="relative mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            Team overview
                            <Icon type="arrow" className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/60 blur-3xl transition-transform duration-500 group-hover:scale-125" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Active
                                </p>

                                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                    {activeMembers}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                    Currently active members
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                                <Icon type="activity" className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="relative mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            Active team
                            <Icon type="arrow" className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/60 blur-3xl transition-transform duration-500 group-hover:scale-125" />

                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                    Inactive
                                </p>

                                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                                    {inactiveMembers}
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                    Currently inactive members
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                                <Icon type="x" className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="relative mt-5 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            Account attention
                            <Icon type="arrow" className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </section>

                {/* ==================================================
                    TEAM MEMBERS
                ================================================== */}

                <section className="mt-6">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                Team management
                            </p>

                            <h2 className="mt-1 text-xl font-black text-slate-900">
                                Team Members
                            </h2>

                            <p className="mt-1 text-xs font-medium text-slate-400">
                                Monitor activity, account status and last activity.
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            {members.length} members
                        </span>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                        {/* Table header */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700">
                                    <Icon type="users" className="h-5 w-5" />
                                </div>

                                <div>
                                    <p className="text-sm font-black text-slate-900">
                                        All Team Members
                                    </p>
                                    <p className="text-xs font-medium text-slate-400">
                                        Members assigned to your team
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    {activeMembers} Active
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                    {inactiveMembers} Inactive
                                </span>
                            </div>
                        </div>

                        {members.length === 0 ? (
                            <div className="px-6 py-20 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Icon type="users" className="h-6 w-6" />
                                </div>

                                <h3 className="mt-4 text-base font-black text-slate-800">
                                    No team members
                                </h3>

                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    No executives are currently assigned to your team.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <div className="divide-y divide-slate-100 lg:hidden">
                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="p-5 transition hover:bg-slate-50/70"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-sm font-black text-white">
                                                        {member.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-slate-900">
                                                            {member.name}
                                                        </p>

                                                        <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-slate-400">
                                                            <Icon
                                                                type="mail"
                                                                className="h-3.5 w-3.5 shrink-0"
                                                            />
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <ActivityBadge
                                                    status={member.activityStatus}
                                                />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        Role
                                                    </p>
                                                    <p className="mt-1 truncate text-xs font-bold text-slate-700">
                                                        {member.role || "-"}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        Account
                                                    </p>
                                                    <div className="mt-1">
                                                        <AccountStatusBadge
                                                            status={
                                                                member.accountStatus
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                                <Icon
                                                    type="clock"
                                                    className="h-4 w-4 text-slate-400"
                                                />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        Last Activity
                                                    </p>
                                                    <p className="mt-1 text-xs font-semibold text-slate-600">
                                                        {formatLastActivity(
                                                            member.lastActivityAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    Team Member
                                                </th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    Role
                                                </th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    Activity
                                                </th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    Account
                                                </th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                    Last Activity
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {members.map((member) => (
                                                <tr
                                                    key={member.id}
                                                    className="group transition hover:bg-slate-50/70"
                                                >
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-sm font-black text-white shadow-sm">
                                                                {member.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase() ||
                                                                    "U"}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-[230px] truncate text-sm font-black text-slate-900">
                                                                    {member.name}
                                                                </p>

                                                                <p className="mt-1 max-w-[230px] truncate text-xs font-medium text-slate-400">
                                                                    {member.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <span className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                                                            <Icon
                                                                type="briefcase"
                                                                className="h-3.5 w-3.5"
                                                            />
                                                            {member.role || "-"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <ActivityBadge
                                                            status={
                                                                member.activityStatus
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <AccountStatusBadge
                                                            status={
                                                                member.accountStatus
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                                <Icon
                                                                    type="clock"
                                                                    className="h-4 w-4"
                                                                />
                                                            </div>

                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {formatLastActivity(
                                                                    member.lastActivityAt
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ManagerTeam;
