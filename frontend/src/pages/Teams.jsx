import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
// VIEW USERS - SVR EDTECH
// ============================================================
// Features:
// - Search users
// - Role filter
// - Team filter
// - Clickable animated summary cards
// - Total / Executive / Manager / Active filters
// - Mobile responsive cards
// - Desktop table
// - Pagination
// - Edit user
// - Refresh users and teams
// ============================================================

function ViewUsers() {
    const navigate = useNavigate();

    // ============================================================
    // AUTH
    // ============================================================

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const userType = localStorage.getItem("userType");

    // ============================================================
    // STATE
    // ============================================================

    const [allUsers, setAllUsers] = useState([]);
    const [teams, setTeams] = useState([]);

    const [loading, setLoading] = useState(true);
    const [teamsLoading, setTeamsLoading] = useState(false);

    const [error, setError] = useState("");
    const [teamError, setTeamError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [teamFilter, setTeamFilter] = useState("ALL");
    const [activeFilter, setActiveFilter] = useState("ALL");

    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 10;

    // ============================================================
    // AUTHORIZATION
    // ============================================================

    useEffect(() => {
        if (!token) {
            window.location.replace("/login");
            return;
        }

        if (userType && userType !== "SUPER_ADMIN") {
            if (userType === "INSTITUTION_ADMIN") {
                window.location.replace(
                    "/institution-admin-dashboard"
                );
            } else {
                localStorage.clear();
                window.location.replace("/login");
            }
        }
    }, [token, userType]);

    // ============================================================
    // HELPERS
    // ============================================================

    const getInitials = (name) => {
        if (!name) {
            return "U";
        }

        const parts = String(name)
            .trim()
            .split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "Never";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Never";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getUserId = (user) => {
        return user?.id || user?._id || "";
    };

    // ============================================================
    // GET TEAM ID
    // ============================================================

    const getTeamId = (user) => {
        const team = user?.team;

        if (!team) {
            return "";
        }

        if (typeof team === "object") {
            return String(
                team._id ||
                    team.id ||
                    team.teamId ||
                    ""
            );
        }

        return String(team);
    };

    // ============================================================
    // GET TEAM NAME
    // ============================================================

    const getTeamName = (user) => {
        const team = user?.team;

        if (team && typeof team === "object") {
            return (
                team.name ||
                team.teamName ||
                "No Team"
            );
        }

        const teamId = getTeamId(user);

        if (!teamId) {
            return "No Team";
        }

        const foundTeam = teams.find(
            (item) =>
                String(
                    item._id ||
                        item.id ||
                        ""
                ) === teamId
        );

        return foundTeam?.name || "No Team";
    };

    // ============================================================
    // FETCH USERS
    // ============================================================

    const fetchUsers = async (silent = false) => {
        if (!token) {
            return;
        }

        if (!silent) {
            setLoading(true);
        }
        setError("");

        try {
            const response = await fetch("/api/users", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error(
                    "Unable to parse server response:",
                    jsonError
                );
            }

            // ====================================================
            // AUTH ERROR
            // ====================================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();
                window.location.replace("/login");
                return;
            }

            // ====================================================
            // OTHER ERROR
            // ====================================================

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to fetch users."
                );
            }

            const users = Array.isArray(data.users)
                ? data.users
                : [];

            console.log(
                "Users received from backend:",
                users
            );

            setAllUsers(users);
        } catch (err) {
            console.error(
                "Fetch users error:",
                err
            );

            setError(
                err.message ||
                    "Unable to load users."
            );
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    // ============================================================
    // FETCH TEAMS
    // ============================================================

    const fetchTeams = async () => {
        if (!token) {
            return;
        }

        setTeamsLoading(true);
        setTeamError("");

        try {
            const response = await fetch("/api/teams", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Unable to fetch teams."
                );
            }

            const receivedTeams = Array.isArray(
                data.teams
            )
                ? data.teams
                : [];

            setTeams(receivedTeams);
        } catch (err) {
            console.error(
                "Fetch teams error:",
                err
            );

            setTeamError(
                err.message ||
                    "Unable to load teams."
            );

            setTeams([]);
        } finally {
            setTeamsLoading(false);
        }
    };

    // ============================================================
    // INITIAL FETCH + ACTIVITY REFRESH
    // ============================================================

    useEffect(() => {
        if (
            !token ||
            (userType && userType !== "SUPER_ADMIN")
        ) {
            return;
        }

        // Initial full fetch
        fetchUsers();
        fetchTeams();

        // Refresh activity status every 60 seconds.
        // This keeps Active/Inactive accurate without
        // requiring the Super Admin to press Refresh.
        const activityRefresh = setInterval(() => {
            fetchUsers(true);
        }, 60 * 1000);

        return () => {
            clearInterval(activityRefresh);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ============================================================
    // SUMMARY COUNTS
    // ============================================================

    const totalUsers = allUsers.length;

    const executiveUsers = allUsers.filter(
        (user) =>
            String(
                user.role || ""
            ).toUpperCase() === "EXECUTIVE"
    ).length;

    const managerUsers = allUsers.filter(
        (user) =>
            String(
                user.role || ""
            ).toUpperCase() === "MANAGER"
    ).length;

    const activeAccounts = allUsers.filter(
        (user) =>
            String(
                user.activityStatus || ""
            ).toUpperCase() === "ACTIVE"
    ).length;

    // ============================================================
    // FILTER USERS
    // ============================================================

    const filteredUsers = useMemo(() => {
        const searchValue = search
            .trim()
            .toLowerCase();

        return allUsers.filter((user) => {
            const name = String(
                user.name || ""
            ).toLowerCase();

            const email = String(
                user.email || ""
            ).toLowerCase();

            const role = String(
                user.role || ""
            ).toUpperCase();

            const userTeamId = getTeamId(user);

            const activityStatus = String(
                user.activityStatus || ""
            ).toUpperCase();

            // ----------------------------------------
            // SEARCH
            // ----------------------------------------

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                email.includes(searchValue);

            // ----------------------------------------
            // ROLE
            // ----------------------------------------

            const matchesRole =
                roleFilter === "ALL" ||
                role === roleFilter;

            // ----------------------------------------
            // TEAM
            // ----------------------------------------

            const matchesTeam =
                teamFilter === "ALL" ||
                userTeamId ===
                    String(teamFilter);

            // ----------------------------------------
            // ACTIVE
            // ----------------------------------------

            const matchesActive =
                activeFilter === "ALL" ||
                activityStatus === "ACTIVE";

            return (
                matchesSearch &&
                matchesRole &&
                matchesTeam &&
                matchesActive
            );
        });
    }, [
        allUsers,
        search,
        roleFilter,
        teamFilter,
        activeFilter,
        teams,
    ]);

    // ============================================================
    // PAGINATION
    // ============================================================

    const totalPages = Math.ceil(
        filteredUsers.length /
            usersPerPage
    );

    const safeCurrentPage =
        totalPages === 0
            ? 1
            : Math.min(
                  currentPage,
                  totalPages
              );

    const startIndex =
        (safeCurrentPage - 1) *
        usersPerPage;

    const pageUsers = filteredUsers.slice(
        startIndex,
        startIndex + usersPerPage
    );

    const showingStart =
        filteredUsers.length === 0
            ? 0
            : startIndex + 1;

    const showingEnd = Math.min(
        startIndex + usersPerPage,
        filteredUsers.length
    );

    // ============================================================
    // SEARCH
    // ============================================================

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    // ============================================================
    // ROLE FILTER
    // ============================================================

    const handleRoleChange = (event) => {
        setRoleFilter(event.target.value);

        // Role filter and Active card filter
        // are separate filters.
        // Selecting a role clears Active.
        setActiveFilter("ALL");

        setCurrentPage(1);
    };

    // ============================================================
    // TEAM FILTER
    // ============================================================

    const handleTeamChange = (event) => {
        setTeamFilter(event.target.value);
        setCurrentPage(1);
    };

    // ============================================================
    // TOTAL USERS CARD
    // ============================================================

    const handleTotalFilter = () => {
        setRoleFilter("ALL");
        setActiveFilter("ALL");
        setCurrentPage(1);
    };

    // ============================================================
    // EXECUTIVE CARD
    // ============================================================

    const handleExecutiveFilter = () => {
        if (roleFilter === "EXECUTIVE") {
            setRoleFilter("ALL");
        } else {
            setRoleFilter("EXECUTIVE");
        }

        setActiveFilter("ALL");
        setCurrentPage(1);
    };

    // ============================================================
    // MANAGER CARD
    // ============================================================

    const handleManagerFilter = () => {
        if (roleFilter === "MANAGER") {
            setRoleFilter("ALL");
        } else {
            setRoleFilter("MANAGER");
        }

        setActiveFilter("ALL");
        setCurrentPage(1);
    };

    // ============================================================
    // ACTIVE CARD
    // ============================================================

    const handleActiveFilter = () => {
        if (activeFilter === "ACTIVE") {
            setActiveFilter("ALL");
        } else {
            setActiveFilter("ACTIVE");
        }

        // Active filter clears role filter
        setRoleFilter("ALL");

        setCurrentPage(1);
    };

    // ============================================================
    // RESET FILTERS
    // ============================================================

    const resetFilters = () => {
        setSearch("");
        setRoleFilter("ALL");
        setTeamFilter("ALL");
        setActiveFilter("ALL");
        setCurrentPage(1);
    };

    const hasActiveFilters =
        search.trim() !== "" ||
        roleFilter !== "ALL" ||
        teamFilter !== "ALL" ||
        activeFilter !== "ALL";

    // ============================================================
    // EDIT USER
    // ============================================================

    const handleEdit = (user) => {
        const userId = getUserId(user);

        if (!userId) {
            console.error(
                "User ID is missing:",
                user
            );
            return;
        }

        navigate(`/edit-user/${userId}`);
    };

    // ============================================================
    // PAGINATION NUMBERS
    // ============================================================

    const paginationNumbers = [];

    const maxVisiblePages = 5;

    let paginationStart = Math.max(
        1,
        safeCurrentPage -
            Math.floor(maxVisiblePages / 2)
    );

    let paginationEnd = Math.min(
        totalPages,
        paginationStart +
            maxVisiblePages -
            1
    );

    if (
        paginationEnd -
            paginationStart +
            1 <
        maxVisiblePages
    ) {
        paginationStart = Math.max(
            1,
            paginationEnd -
                maxVisiblePages +
                1
        );
    }

    for (
        let page = paginationStart;
        page <= paginationEnd;
        page++
    ) {
        paginationNumbers.push(page);
    }

    // ============================================================
    // LOADING
    // ============================================================

    if (
        loading &&
        allUsers.length === 0
    ) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F6F8] px-4">

                <div className="flex flex-col items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102236] shadow-lg">

                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#F6C945]" />

                    </div>

                    <p className="text-sm font-medium text-slate-500">
                        Loading users...
                    </p>

                </div>

            </div>
        );
    }

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="min-h-full w-full bg-[#F4F6F8]">

            <main className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <section className="mb-5">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* TITLE */}

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945] shadow-sm">

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-9a4 4 0 110 8 4 4 0 010-8z"
                                    />
                                </svg>

                            </div>

                            <div>

                                <h1 className="text-xl font-bold tracking-tight text-[#102236] sm:text-2xl lg:text-3xl">
                                    Users
                                </h1>

                                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                    Manage managers and executives.
                                </p>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex w-full gap-2 sm:w-auto">

                            <button
                                type="button"
                                onClick={() => {
                                    fetchUsers();
                                    fetchTeams();
                                }}
                                disabled={
                                    loading ||
                                    teamsLoading
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#102236] shadow-sm transition duration-200 hover:border-[#F6C945] hover:bg-[#FFFBEA] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                            >

                                <svg
                                    className={`h-4 w-4 ${
                                        loading ||
                                        teamsLoading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0118.9 6.1L20 7M18.5 15A7 7 0 005.1 17.9L4 17"
                                    />
                                </svg>

                                Refresh

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/add-user"
                                    )
                                }
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102236] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#182F48] sm:flex-none"
                            >

                                <span className="text-lg leading-none text-[#F6C945]">
                                    +
                                </span>

                                Add User

                            </button>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ANIMATED FILTER CARDS
                ================================================== */}

                <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

                    {/* ==================================================
                        TOTAL USERS
                    ================================================== */}

                    <button
                        type="button"
                        onClick={
                            handleTotalFilter
                        }
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,34,54,0.14)] sm:p-5 ${
                            roleFilter === "ALL" &&
                            activeFilter === "ALL"
                                ? "border-[#F6C945] ring-2 ring-[#F6C945]/20"
                                : "border-slate-200"
                        }`}
                    >

                        <div className="absolute left-0 top-0 h-1 w-full bg-[#102236]" />

                        {roleFilter === "ALL" &&
                            activeFilter ===
                                "ALL" && (
                                <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#F6C945] shadow-[0_0_0_4px_rgba(246,201,69,0.15)]" />
                            )}

                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#102236]/5 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                        <div className="relative flex items-start justify-between gap-2">

                            <div>

                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                                    Total Users
                                </p>

                                <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#102236] transition-all duration-300 group-hover:scale-105 sm:text-3xl">
                                    {totalUsers}
                                </p>

                                <p className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
                                    {roleFilter ===
                                        "ALL" &&
                                    activeFilter ===
                                        "ALL"
                                        ? "All accounts"
                                        : "Click to view all"}
                                </p>

                            </div>


                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-lg sm:h-11 sm:w-11">

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-9a4 4 0 110 8 4 4 0 010-8z"
                                    />
                                </svg>

                            </div>

                        </div>


                        <div
                            className={`absolute bottom-0 left-0 h-[3px] bg-[#F6C945] transition-all duration-500 ${
                                roleFilter ===
                                    "ALL" &&
                                activeFilter ===
                                    "ALL"
                                    ? "w-full"
                                    : "w-0 group-hover:w-full"
                            }`}
                        />

                    </button>


                    {/* ==================================================
                        EXECUTIVES
                    ================================================== */}

                    <button
                        type="button"
                        onClick={
                            handleExecutiveFilter
                        }
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)] sm:p-5 ${
                            roleFilter ===
                            "EXECUTIVE"
                                ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20"
                                : "border-slate-200"
                        }`}
                    >

                        <div className="absolute left-0 top-0 h-1 w-full bg-blue-500" />

                        {roleFilter ===
                            "EXECUTIVE" && (
                            <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
                        )}

                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                        <div className="relative flex items-start justify-between gap-2">

                            <div>

                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                                    Executives
                                </p>

                                <p className="mt-2 text-2xl font-extrabold tracking-tight text-blue-600 transition-all duration-300 group-hover:scale-105 sm:text-3xl">
                                    {executiveUsers}
                                </p>

                                <p className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
                                    {roleFilter ===
                                    "EXECUTIVE"
                                        ? "Showing executives"
                                        : "Click to filter"}
                                </p>

                            </div>


                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white sm:h-11 sm:w-11">

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                                    />
                                </svg>

                            </div>

                        </div>


                        <div
                            className={`absolute bottom-0 left-0 h-[3px] bg-blue-500 transition-all duration-500 ${
                                roleFilter ===
                                "EXECUTIVE"
                                    ? "w-full"
                                    : "w-0 group-hover:w-full"
                            }`}
                        />

                    </button>


                    {/* ==================================================
                        MANAGERS
                    ================================================== */}

                    <button
                        type="button"
                        onClick={
                            handleManagerFilter
                        }
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(124,58,237,0.15)] sm:p-5 ${
                            roleFilter ===
                            "MANAGER"
                                ? "border-violet-500 bg-violet-50/40 ring-2 ring-violet-500/20"
                                : "border-slate-200"
                        }`}
                    >

                        <div className="absolute left-0 top-0 h-1 w-full bg-violet-500" />

                        {roleFilter ===
                            "MANAGER" && (
                            <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_0_4px_rgba(139,92,246,0.15)]" />
                        )}

                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                        <div className="relative flex items-start justify-between gap-2">

                            <div>

                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                                    Managers
                                </p>

                                <p className="mt-2 text-2xl font-extrabold tracking-tight text-violet-600 transition-all duration-300 group-hover:scale-105 sm:text-3xl">
                                    {managerUsers}
                                </p>

                                <p className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
                                    {roleFilter ===
                                    "MANAGER"
                                        ? "Showing managers"
                                        : "Click to filter"}
                                </p>

                            </div>


                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white sm:h-11 sm:w-11">

                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 14a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0"
                                    />
                                </svg>

                            </div>

                        </div>


                        <div
                            className={`absolute bottom-0 left-0 h-[3px] bg-violet-500 transition-all duration-500 ${
                                roleFilter ===
                                "MANAGER"
                                    ? "w-full"
                                    : "w-0 group-hover:w-full"
                            }`}
                        />

                    </button>


                    {/* ==================================================
                        ACTIVE USERS
                    ================================================== */}

                    <button
                        type="button"
                        onClick={
                            handleActiveFilter
                        }
                        className={`group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.15)] sm:p-5 ${
                            activeFilter ===
                            "ACTIVE"
                                ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                                : "border-slate-200"
                        }`}
                    >

                        <div className="absolute left-0 top-0 h-1 w-full bg-emerald-500" />

                        {activeFilter ===
                            "ACTIVE" && (
                            <div className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                        )}

                        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                        <div className="relative flex items-start justify-between gap-2">

                            <div>

                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">
                                    Active
                                </p>

                                <p className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-600 transition-all duration-300 group-hover:scale-105 sm:text-3xl">
                                    {activeAccounts}
                                </p>

                                <p className="mt-1 text-[10px] font-medium text-slate-400 sm:text-xs">
                                    {activeFilter ===
                                    "ACTIVE"
                                        ? "Showing active users"
                                        : "Click to filter"}
                                </p>

                            </div>


                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white sm:h-11 sm:w-11">

                                <span className="relative flex h-3.5 w-3.5">

                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 group-hover:bg-white" />

                                </span>

                            </div>

                        </div>


                        <div
                            className={`absolute bottom-0 left-0 h-[3px] bg-emerald-500 transition-all duration-500 ${
                                activeFilter ===
                                "ACTIVE"
                                    ? "w-full"
                                    : "w-0 group-hover:w-full"
                            }`}
                        />

                    </button>

                </section>


                {/* ==================================================
                    USER DIRECTORY
                ================================================== */}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* ==================================================
                        FILTER HEADER
                    ================================================== */}

                    <div className="border-b border-slate-100 bg-[#FBFCFD] p-4 sm:p-5">

                        <div className="mb-3 flex items-center justify-between gap-3">

                            <div>

                                <h2 className="text-sm font-bold text-[#102236] sm:text-base">
                                    User Directory
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-400">
                                    Search and filter users.
                                </p>

                            </div>


                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                    className="shrink-0 text-xs font-bold text-[#102236] underline decoration-[#F6C945] decoration-2 underline-offset-4 hover:text-slate-600"
                                >
                                    Clear filters
                                </button>
                            )}

                        </div>


                        {/* FILTERS */}

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_210px]">

                            {/* SEARCH */}

                            <div className="relative">

                                <svg
                                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                        strokeWidth="2"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeWidth="2"
                                        d="M20 20l-4-4"
                                    />
                                </svg>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={
                                        handleSearchChange
                                    }
                                    placeholder="Search name or email..."
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/10"
                                />

                            </div>


                            {/* ROLE FILTER */}

                            <select
                                value={roleFilter}
                                onChange={
                                    handleRoleChange
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/10"
                            >

                                <option value="ALL">
                                    All Roles
                                </option>

                                <option value="EXECUTIVE">
                                    Executive
                                </option>

                                <option value="MANAGER">
                                    Manager
                                </option>

                            </select>


                            {/* TEAM FILTER */}

                            <select
                                value={teamFilter}
                                onChange={
                                    handleTeamChange
                                }
                                disabled={
                                    teamsLoading
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/10 disabled:cursor-wait disabled:bg-slate-50"
                            >

                                <option value="ALL">
                                    {teamsLoading
                                        ? "Loading Teams..."
                                        : "All Teams"}
                                </option>

                                {teams.map(
                                    (team) => {
                                        const teamId =
                                            team._id ||
                                            team.id;

                                        return (
                                            <option
                                                key={
                                                    teamId
                                                }
                                                value={
                                                    teamId
                                                }
                                            >
                                                {team.name ||
                                                    "Unnamed Team"}
                                            </option>
                                        );
                                    }
                                )}

                            </select>

                        </div>


                        {/* ACTIVE FILTER INDICATORS */}

                        <div className="mt-3 flex flex-wrap items-center gap-2">

                            {roleFilter !==
                                "ALL" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102236] px-3 py-1 text-[11px] font-bold text-[#F6C945]">

                                    Role:
                                    {" "}
                                    {roleFilter ===
                                    "EXECUTIVE"
                                        ? "Executive"
                                        : "Manager"}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRoleFilter(
                                                "ALL"
                                            );
                                            setCurrentPage(
                                                1
                                            );
                                        }}
                                        className="ml-1 text-white/70 hover:text-white"
                                    >
                                        ×
                                    </button>

                                </span>
                            )}


                            {activeFilter ===
                                "ACTIVE" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    Active Users

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveFilter(
                                                "ALL"
                                            );
                                            setCurrentPage(
                                                1
                                            );
                                        }}
                                        className="ml-1 text-emerald-500 hover:text-emerald-800"
                                    >
                                        ×
                                    </button>

                                </span>
                            )}


                            {teamFilter !==
                                "ALL" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7D6] px-3 py-1 text-[11px] font-bold text-[#102236]">

                                    Team:
                                    {" "}
                                    {teams.find(
                                        (team) =>
                                            String(
                                                team._id ||
                                                    team.id
                                            ) ===
                                            String(
                                                teamFilter
                                            )
                                    )?.name ||
                                        "Selected Team"}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTeamFilter(
                                                "ALL"
                                            );
                                            setCurrentPage(
                                                1
                                            );
                                        }}
                                        className="ml-1 text-slate-500 hover:text-[#102236]"
                                    >
                                        ×
                                    </button>

                                </span>
                            )}


                            {search.trim() !==
                                "" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">

                                    Search:
                                    {" "}
                                    "{search}"

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch(
                                                ""
                                            );
                                            setCurrentPage(
                                                1
                                            );
                                        }}
                                        className="ml-1 text-slate-400 hover:text-slate-700"
                                    >
                                        ×
                                    </button>

                                </span>
                            )}

                        </div>


                        <div className="mt-3 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

                            <span>
                                Showing{" "}
                                <strong className="text-slate-600">
                                    {
                                        filteredUsers.length
                                    }
                                </strong>{" "}
                                matching users
                            </span>

                            {teamError && (
                                <span className="text-amber-600">
                                    Teams could not be loaded.
                                </span>
                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-5">

                            <p className="font-bold">
                                Unable to load users
                            </p>

                            <p className="mt-1">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={
                                    fetchUsers
                                }
                                className="mt-3 rounded-lg bg-[#102236] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#182F48]"
                            >
                                Try Again
                            </button>

                        </div>
                    )}


                    {/* ==================================================
                        MOBILE USER CARDS
                    ================================================== */}

                    {!error && (
                        <div className="block md:hidden">

                            {pageUsers.map(
                                (
                                    user,
                                    index
                                ) => {
                                    const userId =
                                        getUserId(
                                            user
                                        );

                                    const role =
                                        String(
                                            user.role ||
                                                "-"
                                        ).toUpperCase();

                                    const activityStatus =
                                        String(
                                            user.activityStatus ||
                                                "INACTIVE"
                                        ).toUpperCase();

                                    const teamName =
                                        getTeamName(
                                            user
                                        );

                                    return (
                                        <div
                                            key={
                                                userId ||
                                                `${user.email}-${index}`
                                            }
                                            className="border-b border-slate-100 p-4 last:border-b-0"
                                        >

                                            {/* USER */}

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-sm font-bold text-[#F6C945]">
                                                        {getInitials(
                                                            user.name
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-bold text-[#102236]">
                                                            {user.name ||
                                                                "Unknown User"}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                                            {user.email ||
                                                                "-"}
                                                        </p>

                                                    </div>

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            user
                                                        )
                                                    }
                                                    className="shrink-0 rounded-lg bg-[#102236] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#182F48]"
                                                >
                                                    Edit
                                                </button>

                                            </div>


                                            {/* DETAILS */}

                                            <div className="mt-4 grid grid-cols-2 gap-3">

                                                {/* ROLE */}

                                                <div className="rounded-xl bg-slate-50 p-3">

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Role
                                                    </p>

                                                    <span
                                                        className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                            role ===
                                                            "MANAGER"
                                                                ? "bg-violet-50 text-violet-700"
                                                                : "bg-blue-50 text-blue-700"
                                                        }`}
                                                    >
                                                        {role ===
                                                        "MANAGER"
                                                            ? "Manager"
                                                            : "Executive"}
                                                    </span>

                                                </div>


                                                {/* TEAM */}

                                                <div className="rounded-xl bg-slate-50 p-3">

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Team
                                                    </p>

                                                    <p className="mt-1.5 truncate text-xs font-bold text-[#102236]">
                                                        {teamName}
                                                    </p>

                                                </div>


                                                {/* STATUS */}

                                                <div className="rounded-xl bg-slate-50 p-3">

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Status
                                                    </p>

                                                    <span
                                                        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                            activityStatus ===
                                                            "ACTIVE"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >

                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                activityStatus ===
                                                                "ACTIVE"
                                                                    ? "bg-emerald-500"
                                                                    : "bg-slate-400"
                                                            }`}
                                                        />

                                                        {activityStatus ===
                                                        "ACTIVE"
                                                            ? "Active"
                                                            : "Inactive"}

                                                    </span>

                                                </div>


                                                {/* CREATED */}

                                                <div className="rounded-xl bg-slate-50 p-3">

                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        Created
                                                    </p>

                                                    <p className="mt-1.5 text-xs font-semibold text-slate-600">
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </p>

                                                </div>

                                            </div>


                                            {/* LAST ACTIVE */}

                                            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">

                                                <span className="text-xs text-slate-400">
                                                    Last Active
                                                </span>

                                                <span className="text-right text-xs font-semibold text-slate-600">
                                                    {formatDateTime(
                                                        user.lastActivityAt
                                                    )}
                                                </span>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}


                    {/* ==================================================
                        DESKTOP TABLE
                    ================================================== */}

                    {!error && (
                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full min-w-[1050px] text-left">

                                <thead className="bg-[#102236]">

                                    <tr>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            #
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            User
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Email
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Role
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Team
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Activity
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Last Active
                                        </th>

                                        <th className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Created
                                        </th>

                                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {pageUsers.map(
                                        (
                                            user,
                                            index
                                        ) => {
                                            const userId =
                                                getUserId(
                                                    user
                                                );

                                            const role =
                                                String(
                                                    user.role ||
                                                        "-"
                                                ).toUpperCase();

                                            const activityStatus =
                                                String(
                                                    user.activityStatus ||
                                                        "INACTIVE"
                                                ).toUpperCase();

                                            const teamName =
                                                getTeamName(
                                                    user
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        userId ||
                                                        `${user.email}-${index}`
                                                    }
                                                    className="group transition duration-200 hover:bg-[#FFFDF2]"
                                                >

                                                    {/* NUMBER */}

                                                    <td className="px-5 py-4 text-sm font-medium text-slate-400">
                                                        {startIndex +
                                                            index +
                                                            1}
                                                    </td>


                                                    {/* USER */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-xs font-bold text-[#F6C945] transition-transform duration-200 group-hover:scale-110">
                                                                {getInitials(
                                                                    user.name
                                                                )}
                                                            </div>

                                                            <p className="max-w-[180px] truncate text-sm font-bold text-[#102236]">
                                                                {user.name ||
                                                                    "Unknown User"}
                                                            </p>

                                                        </div>

                                                    </td>


                                                    {/* EMAIL */}

                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {user.email ||
                                                            "-"}
                                                    </td>


                                                    {/* ROLE */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                                role ===
                                                                "MANAGER"
                                                                    ? "bg-violet-50 text-violet-700"
                                                                    : "bg-blue-50 text-blue-700"
                                                            }`}
                                                        >
                                                            {role ===
                                                            "MANAGER"
                                                                ? "Manager"
                                                                : "Executive"}
                                                        </span>

                                                    </td>


                                                    {/* TEAM */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2">

                                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFF7D6] text-[#102236]">

                                                                <svg
                                                                    className="h-3.5 w-3.5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-9a4 4 0 110 8 4 4 0 010-8z"
                                                                    />
                                                                </svg>

                                                            </span>

                                                            <span className="max-w-[150px] truncate text-sm font-semibold text-slate-700">
                                                                {teamName}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* ACTIVITY */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                                                activityStatus ===
                                                                "ACTIVE"
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >

                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    activityStatus ===
                                                                    "ACTIVE"
                                                                        ? "bg-emerald-500"
                                                                        : "bg-slate-400"
                                                                }`}
                                                            />

                                                            {activityStatus ===
                                                            "ACTIVE"
                                                                ? "Active"
                                                                : "Inactive"}

                                                        </span>

                                                    </td>


                                                    {/* LAST ACTIVE */}

                                                    <td className="px-5 py-4 text-sm text-slate-500">
                                                        {formatDateTime(
                                                            user.lastActivityAt
                                                        )}
                                                    </td>


                                                    {/* CREATED */}

                                                    <td className="px-5 py-4 text-sm text-slate-500">
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </td>


                                                    {/* ACTION */}

                                                    <td className="px-5 py-4 text-right">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    user
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#102236] transition duration-200 hover:border-[#F6C945] hover:bg-[#FFF7D6]"
                                                            title="Edit User"
                                                        >

                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                                                />
                                                            </svg>

                                                            Edit

                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}


                    {/* ==================================================
                        EMPTY STATE
                    ================================================== */}

                    {!loading &&
                        !error &&
                        filteredUsers.length === 0 && (
                            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7D6] text-[#102236]">

                                    <svg
                                        className="h-7 w-7"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z"
                                        />
                                    </svg>

                                </div>

                                <h3 className="mt-4 text-lg font-bold text-[#102236]">
                                    No users found
                                </h3>

                                <p className="mt-1 max-w-sm text-sm text-slate-400">
                                    No users match the current search,
                                    role, team, or status filters.
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="mt-4 rounded-lg bg-[#102236] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#182F48]"
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>
                        )}


                    {/* ==================================================
                        PAGINATION
                    ================================================== */}

                    {!error &&
                        filteredUsers.length > 0 && (
                            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">

                                <p className="text-center text-xs text-slate-500 md:text-left sm:text-sm">

                                    Showing{" "}

                                    <strong className="text-[#102236]">
                                        {showingStart}
                                    </strong>

                                    -

                                    <strong className="text-[#102236]">
                                        {showingEnd}
                                    </strong>

                                    {" "}of{" "}

                                    <strong className="text-[#102236]">
                                        {
                                            filteredUsers.length
                                        }
                                    </strong>

                                    {" "}users

                                </p>


                                <div className="flex items-center justify-center gap-1.5">

                                    {/* PREVIOUS */}

                                    <button
                                        type="button"
                                        disabled={
                                            safeCurrentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.max(
                                                        1,
                                                        page -
                                                            1
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#F6C945] hover:bg-[#FFFBEA] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                                    >
                                        ←

                                        <span className="ml-1 hidden sm:inline">
                                            Previous
                                        </span>

                                    </button>


                                    {/* PAGE NUMBERS */}

                                    <div className="hidden items-center gap-1 sm:flex">

                                        {paginationNumbers.map(
                                            (page) => (
                                                <button
                                                    key={
                                                        page
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            page
                                                        )
                                                    }
                                                    className={`h-9 min-w-9 rounded-lg px-2 text-sm font-bold transition ${
                                                        page ===
                                                        safeCurrentPage
                                                            ? "bg-[#102236] text-[#F6C945]"
                                                            : "text-slate-600 hover:bg-[#FFF7D6]"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                    </div>


                                    {/* MOBILE PAGE */}

                                    <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#102236] px-3 text-sm font-bold text-[#F6C945] sm:hidden">
                                        {
                                            safeCurrentPage
                                        }
                                    </div>


                                    {/* NEXT */}

                                    <button
                                        type="button"
                                        disabled={
                                            safeCurrentPage >=
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page +
                                                            1
                                                    )
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#F6C945] hover:bg-[#FFFBEA] disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                                    >

                                        <span className="mr-1 hidden sm:inline">
                                            Next
                                        </span>

                                        →

                                    </button>

                                </div>

                            </div>
                        )}

                </section>

            </main>

        </div>
    );
}

export default ViewUsers;