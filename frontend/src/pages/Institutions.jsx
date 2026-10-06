import { useEffect, useMemo, useState } from "react";

function Institutions() {

    const API_URL = import.meta.env.VITE_API_URL;
  
    const [institutions, setInstitutions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedInstitution, setSelectedInstitution] = useState(null);

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");

    // =========================================================
    // CHECK AUTHENTICATION
    // =========================================================

    useEffect(() => {
        if (!token) {
            window.location.replace("/login");
            return;
        }

        if (userType !== "SUPER_ADMIN") {
            window.location.replace("/login");
            return;
        }

        loadInstitutions();
    }, []);

    // =========================================================
    // LOAD INSTITUTIONS
    // =========================================================

    async function loadInstitutions() {
        try {
            setLoading(true);
            setError("");

            const currentToken =
                localStorage.getItem("token");

            if (!currentToken) {
                window.location.replace("/login");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/institutions`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`,
                    },
                }
            );

            // =====================================================
            // AUTH ERROR
            // =====================================================

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                localStorage.removeItem("institutionId");

                window.location.replace("/login");

                return;
            }

            // =====================================================
            // READ RESPONSE
            // =====================================================

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load institutions."
                );
            }

            // =====================================================
            // SAVE DATA
            // =====================================================

            const institutionList =
                Array.isArray(data.institutions)
                    ? data.institutions
                    : [];

            setInstitutions(institutionList);
        } catch (error) {
            console.error(
                "Load institutions error:",
                error
            );

            setError(
                error.message ||
                    "Unable to load institutions."
            );
        } finally {
            setLoading(false);
        }
    }

    // =========================================================
    // RECENTLY ADDED
    // =========================================================

    const recentlyAddedCount = useMemo(() => {
        const now = new Date();

        const currentYear =
            now.getFullYear();

        const currentMonth =
            now.getMonth();

        return institutions.filter(
            (institution) => {
                if (!institution.createdAt) {
                    return false;
                }

                const createdDate =
                    new Date(
                        institution.createdAt
                    );

                return (
                    createdDate.getFullYear() ===
                        currentYear &&
                    createdDate.getMonth() ===
                        currentMonth
                );
            }
        ).length;
    }, [institutions]);

    // =========================================================
    // MONTH NAME
    // =========================================================

    const monthName =
        new Date().toLocaleString(
            "en-US",
            {
                month: "long",
            }
        );

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredInstitutions =
        useMemo(() => {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!search) {
                return institutions;
            }

            return institutions.filter(
                (institution) => {
                    const name =
                        institution.name || "";

                    const state =
                        institution.state || "";

                    const region =
                        institution.region || "";

                    let username = "";

                    if (
                        institution.institutionAdminId &&
                        typeof institution.institutionAdminId ===
                            "object"
                    ) {
                        username =
                            institution
                                .institutionAdminId
                                .username || "";
                    }

                    const searchableText = `
                        ${name}
                        ${state}
                        ${region}
                        ${username}
                    `.toLowerCase();

                    return searchableText.includes(
                        search
                    );
                }
            );
        }, [
            institutions,
            searchTerm,
        ]);

    // =========================================================
    // FORMAT DATE
    // =========================================================

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Not available";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "Not available";
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }

    // =========================================================
    // GET ADMIN DETAILS
    // =========================================================

    function getAdminDetails(institution) {
        if (
            !institution ||
            !institution.institutionAdminId ||
            typeof institution.institutionAdminId !==
                "object"
        ) {
            return {
                username: "Not assigned",
                email: "Not available",
            };
        }

        return {
            username:
                institution
                    .institutionAdminId
                    .username ||
                "Not assigned",

            email:
                institution
                    .institutionAdminId
                    .email ||
                "Not available",
        };
    }

    // =========================================================
    // VIEW INSTITUTION
    // =========================================================

    function viewInstitution(institutionId) {
        const institution =
            institutions.find(
                (item) =>
                    item._id ===
                    institutionId
            );

        if (!institution) {
            console.error(
                "Institution not found:",
                institutionId
            );

            return;
        }

        setSelectedInstitution(
            institution
        );
    }

    // =========================================================
    // CLOSE DETAILS
    // =========================================================

    function closeInstitutionDetails() {
        setSelectedInstitution(null);
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="
            min-h-screen
            bg-[#F7F9FC]
            text-[#102236]
        ">

            {/* =====================================================
                TOP HEADER
            ===================================================== */}

            <header className="
                relative
                overflow-hidden
                border-b
                border-[#F6C945]/20
                bg-[#102236]
            ">

                {/* Decorative shapes */}

                <div className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-28
                    h-72
                    w-72
                    rounded-full
                    bg-[#F6C945]/10
                " />

                <div className="
                    pointer-events-none
                    absolute
                    -bottom-28
                    left-[35%]
                    h-56
                    w-56
                    rounded-full
                    bg-[#F6C945]/5
                " />

                <div className="
                    relative
                    mx-auto
                    max-w-7xl
                    px-4
                    py-7
                    sm:px-6
                    lg:px-8
                ">

                    <div className="
                        flex
                        flex-col
                        gap-5
                        md:flex-row
                        md:items-center
                        md:justify-between
                    ">

                        {/* TITLE */}

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#F6C945]
                                text-[#102236]
                                shadow-lg
                            ">

                                <svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 21h18"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 7h1M14 7h1M9 11h1M14 11h1"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#F6C945]
                                ">
                                    Institution Management
                                </p>

                                <h1 className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    tracking-tight
                                    text-white
                                    sm:text-3xl
                                ">
                                    All Institutions
                                </h1>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-white/60
                                ">
                                    Manage all institutions
                                    created on the platform
                                </p>

                            </div>

                        </div>

                        {/* HEADER ACTIONS */}

                        <div className="
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                        ">

                            <a
                                href="/admin-dashboard"
                                className="
                                    inline-flex
                                    h-12
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    px-5
                                    text-sm
                                    font-bold
                                    text-white
                                    transition-all
                                    duration-200
                                    hover:border-[#F6C945]/50
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                "
                            >

                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 12l9-8 9 8"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 10v10h14V10"
                                    />
                                </svg>

                                Dashboard

                            </a>

                            <a
                                href="/create-institution"
                                className="
                                    inline-flex
                                    h-12
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-[#F6C945]
                                    px-6
                                    text-sm
                                    font-black
                                    text-[#102236]
                                    shadow-lg
                                    shadow-[#F6C945]/15
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:bg-[#FFD95A]
                                    hover:shadow-xl
                                "
                            >

                                <span className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#102236]
                                    text-sm
                                    font-bold
                                    text-[#F6C945]
                                ">
                                    +
                                </span>

                                Add Institution

                            </a>

                        </div>

                    </div>

                </div>

            </header>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="
                mx-auto
                max-w-7xl
                px-4
                py-8
                sm:px-6
                lg:px-8
            ">

                {/* =================================================
                    PAGE INTRO
                ================================================= */}

                <div className="
                    flex
                    flex-col
                    gap-5
                    xl:flex-row
                    xl:items-end
                    xl:justify-between
                ">

                    <div>

                        <div className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#F6C945]/30
                            bg-[#F6C945]/10
                            px-3
                            py-1.5
                        ">

                            <span className="
                                h-2
                                w-2
                                rounded-full
                                bg-[#F6C945]
                            " />

                            <span className="
                                text-xs
                                font-bold
                                uppercase
                                tracking-wide
                                text-[#806500]
                            ">
                                Institution Directory
                            </span>

                        </div>

                        <h2 className="
                            mt-4
                            text-2xl
                            font-black
                            tracking-tight
                            text-[#102236]
                            sm:text-3xl
                        ">
                            View Institutions
                        </h2>

                        <p className="
                            mt-2
                            max-w-2xl
                            text-sm
                            text-slate-500
                        ">
                            Search and view institution
                            information and administrator
                            details.
                        </p>

                    </div>

                    {/* SEARCH */}

                    <div className="
                        relative
                        w-full
                        xl:w-[320px]
                    ">

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search institutions..."
                            autoComplete="off"
                            className="
                                h-12
                                w-full
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                px-5
                                pr-12
                                text-sm
                                font-medium
                                text-[#102236]
                                outline-none
                                transition-all
                                duration-200
                                placeholder:text-slate-400
                                hover:border-[#102236]/20
                                focus:border-[#F6C945]
                                focus:ring-4
                                focus:ring-[#F6C945]/15
                            "
                        />

                        <svg
                            className="
                                absolute
                                right-4
                                top-1/2
                                h-5
                                w-5
                                -translate-y-1/2
                                text-slate-400
                            "
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="7"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 20l-4-4"
                            />
                        </svg>

                    </div>

                </div>

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="
                    mt-7
                    grid
                    grid-cols-1
                    gap-5
                    md:grid-cols-2
                ">

                    {/* TOTAL */}

                    <div className="
                        group
                        relative
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-[0_8px_30px_rgba(16,34,54,0.05)]
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:border-[#F6C945]/50
                        hover:shadow-[0_18px_40px_rgba(246,201,69,0.12)]
                    ">

                        <div className="
                            pointer-events-none
                            absolute
                            -right-10
                            -top-10
                            h-32
                            w-32
                            rounded-full
                            bg-[#F6C945]/10
                            transition-transform
                            duration-500
                            group-hover:scale-150
                        " />

                        <div className="
                            relative
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#F6C945]
                                text-[#102236]
                            ">

                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 21h18"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-slate-500
                                ">
                                    Total Institutions
                                </p>

                                <p className="
                                    mt-1
                                    text-3xl
                                    font-black
                                    text-[#102236]
                                ">
                                    {institutions.length}
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-400
                                ">
                                    All institutions
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* RECENTLY ADDED */}

                    <div className="
                        group
                        relative
                        overflow-hidden
                        rounded-[24px]
                        bg-[#102236]
                        p-6
                        shadow-[0_8px_30px_rgba(16,34,54,0.10)]
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_18px_40px_rgba(16,34,54,0.18)]
                    ">

                        <div className="
                            pointer-events-none
                            absolute
                            -right-10
                            -top-10
                            h-32
                            w-32
                            rounded-full
                            bg-[#F6C945]/10
                        " />

                        <div className="
                            relative
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#F6C945]
                                text-[#102236]
                            ">

                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <rect
                                        x="3"
                                        y="4"
                                        width="18"
                                        height="17"
                                        rx="2"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 2v4M8 2v4M3 10h18"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="
                                    text-sm
                                    font-semibold
                                    text-white/60
                                ">
                                    Recently Added
                                </p>

                                <p className="
                                    mt-1
                                    text-3xl
                                    font-black
                                    text-white
                                ">
                                    {recentlyAddedCount}
                                </p>

                                <p className="
                                    mt-1
                                    text-xs
                                    text-white/50
                                ">
                                    Created in {monthName}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="
                        mt-8
                        rounded-[24px]
                        border
                        border-slate-200
                        bg-white
                        p-12
                        text-center
                        shadow-sm
                    ">

                        <div className="
                            mx-auto
                            h-9
                            w-9
                            animate-spin
                            rounded-full
                            border-4
                            border-[#102236]/10
                            border-t-[#F6C945]
                        " />

                        <p className="
                            mt-4
                            text-sm
                            font-medium
                            text-slate-500
                        ">
                            Loading institutions...
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (
                    <div className="
                        mt-8
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-5
                        text-sm
                        font-semibold
                        text-red-700
                    ">
                        {error}
                    </div>
                )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    institutions.length === 0 && (
                        <div className="
                            mt-8
                            rounded-[24px]
                            border
                            border-[#F6C945]/30
                            bg-white
                            p-12
                            text-center
                            shadow-sm
                        ">

                            <div className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#F6C945]/15
                                text-[#806500]
                            ">

                                <svg
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 21h18"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                    />
                                </svg>

                            </div>

                            <h3 className="
                                mt-5
                                text-xl
                                font-black
                                text-[#102236]
                            ">
                                No institutions found
                            </h3>

                            <p className="
                                mt-2
                                text-sm
                                text-slate-500
                            ">
                                Create your first institution
                                to get started.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    NO SEARCH RESULTS
                ================================================= */}

                {!loading &&
                    !error &&
                    institutions.length > 0 &&
                    filteredInstitutions.length === 0 && (
                        <div className="
                            mt-8
                            rounded-[24px]
                            border
                            border-slate-200
                            bg-white
                            p-12
                            text-center
                            shadow-sm
                        ">

                            <div className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#102236]/5
                                text-[#102236]
                            ">

                                <svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="7"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20 20l-4-4"
                                    />
                                </svg>

                            </div>

                            <h3 className="
                                mt-5
                                text-xl
                                font-black
                                text-[#102236]
                            ">
                                No matching institutions
                            </h3>

                            <p className="
                                mt-2
                                text-sm
                                text-slate-500
                            ">
                                Try searching with another name,
                                state, region, or admin username.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    INSTITUTION CARDS
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredInstitutions.length > 0 && (
                        <div className="
                            mt-8
                            grid
                            grid-cols-1
                            gap-5
                            md:grid-cols-2
                            xl:grid-cols-3
                        ">

                            {filteredInstitutions.map(
                                (institution, index) => {

                                    const adminDetails =
                                        getAdminDetails(
                                            institution
                                        );

                                    return (
                                        <div
                                            key={
                                                institution._id ||
                                                index
                                            }
                                            className="
                                                group
                                                relative
                                                overflow-hidden
                                                rounded-[24px]
                                                border
                                                border-slate-200
                                                bg-white
                                                p-6
                                                shadow-[0_8px_30px_rgba(16,34,54,0.05)]
                                                transition-all
                                                duration-300
                                                hover:-translate-y-1
                                                hover:border-[#F6C945]/50
                                                hover:shadow-[0_18px_45px_rgba(246,201,69,0.13)]
                                            "
                                        >

                                            {/* CARD DECORATION */}

                                            <div className="
                                                pointer-events-none
                                                absolute
                                                -right-10
                                                -top-10
                                                h-28
                                                w-28
                                                rounded-full
                                                bg-[#F6C945]/10
                                                transition-transform
                                                duration-500
                                                group-hover:scale-150
                                            " />

                                            {/* CARD HEADER */}

                                            <div className="
                                                relative
                                                flex
                                                items-start
                                                justify-between
                                            ">

                                                <div className="
                                                    flex
                                                    h-14
                                                    w-14
                                                    items-center
                                                    justify-center
                                                    rounded-2xl
                                                    bg-[#102236]
                                                    text-[#F6C945]
                                                ">

                                                    <svg
                                                        className="h-6 w-6"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 21h18"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 7h1M14 7h1M9 11h1M14 11h1"
                                                        />
                                                    </svg>

                                                </div>

                                                <span className="
                                                    rounded-full
                                                    border
                                                    border-[#F6C945]/30
                                                    bg-[#F6C945]/10
                                                    px-3
                                                    py-1
                                                    text-[10px]
                                                    font-black
                                                    tracking-wide
                                                    text-[#806500]
                                                ">
                                                    INSTITUTION
                                                </span>

                                            </div>

                                            {/* NAME */}

                                            <div className="
                                                relative
                                                mt-5
                                            ">

                                                <p className="
                                                    text-xs
                                                    font-bold
                                                    uppercase
                                                    tracking-wide
                                                    text-slate-400
                                                ">
                                                    Institution{" "}
                                                    {index + 1}
                                                </p>

                                                <h3 className="
                                                    mt-1
                                                    break-words
                                                    text-xl
                                                    font-black
                                                    text-[#102236]
                                                ">
                                                    {institution.name ||
                                                        "Unnamed Institution"}
                                                </h3>

                                            </div>

                                            {/* DETAILS */}

                                            <div className="
                                                relative
                                                mt-5
                                                space-y-3
                                                border-t
                                                border-slate-100
                                                pt-5
                                            ">

                                                {/* STATE */}

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2.5
                                                        text-slate-500
                                                    ">

                                                        <span className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-[#F6C945]/10
                                                            text-[#806500]
                                                        ">
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"
                                                                />

                                                                <circle
                                                                    cx="12"
                                                                    cy="9"
                                                                    r="2"
                                                                />
                                                            </svg>
                                                        </span>

                                                        <span className="
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            State
                                                        </span>

                                                    </div>

                                                    <span className="
                                                        max-w-[55%]
                                                        text-right
                                                        text-sm
                                                        font-bold
                                                        text-[#102236]
                                                    ">
                                                        {institution.state ||
                                                            "Not available"}
                                                    </span>

                                                </div>

                                                {/* REGION */}

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2.5
                                                        text-slate-500
                                                    ">

                                                        <span className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-[#102236]/5
                                                            text-[#102236]
                                                        ">
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="9"
                                                                />

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M3 12h18M12 3a14 14 0 010 18"
                                                                />
                                                            </svg>
                                                        </span>

                                                        <span className="
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            Region
                                                        </span>

                                                    </div>

                                                    <span className="
                                                        max-w-[55%]
                                                        text-right
                                                        text-sm
                                                        font-bold
                                                        text-[#102236]
                                                    ">
                                                        {institution.region ||
                                                            "Not available"}
                                                    </span>

                                                </div>

                                                {/* ADMIN */}

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2.5
                                                        text-slate-500
                                                    ">

                                                        <span className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-[#F6C945]/10
                                                            text-[#806500]
                                                        ">
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <circle
                                                                    cx="12"
                                                                    cy="8"
                                                                    r="3"
                                                                />

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M5 20a7 7 0 0114 0"
                                                                />
                                                            </svg>
                                                        </span>

                                                        <span className="
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            Admin
                                                        </span>

                                                    </div>

                                                    <span className="
                                                        max-w-[55%]
                                                        break-all
                                                        text-right
                                                        text-sm
                                                        font-bold
                                                        text-[#102236]
                                                    ">
                                                        {adminDetails.username}
                                                    </span>

                                                </div>

                                                {/* CREATED */}

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2.5
                                                        text-slate-500
                                                    ">

                                                        <span className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-[#102236]/5
                                                            text-[#102236]
                                                        ">
                                                            <svg
                                                                className="h-4 w-4"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                            >
                                                                <rect
                                                                    x="3"
                                                                    y="4"
                                                                    width="18"
                                                                    height="17"
                                                                    rx="2"
                                                                />

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M16 2v4M8 2v4M3 10h18"
                                                                />
                                                            </svg>
                                                        </span>

                                                        <span className="
                                                            text-xs
                                                            font-semibold
                                                        ">
                                                            Created
                                                        </span>

                                                    </div>

                                                    <span className="
                                                        text-right
                                                        text-sm
                                                        font-bold
                                                        text-[#102236]
                                                    ">
                                                        {formatDate(
                                                            institution.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* VIEW DETAILS */}

                                            <div className="
                                                relative
                                                mt-5
                                                border-t
                                                border-slate-100
                                                pt-4
                                            ">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        viewInstitution(
                                                            institution._id
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        w-full
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-2xl
                                                        bg-[#102236]
                                                        px-4
                                                        py-3
                                                        text-sm
                                                        font-bold
                                                        text-white
                                                        transition-all
                                                        duration-200
                                                        hover:bg-[#18344F]
                                                        hover:text-[#F6C945]
                                                    "
                                                >

                                                    View Details

                                                    <svg
                                                        className="h-4 w-4"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M5 12h14"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M13 6l6 6-6 6"
                                                        />
                                                    </svg>

                                                </button>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

            </main>

            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            {selectedInstitution && (
                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-[#102236]/75
                        p-4
                        backdrop-blur-sm
                    "
                    onClick={
                        closeInstitutionDetails
                    }
                >

                    <div
                        className="
                            w-full
                            max-w-2xl
                            max-h-[90vh]
                            overflow-y-auto
                            overflow-hidden
                            rounded-[28px]
                            border
                            border-[#F6C945]/20
                            bg-white
                            shadow-[0_25px_80px_rgba(16,34,54,0.30)]
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="
                            relative
                            overflow-hidden
                            bg-[#102236]
                            p-6
                            sm:p-8
                        ">

                            <div className="
                                pointer-events-none
                                absolute
                                -right-12
                                -top-12
                                h-40
                                w-40
                                rounded-full
                                bg-[#F6C945]/10
                            " />

                            <div className="
                                relative
                                flex
                                items-start
                                justify-between
                                gap-4
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-4
                                ">

                                    <div className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-[#F6C945]
                                        text-[#102236]
                                    ">

                                        <svg
                                            className="h-6 w-6"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 21h18"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"
                                            />
                                        </svg>

                                    </div>

                                    <div>

                                        <p className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-[0.15em]
                                            text-[#F6C945]
                                        ">
                                            Institution Details
                                        </p>

                                        <h2 className="
                                            mt-1
                                            break-words
                                            text-xl
                                            font-black
                                            text-white
                                            sm:text-2xl
                                        ">
                                            {selectedInstitution.name ||
                                                "Unnamed Institution"}
                                        </h2>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeInstitutionDetails
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        text-xl
                                        text-white
                                        transition
                                        hover:bg-[#F6C945]
                                        hover:text-[#102236]
                                    "
                                    aria-label="Close"
                                >
                                    ×
                                </button>

                            </div>

                        </div>

                        {/* MODAL CONTENT */}

                        <div className="p-6 sm:p-8">

                            <div className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                            ">

                                {/* INSTITUTION NAME */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-[#F6C945]/25
                                    bg-[#F6C945]/5
                                    p-4
                                    sm:col-span-2
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-[#806500]
                                    ">
                                        Institution Name
                                    </p>

                                    <p className="
                                        mt-2
                                        break-words
                                        text-base
                                        font-black
                                        text-[#102236]
                                    ">
                                        {selectedInstitution.name ||
                                            "Not available"}
                                    </p>

                                </div>

                                {/* STATE */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        State
                                    </p>

                                    <p className="
                                        mt-2
                                        font-bold
                                        text-[#102236]
                                    ">
                                        {selectedInstitution.state ||
                                            "Not available"}
                                    </p>

                                </div>

                                {/* REGION */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        Region
                                    </p>

                                    <p className="
                                        mt-2
                                        font-bold
                                        text-[#102236]
                                    ">
                                        {selectedInstitution.region ||
                                            "Not available"}
                                    </p>

                                </div>

                                {/* ADMIN USERNAME */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-[#102236]/10
                                    bg-[#102236]/[0.035]
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        Admin Username
                                    </p>

                                    <p className="
                                        mt-2
                                        break-all
                                        font-bold
                                        text-[#102236]
                                    ">
                                        {
                                            getAdminDetails(
                                                selectedInstitution
                                            ).username
                                        }
                                    </p>

                                </div>

                                {/* ADMIN EMAIL */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-[#102236]/10
                                    bg-[#102236]/[0.035]
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        Admin Email
                                    </p>

                                    <p className="
                                        mt-2
                                        break-all
                                        font-bold
                                        text-[#102236]
                                    ">
                                        {
                                            getAdminDetails(
                                                selectedInstitution
                                            ).email
                                        }
                                    </p>

                                </div>

                                {/* CREATED */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        Created On
                                    </p>

                                    <p className="
                                        mt-2
                                        font-bold
                                        text-[#102236]
                                    ">
                                        {formatDate(
                                            selectedInstitution.createdAt
                                        )}
                                    </p>

                                </div>

                                {/* INSTITUTION ID */}

                                <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-4
                                ">

                                    <p className="
                                        text-xs
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    ">
                                        Institution ID
                                    </p>

                                    <p className="
                                        mt-2
                                        break-all
                                        font-mono
                                        text-xs
                                        font-semibold
                                        text-[#102236]
                                    ">
                                        {selectedInstitution._id ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                            {/* CLOSE */}

                            <div className="
                                mt-7
                                flex
                                justify-end
                                border-t
                                border-slate-100
                                pt-5
                            ">

                                <button
                                    type="button"
                                    onClick={
                                        closeInstitutionDetails
                                    }
                                    className="
                                        rounded-2xl
                                        bg-[#F6C945]
                                        px-7
                                        py-3
                                        text-sm
                                        font-black
                                        text-[#102236]
                                        shadow-lg
                                        shadow-[#F6C945]/15
                                        transition
                                        hover:bg-[#FFD95A]
                                    "
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Institutions;