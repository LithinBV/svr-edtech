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

const ColdLeads = () => {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [allLeads, setAllLeads] =
        useState([]);

    const [teams, setTeams] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");


    // =========================================================
    // OWNER / TEAM FILTERS
    // =========================================================

    const [ownerFilter, setOwnerFilter] =
        useState("");

    const [teamFilter, setTeamFilter] =
        useState("");


    // =========================================================
    // UI PAGINATION
    //
    // IMPORTANT:
    // Backend returns ALL leads.
    //
    // Frontend:
    // 1. Gets all leads
    // 2. Filters COLD leads
    // 3. Applies search / owner / team filters
    // 4. Displays 50 records per page
    //
    // Changing page DOES NOT call the backend.
    // =========================================================

    const [page, setPage] =
        useState(1);

    const limit = 50;


    // =========================================================
    // GET TOKEN
    // =========================================================

    const getToken = () => {

        return (
            localStorage.getItem(
                "adminToken"
            ) ||

            localStorage.getItem(
                "superAdminToken"
            ) ||

            localStorage.getItem(
                "accessToken"
            ) ||

            localStorage.getItem(
                "token"
            ) ||

            localStorage.getItem(
                "access_token"
            ) ||

            localStorage.getItem(
                "jwt"
            ) ||

            localStorage.getItem(
                "authToken"
            )
        );

    };


    // =========================================================
    // GET TEMPERATURE
    // =========================================================

    const getTemperature = (
        lead
    ) => {

        const possibleValues = [

            lead?.temperature,

            lead?.leadTemperature,

            lead?.priority,

            lead?.status,

        ];


        for (
            const value
            of possibleValues
        ) {

            const normalized =
                String(
                    value || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                [
                    "HOT",
                    "WARM",
                    "COLD",
                ].includes(
                    normalized
                )
            ) {

                return normalized;

            }

        }


        return "";

    };


    // =========================================================
    // LOAD ALL LEADS
    //
    // IMPORTANT:
    // NO page / limit is sent to backend.
    // =========================================================

    const loadLeads =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError("");


                    const token =
                        getToken();


                    if (!token) {

                        navigate(
                            "/login"
                        );

                        return;

                    }


                    // =================================================
                    // API
                    // =================================================

                    const response =
                        await fetch(
                            `${API_BASE}/leads`,
                            {

                                method:
                                    "GET",

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

                    }

                    catch {

                        data = {};

                    }


                    // =================================================
                    // UNAUTHORIZED
                    // =================================================

                    if (
                        response.status ===
                        401
                    ) {

                        localStorage.removeItem(
                            "adminToken"
                        );

                        localStorage.removeItem(
                            "superAdminToken"
                        );

                        localStorage.removeItem(
                            "accessToken"
                        );

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "access_token"
                        );

                        localStorage.removeItem(
                            "jwt"
                        );

                        localStorage.removeItem(
                            "authToken"
                        );

                        localStorage.removeItem(
                            "refreshToken"
                        );

                        localStorage.removeItem(
                            "userType"
                        );


                        navigate(
                            "/login"
                        );

                        return;

                    }


                    // =================================================
                    // FORBIDDEN
                    // =================================================

                    if (
                        response.status ===
                        403
                    ) {

                        setAllLeads([]);

                        setPage(1);

                        setError(
                            data?.message ||
                                "You do not have permission to view leads."
                        );

                        return;

                    }


                    // =================================================
                    // OTHER ERRORS
                    // =================================================

                    if (
                        !response.ok
                    ) {

                        throw new Error(
                            data?.message ||
                                "Failed to load leads."
                        );

                    }


                    // =================================================
                    // GET ALL LEADS
                    // =================================================

                    const fetchedLeads =
                        Array.isArray(
                            data?.leads
                        )
                            ? data.leads
                            : Array.isArray(
                                data
                            )
                                ? data
                                : [];


                    setAllLeads(
                        fetchedLeads
                    );


                    // Reset UI page
                    // after refresh.

                    setPage(1);

                }

                catch (
                    err
                ) {

                    console.error(
                        "Cold leads loading error:",
                        err
                    );


                    setAllLeads([]);

                    setPage(1);


                    setError(
                        err?.message ||
                            "Unable to load cold leads."
                    );

                }

                finally {

                    setLoading(
                        false
                    );

                }

            },

            [
                navigate
            ]
        );


    // =========================================================
    // LOAD TEAMS
    // =========================================================

    const loadTeams =
        useCallback(
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

                                method:
                                    "GET",

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

                    }

                    catch {

                        data = {};

                    }


                    if (
                        !response.ok
                    ) {

                        console.error(
                            "Teams loading failed:",
                            response.status,
                            data
                        );


                        setTeams([]);

                        return;

                    }


                    const fetchedTeams =
                        Array.isArray(
                            data?.teams
                        )
                            ? data.teams
                            : Array.isArray(
                                data
                            )
                                ? data
                                : [];


                    setTeams(
                        fetchedTeams
                    );

                }

                catch (
                    err
                ) {

                    console.error(
                        "Teams loading error:",
                        err
                    );


                    setTeams([]);

                }

            },

            []
        );


    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(
        () => {

            loadLeads();

            loadTeams();

        },

        [
            loadLeads,
            loadTeams,
        ]
    );


    // =========================================================
    // GET ONLY COLD LEADS
    // =========================================================

    const coldLeads =
        useMemo(
            () => {

                return allLeads.filter(
                    (
                        lead
                    ) =>
                        getTemperature(
                            lead
                        ) === "COLD"
                );

            },

            [
                allLeads
            ]
        );


    // =========================================================
    // OWNER LIST
    // =========================================================

    const owners =
        useMemo(
            () => {

                const ownerMap =
                    new Map();


                allLeads.forEach(
                    (
                        lead
                    ) => {

                        const owner =
                            lead?.leadOwner ||
                            lead?.owner;


                        if (!owner) {

                            return;

                        }


                        const ownerId =
                            owner?._id ||
                            owner?.id;


                        const ownerName =
                            owner?.name ||
                            owner?.email ||
                            "Unknown Owner";


                        const ownerEmail =
                            owner?.email ||
                            "";


                        if (
                            ownerId
                        ) {

                            ownerMap.set(
                                String(
                                    ownerId
                                ),
                                {

                                    _id:
                                        String(
                                            ownerId
                                        ),

                                    name:
                                        ownerName,

                                    email:
                                        ownerEmail,

                                }
                            );

                        }

                    }
                );


                return Array.from(
                    ownerMap.values()
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            a.name ||
                                ""
                        )
                            .toLowerCase()
                            .localeCompare(
                                String(
                                    b.name ||
                                        ""
                                )
                                    .toLowerCase()
                            )
                );

            },

            [
                allLeads
            ]
        );


    // =========================================================
    // GET TEAM MEMBER IDS
    // =========================================================

    const getTeamMemberIds =
        useCallback(
            (
                team
            ) => {

                const ids = [];


                const manager =
                    team?.manager;


                const managerId =
                    manager?._id ||
                    manager?.id ||
                    team?.managerId;


                if (
                    managerId
                ) {

                    ids.push(
                        String(
                            managerId
                        )
                    );

                }


                const executives =
                    Array.isArray(
                        team?.executives
                    )
                        ? team.executives
                        : [];


                executives.forEach(
                    (
                        executive
                    ) => {

                        const executiveId =
                            executive?._id ||
                            executive?.id;


                        if (
                            executiveId
                        ) {

                            ids.push(
                                String(
                                    executiveId
                                )
                            );

                        }

                    }
                );


                return ids;

            },

            []
        );


    // =========================================================
    // FILTER COLD LEADS
    //
    // IMPORTANT:
    // Filtering happens BEFORE pagination.
    // =========================================================

    const filteredLeads =
        useMemo(
            () => {

                const searchValue =
                    search
                        .trim()
                        .toLowerCase();


                return coldLeads.filter(
                    (
                        lead
                    ) => {


                        // -------------------------------------------------
                        // OWNER FILTER
                        // -------------------------------------------------

                        if (
                            ownerFilter
                        ) {

                            const owner =
                                lead?.leadOwner ||
                                lead?.owner;


                            const leadOwnerId =
                                owner?._id ||
                                owner?.id;


                            if (
                                String(
                                    leadOwnerId ||
                                        ""
                                ) !==
                                String(
                                    ownerFilter
                                )
                            ) {

                                return false;

                            }

                        }


                        // -------------------------------------------------
                        // TEAM FILTER
                        // -------------------------------------------------

                        if (
                            teamFilter
                        ) {

                            const selectedTeam =
                                teams.find(
                                    (
                                        team
                                    ) =>
                                        String(
                                            team?._id ||
                                                team?.id ||
                                                ""
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


                            const teamMemberIds =
                                getTeamMemberIds(
                                    selectedTeam
                                );


                            const owner =
                                lead?.leadOwner ||
                                lead?.owner;


                            const leadOwnerId =
                                owner?._id ||
                                owner?.id;


                            if (
                                !leadOwnerId ||
                                !teamMemberIds.includes(
                                    String(
                                        leadOwnerId
                                    )
                                )
                            ) {

                                return false;

                            }

                        }


                        // -------------------------------------------------
                        // SEARCH
                        // -------------------------------------------------

                        if (
                            !searchValue
                        ) {

                            return true;

                        }


                        const values = [

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

                            lead?.leadOwner?.name,

                            lead?.leadOwner?.email,

                            lead?.owner?.name,

                            lead?.owner?.email,

                        ];


                        return values.some(
                            (
                                value
                            ) =>
                                String(
                                    value ||
                                        ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    )
                        );

                    }
                );

            },

            [
                coldLeads,
                search,
                ownerFilter,
                teamFilter,
                teams,
                getTeamMemberIds,
            ]
        );


    // =========================================================
    // RESET PAGE WHEN FILTERS CHANGE
    // =========================================================

    useEffect(
        () => {

            setPage(1);

        },

        [
            search,
            ownerFilter,
            teamFilter,
        ]
    );


    // =========================================================
    // UI PAGINATION
    //
    // filteredLeads = ALL FILTERED COLD LEADS
    //
    // paginatedLeads = ONLY 50 DISPLAYED LEADS
    // =========================================================

    const total =
        filteredLeads.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / limit
            )
        );


    // =========================================================
    // PAGE SAFETY
    // =========================================================

    useEffect(
        () => {

            if (
                page > totalPages
            ) {

                setPage(
                    totalPages
                );

            }

        },

        [
            page,
            totalPages,
        ]
    );


    // =========================================================
    // CURRENT PAGE LEADS
    // =========================================================

    const paginatedLeads =
        useMemo(
            () => {

                const startIndex =
                    (
                        page - 1
                    ) * limit;


                const endIndex =
                    startIndex +
                    limit;


                return filteredLeads.slice(
                    startIndex,
                    endIndex
                );

            },

            [
                filteredLeads,
                page,
                limit,
            ]
        );


    // =========================================================
    // PREVIOUS PAGE
    // =========================================================

    const goToPreviousPage =
        useCallback(
            () => {

                setPage(
                    (
                        currentPage
                    ) =>
                        Math.max(
                            1,
                            currentPage - 1
                        )
                );

            },

            []
        );


    // =========================================================
    // NEXT PAGE
    // =========================================================

    const goToNextPage =
        useCallback(
            () => {

                setPage(
                    (
                        currentPage
                    ) =>
                        Math.min(
                            totalPages,
                            currentPage + 1
                        )
                );

            },

            [
                totalPages
            ]
        );


    // =========================================================
    // GO TO PAGE
    // =========================================================

    const goToPage =
        useCallback(
            (
                pageNumber
            ) => {

                if (
                    pageNumber < 1 ||
                    pageNumber > totalPages
                ) {

                    return;

                }


                setPage(
                    pageNumber
                );

            },

            [
                totalPages
            ]
        );


    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    const pageNumbers =
        useMemo(
            () => {

                if (
                    totalPages <= 1
                ) {

                    return [];

                }


                const pages = [];

                const maxVisiblePages =
                    5;


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
                    let i =
                        startPage;

                    i <=
                    endPage;

                    i++
                ) {

                    pages.push(
                        i
                    );

                }


                return pages;

            },

            [
                page,
                totalPages,
            ]
        );


    // =========================================================
    // VIEW LEAD
    // =========================================================

    const handleViewLead =
        useCallback(
            (
                lead
            ) => {

                const leadId =
                    lead?._id ||
                    lead?.id;


                if (
                    !leadId
                ) {

                    return;

                }


                navigate(
                    `/leads/${leadId}`
                );

            },

            [
                navigate
            ]
        );


    // =========================================================
    // ADD NEW LEAD
    // =========================================================

    const handleAddLead =
        useCallback(
            () => {

                navigate(
                    "/add-lead"
                );

            },

            [
                navigate
            ]
        );


    // =========================================================
    // SEARCH CHANGE
    // =========================================================

    const handleSearchChange =
        useCallback(
            (
                value
            ) => {

                setSearch(
                    value
                );

                setPage(1);

            },

            []
        );


    // =========================================================
    // OWNER CHANGE
    // =========================================================

    const handleOwnerChange =
        useCallback(
            (
                value
            ) => {

                setOwnerFilter(
                    value
                );

                setPage(1);

            },

            []
        );


    // =========================================================
    // TEAM CHANGE
    // =========================================================

    const handleTeamChange =
        useCallback(
            (
                value
            ) => {

                setTeamFilter(
                    value
                );

                setPage(1);

            },

            []
        );


    // =========================================================
    // REFRESH
    // =========================================================

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


    // =========================================================
    // PAGINATION FOOTER
    // =========================================================

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

            {/* =====================================================
                RESULTS COUNT
            ===================================================== */}

            <div
                className="
                    text-sm
                    text-slate-500
                "
            >

                {total > 0 ? (

                    <>

                        Showing{" "}

                        <span
                            className="
                                font-semibold
                                text-slate-800
                            "
                        >

                            {
                                (
                                    page - 1
                                ) * limit + 1
                            }

                        </span>

                        {" – "}

                        <span
                            className="
                                font-semibold
                                text-slate-800
                            "
                        >

                            {
                                Math.min(
                                    page * limit,
                                    total
                                )
                            }

                        </span>

                        {" of "}

                        <span
                            className="
                                font-semibold
                                text-slate-800
                            "
                        >

                            {total}

                        </span>

                        {" "}cold leads

                    </>

                ) : (

                    "No cold leads found"

                )}

            </div>


            {/* =====================================================
                PAGINATION CONTROLS
            ===================================================== */}

            {totalPages > 1 && (

                <div
                    className="
                        flex
                        items-center
                        gap-1.5
                        overflow-x-auto
                    "
                >

                    {/* ------------------------------------------------
                        PREVIOUS
                    ------------------------------------------------ */}

                    <button
                        type="button"
                        onClick={
                            goToPreviousPage
                        }
                        disabled={
                            page === 1
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


                    {/* ------------------------------------------------
                        PAGE NUMBERS
                    ------------------------------------------------ */}

                    {pageNumbers.map(
                        (
                            pageNumber
                        ) => (

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

                                {pageNumber}

                            </button>

                        )
                    )}


                    {/* ------------------------------------------------
                        NEXT
                    ------------------------------------------------ */}

                    <button
                        type="button"
                        onClick={
                            goToNextPage
                        }
                        disabled={
                            page ===
                            totalPages
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


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div
            className="
                min-h-screen
                bg-[#f8fafc]
            "
        >

            <div
                className="
                    h-1
                    w-full
                    bg-[#F6C945]
                "
            />


            <LeadPageLayout

                title="Cold Leads"

                description="
                    Review leads that currently have lower engagement or interest.
                "


                // -------------------------------------------------
                // TABLE
                //
                // ONLY CURRENT PAGE IS SENT TO TABLE
                // -------------------------------------------------

                leads={
                    paginatedLeads
                }


                // -------------------------------------------------
                // GLOBAL STATISTICS
                // -------------------------------------------------

                statsLeads={
                    allLeads
                }


                loading={
                    loading
                }

                error={
                    error
                }


                // -------------------------------------------------
                // SEARCH
                // -------------------------------------------------

                search={
                    search
                }

                statusFilter="COLD"

                onSearchChange={
                    handleSearchChange
                }

                onStatusChange={
                    undefined
                }


                // -------------------------------------------------
                // OWNER FILTER
                // -------------------------------------------------

                ownerFilter={
                    ownerFilter
                }

                owners={
                    owners
                }

                onOwnerChange={
                    handleOwnerChange
                }


                // -------------------------------------------------
                // TEAM FILTER
                // -------------------------------------------------

                teamFilter={
                    teamFilter
                }

                teams={
                    teams
                }

                onTeamChange={
                    handleTeamChange
                }


                // -------------------------------------------------
                // ACTIONS
                // -------------------------------------------------

                onRefresh={
                    handleRefresh
                }

                onViewLead={
                    handleViewLead
                }


                // -------------------------------------------------
                // DISPLAY OPTIONS
                // -------------------------------------------------

                showStats={
                    true
                }

                showStatusFilter={
                    false
                }


                // -------------------------------------------------
                // ADD NEW LEAD
                // -------------------------------------------------

                headerAction={

                    <button
                        type="button"
                        onClick={
                            handleAddLead
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-[#F6C945]
                            px-4
                            py-2.5
                            text-sm
                            font-semibold
                            text-[#102236]
                            shadow-sm
                            transition-all
                            duration-200
                            hover:bg-[#e5b932]
                            hover:shadow-md
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#F6C945]
                            focus:ring-offset-2
                            active:scale-[0.98]
                        "
                    >

                        <svg
                            className="
                                h-4
                                w-4
                            "
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="
                                    M12 5v14
                                "
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="
                                    M5 12h14
                                "
                            />

                        </svg>

                        Add New Lead

                    </button>

                }

            />


            {/* =====================================================
                UI PAGINATION
            ===================================================== */}

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

                {
                    paginationFooter
                }

            </div>

        </div>

    );

};


export default ColdLeads;