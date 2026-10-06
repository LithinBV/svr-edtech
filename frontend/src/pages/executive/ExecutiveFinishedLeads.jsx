import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";


// ============================================================
// API
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_URL + "/api";


// ============================================================
// FINISHED FILTERS
// ============================================================

const FINISHED_OPTIONS = [
    "ALL",
    "ENROLLED",
    "NOT_INTERESTED",
];


// ============================================================
// STATUS COLORS
// ============================================================

const getStatusClasses = (status) => {

    switch (status) {

        case "NEW":
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case "COLD":
            return `
                border-slate-200
                bg-slate-100
                text-slate-700
            `;

        case "WARM":
            return `
                border-amber-200
                bg-amber-50
                text-amber-700
            `;

        case "HOT":
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        default:
            return `
                border-gray-200
                bg-gray-100
                text-gray-600
            `;
    }
};


// ============================================================
// STATUS DOT
// ============================================================

const getStatusDot = (status) => {

    switch (status) {

        case "NEW":
            return "bg-blue-500";

        case "COLD":
            return "bg-slate-500";

        case "WARM":
            return "bg-amber-500";

        case "HOT":
            return "bg-red-500";

        default:
            return "bg-gray-400";
    }
};


// ============================================================
// FOLLOW-UP COLORS
// ============================================================

const getFollowUpStatusClasses = (status) => {

    switch (status) {

        case "TODAY":
            return `
                border-amber-200
                bg-amber-50
                text-amber-700
            `;

        case "UPCOMING":
            return `
                border-blue-200
                bg-blue-50
                text-blue-700
            `;

        case "MISSED":
            return `
                border-red-200
                bg-red-50
                text-red-700
            `;

        case "COMPLETED":
            return `
                border-emerald-200
                bg-emerald-50
                text-emerald-700
            `;

        default:
            return `
                border-gray-200
                bg-gray-100
                text-gray-500
            `;
    }
};


// ============================================================
// FOLLOW-UP DOT
// ============================================================

const getFollowUpStatusDot = (status) => {

    switch (status) {

        case "TODAY":
            return "bg-amber-500";

        case "UPCOMING":
            return "bg-blue-500";

        case "MISSED":
            return "bg-red-500";

        case "COMPLETED":
            return "bg-emerald-500";

        default:
            return "bg-gray-400";
    }
};


// ============================================================
// FOLLOW-UP LABEL
// ============================================================

const getFollowUpStatusLabel = (status) => {

    switch (status) {

        case "TODAY":
            return "Today";

        case "UPCOMING":
            return "Upcoming";

        case "MISSED":
            return "Missed";

        case "COMPLETED":
            return "Completed";

        default:
            return "No Follow-up";
    }
};


// ============================================================
// DATE FORMAT
// ============================================================

const formatFollowUp = (dateValue) => {

    if (!dateValue) {
        return "-";
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


// ============================================================
// ICON
// ============================================================

const Icon = ({
    type,
    className = "h-5 w-5",
}) => {

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
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                    />

                    <path
                        d="m20 20-4-4"
                    />
                </svg>
            );


        case "refresh":

            return (
                <svg {...common}>
                    <path
                        d="M20 11a8 8 0 0 0-15.5-2"
                    />

                    <path
                        d="M4 4v5h5"
                    />

                    <path
                        d="M4 13a8 8 0 0 0 15.5 2"
                    />

                    <path
                        d="M20 20v-5h-5"
                    />
                </svg>
            );


        case "leads":

            return (
                <svg {...common}>

                    <path
                        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    />

                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />

                    <path
                        d="M22 21v-2a4 4 0 0 0-3-3.87"
                    />

                    <path
                        d="M16 3.13a4 4 0 0 1 0 7.75"
                    />

                </svg>
            );


        case "email":

            return (
                <svg {...common}>

                    <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                    />

                    <path
                        d="m3 7 9 6 9-6"
                    />

                </svg>
            );


        case "phone":

            return (
                <svg {...common}>

                    <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"
                    />

                </svg>
            );


        case "building":

            return (
                <svg {...common}>

                    <path
                        d="M3 21h18"
                    />

                    <path
                        d="M5 21V5l7-3 7 3v16"
                    />

                    <path
                        d="M9 9h1"
                    />

                    <path
                        d="M14 9h1"
                    />

                    <path
                        d="M9 13h1"
                    />

                    <path
                        d="M14 13h1"
                    />

                    <path
                        d="M10 21v-4h4v4"
                    />

                </svg>
            );


        case "filter":

            return (
                <svg {...common}>

                    <path
                        d="M4 6h16"
                    />

                    <path
                        d="M7 12h10"
                    />

                    <path
                        d="M10 18h4"
                    />

                </svg>
            );


        case "arrow":

            return (
                <svg {...common}>

                    <path
                        d="M5 12h14"
                    />

                    <path
                        d="m13 6 6 6-6 6"
                    />

                </svg>
            );


        case "check":

            return (
                <svg {...common}>

                    <path
                        d="m5 12 4 4L19 6"
                    />

                </svg>
            );


        case "close":

            return (
                <svg {...common}>

                    <path
                        d="M6 6l12 12"
                    />

                    <path
                        d="M18 6 6 18"
                    />

                </svg>
            );


        default:
            return null;
    }
};


// ============================================================
// EXECUTIVE FINISHED LEADS
// ============================================================

function ExecutiveFinishedLeads() {

    const navigate =
        useNavigate();


    // ========================================================
    // STATE
    // ========================================================

    const [
        leads,
        setLeads,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        refreshing,
        setRefreshing,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        completionFilter,
        setCompletionFilter,
    ] = useState("ALL");


    // ========================================================
    // TOKEN
    // ========================================================

    const getToken = () => {

        return (
            localStorage.getItem(
                "executiveToken"
            ) ||

            localStorage.getItem(
                "token"
            ) ||

            localStorage.getItem(
                "accessToken"
            )
        );
    };


    // ========================================================
    // FETCH FINISHED LEADS
    // ========================================================

    const fetchFinishedLeads =
        async (
            showLoader = true
        ) => {

            try {

                if (showLoader) {

                    setLoading(true);

                } else {

                    setRefreshing(true);

                }


                setError("");


                const token =
                    getToken();


                if (!token) {

                    navigate(
                        "/login",
                        {
                            replace: true,
                        }
                    );

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


                console.log(
                    "EXECUTIVE FINISHED LEADS RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // AUTH
                // ------------------------------------------------

                if (
                    response.status ===
                        401 ||
                    response.status ===
                        403
                ) {

                    navigate(
                        "/login",
                        {
                            replace: true,
                        }
                    );

                    return;
                }


                // ------------------------------------------------
                // ERROR
                // ------------------------------------------------

                if (
                    !response.ok
                ) {

                    throw new Error(
                        data?.message ||
                            "Failed to fetch finished leads."
                    );

                }


                // ------------------------------------------------
                // DATA
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


                console.log(
                    "EXECUTIVE FINISHED LEADS LOADED:",
                    fetchedLeads.length
                );


            } catch (err) {

                console.error(
                    "Executive finished leads error:",
                    err
                );


                setError(
                    err?.message ||
                        "Unable to load finished leads."
                );


                if (showLoader) {

                    setLeads([]);

                }


            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        fetchFinishedLeads();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = () => {

        fetchFinishedLeads(false);

    };


    // ========================================================
    // FILTERED LEADS
    // ========================================================

    const filteredLeads =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return leads.filter(
                (lead) => {


                    // --------------------------------------------
                    // COMPLETION FILTER
                    // --------------------------------------------

                    const completionType =
                        String(
                            lead?.latestRemark ||
                                lead?.completionType ||
                                ""
                        )
                            .trim()
                            .toUpperCase();


                    const matchesCompletion =
                        completionFilter ===
                            "ALL" ||
                        completionType ===
                            completionFilter;


                    if (
                        !matchesCompletion
                    ) {

                        return false;

                    }


                    // --------------------------------------------
                    // SEARCH
                    // --------------------------------------------

                    if (
                        !searchValue
                    ) {

                        return true;

                    }


                    const searchableText =
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

                            lead?.latestRemark,

                            lead?.completionType,

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    return searchableText.includes(
                        searchValue
                    );

                }
            );

        }, [
            leads,
            search,
            completionFilter,
        ]);


    // ========================================================
    // UI PAGINATION
    // ========================================================

    const {
        page,
        total,
        totalPages,
        paginatedItems,
        setPage,
        itemsPerPage,
    } = usePagination(
        filteredLeads,
        50
    );


    // ========================================================
    // VIEW LEAD
    // ========================================================

    const handleViewLead = (
        lead
    ) => {

        if (
            !lead?._id
        ) {

            return;

        }


        navigate(
            `/leads/${lead._id}`
        );

    };


    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {

        setSearch("");

        setCompletionFilter(
            "ALL"
        );

        setPage(1);

    };


    // ========================================================
    // FILTER CHANGE
    // ========================================================

    const handleCompletionChange =
        (value) => {

            setCompletionFilter(
                value
            );

            setPage(1);

        };


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <div className="min-h-screen bg-[#f5f7fb]">

            <div
                className="
                    mx-auto
                    w-full
                    max-w-[1600px]
                    px-4
                    py-5
                    sm:px-6
                    sm:py-7
                    lg:px-8
                    lg:py-8
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        bg-[#102236]
                        p-6
                        text-white
                        shadow-lg
                        sm:p-8
                    "
                >

                    <div
                        className="
                            absolute
                            -right-16
                            -top-20
                            h-60
                            w-60
                            rounded-full
                            bg-[#FECA42]/10
                        "
                    />

                    <div
                        className="
                            absolute
                            -bottom-24
                            right-1/3
                            h-48
                            w-48
                            rounded-full
                            bg-white/[0.03]
                        "
                    />


                    <div
                        className="
                            relative
                            flex
                            flex-col
                            gap-6
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div>

                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-3
                                    py-1.5
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white/80
                                "
                            >

                                <span
                                    className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-[#FECA42]
                                    "
                                />

                                Finished Leads

                            </div>


                            <h1
                                className="
                                    mt-3
                                    text-3xl
                                    font-black
                                    tracking-tight
                                    sm:text-4xl
                                "
                            >
                                Completed lead records.
                            </h1>


                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-white/60
                                "
                            >
                                View leads that were completed as
                                enrolled or not interested.
                            </p>

                        </div>


                        {/* REFRESH */}

                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                refreshing
                            }
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#FECA42]
                                px-5
                                py-3
                                text-sm
                                font-extrabold
                                text-[#102236]
                                shadow-md
                                transition
                                hover:bg-[#ffd45b]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <Icon
                                type="refresh"
                                className={`
                                    h-4
                                    w-4
                                    ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                `}
                            />

                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}

                        </button>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            text-red-700
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-bold
                            "
                        >
                            Something went wrong
                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-red-600
                            "
                        >
                            {error}
                        </p>

                    </div>

                )}


                {/* ==================================================
                    SEARCH + FILTER
                ================================================== */}

                <section
                    className="
                        mt-7
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        p-4
                        shadow-sm
                        sm:p-5
                    "
                >

                    <div
                        className="
                            mb-4
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#9a8950]
                                "
                            >
                                Find a finished lead
                            </p>


                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-extrabold
                                    text-[#102236]
                                "
                            >
                                Search & Filter
                            </h2>

                        </div>


                        {(search ||
                            completionFilter !==
                                "ALL") && (

                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="
                                    self-start
                                    text-xs
                                    font-bold
                                    text-[#102236]
                                    underline
                                    underline-offset-4
                                    transition
                                    hover:text-[#806100]
                                "
                            >
                                Clear filters
                            </button>

                        )}

                    </div>


                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            lg:flex-row
                        "
                    >

                        {/* SEARCH */}

                        <div
                            className="
                                relative
                                flex-1
                            "
                        >

                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            >

                                <Icon
                                    type="search"
                                    className="
                                        h-5
                                        w-5
                                    "
                                />

                            </div>


                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="
                                    Search by name, email, phone,
                                    college or program...
                                "
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-[#f8faf9]
                                    py-3
                                    pl-11
                                    pr-4
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#FECA42]
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-[#FECA42]/10
                                "
                            />

                        </div>


                        {/* COMPLETION FILTER */}

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-gray-200
                                bg-[#f8faf9]
                                px-3
                                lg:w-64
                            "
                        >

                            <Icon
                                type="filter"
                                className="
                                    h-4
                                    w-4
                                    shrink-0
                                    text-gray-400
                                "
                            />


                            <select
                                value={
                                    completionFilter
                                }
                                onChange={(
                                    event
                                ) =>
                                    handleCompletionChange(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="
                                    w-full
                                    bg-transparent
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    outline-none
                                "
                            >

                                {FINISHED_OPTIONS.map(
                                    (
                                        option
                                    ) => (

                                        <option
                                            key={
                                                option
                                            }
                                            value={
                                                option
                                            }
                                        >
                                            {option ===
                                            "ALL"
                                                ? "All Finished Leads"
                                                : option ===
                                                  "ENROLLED"
                                                ? "Enrolled"
                                                : "Not Interested"}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* FILTER BUTTONS */}

                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                        "
                    >

                        <button
                            type="button"
                            onClick={() =>
                                handleCompletionChange(
                                    "ALL"
                                )
                            }
                            className={`
                                rounded-xl
                                px-4
                                py-2
                                text-xs
                                font-bold
                                transition
                                ${
                                    completionFilter ===
                                    "ALL"
                                        ? "bg-[#102236] text-white"
                                        : "border border-gray-200 bg-white text-gray-600 hover:border-[#FECA42]"
                                }
                            `}
                        >
                            All Finished
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                handleCompletionChange(
                                    "ENROLLED"
                                )
                            }
                            className={`
                                rounded-xl
                                px-4
                                py-2
                                text-xs
                                font-bold
                                transition
                                ${
                                    completionFilter ===
                                    "ENROLLED"
                                        ? "bg-emerald-600 text-white"
                                        : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-300"
                                }
                            `}
                        >
                            Enrolled
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                handleCompletionChange(
                                    "NOT_INTERESTED"
                                )
                            }
                            className={`
                                rounded-xl
                                px-4
                                py-2
                                text-xs
                                font-bold
                                transition
                                ${
                                    completionFilter ===
                                    "NOT_INTERESTED"
                                        ? "bg-red-600 text-white"
                                        : "border border-gray-200 bg-white text-gray-600 hover:border-red-300"
                                }
                            `}
                        >
                            Not Interested
                        </button>

                    </div>


                    {/* RESULT COUNT */}

                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            items-center
                            justify-between
                            gap-2
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-400
                            "
                        >
                            Showing{" "}

                            <span
                                className="
                                    font-bold
                                    text-gray-700
                                "
                            >
                                {filteredLeads.length}
                            </span>

                            {" "}of{" "}

                            <span
                                className="
                                    font-bold
                                    text-gray-700
                                "
                            >
                                {leads.length}
                            </span>

                            {" "}finished leads
                        </p>

                    </div>

                </section>


                {/* ==================================================
                    LEAD TABLE
                ================================================== */}

                <section
                    className="
                        mt-6
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-100
                        bg-white
                        shadow-sm
                    "
                >

                    {/* TABLE HEADER */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-b
                            border-gray-100
                            p-5
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
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
                                    "
                                >

                                    <Icon
                                        type="leads"
                                        className="
                                            h-5
                                            w-5
                                        "
                                    />

                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-lg
                                            font-extrabold
                                            text-[#102236]
                                        "
                                    >
                                        Finished Lead List
                                    </h2>


                                    <p
                                        className="
                                            text-xs
                                            text-gray-400
                                        "
                                    >
                                        Completed leads assigned to you
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[360px]
                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto
                                        h-10
                                        w-10
                                        animate-spin
                                        rounded-full
                                        border-4
                                        border-gray-200
                                        border-t-[#102236]
                                    "
                                />


                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        font-bold
                                        text-[#102236]
                                    "
                                >
                                    Loading finished leads...
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-gray-400
                                    "
                                >
                                    Please wait
                                </p>

                            </div>

                        </div>

                    ) : filteredLeads.length ===
                      0 ? (

                        /* EMPTY */

                        <div
                            className="
                                flex
                                min-h-[360px]
                                items-center
                                justify-center
                                px-6
                            "
                        >

                            <div
                                className="
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-slate-100
                                        text-slate-500
                                    "
                                >

                                    <Icon
                                        type="leads"
                                        className="
                                            h-8
                                            w-8
                                        "
                                    />

                                </div>


                                <h3
                                    className="
                                        mt-5
                                        text-lg
                                        font-extrabold
                                        text-[#102236]
                                    "
                                >
                                    No finished leads found
                                </h3>


                                <p
                                    className="
                                        mx-auto
                                        mt-1
                                        max-w-sm
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    {search ||
                                    completionFilter !==
                                        "ALL"
                                        ? "Try changing your search or completion filter."
                                        : "No finished leads are currently assigned to you."}
                                </p>


                                {(search ||
                                    completionFilter !==
                                        "ALL") && (

                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="
                                            mt-4
                                            rounded-xl
                                            bg-[#FECA42]
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-extrabold
                                            text-[#102236]
                                            transition
                                            hover:bg-[#ffd45b]
                                        "
                                    >
                                        Clear Filters
                                    </button>

                                )}

                            </div>

                        </div>

                    ) : (

                        /* TABLE */

                        <div
                            className="
                                overflow-x-auto
                            "
                        >

                            <table
                                className="
                                    min-w-[1100px]
                                    w-full
                                "
                            >

                                <thead>

                                    <tr
                                        className="
                                            border-b
                                            border-gray-100
                                            bg-[#f8faf9]
                                        "
                                    >

                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Lead
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Contact
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            College
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Program
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Status
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Finished As
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-left
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Follow-up
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-4
                                                text-right
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-[0.14em]
                                                text-gray-400
                                            "
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    {paginatedItems.map(
                                        (
                                            lead,
                                            index
                                        ) => {

                                            const followUpStatus =
                                                lead?.followUpStatus ||
                                                "NONE";


                                            const followUpDate =
                                                lead?.displayFollowUpAt ||
                                                lead?.followUpAt ||
                                                null;


                                            const completionType =
                                                String(
                                                    lead?.latestRemark ||
                                                        lead?.completionType ||
                                                        ""
                                                )
                                                    .trim()
                                                    .toUpperCase();


                                            const initials =
                                                lead?.name
                                                    ?.charAt(
                                                        0
                                                    )
                                                    ?.toUpperCase() ||
                                                "L";


                                            return (

                                                <tr
                                                    key={
                                                        lead?._id ||
                                                        index
                                                    }
                                                    className="
                                                        group
                                                        transition-colors
                                                        duration-150
                                                        hover:bg-[#fffdf5]
                                                    "
                                                >

                                                    {/* LEAD */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    flex
                                                                    h-11
                                                                    w-11
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    bg-blue-50
                                                                    text-sm
                                                                    font-extrabold
                                                                    text-blue-700
                                                                "
                                                            >
                                                                {initials}
                                                            </div>


                                                            <div
                                                                className="
                                                                    min-w-0
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
                                                                        max-w-[230px]
                                                                        truncate
                                                                        text-left
                                                                        text-sm
                                                                        font-extrabold
                                                                        text-[#102236]
                                                                        transition
                                                                        hover:text-blue-600
                                                                    "
                                                                >
                                                                    {lead?.name ||
                                                                        "-"}
                                                                </button>


                                                                <div
                                                                    className="
                                                                        mt-1
                                                                        flex
                                                                        max-w-[250px]
                                                                        items-center
                                                                        gap-1.5
                                                                    "
                                                                >

                                                                    <Icon
                                                                        type="email"
                                                                        className="
                                                                            h-3.5
                                                                            w-3.5
                                                                            shrink-0
                                                                            text-gray-400
                                                                        "
                                                                    />


                                                                    <p
                                                                        className="
                                                                            truncate
                                                                            text-xs
                                                                            text-gray-400
                                                                        "
                                                                    >
                                                                        {lead?.email ||
                                                                            "-"}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* CONTACT */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
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
                                                                    rounded-lg
                                                                    bg-blue-50
                                                                    text-blue-600
                                                                "
                                                            >

                                                                <Icon
                                                                    type="phone"
                                                                    className="
                                                                        h-4
                                                                        w-4
                                                                    "
                                                                />

                                                            </div>


                                                            <span
                                                                className="
                                                                    text-sm
                                                                    font-medium
                                                                    text-gray-700
                                                                "
                                                            >
                                                                {lead?.contact ||
                                                                    lead?.phone ||
                                                                    "-"}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* COLLEGE */}

                                                    <td
                                                        className="
                                                            max-w-[240px]
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-start
                                                                gap-2
                                                            "
                                                        >

                                                            <div
                                                                className="
                                                                    mt-0.5
                                                                    flex
                                                                    h-8
                                                                    w-8
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    bg-slate-100
                                                                    text-slate-600
                                                                "
                                                            >

                                                                <Icon
                                                                    type="building"
                                                                    className="
                                                                        h-4
                                                                        w-4
                                                                    "
                                                                />

                                                            </div>


                                                            <div
                                                                className="
                                                                    min-w-0
                                                                "
                                                            >

                                                                <p
                                                                    className="
                                                                        line-clamp-2
                                                                        text-sm
                                                                        font-bold
                                                                        text-gray-700
                                                                    "
                                                                >
                                                                    {lead?.collegeName ||
                                                                        lead?.college ||
                                                                        "-"}
                                                                </p>


                                                                <p
                                                                    className="
                                                                        mt-1
                                                                        truncate
                                                                        text-xs
                                                                        text-gray-400
                                                                    "
                                                                >
                                                                    {lead?.district ||
                                                                        lead?.state ||
                                                                        "Location not available"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* PROGRAM */}

                                                    <td
                                                        className="
                                                            max-w-[220px]
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                inline-flex
                                                                max-w-[200px]
                                                                rounded-lg
                                                                border
                                                                border-gray-200
                                                                bg-gray-50
                                                                px-3
                                                                py-2
                                                                text-xs
                                                                font-semibold
                                                                text-gray-700
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    truncate
                                                                "
                                                            >
                                                                {lead?.programInterest ||
                                                                    lead?.leadType ||
                                                                    "-"}
                                                            </span>

                                                        </span>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-bold
                                                                    ${getStatusClasses(
                                                                        lead?.status
                                                                    )}
                                                                `}
                                                            >

                                                                <span
                                                                    className={`
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        ${getStatusDot(
                                                                            lead?.status
                                                                        )}
                                                                    `}
                                                                />

                                                                {lead?.status ||
                                                                    "-"}

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* FINISHED AS */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        {completionType ===
                                                        "ENROLLED" ? (

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    border-emerald-200
                                                                    bg-emerald-50
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-bold
                                                                    text-emerald-700
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        flex
                                                                        h-4
                                                                        w-4
                                                                        items-center
                                                                        justify-center
                                                                        rounded-full
                                                                        bg-emerald-100
                                                                    "
                                                                >

                                                                    <Icon
                                                                        type="check"
                                                                        className="
                                                                            h-3
                                                                            w-3
                                                                        "
                                                                    />

                                                                </span>

                                                                Enrolled

                                                            </span>

                                                        ) : (

                                                            <span
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    border-red-200
                                                                    bg-red-50
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-bold
                                                                    text-red-700
                                                                "
                                                            >

                                                                <span
                                                                    className="
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        bg-red-500
                                                                    "
                                                                />

                                                                Not Interested

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* FOLLOW-UP */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                flex-col
                                                                items-start
                                                                gap-2
                                                            "
                                                        >

                                                            <span
                                                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    px-3
                                                                    py-1.5
                                                                    text-[10px]
                                                                    font-bold
                                                                    ${getFollowUpStatusClasses(
                                                                        followUpStatus
                                                                    )}
                                                                `}
                                                            >

                                                                <span
                                                                    className={`
                                                                        h-1.5
                                                                        w-1.5
                                                                        rounded-full
                                                                        ${getFollowUpStatusDot(
                                                                            followUpStatus
                                                                        )}
                                                                    `}
                                                                />

                                                                {getFollowUpStatusLabel(
                                                                    followUpStatus
                                                                )}

                                                            </span>


                                                            {followUpDate && (

                                                                <span
                                                                    className="
                                                                        text-xs
                                                                        text-gray-400
                                                                    "
                                                                >
                                                                    {formatFollowUp(
                                                                        followUpDate
                                                                    )}
                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-5
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
                                                                bg-[#102236]
                                                                px-4
                                                                py-2.5
                                                                text-xs
                                                                font-bold
                                                                text-white
                                                                shadow-sm
                                                                transition-all
                                                                duration-200
                                                                hover:bg-[#18344e]
                                                                hover:shadow-md
                                                                active:scale-95
                                                            "
                                                        >

                                                            View

                                                            <Icon
                                                                type="arrow"
                                                                className="
                                                                    h-3.5
                                                                    w-3.5
                                                                "
                                                            />

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

                </section>


                {/* ==================================================
                    PAGINATION
                ================================================== */}

                {!loading &&
                    filteredLeads.length > 0 && (

                    <Pagination
                        page={page}
                        total={total}
                        totalPages={totalPages}
                        itemsPerPage={
                            itemsPerPage
                        }
                        onPageChange={
                            setPage
                        }
                        itemLabel="finished leads"
                    />

                )}


                {/* ==================================================
                    FOOTER
                ================================================== */}

                {!loading &&
                    filteredLeads.length > 0 && (

                    <div
                        className="
                            mt-4
                            flex
                            flex-col
                            items-center
                            justify-between
                            gap-2
                            text-xs
                            text-gray-400
                            sm:flex-row
                        "
                    >

                        <p>

                            Showing{" "}

                            <span
                                className="
                                    font-bold
                                    text-gray-600
                                "
                            >
                                {(page - 1) *
                                    itemsPerPage +
                                    1}
                            </span>

                            {" – "}

                            <span
                                className="
                                    font-bold
                                    text-gray-600
                                "
                            >
                                {Math.min(
                                    page *
                                        itemsPerPage,
                                    total
                                )}
                            </span>

                            {" of "}

                            <span
                                className="
                                    font-bold
                                    text-gray-600
                                "
                            >
                                {total}
                            </span>

                            {" "}finished leads

                        </p>


                        <p>
                            SVR EDTECH • Executive
                            Finished Lead Management
                        </p>

                    </div>

                )}

            </div>

        </div>

    );
}


export default ExecutiveFinishedLeads;