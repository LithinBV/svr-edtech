import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL + "/api";

const ITEMS_PER_PAGE = 50;


// ============================================================
// ICON
// ============================================================

const Icon = ({
    name,
    size = 18,
    className = "",
}) => {

    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
    };

    switch (name) {

        case "search":
            return (
                <svg {...common}>
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    />
                    <path d="m20 20-4-4" />
                </svg>
            );


        case "refresh":
            return (
                <svg {...common}>
                    <path
                        d="M20 11a8.1 8.1 0 0 0-15.5-3"
                    />
                    <path d="M4 4v4h4" />
                    <path
                        d="M4 13a8.1 8.1 0 0 0 15.5 3"
                    />
                    <path d="M20 20v-4h-4" />
                </svg>
            );


        case "filter":
            return (
                <svg {...common}>
                    <path d="M4 6h16" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            );


        case "eye":
            return (
                <svg {...common}>
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                    <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                    />
                </svg>
            );


        case "users":
            return (
                <svg {...common}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );


        case "calendar":
            return (
                <svg {...common}>
                    <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                    />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                </svg>
            );


        default:
            return null;
    }
};


// ============================================================
// HELPERS
// ============================================================

const getLeadId = (lead) =>
    lead?._id ||
    lead?.id ||
    lead?.leadId ||
    null;


const getLeadName = (lead) =>
    lead?.name ||
    lead?.fullName ||
    lead?.studentName ||
    "Unnamed Lead";


const getLeadPhone = (lead) =>
    lead?.contact ||
    lead?.phone ||
    lead?.mobile ||
    lead?.phoneNumber ||
    "—";


const getLeadEmail = (lead) =>
    lead?.email ||
    "—";


const getOwner = (lead) =>
    lead?.leadOwner ||
    lead?.owner ||
    null;


const getOwnerName = (lead) => {

    const owner = getOwner(lead);

    return (
        owner?.name ||
        owner?.email ||
        lead?.leadOwnerName ||
        "Unassigned"
    );
};


const getCollege = (lead) =>
    lead?.collegeName ||
    lead?.college ||
    "—";


const getProgram = (lead) =>
    lead?.programInterest ||
    lead?.program ||
    lead?.course ||
    "—";


const getCompletionType = (lead) =>
    String(
        lead?.latestRemark ||
        lead?.completionType ||
        ""
    )
        .trim()
        .toUpperCase();


// ============================================================
// COMPONENT
// ============================================================

const ManagerFinishedLeads = () => {

    const navigate = useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [leads, setLeads] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ========================================================
    // FILTER STATE
    // ========================================================

    const [search, setSearch] =
        useState("");

    const [completionFilter, setCompletionFilter] =
        useState("ALL");

    const [executiveFilter, setExecutiveFilter] =
        useState("ALL");


    // ========================================================
    // PAGINATION
    // ========================================================

    const [page, setPage] =
        useState(1);


    // ========================================================
    // TOKEN
    // ========================================================

    const getToken = useCallback(() => {

        return (
            localStorage.getItem("managerToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );

    }, []);


    // ========================================================
    // CLEAR AUTH
    // ========================================================

    const clearAuthAndRedirect =
        useCallback(() => {

            localStorage.removeItem(
                "managerToken"
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
                "refreshToken"
            );

            localStorage.removeItem(
                "userType"
            );


            navigate(
                "/login",
                {
                    replace: true,
                }
            );

        }, [navigate]);


    // ========================================================
    // LOAD FINISHED LEADS
    // ========================================================

    const loadFinishedLeads =
        useCallback(
            async (
                isRefresh = false
            ) => {

                try {

                    if (isRefresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }

                    setError("");


                    const token =
                        getToken();


                    if (!token) {

                        clearAuthAndRedirect();

                        return;
                    }


                    const response =
                        await fetch(
                            `${API_BASE}/finished-leads`,
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


                    if (
                        response.status ===
                        401
                    ) {

                        clearAuthAndRedirect();

                        return;
                    }


                    if (
                        response.status ===
                        403
                    ) {

                        setLeads([]);

                        setError(
                            data?.message ||
                            "You do not have permission to view finished leads."
                        );

                        return;
                    }


                    if (!response.ok) {

                        throw new Error(
                            data?.message ||
                            "Failed to load finished leads."
                        );
                    }


                    if (
                        data?.success === false
                    ) {

                        throw new Error(
                            data?.message ||
                            "Unable to load finished leads."
                        );
                    }


                    const fetchedLeads =
                        Array.isArray(
                            data?.leads
                        )
                            ? data.leads
                            : [];


                    setLeads(
                        fetchedLeads
                    );


                } catch (err) {

                    console.error(
                        "Manager finished leads error:",
                        err
                    );

                    setLeads([]);

                    setError(
                        err?.message ||
                        "Unable to load finished leads."
                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);
                }

            },
            [
                getToken,
                clearAuthAndRedirect,
            ]
        );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadFinishedLeads();

    }, [
        loadFinishedLeads,
    ]);


    // ========================================================
    // EXECUTIVE OPTIONS
    // ========================================================

    const executives =
        useMemo(() => {

            const map =
                new Map();


            leads.forEach(
                (lead) => {

                    const owner =
                        getOwner(
                            lead
                        );


                    const id =
                        owner?._id ||
                        owner?.id ||
                        lead?.leadOwnerId ||
                        lead?.ownerId;


                    if (!id) {
                        return;
                    }


                    const name =
                        owner?.name ||
                        owner?.email ||
                        lead?.leadOwnerName ||
                        "Unknown Executive";


                    if (
                        !map.has(
                            String(id)
                        )
                    ) {

                        map.set(
                            String(id),
                            {
                                id,
                                name,
                            }
                        );

                    }

                }
            );


            return Array.from(
                map.values()
            ).sort(
                (a, b) =>
                    String(
                        a.name || ""
                    )
                        .toLowerCase()
                        .localeCompare(
                            String(
                                b.name || ""
                            )
                                .toLowerCase()
                        )
            );

        }, [leads]);


    // ========================================================
    // FILTER LEADS
    // ========================================================

    const filteredLeads =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return leads.filter(
                (lead) => {

                    // ------------------------------------------
                    // COMPLETION
                    // ------------------------------------------

                    const completion =
                        getCompletionType(
                            lead
                        );


                    if (
                        completionFilter !==
                        "ALL"
                    ) {

                        if (
                            completion !==
                            completionFilter
                        ) {

                            return false;
                        }
                    }


                    // ------------------------------------------
                    // EXECUTIVE
                    // ------------------------------------------

                    if (
                        executiveFilter !==
                        "ALL"
                    ) {

                        const owner =
                            getOwner(
                                lead
                            );


                        const ownerId =
                            owner?._id ||
                            owner?.id ||
                            lead?.leadOwnerId ||
                            lead?.ownerId;


                        if (
                            String(
                                ownerId || ""
                            ) !==
                            String(
                                executiveFilter
                            )
                        ) {

                            return false;
                        }
                    }


                    // ------------------------------------------
                    // SEARCH
                    // ------------------------------------------

                    if (!searchValue) {
                        return true;
                    }


                    const values = [

                        lead?.name,

                        lead?.fullName,

                        lead?.studentName,

                        lead?.email,

                        lead?.contact,

                        lead?.phone,

                        lead?.phoneNumber,

                        lead?.collegeName,

                        lead?.college,

                        lead?.department,

                        lead?.state,

                        lead?.district,

                        lead?.leadSource,

                        lead?.leadType,

                        lead?.programInterest,

                        lead?.program,

                        lead?.course,

                        lead?.latestRemark,

                        getOwner(
                            lead
                        )?.name,

                        getOwner(
                            lead
                        )?.email,

                    ];


                    return values.some(
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
            completionFilter,
            executiveFilter,
        ]);


    // ========================================================
    // RESET PAGE WHEN FILTER CHANGES
    // ========================================================

    useEffect(() => {

        setPage(1);

    }, [
        search,
        completionFilter,
        executiveFilter,
    ]);


    // ========================================================
    // PAGINATION
    // ========================================================

    const total =
        filteredLeads.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                ITEMS_PER_PAGE
            )
        );


    useEffect(() => {

        if (
            page >
            totalPages
        ) {

            setPage(
                totalPages
            );

        }

    }, [
        page,
        totalPages,
    ]);


    const paginatedLeads =
        useMemo(() => {

            const start =
                (
                    page - 1
                ) *
                ITEMS_PER_PAGE;


            const end =
                start +
                ITEMS_PER_PAGE;


            return filteredLeads.slice(
                start,
                end
            );

        }, [
            filteredLeads,
            page,
        ]);


    // ========================================================
    // VIEW LEAD
    // ========================================================

    const handleViewLead =
        useCallback(
            (lead) => {

                const leadId =
                    getLeadId(
                        lead
                    );


                if (!leadId) {
                    return;
                }


                navigate(
                    `/leads/${leadId}`
                );

            },
            [navigate]
        );


    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters =
        useCallback(() => {

            setSearch("");

            setCompletionFilter(
                "ALL"
            );

            setExecutiveFilter(
                "ALL"
            );

            setPage(1);

        }, []);


    const hasFilters =
        Boolean(
            search.trim() ||
            completionFilter !== "ALL" ||
            executiveFilter !== "ALL"
        );


    // ========================================================
    // FORMAT DATE
    // ========================================================

    const formatDate =
        (value) => {

            if (!value) {
                return "—";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "—";
            }


            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        };


    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading &&
        leads.length === 0
    ) {

        return (
            <div className="min-h-screen bg-[#F7F9FC]">

                <div className="flex min-h-screen items-center justify-center">

                    <div className="text-center">

                        <div
                            className="
                                mx-auto
                                mb-4
                                h-10
                                w-10
                                animate-spin
                                rounded-full
                                border-4
                                border-[#102236]/10
                                border-t-[#102236]
                            "
                        />

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-[#102236]
                            "
                        >
                            Loading finished leads...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div
            className="
                min-h-screen
                bg-[#F7F9FC]
                px-4
                py-5
                sm:px-6
                lg:px-8
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    mb-6
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div>

                    <div
                        className="
                            mb-2
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#102236]
                                text-white
                                shadow-sm
                            "
                        >
                            <Icon
                                name="check"
                                size={20}
                            />
                        </div>

                        <h1
                            className="
                                text-2xl
                                font-black
                                tracking-tight
                                text-[#102236]
                                sm:text-3xl
                            "
                        >
                            Finished Leads
                        </h1>

                    </div>


                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >
                        View leads completed by your team.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={() =>
                        loadFinishedLeads(true)
                    }
                    disabled={refreshing}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#102236]
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#172d45]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >

                    <Icon
                        name="refresh"
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}

                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div
                    className="
                        mb-5
                        rounded-2xl
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


            {/* ==================================================
                FILTER AREA
            ================================================== */}

            <div
                className="
                    mb-5
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                "
            >

                <div
                    className="
                        mb-4
                        flex
                        items-center
                        gap-2
                    "
                >

                    <Icon
                        name="filter"
                        size={17}
                        className="text-[#102236]"
                    />

                    <h2
                        className="
                            text-sm
                            font-black
                            text-[#102236]
                        "
                    >
                        Filters
                    </h2>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        gap-3
                        md:grid-cols-2
                        xl:grid-cols-4
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            relative
                            md:col-span-2
                            xl:col-span-2
                        "
                    >

                        <Icon
                            name="search"
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
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Search name, phone, email, college...
                            "
                            className="
                                h-11
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                pl-10
                                pr-4
                                text-sm
                                font-medium
                                text-slate-700
                                outline-none
                                transition
                                focus:border-[#102236]
                                focus:bg-white
                                focus:ring-2
                                focus:ring-[#102236]/10
                            "
                        />

                    </div>


                    {/* COMPLETION */}

                    <select
                        value={completionFilter}
                        onChange={(e) =>
                            setCompletionFilter(
                                e.target.value
                            )
                        }
                        className="
                            h-11
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            outline-none
                            focus:border-[#102236]
                            focus:ring-2
                            focus:ring-[#102236]/10
                        "
                    >

                        <option value="ALL">
                            All Finished Leads
                        </option>

                        <option value="ENROLLED">
                            Enrolled
                        </option>

                        <option value="NOT_INTERESTED">
                            Not Interested
                        </option>

                    </select>


                    {/* EXECUTIVE */}

                    <select
                        value={executiveFilter}
                        onChange={(e) =>
                            setExecutiveFilter(
                                e.target.value
                            )
                        }
                        className="
                            h-11
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            outline-none
                            focus:border-[#102236]
                            focus:ring-2
                            focus:ring-[#102236]/10
                        "
                    >

                        <option value="ALL">
                            All Executives
                        </option>

                        {executives.map(
                            (executive) => (
                                <option
                                    key={
                                        executive.id
                                    }
                                    value={
                                        executive.id
                                    }
                                >
                                    {executive.name}
                                </option>
                            )
                        )}

                    </select>

                </div>


                {hasFilters && (
                    <div className="mt-3">

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-xs
                                font-bold
                                text-slate-500
                                transition
                                hover:bg-slate-100
                                hover:text-[#102236]
                            "
                        >

                            <Icon
                                name="x"
                                size={14}
                            />

                            Clear filters

                        </button>

                    </div>
                )}

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                "
            >

                {/* TABLE HEADER */}

                <div
                    className="
                        flex
                        flex-col
                        gap-2
                        border-b
                        border-slate-200
                        px-5
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-base
                                font-black
                                text-[#102236]
                            "
                        >
                            Finished Leads
                        </h2>

                        <p
                            className="
                                mt-0.5
                                text-xs
                                text-slate-500
                            "
                        >
                            {total === 0
                                ? "No finished leads found."
                                : `Showing ${
                                    Math.min(
                                        (
                                            page -
                                            1
                                        ) *
                                        ITEMS_PER_PAGE +
                                        1,
                                        total
                                    )
                                }–${
                                    Math.min(
                                        page *
                                        ITEMS_PER_PAGE,
                                        total
                                    )
                                } of ${
                                    total
                                } leads`
                            }
                        </p>

                    </div>

                </div>


                {/* EMPTY */}

                {paginatedLeads.length === 0 ? (

                    <div
                        className="
                            px-6
                            py-16
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                mb-4
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-slate-100
                                text-slate-400
                            "
                        >

                            <Icon
                                name="users"
                                size={25}
                            />

                        </div>


                        <h3
                            className="
                                text-base
                                font-black
                                text-[#102236]
                            "
                        >
                            No finished leads
                        </h3>


                        <p
                            className="
                                mx-auto
                                mt-1
                                max-w-md
                                text-sm
                                text-slate-500
                            "
                        >
                            There are no leads matching
                            your current filters.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            overflow-x-auto
                        "
                    >

                        <table
                            className="
                                min-w-[1050px]
                                w-full
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        border-b
                                        border-slate-200
                                        bg-slate-50
                                    "
                                >

                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Lead
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Contact
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        College / Program
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Executive
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Finished As
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-left
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Finished Date
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-right
                                            text-[11px]
                                            font-black
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {paginatedLeads.map(
                                    (lead) => {

                                        const leadId =
                                            getLeadId(
                                                lead
                                            );

                                        const completion =
                                            getCompletionType(
                                                lead
                                            );

                                        const enrolled =
                                            completion ===
                                            "ENROLLED";


                                        return (
                                            <tr
                                                key={
                                                    leadId
                                                }
                                                className="
                                                    border-b
                                                    border-slate-100
                                                    transition
                                                    hover:bg-slate-50
                                                "
                                            >

                                                {/* LEAD */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            min-w-[190px]
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-black
                                                                text-[#102236]
                                                            "
                                                        >
                                                            {
                                                                getLeadName(
                                                                    lead
                                                                )
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                        >
                                                            ID:{" "}
                                                            {leadId
                                                                ? String(
                                                                    leadId
                                                                ).slice(
                                                                    -8
                                                                )
                                                                : "—"}
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* CONTACT */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            min-w-[160px]
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                        >
                                                            {
                                                                getLeadPhone(
                                                                    lead
                                                                )
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                max-w-[190px]
                                                                truncate
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                            title={
                                                                getLeadEmail(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getLeadEmail(
                                                                    lead
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* COLLEGE */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            min-w-[190px]
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                max-w-[230px]
                                                                truncate
                                                                text-sm
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                            title={
                                                                getCollege(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getCollege(
                                                                    lead
                                                                )
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                mt-1
                                                                max-w-[230px]
                                                                truncate
                                                                text-xs
                                                                text-slate-400
                                                            "
                                                            title={
                                                                getProgram(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getProgram(
                                                                    lead
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* EXECUTIVE */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                h-8
                                                                w-8
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-[#102236]
                                                                text-xs
                                                                font-black
                                                                text-white
                                                            "
                                                        >
                                                            {String(
                                                                getOwnerName(
                                                                    lead
                                                                )
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <span
                                                            className="
                                                                max-w-[150px]
                                                                truncate
                                                                text-sm
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                            title={
                                                                getOwnerName(
                                                                    lead
                                                                )
                                                            }
                                                        >
                                                            {
                                                                getOwnerName(
                                                                    lead
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* FINISHED STATUS */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-black
                                                            ${
                                                                enrolled
                                                                    ? "bg-emerald-50 text-emerald-700"
                                                                    : "bg-red-50 text-red-700"
                                                            }
                                                        `}
                                                    >

                                                        <Icon
                                                            name={
                                                                enrolled
                                                                    ? "check"
                                                                    : "x"
                                                            }
                                                            size={13}
                                                        />

                                                        {enrolled
                                                            ? "Enrolled"
                                                            : "Not Interested"}

                                                    </span>

                                                </td>


                                                {/* DATE */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            font-semibold
                                                            text-slate-600
                                                        "
                                                    >

                                                        <Icon
                                                            name="calendar"
                                                            size={15}
                                                            className="text-slate-400"
                                                        />

                                                        {formatDate(
                                                            lead?.updatedAt ||
                                                            lead?.completedAt ||
                                                            lead?.createdAt
                                                        )}

                                                    </div>

                                                </td>


                                                {/* ACTION */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                        text-right
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewLead(
                                                                lead
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-slate-200
                                                            bg-white
                                                            px-3.5
                                                            py-2
                                                            text-xs
                                                            font-black
                                                            text-[#102236]
                                                            shadow-sm
                                                            transition
                                                            hover:border-[#102236]
                                                            hover:bg-[#102236]
                                                            hover:text-white
                                                        "
                                                    >

                                                        <Icon
                                                            name="eye"
                                                            size={15}
                                                        />

                                                        View Lead

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

            </div>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {total > ITEMS_PER_PAGE && (

                <div
                    className="
                        mt-5
                        flex
                        flex-col
                        gap-3
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

                    <p
                        className="
                            text-xs
                            font-semibold
                            text-slate-500
                        "
                    >
                        Page{" "}
                        <span className="font-black text-[#102236]">
                            {page}
                        </span>{" "}
                        of{" "}
                        <span className="font-black text-[#102236]">
                            {totalPages}
                        </span>
                    </p>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <button
                            type="button"
                            disabled={
                                page === 1
                            }
                            onClick={() =>
                                setPage(
                                    (current) =>
                                        Math.max(
                                            1,
                                            current - 1
                                        )
                                )
                            }
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-2
                                text-xs
                                font-black
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            Previous
                        </button>


                        <div
                            className="
                                flex
                                h-9
                                min-w-9
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#102236]
                                px-3
                                text-xs
                                font-black
                                text-white
                            "
                        >
                            {page}
                        </div>


                        <button
                            type="button"
                            disabled={
                                page >=
                                totalPages
                            }
                            onClick={() =>
                                setPage(
                                    (current) =>
                                        Math.min(
                                            totalPages,
                                            current + 1
                                        )
                                )
                            }
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-2
                                text-xs
                                font-black
                                text-slate-700
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            Next
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};


export default ManagerFinishedLeads;