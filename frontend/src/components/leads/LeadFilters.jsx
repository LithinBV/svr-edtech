import React, { useEffect, useRef, useState } from "react";

const LeadFilters = ({
    search = "",
    statusFilter = "ALL",

    ownerFilter = "ALL",
    teamFilter = "ALL",

    owners = [],
    teams = [],

    onSearchChange,
    onStatusChange,

    onOwnerChange,
    onTeamChange,

    onRefresh,
    loading = false,

    showStatusFilter = true,
    showOwnerFilter = true,
    showTeamFilter = true,
}) => {
    // =========================================================
    // DROPDOWN STATE
    // =========================================================

    const [openDropdown, setOpenDropdown] = useState(null);

    const dropdownRef = useRef(null);

    // =========================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =========================================================

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
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
    }, []);

    // =========================================================
    // STATUS FILTERS
    // =========================================================

    const filters = [
        {
            value: "ALL",
            label: "All",
        },
        {
            value: "HOT",
            label: "Hot",
        },
        {
            value: "WARM",
            label: "Warm",
        },
        {
            value: "COLD",
            label: "Cold",
        },
    ];

    // =========================================================
    // OWNER HELPERS
    // =========================================================

    const getOwnerId = (owner) => {
        return owner?._id || owner?.id || "";
    };

    const getOwnerName = (owner) => {
        return (
            owner?.name ||
            owner?.email ||
            "Unknown Owner"
        );
    };

    // =========================================================
    // TEAM HELPERS
    // =========================================================

    const getTeamId = (team) => {
        return team?._id || team?.id || "";
    };

    const getTeamName = (team) => {
        return (
            team?.name ||
            team?.teamName ||
            "Unnamed Team"
        );
    };

    // =========================================================
    // SELECTED OWNER
    // =========================================================

    const selectedOwner = owners.find(
        (owner) =>
            String(getOwnerId(owner)) ===
            String(ownerFilter)
    );

    const selectedOwnerName =
        ownerFilter === "ALL"
            ? "All Owners"
            : selectedOwner
            ? getOwnerName(selectedOwner)
            : "All Owners";

    // =========================================================
    // SELECTED TEAM
    // =========================================================

    const selectedTeam = teams.find(
        (team) =>
            String(getTeamId(team)) ===
            String(teamFilter)
    );

    const selectedTeamName =
        teamFilter === "ALL"
            ? "All Teams"
            : selectedTeam
            ? getTeamName(selectedTeam)
            : "All Teams";

    // =========================================================
    // TOGGLE DROPDOWN
    // =========================================================

    const toggleDropdown = (dropdown) => {
        setOpenDropdown((current) =>
            current === dropdown
                ? null
                : dropdown
        );
    };

    // =========================================================
    // OWNER CHANGE
    // =========================================================

    const handleOwnerChange = (value) => {
        onOwnerChange?.(value);
        setOpenDropdown(null);
    };

    // =========================================================
    // TEAM CHANGE
    // =========================================================

    const handleTeamChange = (value) => {
        onTeamChange?.(value);
        setOpenDropdown(null);
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            ref={dropdownRef}
            className="
                overflow-visible
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_6px_24px_rgba(15,23,42,0.05)]
            "
        >
            <div
                className="
                    flex
                    flex-col
                    gap-3
                    p-3
                    sm:p-4
                "
            >

                {/* =====================================================
                    TOP ROW
                ===================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        lg:flex-row
                        lg:items-center
                    "
                >

                    {/* =================================================
                        SEARCH
                    ================================================= */}

                    <div className="relative min-w-0 flex-1">

                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-y-0
                                left-0
                                flex
                                items-center
                                pl-3.5
                                text-slate-400
                            "
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="7"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="m20 20-4-4"
                                />
                            </svg>
                        </div>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                onSearchChange?.(
                                    event.target.value
                                )
                            }
                            placeholder="Search name, email, phone, college, owner..."
                            className="
                                h-11
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                pl-11
                                pr-4
                                text-sm
                                font-medium
                                text-slate-800
                                outline-none
                                transition
                                placeholder:text-slate-400
                                hover:border-slate-300
                                focus:border-[#102236]
                                focus:bg-white
                                focus:ring-4
                                focus:ring-[#F6C945]/20
                            "
                        />

                    </div>

                    {/* =================================================
                        STATUS
                    ================================================= */}

                    {showStatusFilter && (
                        <div
                            className="
                                flex
                                w-full
                                shrink-0
                                items-center
                                overflow-x-auto
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                p-1
                                lg:w-auto
                            "
                        >
                            {filters.map((filter) => {
                                const active =
                                    statusFilter ===
                                    filter.value;

                                return (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() =>
                                            onStatusChange?.(
                                                filter.value
                                            )
                                        }
                                        className={`
                                            flex
                                            min-w-[62px]
                                            flex-1
                                            items-center
                                            justify-center
                                            gap-1.5
                                            rounded-lg
                                            px-3
                                            py-2
                                            text-xs
                                            font-bold
                                            transition
                                            sm:px-4
                                            lg:flex-none

                                            ${
                                                active
                                                    ? "bg-[#102236] text-[#F6C945] shadow-sm"
                                                    : "text-slate-500 hover:bg-white hover:text-[#102236]"
                                            }
                                        `}
                                    >
                                        {filter.value !==
                                            "ALL" && (
                                            <span
                                                className={`
                                                    h-1.5
                                                    w-1.5
                                                    shrink-0
                                                    rounded-full

                                                    ${
                                                        filter.value ===
                                                        "HOT"
                                                            ? "bg-red-500"
                                                            : filter.value ===
                                                              "WARM"
                                                            ? "bg-amber-500"
                                                            : "bg-cyan-500"
                                                    }
                                                `}
                                            />
                                        )}

                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* =================================================
                        REFRESH
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            onRefresh?.()
                        }
                        disabled={loading}
                        className="
                            inline-flex
                            h-11
                            w-full
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            font-bold
                            text-slate-600
                            transition
                            hover:border-[#F6C945]
                            hover:bg-[#F6C945]/10
                            hover:text-[#102236]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:w-auto
                        "
                    >
                        <svg
                            className={`
                                h-4
                                w-4
                                ${loading ? "animate-spin" : ""}
                            `}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 13a8 8 0 0 0 15.5 2M20 19v-4h-4"
                            />
                        </svg>

                        <span>
                            {loading
                                ? "Loading..."
                                : "Refresh"}
                        </span>
                    </button>
                </div>

                {/* =====================================================
                    OWNER + TEAM
                ===================================================== */}

                {(showOwnerFilter ||
                    showTeamFilter) && (
                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-slate-100
                            pt-3
                            sm:flex-row
                        "
                    >

                        {/* =================================================
                            OWNER DROPDOWN
                        ================================================= */}

                        {showOwnerFilter && (
                            <div className="min-w-0 flex-1">

                                <label
                                    className="
                                        mb-1.5
                                        block
                                        px-1
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    "
                                >
                                    Lead Owner
                                </label>

                                <div className="relative">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleDropdown(
                                                "owner"
                                            )
                                        }
                                        className={`
                                            flex
                                            h-11
                                            w-full
                                            items-center
                                            justify-between
                                            gap-3
                                            rounded-xl
                                            border
                                            px-4
                                            text-left
                                            text-sm
                                            font-semibold
                                            outline-none
                                            transition

                                            ${
                                                openDropdown ===
                                                "owner"
                                                    ? "border-[#102236] bg-[#fffdf0] ring-4 ring-[#F6C945]/20"
                                                    : "border-slate-200 bg-slate-50 hover:border-[#102236]"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                min-w-0
                                                truncate
                                                ${
                                                    ownerFilter ===
                                                    "ALL"
                                                        ? "text-slate-600"
                                                        : "text-[#102236]"
                                                }
                                            `}
                                        >
                                            {selectedOwnerName}
                                        </span>

                                        <svg
                                            className={`
                                                h-4
                                                w-4
                                                shrink-0
                                                transition-transform
                                                ${
                                                    openDropdown ===
                                                    "owner"
                                                        ? "rotate-180 text-[#102236]"
                                                        : "text-slate-400"
                                                }
                                            `}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m6 9 6 6 6-6"
                                            />
                                        </svg>
                                    </button>

                                    {openDropdown ===
                                        "owner" && (
                                        <div
                                            className="
                                                absolute
                                                left-0
                                                right-0
                                                z-50
                                                mt-2
                                                max-h-64
                                                overflow-y-auto
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                p-1.5
                                                shadow-[0_12px_35px_rgba(15,23,42,0.16)]
                                            "
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOwnerChange(
                                                        "ALL"
                                                    )
                                                }
                                                className={`
                                                    flex
                                                    w-full
                                                    items-center
                                                    justify-between
                                                    rounded-lg
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-sm
                                                    font-semibold
                                                    transition
                                                    ${
                                                        ownerFilter ===
                                                        "ALL"
                                                            ? "bg-[#102236] text-[#F6C945]"
                                                            : "text-slate-700 hover:bg-[#fff8d8] hover:text-[#102236]"
                                                    }
                                                `}
                                            >
                                                <span>
                                                    All Owners
                                                </span>

                                                {ownerFilter ===
                                                    "ALL" && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m5 12 4 4L19 6"
                                                        />
                                                    </svg>
                                                )}
                                            </button>

                                            {owners.map(
                                                (owner) => {
                                                    const id =
                                                        getOwnerId(
                                                            owner
                                                        );

                                                    if (!id) {
                                                        return null;
                                                    }

                                                    const name =
                                                        getOwnerName(
                                                            owner
                                                        );

                                                    const active =
                                                        String(
                                                            ownerFilter
                                                        ) ===
                                                        String(
                                                            id
                                                        );

                                                    return (
                                                        <button
                                                            key={String(
                                                                id
                                                            )}
                                                            type="button"
                                                            onClick={() =>
                                                                handleOwnerChange(
                                                                    String(
                                                                        id
                                                                    )
                                                                )
                                                            }
                                                            className={`
                                                                flex
                                                                w-full
                                                                items-center
                                                                justify-between
                                                                rounded-lg
                                                                px-3
                                                                py-2.5
                                                                text-left
                                                                text-sm
                                                                font-semibold
                                                                transition
                                                                ${
                                                                    active
                                                                        ? "bg-[#102236] text-[#F6C945]"
                                                                        : "text-slate-700 hover:bg-[#fff8d8] hover:text-[#102236]"
                                                                }
                                                            `}
                                                        >
                                                            <span className="truncate">
                                                                {name}
                                                            </span>

                                                            {active && (
                                                                <svg
                                                                    className="ml-2 h-4 w-4 shrink-0"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2.5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="m5 12 4 4L19 6"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* =================================================
                            TEAM DROPDOWN
                        ================================================= */}

                        {showTeamFilter && (
                            <div className="min-w-0 flex-1">

                                <label
                                    className="
                                        mb-1.5
                                        block
                                        px-1
                                        text-[11px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                        text-slate-400
                                    "
                                >
                                    Team
                                </label>

                                <div className="relative">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleDropdown(
                                                "team"
                                            )
                                        }
                                        className={`
                                            flex
                                            h-11
                                            w-full
                                            items-center
                                            justify-between
                                            gap-3
                                            rounded-xl
                                            border
                                            px-4
                                            text-left
                                            text-sm
                                            font-semibold
                                            outline-none
                                            transition

                                            ${
                                                openDropdown ===
                                                "team"
                                                    ? "border-[#102236] bg-[#fffdf0] ring-4 ring-[#F6C945]/20"
                                                    : "border-slate-200 bg-slate-50 hover:border-[#102236]"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                min-w-0
                                                truncate
                                                ${
                                                    teamFilter ===
                                                    "ALL"
                                                        ? "text-slate-600"
                                                        : "text-[#102236]"
                                                }
                                            `}
                                        >
                                            {selectedTeamName}
                                        </span>

                                        <svg
                                            className={`
                                                h-4
                                                w-4
                                                shrink-0
                                                transition-transform
                                                ${
                                                    openDropdown ===
                                                    "team"
                                                        ? "rotate-180 text-[#102236]"
                                                        : "text-slate-400"
                                                }
                                            `}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m6 9 6 6 6-6"
                                            />
                                        </svg>
                                    </button>

                                    {openDropdown ===
                                        "team" && (
                                        <div
                                            className="
                                                absolute
                                                left-0
                                                right-0
                                                z-50
                                                mt-2
                                                max-h-64
                                                overflow-y-auto
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                p-1.5
                                                shadow-[0_12px_35px_rgba(15,23,42,0.16)]
                                            "
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleTeamChange(
                                                        "ALL"
                                                    )
                                                }
                                                className={`
                                                    flex
                                                    w-full
                                                    items-center
                                                    justify-between
                                                    rounded-lg
                                                    px-3
                                                    py-2.5
                                                    text-left
                                                    text-sm
                                                    font-semibold
                                                    transition
                                                    ${
                                                        teamFilter ===
                                                        "ALL"
                                                            ? "bg-[#102236] text-[#F6C945]"
                                                            : "text-slate-700 hover:bg-[#fff8d8] hover:text-[#102236]"
                                                    }
                                                `}
                                            >
                                                <span>
                                                    All Teams
                                                </span>

                                                {teamFilter ===
                                                    "ALL" && (
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth="2.5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m5 12 4 4L19 6"
                                                        />
                                                    </svg>
                                                )}
                                            </button>

                                            {teams.map(
                                                (team) => {
                                                    const id =
                                                        getTeamId(
                                                            team
                                                        );

                                                    if (!id) {
                                                        return null;
                                                    }

                                                    const name =
                                                        getTeamName(
                                                            team
                                                        );

                                                    const active =
                                                        String(
                                                            teamFilter
                                                        ) ===
                                                        String(
                                                            id
                                                        );

                                                    return (
                                                        <button
                                                            key={String(
                                                                id
                                                            )}
                                                            type="button"
                                                            onClick={() =>
                                                                handleTeamChange(
                                                                    String(
                                                                        id
                                                                    )
                                                                )
                                                            }
                                                            className={`
                                                                flex
                                                                w-full
                                                                items-center
                                                                justify-between
                                                                rounded-lg
                                                                px-3
                                                                py-2.5
                                                                text-left
                                                                text-sm
                                                                font-semibold
                                                                transition
                                                                ${
                                                                    active
                                                                        ? "bg-[#102236] text-[#F6C945]"
                                                                        : "text-slate-700 hover:bg-[#fff8d8] hover:text-[#102236]"
                                                                }
                                                            `}
                                                        >
                                                            <span className="truncate">
                                                                {name}
                                                            </span>

                                                            {active && (
                                                                <svg
                                                                    className="ml-2 h-4 w-4 shrink-0"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2.5"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="m5 12 4 4L19 6"
                                                                    />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadFilters;