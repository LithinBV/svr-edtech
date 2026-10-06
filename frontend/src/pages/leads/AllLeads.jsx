import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import LeadPageLayout from "../../components/leads/LeadPageLayout";

const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:3000")
    .replace(/\/$/, "") + "/api";

const AllLeads = () => {
    const navigate = useNavigate();

    // ============================================================
    // STATE
    // ============================================================

    const [leads, setLeads] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ============================================================
    // FILTER STATE
    // ============================================================

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [ownerFilter, setOwnerFilter] =
        useState("ALL");

    const [teamFilter, setTeamFilter] =
        useState("ALL");


    // ============================================================
    // FILTER OPTIONS
    // ============================================================

    const [owners, setOwners] = useState([]);

    const [teams, setTeams] = useState([]);


    // ============================================================
    // PAGINATION
    // ============================================================

    const [page, setPage] = useState(1);

    // UI pagination only. Backend returns all leads.
    const limit = 50;


    // ============================================================
    // GET TOKEN
    // ============================================================

    const getToken = useCallback(() => {
        return (
            localStorage.getItem("adminToken") ||
            localStorage.getItem("superAdminToken") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    }, []);


    // ============================================================
    // CLEAR AUTH
    // ============================================================

    const clearAuthAndRedirect = useCallback(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("superAdminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");

        navigate("/login", {
            replace: true,
        });
    }, [navigate]);


    // ============================================================
    // LOAD LEADS
    // ============================================================

    const loadLeads = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");


                // ------------------------------------------------
                // TOKEN
                // ------------------------------------------------

                const token = getToken();


                if (!token) {
                    clearAuthAndRedirect();
                    return;
                }


                // ------------------------------------------------
                // BUILD URL
                // ------------------------------------------------
                // Backend returns ALL leads.
                // Pagination is handled only by the UI.
                // ------------------------------------------------

                const response =
                    await fetch(
                        `${API_BASE}/leads`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );


                // ------------------------------------------------
                // RESPONSE
                // ------------------------------------------------

                let data = {};

                try {
                    data =
                        await response.json();
                } catch {
                    data = {};
                }


                console.log(
                    "ADMIN ALL LEADS RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // UNAUTHORIZED
                // ------------------------------------------------

                if (
                    response.status === 401
                ) {
                    clearAuthAndRedirect();
                    return;
                }


                // ------------------------------------------------
                // FORBIDDEN
                // ------------------------------------------------

                if (
                    response.status === 403
                ) {
                    setLeads([]);


                    setError(
                        data?.message ||
                            "You do not have permission to view leads."
                    );

                    return;
                }


                // ------------------------------------------------
                // OTHER API ERROR
                // ------------------------------------------------

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Failed to load leads."
                    );
                }


                // ------------------------------------------------
                // BACKEND ERROR
                // ------------------------------------------------

                if (
                    data?.success === false
                ) {
                    throw new Error(
                        data?.message ||
                            "Unable to load leads."
                    );
                }


                // ------------------------------------------------
                // LEADS
                // ------------------------------------------------

                const fetchedLeads =
                    Array.isArray(
                        data?.leads
                    )
                        ? data.leads
                        : [];


                setLeads(
                    fetchedLeads
                );


                // ------------------------------------------------
                // STORE ALL LEADS
                // ------------------------------------------------

                setLeads(
                    fetchedLeads
                );

                console.log(
                    "ALL LEADS LOADED:",
                    {
                        totalLeads:
                            fetchedLeads.length,
                    }
                );

            } catch (err) {

                console.error(
                    "All leads loading error:",
                    err
                );


                setLeads([]);




                setError(
                    err?.message ||
                        "Unable to load leads."
                );


            } finally {

                setLoading(false);

            }
        },
        [
            getToken,
            clearAuthAndRedirect,
        ]
    );


    // ============================================================
    // LOAD TEAMS
    // ============================================================

    const loadTeams = useCallback(
        async () => {

            try {

                const token =
                    getToken();


                if (!token) {
                    return;
                }


                const response =
                    await fetch(
                        `${API_BASE}/teams`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json",
                            },
                        }
                    );


                let data = {};

                try {
                    data =
                        await response.json();
                } catch {
                    data = {};
                }


                console.log(
                    "ADMIN TEAMS RESPONSE:",
                    data
                );


                if (
                    response.status === 401
                ) {
                    clearAuthAndRedirect();
                    return;
                }


                if (!response.ok) {

                    console.warn(
                        "Unable to load teams:",
                        data?.message
                    );

                    setTeams([]);

                    return;
                }


                const fetchedTeams =
                    Array.isArray(
                        data?.teams
                    )
                        ? data.teams
                        : [];


                setTeams(
                    fetchedTeams
                );


            } catch (err) {

                console.error(
                    "Teams loading error:",
                    err
                );

                setTeams([]);

            }

        },
        [
            getToken,
            clearAuthAndRedirect,
        ]
    );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadLeads();

        loadTeams();

    }, [
        loadLeads,
        loadTeams,
    ]);


    // ============================================================
    // BUILD OWNER LIST
    // ============================================================

    useEffect(() => {

        const ownerMap =
            new Map();


        leads.forEach(
            (lead) => {

                const owner =
                    lead?.leadOwner ||
                    lead?.owner ||
                    null;


                if (!owner) {
                    return;
                }


                const ownerId =
                    owner?._id ||
                    owner?.id;


                if (!ownerId) {
                    return;
                }


                const ownerName =
                    owner?.name ||
                    owner?.email ||
                    "Unknown Owner";


                if (
                    !ownerMap.has(
                        String(ownerId)
                    )
                ) {

                    ownerMap.set(
                        String(ownerId),
                        {
                            ...owner,

                            _id:
                                ownerId,

                            name:
                                ownerName,
                        }
                    );

                }

            }
        );


        setOwners(
            Array.from(
                ownerMap.values()
            ).sort(
                (a, b) =>
                    String(
                        a?.name || ""
                    )
                        .toLowerCase()
                        .localeCompare(
                            String(
                                b?.name || ""
                            )
                                .toLowerCase()
                        )
            )
        );

    }, [leads]);


    // ============================================================
    // FILTER LEADS
    // ============================================================

    const filteredLeads =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return leads.filter(
                (lead) => {

                    // --------------------------------------------
                    // STATUS
                    // --------------------------------------------

                    if (
                        statusFilter !==
                        "ALL"
                    ) {

                        const leadStatus =
                            String(
                                lead?.status ||
                                    ""
                            )
                                .trim()
                                .toUpperCase();


                        if (
                            leadStatus !==
                            statusFilter.toUpperCase()
                        ) {
                            return false;
                        }

                    }


                    // --------------------------------------------
                    // OWNER
                    // --------------------------------------------

                    if (
                        ownerFilter !==
                        "ALL"
                    ) {

                        const owner =
                            lead?.leadOwner ||
                            lead?.owner ||
                            null;


                        const leadOwnerId =
                            owner?._id ||
                            owner?.id ||
                            lead?.leadOwnerId ||
                            lead?.ownerId;


                        if (
                            String(
                                leadOwnerId || ""
                            ) !==
                            String(
                                ownerFilter
                            )
                        ) {
                            return false;
                        }

                    }


                    // --------------------------------------------
                    // TEAM
                    // --------------------------------------------

                    if (
                        teamFilter !==
                        "ALL"
                    ) {

                        const owner =
                            lead?.leadOwner ||
                            lead?.owner ||
                            null;


                        const leadOwnerId =
                            owner?._id ||
                            owner?.id ||
                            lead?.leadOwnerId ||
                            lead?.ownerId;


                        if (!leadOwnerId) {
                            return false;
                        }


                        const selectedTeam =
                            teams.find(
                                (team) =>
                                    String(
                                        team?._id ||
                                            team?.id
                                    ) ===
                                    String(
                                        teamFilter
                                    )
                            );


                        if (
                            !selectedTeam
                        ) {
                            return false;
                        }


                        const memberIds =
                            [];


                        // Manager
                        if (
                            selectedTeam?.manager
                        ) {

                            const managerId =
                                selectedTeam
                                    .manager?._id ||
                                selectedTeam
                                    .manager?.id ||
                                selectedTeam
                                    .manager;


                            if (
                                managerId
                            ) {

                                memberIds.push(
                                    String(
                                        managerId
                                    )
                                );

                            }

                        }


                        // Executives
                        if (
                            Array.isArray(
                                selectedTeam?.executives
                            )
                        ) {

                            selectedTeam.executives.forEach(
                                (
                                    executive
                                ) => {

                                    const executiveId =
                                        executive?._id ||
                                        executive?.id ||
                                        executive;


                                    if (
                                        executiveId
                                    ) {

                                        memberIds.push(
                                            String(
                                                executiveId
                                            )
                                        );

                                    }

                                }
                            );

                        }


                        if (
                            !memberIds.includes(
                                String(
                                    leadOwnerId
                                )
                            )
                        ) {
                            return false;
                        }

                    }


                    // --------------------------------------------
                    // SEARCH
                    // --------------------------------------------

                    if (
                        !searchValue
                    ) {
                        return true;
                    }


                    const searchableValues =
                        [

                            lead?.name,

                            lead?.email,

                            lead?.contact,

                            lead?.phone,

                            lead?.collegeName,

                            lead?.college,

                            lead?.department,

                            lead?.state,

                            lead?.district,

                            lead?.leadSource,

                            lead?.leadType,

                            lead?.programInterest,

                            lead?.leadOwner
                                ?.name,

                            lead?.leadOwner
                                ?.email,

                            lead?.owner
                                ?.name,

                            lead?.owner
                                ?.email,

                        ];


                    return searchableValues.some(
                        (value) =>
                            String(
                                value || ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchValue
                                )
                    );

                }
            );

        }, [
            leads,
            search,
            statusFilter,
            ownerFilter,
            teamFilter,
            teams,
        ]);


    // ============================================================
    // VIEW LEAD
    // ============================================================

    const handleViewLead =
        useCallback(
            (lead) => {

                const leadId =
                    lead?._id ||
                    lead?.id ||
                    lead?.leadId;


                if (!leadId) {

                    console.warn(
                        "Unable to view lead: missing lead ID.",
                        lead
                    );

                    return;
                }


                navigate(
                    `/leads/${leadId}`
                );

            },
            [navigate]
        );


    // ============================================================
    // SEARCH CHANGE
    // ============================================================

    const handleSearchChange =
        useCallback(
            (value) => {

                setSearch(value);
                setPage(1);

            },
            []
        );


    // ============================================================
    // STATUS CHANGE
    // ============================================================

    const handleStatusChange =
        useCallback(
            (value) => {

                setStatusFilter(value);
                setPage(1);

            },
            []
        );


    // ============================================================
    // OWNER CHANGE
    // ============================================================

    const handleOwnerChange =
        useCallback(
            (value) => {

                setOwnerFilter(value);
                setPage(1);

            },
            []
        );


    // ============================================================
    // TEAM CHANGE
    // ============================================================

    const handleTeamChange =
        useCallback(
            (value) => {

                setTeamFilter(value);
                setPage(1);

            },
            []
        );


    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh =
        useCallback(
            () => {

                loadLeads();

                loadTeams();

            },
            [
                loadLeads,
                loadTeams,
            ]
        );


    // ============================================================
    // UI PAGINATION
    // ============================================================

    const total =
        filteredLeads.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / limit
            )
        );

    const hasNextPage =
        page < totalPages;

    const hasPreviousPage =
        page > 1;

    // Display only 50 leads per page.
    // Changing pages does NOT call the backend.
    const paginatedLeads =
        useMemo(() => {

            const startIndex =
                (page - 1) * limit;

            const endIndex =
                startIndex + limit;

            return filteredLeads.slice(
                startIndex,
                endIndex
            );

        }, [
            filteredLeads,
            page,
        ]);


    // ============================================================
    // PREVIOUS PAGE
    // ============================================================

    const goToPreviousPage =
        useCallback(
            () => {

                if (
                    !hasPreviousPage
                ) {
                    return;
                }

                setPage((currentPage) =>
                    Math.max(
                        1,
                        currentPage - 1
                    )
                );

            },
            [hasPreviousPage]
        );


    // ============================================================
    // NEXT PAGE
    // ============================================================

    const goToNextPage =
        useCallback(
            () => {

                if (
                    !hasNextPage
                ) {
                    return;
                }

                setPage((currentPage) =>
                    Math.min(
                        totalPages,
                        currentPage + 1
                    )
                );

            },
            [
                hasNextPage,
                totalPages,
            ]
        );


    // ============================================================
    // PAGE NUMBER
    // ============================================================

    const goToPage =
        useCallback(
            (pageNumber) => {

                if (
                    pageNumber < 1 ||
                    pageNumber > totalPages ||
                    pageNumber === page
                ) {
                    return;
                }

                setPage(pageNumber);

            },
            [
                page,
                totalPages,
            ]
        );


    // ============================================================
    // PAGE NUMBERS
    // ============================================================

    const pageNumbers =
        useMemo(() => {

            if (
                totalPages <= 0
            ) {
                return [];
            }


            const pages = [];

            const maxVisiblePages = 5;


            let startPage =
                Math.max(
                    1,
                    page - 2
                );


            let endPage =
                Math.min(
                    totalPages,
                    startPage +
                        maxVisiblePages -
                        1
                );


            if (
                endPage -
                    startPage +
                    1 <
                maxVisiblePages
            ) {

                startPage =
                    Math.max(
                        1,
                        endPage -
                            maxVisiblePages +
                            1
                    );

            }


            for (
                let i = startPage;
                i <= endPage;
                i++
            ) {

                pages.push(i);

            }


            return pages;

        }, [
            page,
            totalPages,
        ]);


    // ============================================================
    // HEADER ACTIONS
    // ============================================================

    const headerAction = (

        <div className="flex flex-wrap items-center gap-2">

            {/* BULK UPLOAD */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/bulk-upload-leads"
                    )
                }
                className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-700
                    shadow-sm
                    transition
                    hover:border-[#F6C945]
                    hover:bg-[#F6C945]/10
                    hover:text-slate-900
                    active:scale-[0.98]
                "
            >

                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                >

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16V4"
                    />

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m7 9 5-5 5 5"
                    />

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 20h14"
                    />

                </svg>


                <span className="hidden sm:inline">
                    Bulk Upload
                </span>

            </button>


            {/* ADD LEAD */}

            <button
                type="button"
                onClick={() =>
                    navigate(
                        "/add-lead"
                    )
                }
                className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#F6C945]
                    px-4
                    text-sm
                    font-bold
                    text-[#102236]
                    shadow-sm
                    transition
                    hover:bg-[#e9ba32]
                    hover:shadow-md
                    active:scale-[0.98]
                "
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
                        d="M12 5v14"
                    />

                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14"
                    />

                </svg>


                <span>
                    Add Lead
                </span>

            </button>

        </div>

    );


    // ============================================================
    // PAGINATION FOOTER
    // ============================================================

    const paginationFooter = (

        <div
            className="
                mt-5
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-4
                shadow-sm
                sm:flex-row
                sm:items-center
                sm:justify-between
            "
        >

            {/* RESULTS */}

            <div className="text-sm text-slate-500">

                {total > 0 ? (

                    <>

                        Showing{" "}

                        <span className="font-semibold text-slate-800">

                            {(page - 1) *
                                limit +
                                1}

                        </span>

                        {" – "}

                        <span className="font-semibold text-slate-800">

                            {Math.min(
                                page *
                                    limit,
                                total
                            )}

                        </span>

                        {" of "}

                        <span className="font-semibold text-slate-800">

                            {total}

                        </span>

                        {" "}leads

                    </>

                ) : (

                    "No leads found"

                )}

            </div>


            {/* PAGINATION */}

            {totalPages > 1 && (

                <div className="flex items-center gap-1.5">

                    {/* PREVIOUS */}

                    <button
                        type="button"
                        onClick={
                            goToPreviousPage
                        }
                        disabled={
                            !hasPreviousPage ||
                            loading
                        }
                        className="
                            inline-flex
                            h-9
                            min-w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            transition
                            hover:border-[#F6C945]
                            hover:bg-[#F6C945]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Previous
                    </button>


                    {/* PAGE NUMBERS */}

                    {pageNumbers.map(
                        (pageNumber) => (

                            <button
                                key={
                                    pageNumber
                                }
                                type="button"
                                onClick={() =>
                                    goToPage(
                                        pageNumber
                                    )
                                }
                                disabled={
                                    loading
                                }
                                className={`
                                    inline-flex
                                    h-9
                                    min-w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    px-3
                                    text-sm
                                    font-bold
                                    transition

                                    ${
                                        pageNumber ===
                                        page

                                            ? "bg-[#102236] text-white shadow-sm"

                                            : "border border-slate-200 bg-white text-slate-700 hover:border-[#F6C945] hover:bg-[#F6C945]/10"
                                    }
                                `}
                            >

                                {
                                    pageNumber
                                }

                            </button>

                        )
                    )}


                    {/* NEXT */}

                    <button
                        type="button"
                        onClick={
                            goToNextPage
                        }
                        disabled={
                            !hasNextPage ||
                            loading
                        }
                        className="
                            inline-flex
                            h-9
                            min-w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            transition
                            hover:border-[#F6C945]
                            hover:bg-[#F6C945]/10
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Next
                    </button>

                </div>

            )}

        </div>

    );


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="min-h-screen bg-[#f8fafc]">

            <div className="h-1 w-full bg-[#F6C945]" />


            <LeadPageLayout

                title="All Leads"

                description="View, search and manage all leads from one place."


                // ------------------------------------------------
                // CURRENT PAGE LEADS
                // ------------------------------------------------

                leads={
                    paginatedLeads
                }


                // ------------------------------------------------
                // STATS
                // ------------------------------------------------

                statsLeads={
                    leads
                }


                // ------------------------------------------------
                // LOADING / ERROR
                // ------------------------------------------------

                loading={
                    loading
                }

                error={
                    error
                }


                // ------------------------------------------------
                // SEARCH
                // ------------------------------------------------

                search={
                    search
                }


                // ------------------------------------------------
                // STATUS
                // ------------------------------------------------

                statusFilter={
                    statusFilter
                }


                // ------------------------------------------------
                // OWNER
                // ------------------------------------------------

                ownerFilter={
                    ownerFilter
                }


                // ------------------------------------------------
                // TEAM
                // ------------------------------------------------

                teamFilter={
                    teamFilter
                }


                // ------------------------------------------------
                // OPTIONS
                // ------------------------------------------------

                owners={
                    owners
                }

                teams={
                    teams
                }


                // ------------------------------------------------
                // CALLBACKS
                // ------------------------------------------------

                onSearchChange={
                    handleSearchChange
                }

                onStatusChange={
                    handleStatusChange
                }

                onOwnerChange={
                    handleOwnerChange
                }

                onTeamChange={
                    handleTeamChange
                }

                onRefresh={
                    handleRefresh
                }

                onViewLead={
                    handleViewLead
                }


                // ------------------------------------------------
                // DISPLAY
                // ------------------------------------------------

                showStats={
                    true
                }

                showStatusFilter={
                    true
                }

                showOwnerFilter={
                    true
                }

                showTeamFilter={
                    true
                }


                // ------------------------------------------------
                // HEADER
                // ------------------------------------------------

                headerAction={
                    headerAction
                }

            />


            {/* ====================================================
                PAGINATION
            ==================================================== */}

            <div
                className="
                    mx-auto
                    max-w-[1600px]
                    px-4
                    pb-6
                    sm:px-6
                    lg:px-8
                "
            >

                {paginationFooter}

            </div>

        </div>

    );

};


export default AllLeads;