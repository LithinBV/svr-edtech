import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import usePagination from "../../hooks/usePagination";
import Pagination from "../../components/common/Pagination";


const API_BASE = "/api";


const FollowUpsPage = ({
    type = "TODAY",
    title = "Follow Ups",
    description = "",
}) => {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [allFollowUps, setAllFollowUps] =
        useState([]);

    const [owners, setOwners] =
        useState([]);

    const [teams, setTeams] =
        useState([]);

    const [ownerFilter, setOwnerFilter] =
        useState("ALL");

    const [teamFilter, setTeamFilter] =
        useState("ALL");

    const [ownerOpen, setOwnerOpen] =
        useState(false);

    const [teamOpen, setTeamOpen] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);

    const ownerRef =
        useRef(null);

    const teamRef =
        useRef(null);


    // =========================================================
    // TOKEN
    // =========================================================

    const getToken = () => {

        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("executiveToken") ||
            localStorage.getItem("authToken") ||
            localStorage.getItem("jwt")
        );

    };


    // =========================================================
    // FETCH FOLLOW UPS
    // =========================================================

    const fetchFollowUps =
        useCallback(
            async (isRefresh = false) => {

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

                        setError(
                            "Your login session is not available. Please login again."
                        );

                        setAllFollowUps([]);

                        return;

                    }


                    const response =
                        await fetch(
                            `${API_BASE}/leads/follow-ups`,
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
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        setError(
                            data?.message ||
                            "You are not authorized to view follow-ups."
                        );

                        setAllFollowUps([]);

                        return;

                    }


                    if (!response.ok) {

                        throw new Error(
                            data?.message ||
                            "Failed to fetch follow-ups."
                        );

                    }


                    const fetchedFollowUps =
                        Array.isArray(
                            data?.leads
                        )
                            ? data.leads
                            : [];


                    setAllFollowUps(
                        fetchedFollowUps
                    );

                } catch (err) {

                    console.error(
                        "Fetch follow-ups error:",
                        err
                    );


                    setError(
                        err?.message ||
                        "Failed to fetch follow-ups."
                    );


                    setAllFollowUps([]);

                } finally {

                    setLoading(false);

                    setRefreshing(false);

                }

            },
            []
        );


    // =========================================================
    // FETCH TEAMS
    // =========================================================

    const fetchTeams =
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
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${token}`,

                                    "Content-Type":
                                        "application/json",
                                },
                            }
                        );


                    if (!response.ok) {

                        return;

                    }


                    const data =
                        await response.json();


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
                        "Fetch teams error:",
                        err
                    );

                }

            },
            []
        );


    // =========================================================
    // INITIAL FETCH
    // =========================================================

    useEffect(
        () => {

            fetchFollowUps();

            fetchTeams();

        },
        [
            fetchFollowUps,
            fetchTeams,
        ]
    );


    // =========================================================
    // CLOSE DROPDOWNS
    // =========================================================

    useEffect(
        () => {

            const handleClickOutside =
                (event) => {

                    if (
                        ownerRef.current &&
                        !ownerRef.current.contains(
                            event.target
                        )
                    ) {

                        setOwnerOpen(
                            false
                        );

                    }


                    if (
                        teamRef.current &&
                        !teamRef.current.contains(
                            event.target
                        )
                    ) {

                        setTeamOpen(
                            false
                        );

                    }

                };


            document.addEventListener(
                "mousedown",
                handleClickOutside
            );


            return () => {

                document.removeEventListener(
                    "mousedown",
                    handleClickOutside
                );

            };

        },
        []
    );


    // =========================================================
    // DATE VALIDATION
    // =========================================================

    const isValidDate = (
        value
    ) => {

        if (!value) {

            return false;

        }


        const date =
            new Date(value);


        return !Number.isNaN(
            date.getTime()
        );

    };


    // =========================================================
    // SAME DAY
    // =========================================================

    const isSameDay = (
        date1,
        date2
    ) => {

        return (
            date1.getFullYear() ===
                date2.getFullYear() &&

            date1.getMonth() ===
                date2.getMonth() &&

            date1.getDate() ===
                date2.getDate()
        );

    };


    // =========================================================
    // NEW FOLLOW UP
    // =========================================================

    const hasNewFollowUp = (
        lead
    ) => {

        if (
            lead?.followUpCompleted !==
            true
        ) {

            return false;

        }


        if (
            !isValidDate(
                lead?.followUpCompletedAt
            )
        ) {

            return false;

        }


        if (
            !isValidDate(
                lead?.followUpAt
            )
        ) {

            return false;

        }


        return (
            new Date(
                lead.followUpAt
            ).getTime() >

            new Date(
                lead.followUpCompletedAt
            ).getTime()
        );

    };


    // =========================================================
    // COMPLETED TODAY + NEW FOLLOW UP
    // =========================================================

    const isCompletedTodayWithNewFollowUp =
        (lead) => {

            if (
                lead?.followUpCompleted !==
                true
            ) {

                return false;

            }


            if (
                !isValidDate(
                    lead?.followUpCompletedAt
                )
            ) {

                return false;

            }


            if (
                !isValidDate(
                    lead?.followUpAt
                )
            ) {

                return false;

            }


            const completedAt =
                new Date(
                    lead.followUpCompletedAt
                );


            const nextFollowUpAt =
                new Date(
                    lead.followUpAt
                );


            const now =
                new Date();


            const completedToday =
                isSameDay(
                    completedAt,
                    now
                );


            const hasNextFollowUp =
                nextFollowUpAt.getTime() >
                completedAt.getTime();


            return (
                completedToday &&
                hasNextFollowUp
            );

        };


    // =========================================================
    // ACTIVE FOLLOW UP
    // =========================================================

    const isActiveFollowUp = (
        lead
    ) => {

        if (
            !isValidDate(
                lead?.followUpAt
            )
        ) {

            return false;

        }


        if (
            isCompletedTodayWithNewFollowUp(
                lead
            )
        ) {

            return false;

        }


        if (
            lead?.followUpCompleted !==
            true
        ) {

            return true;

        }


        return hasNewFollowUp(
            lead
        );

    };


    // =========================================================
    // COMPLETED FOLLOW UP
    // =========================================================

    const isCompletedFollowUp = (
        lead
    ) => {

        if (
            lead?.followUpCompleted !==
            true
        ) {

            return false;

        }


        if (
            isCompletedTodayWithNewFollowUp(
                lead
            )
        ) {

            return true;

        }


        if (
            hasNewFollowUp(
                lead
            )
        ) {

            return false;

        }


        return true;

    };


    // =========================================================
    // DISPLAY FOLLOW UP DATE
    // =========================================================

    const getDisplayFollowUpDate = (
        lead
    ) => {

        if (
            isCompletedTodayWithNewFollowUp(
                lead
            )
        ) {

            return lead.followUpCompletedAt;

        }


        return lead.followUpAt;

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDateTime = (
        value
    ) => {

        if (
            !value ||
            !isValidDate(value)
        ) {

            return "-";

        }


        const date =
            new Date(value);


        return date.toLocaleString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    // =========================================================
    // LEAD NAME
    // =========================================================

    const getLeadName = (
        lead
    ) => {

        return (
            lead?.name ||
            lead?.fullName ||
            lead?.leadName ||
            lead?.studentName ||
            "Unnamed Lead"
        );

    };


    // =========================================================
    // PHONE
    // =========================================================

    const getPhone = (
        lead
    ) => {

        return (
            lead?.phone ||
            lead?.mobile ||
            lead?.mobileNumber ||
            lead?.contact ||
            lead?.contactNumber ||
            "-"
        );

    };


    // =========================================================
    // OWNER NAME
    // =========================================================

    const getOwnerName = (
        lead
    ) => {

        if (
            lead?.leadOwner &&
            typeof lead.leadOwner ===
                "object"
        ) {

            return (
                lead.leadOwner.name ||
                lead.leadOwner.email ||
                "-"
            );

        }


        return (
            lead?.leadOwner ||
            "-"
        );

    };


    // =========================================================
    // OWNER ID
    // =========================================================

    const getOwnerId = (
        lead
    ) => {

        if (
            lead?.leadOwner &&
            typeof lead.leadOwner ===
                "object"
        ) {

            return (
                lead.leadOwner._id ||
                lead.leadOwner.id ||
                ""
            );

        }


        return String(
            lead?.leadOwner || ""
        );

    };


    // =========================================================
    // FOLLOW UP STATUS
    //
    // OVERDUE is kept internally.
    // UI displays it as MISSED.
    // =========================================================

    const getFollowUpStatus = (
        lead
    ) => {

        if (
            !isActiveFollowUp(
                lead
            )
        ) {

            return "COMPLETED";

        }


        if (
            !isValidDate(
                lead?.followUpAt
            )
        ) {

            return "UPCOMING";

        }


        const now =
            new Date();


        const followUpDate =
            new Date(
                lead.followUpAt
            );


        if (
            followUpDate < now
        ) {

            return "OVERDUE";

        }


        if (
            isSameDay(
                followUpDate,
                now
            )
        ) {

            return "TODAY";

        }


        return "UPCOMING";

    };


    // =========================================================
    // BUILD OWNERS
    // =========================================================

    useEffect(
        () => {

            const ownerMap =
                new Map();


            allFollowUps.forEach(
                (lead) => {

                    const owner =
                        lead?.leadOwner;


                    if (
                        owner &&
                        typeof owner ===
                            "object"
                    ) {

                        const id =
                            owner._id ||
                            owner.id;


                        if (id) {

                            ownerMap.set(
                                String(id),
                                {
                                    _id:
                                        String(id),

                                    name:
                                        owner.name ||
                                        owner.email ||
                                        "Unknown Owner",

                                    email:
                                        owner.email ||
                                        "",
                                }
                            );

                        }

                    }

                }
            );


            setOwners(
                Array.from(
                    ownerMap.values()
                ).sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                )
            );

        },
        [allFollowUps]
    );


    // =========================================================
    // TEAM MEMBERS
    // =========================================================

    const getTeamMembers = (
        team
    ) => {

        const members = [];


        if (team?.manager) {

            members.push(
                team.manager
            );

        }


        if (
            Array.isArray(
                team?.executives
            )
        ) {

            members.push(
                ...team.executives
            );

        }


        return members;

    };


    // =========================================================
    // TEAM MATCH
    // =========================================================

    const leadBelongsToTeam = (
        lead,
        team
    ) => {

        const ownerId =
            getOwnerId(lead);


        if (!ownerId) {

            return false;

        }


        const members =
            getTeamMembers(
                team
            );


        return members.some(
            (member) => {

                const memberId =
                    member?._id ||
                    member?.id;


                return (
                    memberId &&
                    String(
                        memberId
                    ) ===
                    String(
                        ownerId
                    )
                );

            }
        );

    };


    // =========================================================
    // CATEGORY FILTER
    // =========================================================

    const categoryFollowUps =
        useMemo(
            () => {

                let result = [
                    ...allFollowUps,
                ];


                // -------------------------------------------------
                // TODAY
                // -------------------------------------------------

                if (
                    type === "TODAY"
                ) {

                    result =
                        result.filter(
                            (lead) =>
                                isActiveFollowUp(
                                    lead
                                ) &&

                                getFollowUpStatus(
                                    lead
                                ) ===
                                "TODAY"
                        );

                }


                // -------------------------------------------------
                // UPCOMING
                // -------------------------------------------------

                if (
                    type === "UPCOMING"
                ) {

                    result =
                        result
                            .filter(
                                (lead) =>
                                    isActiveFollowUp(
                                        lead
                                    ) &&

                                    getFollowUpStatus(
                                        lead
                                    ) ===
                                    "UPCOMING"
                            )
                            .sort(
                                (a, b) =>
                                    new Date(
                                        a.followUpAt
                                    ) -
                                    new Date(
                                        b.followUpAt
                                    )
                            );

                }


                // -------------------------------------------------
                // OVERDUE / MISSED
                // -------------------------------------------------

                if (
                    type ===
                    "OVERDUE"
                ) {

                    result =
                        result
                            .filter(
                                (lead) =>
                                    isActiveFollowUp(
                                        lead
                                    ) &&

                                    getFollowUpStatus(
                                        lead
                                    ) ===
                                    "OVERDUE"
                            )
                            .sort(
                                (a, b) =>
                                    new Date(
                                        a.followUpAt
                                    ) -
                                    new Date(
                                        b.followUpAt
                                    )
                            );

                }


                // -------------------------------------------------
                // COMPLETED
                // -------------------------------------------------

                if (
                    type ===
                    "COMPLETED"
                ) {

                    result =
                        result
                            .filter(
                                (lead) =>
                                    isCompletedFollowUp(
                                        lead
                                    )
                            )
                            .sort(
                                (a, b) => {

                                    const dateA =
                                        isValidDate(
                                            a?.followUpCompletedAt
                                        )
                                            ? new Date(
                                                a.followUpCompletedAt
                                            ).getTime()
                                            : 0;


                                    const dateB =
                                        isValidDate(
                                            b?.followUpCompletedAt
                                        )
                                            ? new Date(
                                                b.followUpCompletedAt
                                            ).getTime()
                                            : 0;


                                    return (
                                        dateB -
                                        dateA
                                    );

                                }
                            );

                }


                // -------------------------------------------------
                // ALL
                // -------------------------------------------------

                if (
                    type === "ALL"
                ) {

                    result.sort(
                        (a, b) => {

                            const dateA =
                                isValidDate(
                                    a?.followUpAt
                                )
                                    ? new Date(
                                        a.followUpAt
                                    ).getTime()
                                    : 0;


                            const dateB =
                                isValidDate(
                                    b?.followUpAt
                                )
                                    ? new Date(
                                        b.followUpAt
                                    ).getTime()
                                    : 0;


                            return (
                                dateA -
                                dateB
                            );

                        }
                    );

                }


                return result;

            },
            [
                allFollowUps,
                type,
            ]
        );


    // =========================================================
    // OWNER + TEAM FILTER
    // =========================================================

    const filteredFollowUps =
        useMemo(
            () => {

                return categoryFollowUps.filter(
                    (lead) => {

                        // -----------------------------------------
                        // OWNER
                        // -----------------------------------------

                        if (
                            ownerFilter !==
                            "ALL"
                        ) {

                            if (
                                String(
                                    getOwnerId(
                                        lead
                                    )
                                ) !==
                                String(
                                    ownerFilter
                                )
                            ) {

                                return false;

                            }

                        }


                        // -----------------------------------------
                        // TEAM
                        // -----------------------------------------

                        if (
                            teamFilter !==
                            "ALL"
                        ) {

                            const selectedTeam =
                                teams.find(
                                    (team) =>
                                        String(
                                            team?._id
                                        ) ===
                                        String(
                                            teamFilter
                                        )
                                );


                            if (
                                !selectedTeam ||
                                !leadBelongsToTeam(
                                    lead,
                                    selectedTeam
                                )
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );

            },
            [
                categoryFollowUps,
                ownerFilter,
                teamFilter,
                teams,
            ]
        );


    // =========================================================
    // SEARCH
    // =========================================================

    const visibleFollowUps =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                if (!query) {

                    return filteredFollowUps;

                }


                return filteredFollowUps.filter(
                    (lead) => {

                        const values = [

                            getLeadName(
                                lead
                            ),

                            getPhone(
                                lead
                            ),

                            lead?.email,

                            lead?.collegeName,

                            lead?.department,

                            lead?.city,

                            lead?.district,

                            lead?.state,

                            lead?.programInterest,

                            lead?.leadSource,

                            lead?.leadType,

                            lead?.status,

                            lead?.temperature,

                            lead?.priority,

                            lead?.remarks,

                            lead?.latestRemark,

                            getOwnerName(
                                lead
                            ),

                        ];


                        return values.some(
                            (value) =>
                                String(
                                    value ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )
                        );

                    }
                );

            },
            [
                filteredFollowUps,
                search,
            ]
        );


    // =========================================================
    // UI PAGINATION
    //
    // IMPORTANT:
    // Filtering and searching happen BEFORE pagination.
    //
    // Backend
    //    ↓
    // allFollowUps
    //    ↓
    // category
    //    ↓
    // owner/team
    //    ↓
    // search
    //    ↓
    // pagination
    //    ↓
    // table
    // =========================================================

    const {
        page,
        total,
        totalPages,
        paginatedItems,
        setPage,
        itemsPerPage,
    } = usePagination(
        visibleFollowUps,
        50
    );


    // =========================================================
    // STATS
    // =========================================================

    const stats =
        useMemo(
            () => {

                const today =
                    allFollowUps.filter(
                        (lead) =>
                            isActiveFollowUp(
                                lead
                            ) &&

                            getFollowUpStatus(
                                lead
                            ) ===
                            "TODAY"
                    ).length;


                const upcoming =
                    allFollowUps.filter(
                        (lead) =>
                            isActiveFollowUp(
                                lead
                            ) &&

                            getFollowUpStatus(
                                lead
                            ) ===
                            "UPCOMING"
                    ).length;


                const overdue =
                    allFollowUps.filter(
                        (lead) =>
                            isActiveFollowUp(
                                lead
                            ) &&

                            getFollowUpStatus(
                                lead
                            ) ===
                            "OVERDUE"
                    ).length;


                const completed =
                    allFollowUps.filter(
                        (lead) =>
                            isCompletedFollowUp(
                                lead
                            )
                    ).length;


                return {

                    total:
                        allFollowUps.length,

                    today,

                    upcoming,

                    overdue,

                    completed,

                };

            },
            [
                allFollowUps,
            ]
        );


    // =========================================================
    // VIEW LEAD
    // =========================================================

    const handleViewLead = (
        lead
    ) => {

        if (!lead?._id) {

            return;

        }


        navigate(
            `/leads/${lead._id}`
        );

    };


    // =========================================================
    // REFRESH
    // =========================================================

    const handleRefresh = () => {

        fetchFollowUps(true);

        fetchTeams();

    };


    // =========================================================
    // SELECTED OWNER NAME
    // =========================================================

    const selectedOwnerName =
        useMemo(
            () => {

                if (
                    ownerFilter ===
                    "ALL"
                ) {

                    return "All Owners";

                }


                const owner =
                    owners.find(
                        (item) =>
                            String(
                                item._id
                            ) ===
                            String(
                                ownerFilter
                            )
                    );


                return (
                    owner?.name ||
                    "All Owners"
                );

            },
            [
                ownerFilter,
                owners,
            ]
        );


    // =========================================================
    // SELECTED TEAM NAME
    // =========================================================

    const selectedTeamName =
        useMemo(
            () => {

                if (
                    teamFilter ===
                    "ALL"
                ) {

                    return "All Teams";

                }


                const team =
                    teams.find(
                        (item) =>
                            String(
                                item?._id
                            ) ===
                            String(
                                teamFilter
                            )
                    );


                return (
                    team?.name ||
                    "All Teams"
                );

            },
            [
                teamFilter,
                teams,
            ]
        );


    // =========================================================
    // STATUS BOX
    // =========================================================

    const StatusBox = ({
        label,
        count,
        status,
        path,
        color,
        lightColor,
        icon,
    }) => {

        const active =
            type === status;


        return (

            <button
                type="button"
                onClick={() =>
                    navigate(path)
                }
                className={`
                    group
                    relative
                    overflow-hidden
                    rounded-xl
                    border
                    bg-white
                    p-4
                    text-left
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-1
                    hover:scale-[1.015]
                    hover:shadow-lg
                    active:scale-[0.97]

                    ${
                        active
                            ? `border-${color}-400 shadow-md`
                            : "border-gray-200"
                    }
                `}
            >

                {/* TOP COLOR LINE */}

                <div
                    className={`
                        absolute
                        left-0
                        right-0
                        top-0
                        h-1
                        ${lightColor}
                    `}
                />


                {/* HOVER BACKGROUND */}

                <div
                    className={`
                        absolute
                        -right-10
                        -top-10
                        h-24
                        w-24
                        rounded-full
                        opacity-0
                        transition-all
                        duration-500
                        group-hover:scale-150
                        group-hover:opacity-10
                        ${lightColor}
                    `}
                />


                <div className="relative">

                    <div className="flex items-center justify-between">

                        <div
                            className={`
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg

                                ${
                                    active
                                        ? `${lightColor} text-white`
                                        : `bg-${color}-50 text-${color}-600`
                                }
                            `}
                        >
                            {icon}
                        </div>


                        <svg
                            className={`
                                h-4
                                w-4
                                transition-all
                                duration-300
                                group-hover:translate-x-1

                                ${
                                    active
                                        ? "text-gray-500"
                                        : "text-gray-300"
                                }
                            `}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>

                    </div>


                    <p
                        className={`
                            mt-3
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide

                            ${
                                active
                                    ? `text-${color}-600`
                                    : "text-gray-500"
                            }
                        `}
                    >
                        {label}
                    </p>


                    <p
                        className={`
                            mt-1
                            text-2xl
                            font-bold

                            ${
                                active
                                    ? `text-${color}-700`
                                    : "text-[#102236]"
                            }
                        `}
                    >
                        {count}
                    </p>

                </div>

            </button>

        );

    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div
            className="
                min-h-[calc(100vh-70px)]
                bg-[#F5F7FA]
                px-3
                py-4
                sm:px-5
                lg:px-7
            "
        >

            <div
                className="
                    mx-auto
                    max-w-[1500px]
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="mb-5">

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
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
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        h-7
                                        w-1
                                        rounded-full
                                        bg-[#102236]
                                    "
                                />

                                <h1
                                    className="
                                        text-2xl
                                        font-bold
                                        text-[#102236]
                                    "
                                >
                                    {title}
                                </h1>

                            </div>


                            {description && (

                                <p
                                    className="
                                        mt-1
                                        pl-3
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    {description}
                                </p>

                            )}

                        </div>


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
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-[#102236]
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:bg-[#1B334A]
                                hover:shadow-md
                                active:scale-95
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            <svg
                                className={`
                                    h-4
                                    w-4

                                    ${
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                `}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 4v5h5M20 20v-5h-5M5.64 18.36A9 9 0 0118.36 5.64L20 7M4 17l1.64 1.36"
                                />
                            </svg>


                            {refreshing
                                ? "Refreshing..."
                                : "Refresh"}

                        </button>

                    </div>

                </div>


                {/* =================================================
                    STATUS BOXES
                ================================================= */}

                <div
                    className="
                        mb-5
                        grid
                        grid-cols-2
                        gap-3
                        md:grid-cols-3
                        lg:grid-cols-5
                    "
                >

                    {/* ALL */}

                    <StatusBox
                        label="All"
                        count={
                            stats.total
                        }
                        status="ALL"
                        path="/follow-ups"
                        color="blue"
                        lightColor="bg-blue-500"
                        icon={
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        }
                    />


                    {/* TODAY */}

                    <StatusBox
                        label="Today"
                        count={
                            stats.today
                        }
                        status="TODAY"
                        path="/today-follow-ups"
                        color="green"
                        lightColor="bg-green-500"
                        icon={
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
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        }
                    />


                    {/* UPCOMING */}

                    <StatusBox
                        label="Upcoming"
                        count={
                            stats.upcoming
                        }
                        status="UPCOMING"
                        path="/upcoming-follow-ups"
                        color="indigo"
                        lightColor="bg-indigo-500"
                        icon={
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
                                    d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                    />


                    {/* MISSED */}

                    <StatusBox
                        label="Missed"
                        count={
                            stats.overdue
                        }
                        status="OVERDUE"
                        path="/overdue-follow-ups"
                        color="red"
                        lightColor="bg-red-500"
                        icon={
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
                                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        }
                    />


                    {/* COMPLETED */}

                    <StatusBox
                        label="Completed"
                        count={
                            stats.completed
                        }
                        status="COMPLETED"
                        path="/completed-follow-ups"
                        color="teal"
                        lightColor="bg-teal-500"
                        icon={
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
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        }
                    />

                </div>


                {/* =================================================
                    FILTERS
                ================================================= */}

                <div
                    className="
                        mb-5
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-sm
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            lg:grid-cols-[1fr_230px_230px]
                        "
                    >

                        {/* SEARCH */}

                        <div className="relative">

                            <svg
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    h-4
                                    w-4
                                    -translate-y-1/2
                                    text-gray-400
                                "
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                />
                            </svg>


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
                                    Search lead name,
                                    phone, email,
                                    program...
                                "
                                className="
                                    h-11
                                    w-full
                                    border
                                    border-gray-300
                                    bg-white
                                    pl-10
                                    pr-4
                                    text-sm
                                    text-gray-700
                                    outline-none
                                    transition
                                    focus:border-blue-400
                                    focus:ring-1
                                    focus:ring-blue-100
                                "
                            />

                        </div>


                        {/* OWNER */}

                        <div
                            ref={
                                ownerRef
                            }
                            className="relative"
                        >

                            <button
                                type="button"
                                onClick={() => {

                                    setOwnerOpen(
                                        !ownerOpen
                                    );

                                    setTeamOpen(
                                        false
                                    );

                                }}
                                className="
                                    flex
                                    h-11
                                    w-full
                                    items-center
                                    justify-between
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    transition
                                    hover:border-blue-400
                                "
                            >

                                <span className="truncate">

                                    {
                                        selectedOwnerName
                                    }

                                </span>


                                <svg
                                    className={`
                                        ml-2
                                        h-4
                                        w-4
                                        shrink-0
                                        transition-transform
                                        duration-200

                                        ${
                                            ownerOpen
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m6 9 6 6 6-6"
                                    />
                                </svg>

                            </button>


                            {ownerOpen && (

                                <div
                                    className="
                                        absolute
                                        left-0
                                        right-0
                                        top-full
                                        z-50
                                        mt-1
                                        max-h-64
                                        overflow-y-auto
                                        border
                                        border-gray-200
                                        bg-white
                                        shadow-xl
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setOwnerFilter(
                                                "ALL"
                                            );

                                            setOwnerOpen(
                                                false
                                            );

                                        }}
                                        className={`
                                            block
                                            w-full
                                            px-3
                                            py-2.5
                                            text-left
                                            text-sm

                                            ${
                                                ownerFilter ===
                                                "ALL"
                                                    ? "bg-blue-600 font-semibold text-white"
                                                    : "text-gray-700 hover:bg-blue-50"
                                            }
                                        `}
                                    >
                                        All Owners
                                    </button>


                                    {owners.map(
                                        (
                                            owner
                                        ) => (

                                            <button
                                                key={
                                                    owner._id
                                                }
                                                type="button"
                                                onClick={() => {

                                                    setOwnerFilter(
                                                        owner._id
                                                    );

                                                    setOwnerOpen(
                                                        false
                                                    );

                                                }}
                                                className={`
                                                    block
                                                    w-full
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-sm

                                                    ${
                                                        String(
                                                            ownerFilter
                                                        ) ===
                                                        String(
                                                            owner._id
                                                        )
                                                            ? "bg-blue-600 font-semibold text-white"
                                                            : "text-gray-700 hover:bg-blue-50"
                                                    }
                                                `}
                                            >

                                                {
                                                    owner.name
                                                }

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* TEAM */}

                        <div
                            ref={
                                teamRef
                            }
                            className="relative"
                        >

                            <button
                                type="button"
                                onClick={() => {

                                    setTeamOpen(
                                        !teamOpen
                                    );

                                    setOwnerOpen(
                                        false
                                    );

                                }}
                                className="
                                    flex
                                    h-11
                                    w-full
                                    items-center
                                    justify-between
                                    border
                                    border-gray-300
                                    bg-white
                                    px-3
                                    text-sm
                                    text-gray-700
                                    transition
                                    hover:border-indigo-400
                                "
                            >

                                <span className="truncate">

                                    {
                                        selectedTeamName
                                    }

                                </span>


                                <svg
                                    className={`
                                        ml-2
                                        h-4
                                        w-4
                                        shrink-0
                                        transition-transform
                                        duration-200

                                        ${
                                            teamOpen
                                                ? "rotate-180"
                                                : ""
                                        }
                                    `}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m6 9 6 6 6-6"
                                    />
                                </svg>

                            </button>


                            {teamOpen && (

                                <div
                                    className="
                                        absolute
                                        left-0
                                        right-0
                                        top-full
                                        z-50
                                        mt-1
                                        max-h-64
                                        overflow-y-auto
                                        border
                                        border-gray-200
                                        bg-white
                                        shadow-xl
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setTeamFilter(
                                                "ALL"
                                            );

                                            setTeamOpen(
                                                false
                                            );

                                        }}
                                        className={`
                                            block
                                            w-full
                                            px-3
                                            py-2.5
                                            text-left
                                            text-sm

                                            ${
                                                teamFilter ===
                                                "ALL"
                                                    ? "bg-indigo-600 font-semibold text-white"
                                                    : "text-gray-700 hover:bg-indigo-50"
                                            }
                                        `}
                                    >
                                        All Teams
                                    </button>


                                    {teams.map(
                                        (
                                            team
                                        ) => (

                                            <button
                                                key={
                                                    team?._id
                                                }
                                                type="button"
                                                onClick={() => {

                                                    setTeamFilter(
                                                        team._id
                                                    );

                                                    setTeamOpen(
                                                        false
                                                    );

                                                }}
                                                className={`
                                                    block
                                                    w-full
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-sm

                                                    ${
                                                        String(
                                                            teamFilter
                                                        ) ===
                                                        String(
                                                            team?._id
                                                        )
                                                            ? "bg-indigo-600 font-semibold text-white"
                                                            : "text-gray-700 hover:bg-indigo-50"
                                                    }
                                                `}
                                            >

                                                {
                                                    team?.name
                                                }

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-5
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                        "
                    >

                        <div
                            className="
                                font-semibold
                                text-red-700
                            "
                        >
                            Unable to load follow-ups
                        </div>


                        <div
                            className="
                                mt-1
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>


                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                            className="
                                mt-3
                                rounded-md
                                bg-red-600
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                text-white
                                transition
                                hover:bg-red-700
                            "
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                <div
                    className="
                        overflow-hidden
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                    "
                >

                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[300px]
                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    text-sm
                                    text-gray-500
                                "
                            >

                                <div
                                    className="
                                        h-5
                                        w-5
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-gray-300
                                        border-t-blue-500
                                    "
                                />

                                Loading follow-ups...

                            </div>

                        </div>

                    ) : visibleFollowUps.length ===
                      0 ? (

                        <div
                            className="
                                flex
                                min-h-[300px]
                                flex-col
                                items-center
                                justify-center
                                px-6
                                text-center
                            "
                        >

                            <div
                                className="
                                    mb-4
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-50
                                    text-blue-500
                                "
                            >

                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>

                            </div>


                            <h3
                                className="
                                    text-lg
                                    font-semibold
                                    text-[#102236]
                                "
                            >
                                No follow-ups found
                            </h3>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                "
                            >

                                {search
                                    ? "Try a different search term."
                                    : "There are no follow-ups in this category."}

                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table
                                className="
                                    min-w-[1000px]
                                    w-full
                                "
                            >

                                {/* HEADER */}

                                <thead
                                    className="
                                        bg-[#102236]
                                    "
                                >

                                    <tr>

                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Lead
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Phone
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Program
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Owner
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-left
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Follow-up
                                        </th>


                                        <th
                                            className="
                                                px-5
                                                py-3.5
                                                text-right
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-white
                                            "
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                {/* BODY */}

                                <tbody
                                    className="
                                        divide-y
                                        divide-gray-100
                                    "
                                >

                                    {paginatedItems.map(
                                        (
                                            lead
                                        ) => {

                                            const status =
                                                getFollowUpStatus(
                                                    lead
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        lead?._id
                                                    }
                                                    className="
                                                        transition-colors
                                                        duration-200
                                                        hover:bg-gray-50
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
                                                                font-semibold
                                                                text-[#102236]
                                                            "
                                                        >
                                                            {
                                                                getLeadName(
                                                                    lead
                                                                )
                                                            }
                                                        </div>


                                                        {lead?.email && (

                                                            <div
                                                                className="
                                                                    mt-1
                                                                    text-xs
                                                                    text-gray-400
                                                                "
                                                            >
                                                                {
                                                                    lead.email
                                                                }
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* PHONE */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                            text-sm
                                                            text-gray-600
                                                        "
                                                    >

                                                        {
                                                            getPhone(
                                                                lead
                                                            )
                                                        }

                                                    </td>


                                                    {/* PROGRAM */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                            text-sm
                                                            text-gray-600
                                                        "
                                                    >

                                                        {
                                                            lead?.programInterest ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* OWNER */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                            text-sm
                                                            font-medium
                                                            text-gray-700
                                                        "
                                                    >

                                                        {
                                                            getOwnerName(
                                                                lead
                                                            )
                                                        }

                                                    </td>


                                                    {/* FOLLOW UP */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-gray-700
                                                            "
                                                        >

                                                            {
                                                                formatDateTime(
                                                                    getDisplayFollowUpDate(
                                                                        lead
                                                                    )
                                                                )
                                                            }

                                                        </div>


                                                        {isActiveFollowUp(
                                                            lead
                                                        ) && (

                                                            <div
                                                                className="
                                                                    mt-1
                                                                "
                                                            >

                                                                {status ===
                                                                    "OVERDUE" && (

                                                                    <span
                                                                        className="
                                                                            inline-flex
                                                                            rounded-full
                                                                            bg-red-50
                                                                            px-2.5
                                                                            py-1
                                                                            text-xs
                                                                            font-semibold
                                                                            text-red-600
                                                                        "
                                                                    >
                                                                        MISSED
                                                                    </span>

                                                                )}


                                                                {status ===
                                                                    "TODAY" && (

                                                                    <span
                                                                        className="
                                                                            inline-flex
                                                                            rounded-full
                                                                            bg-green-50
                                                                            px-2.5
                                                                            py-1
                                                                            text-xs
                                                                            font-semibold
                                                                            text-green-600
                                                                        "
                                                                    >
                                                                        TODAY
                                                                    </span>

                                                                )}


                                                                {status ===
                                                                    "UPCOMING" && (

                                                                    <span
                                                                        className="
                                                                            inline-flex
                                                                            rounded-full
                                                                            bg-indigo-50
                                                                            px-2.5
                                                                            py-1
                                                                            text-xs
                                                                            font-semibold
                                                                            text-indigo-600
                                                                        "
                                                                    >
                                                                        UPCOMING
                                                                    </span>

                                                                )}

                                                            </div>

                                                        )}


                                                        {isCompletedFollowUp(
                                                            lead
                                                        ) &&
                                                            lead?.followUpCompletedAt && (

                                                                <div
                                                                    className="
                                                                        mt-1
                                                                    "
                                                                >

                                                                    <span
                                                                        className="
                                                                            inline-flex
                                                                            rounded-full
                                                                            bg-teal-50
                                                                            px-2.5
                                                                            py-1
                                                                            text-xs
                                                                            font-semibold
                                                                            text-teal-600
                                                                        "
                                                                    >
                                                                        COMPLETED
                                                                    </span>

                                                                </div>

                                                            )}

                                                    </td>


                                                    {/* ACTION */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                justify-end
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
                                                                    rounded-lg
                                                                    border
                                                                    border-[#102236]
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-semibold
                                                                    text-[#102236]
                                                                    transition-all
                                                                    duration-200
                                                                    hover:-translate-y-0.5
                                                                    hover:bg-[#102236]
                                                                    hover:text-white
                                                                    hover:shadow-sm
                                                                    active:scale-95
                                                                "
                                                            >
                                                                View Lead
                                                            </button>

                                                        </div>

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


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {!loading &&
                    visibleFollowUps.length > 0 && (

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
                            itemLabel="follow-ups"
                        />

                    )}

            </div>

        </div>

    );

};


export default FollowUpsPage;