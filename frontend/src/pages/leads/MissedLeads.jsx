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

const MissedLeads = () => {

    const navigate = useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    // ALL LEADS
    // Used for the upper statistics section
    const [allLeads, setAllLeads] = useState([]);


    // MISSED LEADS
    // All missed leads before UI filtering/pagination
    const [leads, setLeads] = useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // SEARCH
    const [search, setSearch] =
        useState("");


    // OWNER
    const [ownerFilter, setOwnerFilter] =
        useState("ALL");


    // TEAM
    const [teamFilter, setTeamFilter] =
        useState("ALL");


    // AVAILABLE OWNERS
    const [owners, setOwners] =
        useState([]);


    // AVAILABLE TEAMS
    const [teams, setTeams] =
        useState([]);


    // ============================================================
    // UI PAGINATION
    //
    // IMPORTANT:
    // Backend does NOT paginate.
    //
    // Frontend:
    // 1. Gets all missed leads
    // 2. Filters them
    // 3. Displays 50 at a time
    // ============================================================

    const [page, setPage] =
        useState(1);


    const limit = 50;


    // ============================================================
    // GET TOKEN
    // ============================================================

    const getToken =
        useCallback(
            () => {

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

            },

            []
        );


    // ============================================================
    // LOAD LEADS
    // ============================================================

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
                            "/login",
                            {
                                replace:
                                    true,
                            }
                        );

                        return;

                    }


                    // ====================================================
                    // 1. LOAD ALL LEADS
                    //
                    // NO PAGE / LIMIT
                    //
                    // Used for:
                    // Total
                    // New
                    // Hot
                    // Warm
                    // Cold
                    // etc.
                    // ====================================================

                    const allResponse =
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


                    // ====================================================
                    // AUTH ERROR
                    // ====================================================

                    if (
                        allResponse.status ===
                            401 ||
                        allResponse.status ===
                            403
                    ) {

                        localStorage.removeItem(
                            "adminToken"
                        );

                        localStorage.removeItem(
                            "superAdminToken"
                        );

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "accessToken"
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
                            "userType"
                        );


                        navigate(
                            "/login",
                            {
                                replace:
                                    true,
                            }
                        );

                        return;

                    }


                    let allData = {};


                    try {

                        allData =
                            await allResponse.json();

                    }

                    catch {

                        allData = {};

                    }


                    if (
                        !allResponse.ok
                    ) {

                        throw new Error(
                            allData?.message ||
                                "Failed to fetch leads."
                        );

                    }


                    const fetchedAllLeads =
                        Array.isArray(
                            allData?.leads
                        )
                            ? allData.leads
                            : [];


                    setAllLeads(
                        fetchedAllLeads
                    );


                    // ====================================================
                    // 2. LOAD ALL FOLLOW-UP DATA
                    //
                    // NO PAGE / LIMIT
                    //
                    // Backend returns all follow-up records.
                    // ====================================================

                    const followUpResponse =
                        await fetch(
                            `${API_BASE}/leads/follow-ups`,
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


                    let followUpData = {};


                    try {

                        followUpData =
                            await followUpResponse.json();

                    }

                    catch {

                        followUpData = {};

                    }


                    if (
                        !followUpResponse.ok
                    ) {

                        throw new Error(
                            followUpData?.message ||
                                "Failed to fetch follow-ups."
                        );

                    }


                    const followUpLeads =
                        Array.isArray(
                            followUpData?.leads
                        )
                            ? followUpData.leads
                            : [];


                    // ====================================================
                    // 3. ONLY MISSED LEADS
                    // ====================================================

                    const missedLeads =
                        followUpLeads.filter(
                            (
                                lead
                            ) => {

                                return (
                                    String(
                                        lead?.followUpStatus ||
                                            ""
                                    )
                                        .trim()
                                        .toUpperCase() ===
                                    "MISSED"
                                );

                            }
                        );


                    setLeads(
                        missedLeads
                    );


                    // Reset UI page after
                    // refreshing the data.

                    setPage(1);

                }

                catch (
                    err
                ) {

                    console.error(
                        "Missed leads fetch error:",
                        err
                    );


                    setError(
                        err?.message ||
                            "Failed to fetch missed leads."
                    );


                    setAllLeads([]);

                    setLeads([]);

                    setPage(1);

                }

                finally {

                    setLoading(false);

                }

            },

            [
                getToken,
                navigate,
            ]
        );


    // ============================================================
    // LOAD TEAMS
    // ============================================================

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

            [
                getToken
            ]
        );


    // ============================================================
    // INITIAL LOAD
    // ============================================================

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


    // ============================================================
    // BUILD OWNER LIST
    // ============================================================

    useEffect(
        () => {

            const ownerMap =
                new Map();


            allLeads.forEach(
                (
                    lead
                ) => {

                    const owner =
                        lead?.leadOwner ||
                        lead?.owner ||
                        null;


                    if (!owner) {

                        return;

                    }


                    const ownerId =
                        owner?._id ||
                        owner?.id ||
                        lead?.leadOwnerId ||
                        lead?.ownerId;


                    if (!ownerId) {

                        return;

                    }


                    const ownerName =
                        owner?.name ||
                        owner?.email ||
                        "Unknown Owner";


                    const key =
                        String(
                            ownerId
                        );


                    if (
                        !ownerMap.has(
                            key
                        )
                    ) {

                        ownerMap.set(
                            key,
                            {

                                ...(typeof owner ===
                                    "object"
                                    ? owner
                                    : {}),

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
                    (
                        a,
                        b
                    ) =>
                        String(
                            a?.name ||
                                ""
                        )
                            .toLowerCase()
                            .localeCompare(
                                String(
                                    b?.name ||
                                        ""
                                )
                                    .toLowerCase()
                            )
                )
            );

        },

        [
            allLeads
        ]
    );


    // ============================================================
    // FILTER MISSED LEADS
    //
    // IMPORTANT:
    // Filtering happens BEFORE pagination.
    // ============================================================

    const displayedLeads =
        useMemo(
            () => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();


                return leads.filter(
                    (
                        lead
                    ) => {


                        // ====================================================
                        // OWNER FILTER
                        // ====================================================

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


                        // ====================================================
                        // TEAM FILTER
                        // ====================================================

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


                            if (
                                !leadOwnerId
                            ) {

                                return false;

                            }


                            const selectedTeam =
                                teams.find(
                                    (
                                        team
                                    ) =>
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


                            // ------------------------------------------------
                            // TEAM MANAGER
                            // ------------------------------------------------

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


                            // ------------------------------------------------
                            // TEAM EXECUTIVES
                            // ------------------------------------------------

                            if (
                                Array.isArray(
                                    selectedTeam?.executives
                                )
                            ) {

                                selectedTeam
                                    .executives
                                    .forEach(
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


                        // ====================================================
                        // SEARCH
                        // ====================================================

                        if (
                            !searchText
                        ) {

                            return true;

                        }


                        const ownerName =
                            typeof lead?.leadOwner ===
                                "object"
                                ? lead?.leadOwner?.name
                                : lead?.leadOwner;


                        const ownerEmail =
                            typeof lead?.leadOwner ===
                                "object"
                                ? lead?.leadOwner?.email
                                : "";


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

                            lead?.status,

                            lead?.remarks,

                            lead?.latestRemark,

                            lead?.leadSource,

                            lead?.leadType,

                            lead?.programInterest,

                            ownerName,

                            ownerEmail,

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
                                        searchText
                                    )
                        );

                    }
                );

            },

            [
                leads,
                search,
                ownerFilter,
                teamFilter,
                teams,
            ]
        );


    // ============================================================
    // RESET PAGE WHEN FILTERS CHANGE
    // ============================================================

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


    // ============================================================
    // UI PAGINATION
    //
    // displayedLeads =
    // ALL FILTERED MISSED LEADS
    //
    // paginatedLeads =
    // ONLY 50 LEADS FOR CURRENT PAGE
    // ============================================================

    const total =
        displayedLeads.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / limit
            )
        );


    // ============================================================
    // PAGE SAFETY
    // ============================================================

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


    // ============================================================
    // CURRENT PAGE LEADS
    // ============================================================

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


                return displayedLeads.slice(
                    startIndex,
                    endIndex
                );

            },

            [
                displayedLeads,
                page,
                limit,
            ]
        );


    // ============================================================
    // PREVIOUS PAGE
    // ============================================================

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


    // ============================================================
    // NEXT PAGE
    // ============================================================

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


    // ============================================================
    // GO TO PAGE
    // ============================================================

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


    // ============================================================
    // PAGE NUMBERS
    // ============================================================

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


    // ============================================================
    // VIEW LEAD
    // ============================================================

    const handleViewLead =
        useCallback(
            (
                lead
            ) => {

                const leadId =
                    lead?._id ||
                    lead?.id ||
                    lead?.leadId;


                if (
                    !leadId
                ) {

                    return;

                }


                navigate(
                    `/lead/${leadId}`
                );

            },

            [
                navigate
            ]
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
    // OWNER CHANGE
    // ============================================================

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


    // ============================================================
    // TEAM CHANGE
    // ============================================================

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


    // ============================================================
    // SEARCH CHANGE
    // ============================================================

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

            {/* =====================================================
                RESULTS
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

                        {" "}missed leads

                    </>

                ) : (

                    "No missed leads found"

                )}

            </div>


            {/* =====================================================
                PAGINATION
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


    // ============================================================
    // PAGE
    // ============================================================

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

                title="Missed Leads"

                description="
                    Leads with overdue follow-up tasks that have not been completed.
                "


                // ====================================================
                // TABLE
                //
                // ONLY CURRENT PAGE
                // ====================================================

                leads={
                    paginatedLeads
                }


                // ====================================================
                // STATS
                //
                // ALL LEADS
                // ====================================================

                statsLeads={
                    allLeads
                }


                loading={
                    loading
                }


                error={
                    error
                }


                // ====================================================
                // SEARCH
                // ====================================================

                search={
                    search
                }


                // ====================================================
                // OWNER / TEAM
                // ====================================================

                ownerFilter={
                    ownerFilter
                }

                teamFilter={
                    teamFilter
                }


                owners={
                    owners
                }

                teams={
                    teams
                }


                onSearchChange={
                    handleSearchChange
                }


                onOwnerChange={
                    handleOwnerChange
                }


                onTeamChange={
                    handleTeamChange
                }


                // ====================================================
                // ACTIONS
                // ====================================================

                onRefresh={
                    handleRefresh
                }


                onViewLead={
                    handleViewLead
                }


                // ====================================================
                // UI
                // ====================================================

                showStats={
                    true
                }


                // No Hot / Warm / Cold filter
                showStatusFilter={
                    false
                }


                showOwnerFilter={
                    true
                }


                showTeamFilter={
                    true
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


export default MissedLeads;