import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CheckCircle,
    RefreshCw,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL || "";


const getLeadId = (lead) =>
    lead?._id || lead?.id;


const getToken = () =>
    localStorage.getItem("token");


const getRefreshToken = () =>
    localStorage.getItem("refreshToken");


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

const refreshAccessToken = async () => {

    const refreshToken =
        getRefreshToken();


    if (!refreshToken) {

        return null;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/auth/refresh`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            refreshToken,
                        }),
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (
            response.ok &&
            data.success &&
            data.token
        ) {

            localStorage.setItem(
                "token",
                data.token
            );


            if (
                data.refreshToken
            ) {

                localStorage.setItem(
                    "refreshToken",
                    data.refreshToken
                );

            }


            if (
                data.userType
            ) {

                localStorage.setItem(
                    "userType",
                    data.userType
                );

            }


            if (
                data.institutionId
            ) {

                localStorage.setItem(
                    "institutionId",
                    data.institutionId
                );

            }


            return data.token;

        }


        return null;

    }

    catch (
        error
    ) {

        console.error(
            "Token refresh error:",
            error
        );


        return null;

    }

};


// ============================================================
// DECODE JWT
// ============================================================

const decodeJWT = (
    token
) => {

    try {

        if (
            !token ||
            typeof token !==
                "string"
        ) {

            return null;

        }


        const parts =
            token.split(".");


        if (
            parts.length !== 3
        ) {

            return null;

        }


        let payload =
            parts[1]
                .replace(
                    /-/g,
                    "+"
                )
                .replace(
                    /_/g,
                    "/"
                );


        while (
            payload.length % 4 !==
            0
        ) {

            payload += "=";

        }


        return JSON.parse(
            decodeURIComponent(
                atob(payload)
                    .split("")
                    .map(
                        (
                            character
                        ) =>
                            "%" +
                            (
                                "00" +
                                character
                                    .charCodeAt(
                                        0
                                    )
                                    .toString(
                                        16
                                    )
                            ).slice(-2)
                    )
                    .join("")
            )
        );

    }

    catch {

        return null;

    }

};


// ============================================================
// GET VALID TOKEN
// ============================================================

const getValidToken =
    async () => {

        const token =
            getToken();


        const refreshToken =
            getRefreshToken();


        if (!token) {

            return null;

        }


        if (!refreshToken) {

            return token;

        }


        const decoded =
            decodeJWT(
                token
            );


        if (
            !decoded ||
            !decoded.exp
        ) {

            return (
                (await refreshAccessToken()) ||
                null
            );

        }


        const expiresAt =
            decoded.exp * 1000;


        const oneMinute =
            60 * 1000;


        if (
            expiresAt -
                Date.now() >
            oneMinute
        ) {

            return token;

        }


        return (
            (await refreshAccessToken()) ||
            null
        );

    };


// ============================================================
// AUTHENTICATED FETCH
// ============================================================

const authenticatedFetch =
    async (
        url,
        options = {}
    ) => {

        let token =
            await getValidToken();


        if (!token) {

            throw new Error(
                "Access denied. Please login."
            );

        }


        const makeRequest =
            async (
                currentToken
            ) => {

                return fetch(
                    url,
                    {

                        ...options,

                        headers: {

                            ...(options.headers ||
                                {}),

                            Authorization:
                                `Bearer ${currentToken}`,

                        },

                    }
                );

            };


        let response =
            await makeRequest(
                token
            );


        if (
            response.status ===
            401
        ) {

            const refreshed =
                await refreshAccessToken();


            if (!refreshed) {

                return response;

            }


            response =
                await makeRequest(
                    refreshed
                );

        }


        return response;

    };


// ============================================================
// USER HELPERS
// ============================================================

const getRole = (
    user
) =>
    String(
        user?.role ||
            user?.userType ||
            user?.type ||
            ""
    ).toUpperCase();


const getName = (
    user
) =>
    user?.name ||
    user?.fullName ||
    user?.email ||
    "Unnamed User";


// ============================================================
// COMPONENT
// ============================================================

const BulkUpdateLeads = ({
    refreshKey,
}) => {


    // =========================================================
    // STATE
    // =========================================================

    const [
        leads,
        setLeads,
    ] = useState([]);


    const [
        owners,
        setOwners,
    ] = useState([]);


    const [
        selectedIds,
        setSelectedIds,
    ] = useState([]);


    const [
        selectedOwnerId,
        setSelectedOwnerId,
    ] = useState("");


    const [
        selectedOwnerType,
        setSelectedOwnerType,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        loadingOwners,
        setLoadingOwners,
    ] = useState(false);


    const [
        assigning,
        setAssigning,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    // =========================================================
    // UI PAGINATION
    //
    // IMPORTANT:
    // Backend returns ALL unassigned bulk leads.
    //
    // Frontend handles:
    // - search
    // - filtering
    // - pagination
    //
    // 50 leads per page.
    // =========================================================

    const [
        page,
        setPage,
    ] = useState(1);


    const limit = 50;

    const [selectCount, setSelectCount] = useState("");


    // =========================================================
    // FETCH UNASSIGNED BULK LEADS
    //
    // NO page / limit parameters.
    // =========================================================

    const fetchUnassignedLeads =
        async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/leads/bulk-uploaded/unassigned`,
                        {

                            method:
                                "GET",

                            headers: {

                                "Content-Type":
                                    "application/json",

                            },

                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                            "Failed to load unassigned leads."
                    );

                }


                const list =
                    Array.isArray(
                        data.leads
                    )
                        ? data.leads
                        : [];


                setLeads(
                    list
                );


                // -------------------------------------------------
                // Keep only selections that still exist.
                // -------------------------------------------------

                setSelectedIds(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                id
                            ) =>
                                list.some(
                                    (
                                        lead
                                    ) =>
                                        String(
                                            getLeadId(
                                                lead
                                            )
                                        ) ===
                                        String(
                                            id
                                        )
                                )
                        )
                );


                // Reset UI page
                // after refreshing data.

                setPage(1);

            }

            catch (
                err
            ) {

                console.error(
                    err
                );


                setError(
                    err.message ||
                        "Failed to load unassigned leads."
                );

            }

            finally {

                setLoading(
                    false
                );

            }

        };


    // =========================================================
    // FETCH OWNERS
    // =========================================================

    const fetchOwners =
        async () => {

            try {

                setLoadingOwners(
                    true
                );


                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/users`,
                        {

                            method:
                                "GET",

                            headers: {

                                "Content-Type":
                                    "application/json",

                            },

                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        data.message ||
                            "Failed to load users."
                    );

                }


                const users =
                    Array.isArray(
                        data.users
                    )
                        ? data.users

                        : Array.isArray(
                            data.data
                        )
                            ? data.data

                            : Array.isArray(
                                data
                            )
                                ? data

                                : [];


                const filtered =
                    users.filter(
                        (
                            user
                        ) => {

                            const role =
                                getRole(
                                    user
                                );


                            return (
                                role ===
                                    "MANAGER" ||
                                role ===
                                    "EXECUTIVE"
                            );

                        }
                    );


                setOwners(
                    filtered
                );

            }

            catch (
                err
            ) {

                console.error(
                    err
                );


                setError(
                    err.message ||
                        "Failed to load users."
                );

            }

            finally {

                setLoadingOwners(
                    false
                );

            }

        };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(
        () => {

            fetchUnassignedLeads();

            fetchOwners();

        },

        [
            refreshKey,
        ]
    );


    // =========================================================
    // SEARCH / FILTER
    //
    // IMPORTANT:
    // Search happens BEFORE pagination.
    // =========================================================

    const filteredLeads =
        useMemo(
            () => {

                const value =
                    search
                        .trim()
                        .toLowerCase();


                if (!value) {

                    return leads;

                }


                return leads.filter(
                    (
                        lead
                    ) =>

                        String(
                            lead.name ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )

                        ||

                        String(
                            lead.email ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )

                        ||

                        String(
                            lead.contact ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )

                        ||

                        String(
                            lead.collegeName ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            )

                );

            },

            [
                leads,
                search,
            ]
        );


    // =========================================================
    // RESET PAGE WHEN SEARCH CHANGES
    // =========================================================

    useEffect(
        () => {

            setPage(1);
            setSelectCount("");

        },

        [
            search,
        ]
    );


    // =========================================================
    // UI PAGINATION
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
    // PREVIOUS PAGE
    // =========================================================

    const goToPreviousPage =
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

        };


    // =========================================================
    // NEXT PAGE
    // =========================================================

    const goToNextPage =
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

        };


    // =========================================================
    // GO TO PAGE
    // =========================================================

    const goToPage =
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

        };


    // =========================================================
    // MANAGER / EXECUTIVE OWNERS
    // =========================================================

    const managerOwners =
        owners.filter(
            (
                owner
            ) =>
                getRole(
                    owner
                ) ===
                "MANAGER"
        );


    const executiveOwners =
        owners.filter(
            (
                owner
            ) =>
                getRole(
                    owner
                ) ===
                "EXECUTIVE"
        );


    // =========================================================
    // SELECTED OWNER
    // =========================================================

    const selectedOwner =
        owners.find(
            (
                owner
            ) =>
                String(
                    owner._id ||
                        owner.id
                ) ===
                String(
                    selectedOwnerId
                )
        );


    // =========================================================
    // TOGGLE SINGLE LEAD
    // =========================================================

    const toggleLead = (
        leadId
    ) => {

        setSelectedIds(
            (
                previous
            ) => {

                const exists =
                    previous.some(
                        (
                            id
                        ) =>
                            String(
                                id
                            ) ===
                            String(
                                leadId
                            )
                    );


                if (
                    exists
                ) {

                    return previous.filter(
                        (
                            id
                        ) =>
                            String(
                                id
                            ) !==
                            String(
                                leadId
                            )
                    );

                }


                return [
                    ...previous,
                    leadId,
                ];

            }
        );

    };


    // =========================================================
    // SELECT ALL FILTERED LEADS
    //
    // IMPORTANT:
    // This still selects ALL filtered leads,
    // not only the current page.
    //
    // This preserves your previous behavior.
    // =========================================================

    const toggleSelectAll =
        () => {

            const ids =
                filteredLeads
                    .map(
                        getLeadId
                    )
                    .filter(
                        Boolean
                    );


            const allSelected =
                ids.length > 0 &&
                ids.every(
                    (
                        id
                    ) =>
                        selectedIds.some(
                            (
                                selectedId
                            ) =>
                                String(
                                    selectedId
                                ) ===
                                String(
                                    id
                                )
                        )
                );


            if (
                allSelected
            ) {

                setSelectedIds(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                id
                            ) =>
                                !ids.some(
                                    (
                                        filteredId
                                    ) =>
                                        String(
                                            filteredId
                                        ) ===
                                        String(
                                            id
                                        )
                                )
                        )
                );

            }

            else {

                setSelectedIds(
                    (
                        previous
                    ) => [

                        ...new Set([
                            ...previous,
                            ...ids,
                        ]),

                    ]
                );

            }

        };


    // =========================================================
    // SELECT FIRST N FILTERED LEADS

    const selectFirstN = (value = selectCount) => {
        const requestedCount = Math.max(0, Math.floor(Number(value) || 0));
        const safeCount = Math.min(requestedCount, filteredLeads.length);

        const ids = filteredLeads
            .slice(0, safeCount)
            .map(getLeadId)
            .filter(Boolean);

        setSelectedIds(ids);
        setSelectCount(requestedCount > 0 ? String(safeCount) : "");
        setPage(1);
    };

    // CLEAR SELECTION
    // =========================================================

    const clearSelection =
        () => {

            setSelectedIds([]);
            setSelectCount("");

            setSelectedOwnerId("");

            setSelectedOwnerType("");

            setError("");

        };


    // =========================================================
    // OWNER CHANGE
    // =========================================================

    const handleOwnerChange =
        (
            event
        ) => {

            const value =
                event.target.value;


            setSelectedOwnerId(
                value
            );


            const owner =
                owners.find(
                    (
                        item
                    ) =>
                        String(
                            item._id ||
                                item.id
                        ) ===
                        String(
                            value
                        )
                );


            setSelectedOwnerType(
                owner
                    ? getRole(
                        owner
                    )
                    : ""
            );


            setError("");

        };


    // =========================================================
    // ASSIGN LEADS
    // =========================================================

    const handleAssign =
        async () => {

            setError("");

            setSuccess("");


            if (
                selectedIds.length ===
                0
            ) {

                setError(
                    "Please select at least one lead."
                );

                return;

            }


            if (
                !selectedOwnerId
            ) {

                setError(
                    "Please select a Manager or Executive."
                );

                return;

            }


            if (
                !selectedOwnerType
            ) {

                setError(
                    "Unable to determine the selected user's role."
                );

                return;

            }


            try {

                setAssigning(
                    true
                );


                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/leads/bulk-uploaded/assign`,
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                            },


                            body:
                                JSON.stringify(
                                    {

                                        leadIds:
                                            selectedIds,

                                        ownerId:
                                            selectedOwnerId,

                                        ownerType:
                                            selectedOwnerType,

                                    }
                                ),

                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                            "Failed to assign leads."
                    );

                }


                const assigned =
                    data.assigned ??
                    selectedIds.length;


                setSuccess(
                    `${assigned} lead${
                        assigned ===
                        1
                            ? ""
                            : "s"
                    } assigned successfully.`
                );


                setSelectedIds([]);

                setSelectedOwnerId(
                    ""
                );

                setSelectedOwnerType(
                    ""
                );


                await fetchUnassignedLeads();

            }

            catch (
                err
            ) {

                console.error(
                    "Assignment error:",
                    err
                );


                setError(
                    err.message ||
                        "Failed to assign leads."
                );

            }

            finally {

                setAssigning(
                    false
                );

            }

        };


    // =========================================================
    // CURRENT FILTERED SELECTION
    // =========================================================

    const allFilteredSelected =
        filteredLeads.length >
            0 &&
        filteredLeads.every(
            (
                lead
            ) =>
                selectedIds.some(
                    (
                        id
                    ) =>
                        String(
                            id
                        ) ===
                        String(
                            getLeadId(
                                lead
                            )
                        )
                )
        );


    // =========================================================
    // PAGE SELECTION
    //
    // Used for the checkbox in the table header.
    //
    // This selects/deselects only the CURRENT PAGE.
    // =========================================================

    const currentPageIds =
        paginatedLeads
            .map(
                getLeadId
            )
            .filter(
                Boolean
            );


    const allCurrentPageSelected =
        currentPageIds.length >
            0 &&
        currentPageIds.every(
            (
                id
            ) =>
                selectedIds.some(
                    (
                        selectedId
                    ) =>
                        String(
                            selectedId
                        ) ===
                        String(
                            id
                        )
                )
        );


    // =========================================================
    // TOGGLE CURRENT PAGE
    // =========================================================

    const toggleCurrentPage =
        () => {

            if (
                currentPageIds.length ===
                0
            ) {

                return;

            }


            if (
                allCurrentPageSelected
            ) {

                setSelectedIds(
                    (
                        previous
                    ) =>
                        previous.filter(
                            (
                                id
                            ) =>
                                !currentPageIds.some(
                                    (
                                        pageId
                                    ) =>
                                        String(
                                            pageId
                                        ) ===
                                        String(
                                            id
                                        )
                                )
                        )
                );

            }

            else {

                setSelectedIds(
                    (
                        previous
                    ) => [

                        ...new Set([
                            ...previous,
                            ...currentPageIds,
                        ]),

                    ]
                );

            }

        };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div
            className="
                mt-8
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-sm
            "
        >

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div
                className="
                    border-b
                    border-slate-200
                    p-5
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-bold
                                text-slate-900
                            "
                        >
                            Unassigned Bulk Leads
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            Select uploaded leads and assign them to a Manager or Executive.
                        </p>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className="
                                rounded-lg
                                bg-slate-100
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            {leads.length} Unassigned
                        </span>


                        <button
                            type="button"
                            onClick={
                                fetchUnassignedLeads
                            }
                            disabled={
                                loading
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-slate-700
                                hover:bg-slate-50
                                disabled:opacity-50
                            "
                        >

                            <RefreshCw
                                size={16}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                    </div>

                </div>

            </div>


            {/* =====================================================
                FILTER / ASSIGN AREA
            ===================================================== */}

            <div
                className="
                    border-b
                    border-slate-200
                    bg-slate-50
                    p-4
                "
            >

                {/* SEARCH */}

                <div
                    className="
                        mb-4
                    "
                >

                    <div
                        className="
                            relative
                            max-w-md
                        "
                    >

                        <Search
                            size={17}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />


                        <input
                            type="text"
                            value={
                                search
                            }
                            onChange={
                                (
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                            }
                            placeholder="
                                Search name, email, contact or college...
                            "
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                py-2.5
                                pl-10
                                pr-3
                                text-sm
                                outline-none
                                focus:border-slate-500
                            "
                        />

                    </div>

                </div>


                {/* ASSIGN CONTROLS */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        lg:flex-row
                        lg:items-end
                    "
                >

                    <div
                        className="
                            lg:w-52
                        "
                    >

                        <label
                            className="
                                mb-1.5
                                block
                                text-xs
                                font-bold
                                uppercase
                                tracking-wide
                                text-slate-500
                            "
                        >
                            Selected Leads
                        </label>


                        <div
                            className="
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-800
                            "
                        >
                            {selectedIds.length} selected
                        </div>

                    </div>
                    <div className="lg:w-64">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                            Select Leads
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max={filteredLeads.length}
                                value={selectCount}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectCount(value);
                                    if (value === "") {
                                        setSelectedIds([]);
                                        return;
                                    }
                                    const numericValue = Number(value);
                                    if (Number.isFinite(numericValue) && numericValue > 0) {
                                        selectFirstN(numericValue);
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") selectFirstN();
                                }}
                                placeholder="50"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-500"
                            />
                            <button
                                type="button"
                                onClick={() => selectFirstN()}
                                disabled={assigning || filteredLeads.length === 0 || !selectCount}
                                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Select
                            </button>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            Selects the first N leads from the current search result.
                        </p>
                    </div>

                    <div className="lg:w-80">
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                            Assign To
                        </label>


                        <select
                            value={
                                selectedOwnerId
                            }
                            onChange={
                                handleOwnerChange
                            }
                            disabled={
                                selectedIds.length ===
                                    0 ||
                                assigning ||
                                loadingOwners
                            }
                            className="
                                w-full
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-3
                                py-2.5
                                text-sm
                                font-medium
                                text-slate-700
                                outline-none
                                focus:border-slate-500
                                disabled:cursor-not-allowed
                                disabled:bg-slate-100
                            "
                        >

                            <option value="">
                                {
                                    loadingOwners
                                        ? "Loading users..."
                                        : "Select Manager / Executive"
                                }
                            </option>


                            {managerOwners.length >
                                0 && (

                                <optgroup
                                    label="Managers"
                                >

                                    {managerOwners.map(
                                        (
                                            manager
                                        ) => (

                                            <option
                                                key={
                                                    manager._id ||
                                                    manager.id
                                                }
                                                value={
                                                    manager._id ||
                                                    manager.id
                                                }
                                            >
                                                Manager -{" "}
                                                {
                                                    getName(
                                                        manager
                                                    )
                                                }
                                            </option>

                                        )
                                    )}

                                </optgroup>

                            )}


                            {executiveOwners.length >
                                0 && (

                                <optgroup
                                    label="Executives"
                                >

                                    {executiveOwners.map(
                                        (
                                            executive
                                        ) => (

                                            <option
                                                key={
                                                    executive._id ||
                                                    executive.id
                                                }
                                                value={
                                                    executive._id ||
                                                    executive.id
                                                }
                                            >
                                                Executive -{" "}
                                                {
                                                    getName(
                                                        executive
                                                    )
                                                }
                                            </option>

                                        )
                                    )}

                                </optgroup>

                            )}

                        </select>

                    </div>


                    <button
                        type="button"
                        onClick={
                            handleAssign
                        }
                        disabled={
                            assigning ||
                            selectedIds.length ===
                                0 ||
                            !selectedOwnerId
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-slate-900
                            px-5
                            py-2.5
                            text-sm
                            font-semibold
                            text-white
                            hover:bg-slate-800
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >

                        {assigning ? (

                            <>

                                <RefreshCw
                                    size={16}
                                    className="
                                        animate-spin
                                    "
                                />

                                Assigning...

                            </>

                        ) : (

                            <>

                                Assign{" "}

                                {
                                    selectedIds.length
                                }

                                {" "}Lead
                                {
                                    selectedIds.length !==
                                    1
                                        ? "s"
                                        : ""
                                }

                            </>

                        )}

                    </button>


                    {selectedIds.length >
                        0 && (

                        <button
                            type="button"
                            onClick={
                                clearSelection
                            }
                            disabled={
                                assigning
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-slate-300
                                bg-white
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-slate-700
                                hover:bg-slate-100
                                disabled:opacity-50
                            "
                        >
                            Clear Selection
                        </button>

                    )}

                </div>


                {/* SELECTED OWNER */}

                {selectedOwner && (

                    <p
                        className="
                            mt-3
                            text-xs
                            text-slate-500
                        "
                    >

                        Selected owner:{" "}

                        <span
                            className="
                                font-semibold
                                text-slate-700
                            "
                        >

                            {
                                getRole(
                                    selectedOwner
                                ) ===
                                "MANAGER"
                                    ? "Manager"
                                    : "Executive"
                            }

                            {" - "}

                            {
                                getName(
                                    selectedOwner
                                )
                            }

                        </span>

                    </p>

                )}


                {/* ERROR */}

                {error && (

                    <div
                        className="
                            mt-3
                            rounded-lg
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-red-700
                        "
                    >
                        {error}
                    </div>

                )}


                {/* SUCCESS */}

                {success && (

                    <div
                        className="
                            mt-3
                            rounded-lg
                            border
                            border-green-200
                            bg-green-50
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-green-700
                        "
                    >
                        {success}
                    </div>

                )}

            </div>


            {/* =====================================================
                TABLE
            ===================================================== */}

            <div
                className="
                    overflow-x-auto
                "
            >

                {/* LOADING */}

                {loading ? (

                    <div
                        className="
                            p-10
                            text-center
                        "
                    >

                        <RefreshCw
                            size={22}
                            className="
                                mx-auto
                                animate-spin
                                text-slate-400
                            "
                        />


                        <p
                            className="
                                mt-3
                                text-sm
                                text-slate-500
                            "
                        >
                            Loading unassigned bulk leads...
                        </p>

                    </div>

                ) : leads.length ===
                    0 ? (

                    /* =================================================
                       NO LEADS
                    ================================================= */

                    <div
                        className="
                            p-10
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-green-50
                            "
                        >

                            <CheckCircle
                                size={24}
                                className="
                                    text-green-600
                                "
                            />

                        </div>


                        <div
                            className="
                                mt-3
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            No unassigned bulk leads
                        </div>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >
                            All uploaded bulk leads have been assigned.
                        </p>

                    </div>

                ) : filteredLeads.length ===
                    0 ? (

                    /* =================================================
                       SEARCH EMPTY
                    ================================================= */

                    <div
                        className="
                            p-10
                            text-center
                            text-sm
                            text-slate-500
                        "
                    >
                        No leads match your search.
                    </div>

                ) : (

                    /* =================================================
                       TABLE
                    ================================================= */

                    <table
                        className="
                            min-w-[1000px]
                            w-full
                        "
                    >

                        <thead
                            className="
                                border-b
                                border-slate-200
                                bg-slate-50
                            "
                        >

                            <tr>

                                <th
                                    className="
                                        w-12
                                        px-4
                                        py-3
                                        text-center
                                    "
                                >

                                    <input
                                        type="checkbox"
                                        checked={
                                            allCurrentPageSelected
                                        }
                                        onChange={
                                            toggleCurrentPage
                                        }
                                        className="
                                            h-4
                                            w-4
                                            rounded
                                            border-slate-300
                                        "
                                    />

                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    Name
                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    Email
                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    Contact
                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    College
                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    Program
                                </th>


                                <th
                                    className="
                                        px-4
                                        py-3
                                        text-left
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-500
                                    "
                                >
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {paginatedLeads.map(
                                (
                                    lead
                                ) => {

                                    const id =
                                        getLeadId(
                                            lead
                                        );


                                    const selected =
                                        selectedIds.some(
                                            (
                                                selectedId
                                            ) =>
                                                String(
                                                    selectedId
                                                ) ===
                                                String(
                                                    id
                                                )
                                        );


                                    return (

                                        <tr
                                            key={
                                                id
                                            }
                                            className={`
                                                border-b
                                                border-slate-100

                                                ${
                                                    selected
                                                        ? "bg-blue-50"
                                                        : "bg-white hover:bg-slate-50"
                                                }
                                            `}
                                        >

                                            {/* CHECKBOX */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                    text-center
                                                "
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected
                                                    }
                                                    onChange={() =>
                                                        toggleLead(
                                                            id
                                                        )
                                                    }
                                                    className="
                                                        h-4
                                                        w-4
                                                        rounded
                                                        border-slate-300
                                                    "
                                                />

                                            </td>


                                            {/* NAME */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        max-w-[220px]
                                                        truncate
                                                        text-sm
                                                        font-semibold
                                                        text-slate-800
                                                    "
                                                >
                                                    {
                                                        lead.name ||
                                                        "-"
                                                    }
                                                </div>

                                            </td>


                                            {/* EMAIL */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        max-w-[240px]
                                                        truncate
                                                        text-sm
                                                        text-slate-600
                                                    "
                                                >
                                                    {
                                                        lead.email ||
                                                        "-"
                                                    }
                                                </div>

                                            </td>


                                            {/* CONTACT */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-slate-600
                                                "
                                            >
                                                {
                                                    lead.contact ||
                                                    "-"
                                                }
                                            </td>


                                            {/* COLLEGE */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        max-w-[220px]
                                                        truncate
                                                        text-sm
                                                        text-slate-600
                                                    "
                                                >
                                                    {
                                                        lead.collegeName ||
                                                        "-"
                                                    }
                                                </div>

                                            </td>


                                            {/* PROGRAM */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        max-w-[180px]
                                                        truncate
                                                        text-sm
                                                        text-slate-600
                                                    "
                                                >
                                                    {
                                                        lead.programInterest ||
                                                        "-"
                                                    }
                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td
                                                className="
                                                    px-4
                                                    py-3
                                                "
                                            >

                                                <span
                                                    className="
                                                        inline-flex
                                                        rounded-full
                                                        bg-blue-50
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-bold
                                                        text-blue-700
                                                    "
                                                >
                                                    {
                                                        lead.status ||
                                                        "NEW"
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =====================================================
                UI PAGINATION
            ===================================================== */}

            {!loading &&
                filteredLeads.length >
                    0 &&
                totalPages > 1 && (

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        border-t
                        border-slate-200
                        bg-white
                        px-4
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    {/* ------------------------------------------------
                        RESULT COUNT
                    ------------------------------------------------ */}

                    <div
                        className="
                            text-sm
                            text-slate-500
                        "
                    >

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

                        {" "}unassigned leads

                    </div>


                    {/* ------------------------------------------------
                        PAGINATION CONTROLS
                    ------------------------------------------------ */}

                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                            overflow-x-auto
                        "
                    >

                        {/* PREVIOUS */}

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
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-sm
                                font-semibold
                                text-slate-700
                                transition
                                hover:border-slate-400
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            <ChevronLeft
                                size={16}
                            />

                            Previous

                        </button>


                        {/* PAGE NUMBERS */}

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
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
                                page ===
                                totalPages
                            }
                            className="
                                inline-flex
                                h-9
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-sm
                                font-semibold
                                text-slate-700
                                transition
                                hover:border-slate-400
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            Next

                            <ChevronRight
                                size={16}
                            />

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

};


export default BulkUpdateLeads;