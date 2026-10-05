import React from "react";
import { NavLink } from "react-router-dom";
import sLogo from "../../assets/images/s-logo.png";
import AdminIcon from "./AdminIcon";

function AdminSidebar({
    sidebarCollapsed,
    mobileMenuOpen,
    setSidebarCollapsed,
    openMenu,
    toggleMenu,
    closeMobileMenu,
    handleLogout,
    handleNavigation,
    isActive,
    profileName,
    profileImage,
    profileInitial,
}) {
    const SubmenuLink = ({ to, children }) => {
        return (
            <NavLink
                to={to}
                onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenu();
                    handleNavigation(to);
                }}
                className={({ isActive }) => `
                    group
                    flex
                    w-full
                    items-center
                    rounded-lg
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    transition
                    duration-200

                    ${
                        isActive
                            ? "bg-[#F6C945]/15 text-[#F6C945]"
                            : "text-gray-300 hover:bg-[#F6C945]/10 hover:text-[#F6C945]"
                    }
                `}
            >
                {({ isActive }) => (
                    <>
                        <span
                            className={`
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                transition

                                ${
                                    isActive
                                        ? "bg-[#F6C945]"
                                        : "bg-gray-500 group-hover:bg-[#F6C945]"
                                }
                            `}
                        />

                        <span className="ml-3">
                            {children}
                        </span>
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <>
            {/* ==========================================
                MOBILE OVERLAY
            ========================================== */}

            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={closeMobileMenu}
                    className="
                        fixed
                        inset-0
                        z-30
                        bg-black/40
                        lg:hidden
                    "
                />
            )}


            {/* ==========================================
                SIDEBAR
            ========================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-40
                    flex
                    h-screen
                    flex-col
                    overflow-y-auto
                    bg-[#102236]
                    text-white
                    shadow-2xl
                    transition-all
                    duration-300

                    ${
                        sidebarCollapsed
                            ? "w-[78px]"
                            : "w-[252px]"
                    }

                    lg:translate-x-0

                    ${
                        mobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* ==========================================
                    LOGO SECTION
                ========================================== */}

                <div
                    className={`
                        flex
                        h-20
                        shrink-0
                        items-center
                        border-b
                        border-white/10

                        ${
                            sidebarCollapsed
                                ? "justify-center px-3"
                                : "px-5"
                        }
                    `}
                >

                    {/* LOGO */}

                    <button
                        type="button"
                        onClick={() => {
                            handleNavigation("/admin-dashboard");
                        }}
                        className={`
                            flex
                            items-center

                            ${
                                sidebarCollapsed
                                    ? "justify-center"
                                    : ""
                            }
                        `}
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
                                bg-white
                                p-1
                                shadow-md
                            "
                        >
                            <img
                                src={sLogo}
                                alt="SVR EDTECH"
                                className="
                                    h-full
                                    w-full
                                    object-contain
                                "
                            />
                        </div>


                        {!sidebarCollapsed && (
                            <div className="ml-3 text-left">

                                <p
                                    className="
                                        text-lg
                                        font-extrabold
                                        tracking-tight
                                        text-white
                                    "
                                >
                                    SVR EDTECH
                                </p>

                                <p
                                    className="
                                        text-[10px]
                                        uppercase
                                        tracking-[0.18em]
                                        text-gray-400
                                    "
                                >
                                    Super Admin Portal
                                </p>

                            </div>
                        )}

                    </button>


                    {/* MOBILE CLOSE */}

                    <button
                        type="button"
                        onClick={closeMobileMenu}
                        className="
                            ml-auto
                            rounded-lg
                            p-2
                            text-gray-300
                            transition
                            hover:bg-[#F6C945]/10
                            hover:text-[#F6C945]
                            lg:hidden
                        "
                    >
                        <AdminIcon
                            type="close"
                            className="h-5 w-5"
                        />
                    </button>

                </div>


                {/* ==========================================
                    ADMIN PROFILE CARD
                ========================================== */}

                {!sidebarCollapsed && (
                    <div
                        className="
                            mx-4
                            mt-5
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-4
                            transition
                            duration-200
                            hover:border-[#F6C945]/30
                            hover:bg-[#F6C945]/5
                        "
                    >

                        <div className="flex items-center gap-3">

                            {/* Avatar */}

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-full
                                    bg-[#F6C945]
                                    text-sm
                                    font-bold
                                    text-[#102236]
                                    shadow-lg
                                "
                            >

                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={
                                            profileName ||
                                            "Super Admin"
                                        }
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                        "
                                    />
                                ) : (
                                    <span>
                                        {profileInitial || "S"}
                                    </span>
                                )}

                            </div>


                            {/* Details */}

                            <div className="min-w-0">

                                <p
                                    className="
                                        text-[10px]
                                        uppercase
                                        tracking-wider
                                        text-gray-400
                                    "
                                >
                                    Logged in as
                                </p>


                                <p
                                    className="
                                        mt-1
                                        truncate
                                        text-sm
                                        font-bold
                                        text-white
                                    "
                                >
                                    {profileName || "Super Admin"}
                                </p>


                                <div
                                    className="
                                        mt-1
                                        flex
                                        items-center
                                        gap-1.5
                                    "
                                >

                                    <span
                                        className="
                                            h-2
                                            w-2
                                            rounded-full
                                            bg-[#F6C945]
                                        "
                                    />

                                    <span
                                        className="
                                            text-[10px]
                                            font-medium
                                            text-[#F6C945]
                                        "
                                    >
                                        Online
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>
                )}


                {/* ==========================================
                    NAVIGATION
                ========================================== */}

                <nav
                    className={`
                        mt-5

                        ${
                            sidebarCollapsed
                                ? "px-2"
                                : "px-3"
                        }
                    `}
                >

                    {!sidebarCollapsed && (
                        <p
                            className="
                                mb-2
                                px-3
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-gray-500
                            "
                        >
                            Main Menu
                        </p>
                    )}


                    {/* ==========================================
                        DASHBOARD
                    ========================================== */}

                    <button
                        type="button"
                        onClick={() => {
                            handleNavigation(
                                "/admin-dashboard"
                            );
                        }}
                        className={`
                            group
                            mb-2
                            flex
                            w-full
                            items-center
                            rounded-xl
                            px-3
                            py-3
                            text-left
                            transition
                            duration-200

                            ${
                                isActive("/admin-dashboard")
                                    ? "bg-[#F6C945] text-[#102236] shadow-lg shadow-[#F6C945]/10"
                                    : "text-gray-300 hover:bg-[#F6C945]/10 hover:text-[#F6C945]"
                            }

                            ${
                                sidebarCollapsed
                                    ? "justify-center"
                                    : ""
                            }
                        `}
                        title={
                            sidebarCollapsed
                                ? "Dashboard"
                                : ""
                        }
                    >

                        <span
                            className={`
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                transition

                                ${
                                    isActive(
                                        "/admin-dashboard"
                                    )
                                        ? "bg-[#102236]/10 text-[#102236]"
                                        : "bg-white/5 text-gray-400 group-hover:bg-[#F6C945] group-hover:text-[#102236]"
                                }
                            `}
                        >
                            <AdminIcon
                                type="dashboard"
                                className="h-5 w-5"
                            />
                        </span>


                        {!sidebarCollapsed && (
                            <span
                                className="
                                    ml-3
                                    font-semibold
                                "
                            >
                                Dashboard
                            </span>
                        )}


                        {!sidebarCollapsed &&
                            isActive(
                                "/admin-dashboard"
                            ) && (
                                <span
                                    className="
                                        ml-auto
                                        rounded-full
                                        bg-[#102236]/10
                                        px-2
                                        py-1
                                        text-[9px]
                                        font-bold
                                    "
                                >
                                    HOME
                                </span>
                            )}

                    </button>


                    {/* ==========================================
                        LEADS
                    ========================================== */}

                    <div className="mb-1">

                        <button
                            type="button"
                            onClick={() =>
                                toggleMenu("leads")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                text-gray-300
                                transition
                                duration-200
                                hover:bg-[#F6C945]/10
                                hover:text-[#F6C945]
                            "
                            title={
                                sidebarCollapsed
                                    ? "Leads"
                                    : ""
                            }
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    text-gray-400
                                    transition
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                "
                            >
                                <AdminIcon
                                    type="leads"
                                    className="h-5 w-5"
                                />
                            </span>


                            {!sidebarCollapsed && (
                                <span
                                    className="
                                        ml-3
                                        font-medium
                                    "
                                >
                                    Leads
                                </span>
                            )}


                            {!sidebarCollapsed && (
                                <svg
                                    className={`
                                        ml-auto
                                        h-4
                                        w-4
                                        text-gray-500
                                        transition-transform
                                        group-hover:text-[#F6C945]

                                        ${
                                            openMenu ===
                                            "leads"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}

                        </button>


                        {!sidebarCollapsed &&
                            openMenu === "leads" && (

                                <div
                                    className="
                                        ml-9
                                        space-y-1
                                        border-l
                                        border-white/10
                                        pl-4
                                    "
                                >

                                    <SubmenuLink to="/all-leads">
                                        All Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/new-leads">
                                        New Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/hot-leads">
                                        Hot Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/warm-leads">
                                        Warm Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/cold-leads">
                                        Cold Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/missed-leads">
                                        Missed Leads
                                    </SubmenuLink>


                                    {/* ==========================================
                                        FINISHED LEADS
                                    ========================================== */}

                                    <SubmenuLink to="/finished-leads">
                                        Finished Leads
                                    </SubmenuLink>


                                    <SubmenuLink to="/add-lead">
                                        Add Lead
                                    </SubmenuLink>


                                    <SubmenuLink to="/bulk-upload-leads">
                                        Bulk Upload
                                    </SubmenuLink>

                                </div>
                            )}

                    </div>


                    {/* ==========================================
                        USER / TEAM
                    ========================================== */}

                    <div className="mb-1">

                        <button
                            type="button"
                            onClick={() =>
                                toggleMenu("users")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                text-gray-300
                                transition
                                duration-200
                                hover:bg-[#F6C945]/10
                                hover:text-[#F6C945]
                            "
                            title={
                                sidebarCollapsed
                                    ? "User / Team"
                                    : ""
                            }
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    text-gray-400
                                    transition
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                "
                            >
                                <AdminIcon
                                    type="users"
                                    className="h-5 w-5"
                                />
                            </span>


                            {!sidebarCollapsed && (
                                <span
                                    className="
                                        ml-3
                                        font-medium
                                    "
                                >
                                    User / Team
                                </span>
                            )}


                            {!sidebarCollapsed && (
                                <svg
                                    className={`
                                        ml-auto
                                        h-4
                                        w-4
                                        text-gray-500
                                        transition-transform
                                        group-hover:text-[#F6C945]

                                        ${
                                            openMenu ===
                                            "users"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}

                        </button>


                        {!sidebarCollapsed &&
                            openMenu === "users" && (

                                <div
                                    className="
                                        ml-9
                                        space-y-1
                                        border-l
                                        border-white/10
                                        pl-4
                                    "
                                >

                                    <SubmenuLink to="/add-user">
                                        Add New User
                                    </SubmenuLink>


                                    <SubmenuLink to="/view-users">
                                        View Users
                                    </SubmenuLink>


                                    <SubmenuLink to="/teams">
                                        Teams
                                    </SubmenuLink>


                                    <SubmenuLink to="/performance">
                                        Performance
                                    </SubmenuLink>

                                </div>
                            )}

                    </div>


                    {/* ==========================================
                        FOLLOW UPS
                    ========================================== */}

                    <div className="mb-1">

                        <button
                            type="button"
                            onClick={() =>
                                toggleMenu("followups")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                text-gray-300
                                transition
                                duration-200
                                hover:bg-[#F6C945]/10
                                hover:text-[#F6C945]
                            "
                            title={
                                sidebarCollapsed
                                    ? "Follow-ups"
                                    : ""
                            }
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    text-gray-400
                                    transition
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                "
                            >
                                <AdminIcon
                                    type="clock"
                                    className="h-5 w-5"
                                />
                            </span>


                            {!sidebarCollapsed && (
                                <span
                                    className="
                                        ml-3
                                        font-medium
                                    "
                                >
                                    Follow-ups
                                </span>
                            )}


                            {!sidebarCollapsed && (
                                <svg
                                    className={`
                                        ml-auto
                                        h-4
                                        w-4
                                        text-gray-500
                                        transition-transform
                                        group-hover:text-[#F6C945]

                                        ${
                                            openMenu ===
                                            "followups"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}

                        </button>


                        {!sidebarCollapsed &&
                            openMenu === "followups" && (

                                <div
                                    className="
                                        ml-9
                                        space-y-1
                                        border-l
                                        border-white/10
                                        pl-4
                                    "
                                >

                                    <SubmenuLink to="/follow-ups">
                                        All Follow Ups
                                    </SubmenuLink>


                                    <SubmenuLink to="/today-follow-ups">
                                        Today Follow Ups
                                    </SubmenuLink>


                                    <SubmenuLink to="/upcoming-follow-ups">
                                        Upcoming
                                    </SubmenuLink>


                                    <SubmenuLink to="/overdue-follow-ups">
                                        Missed
                                    </SubmenuLink>


                                    <SubmenuLink to="/completed-follow-ups">
                                        Completed
                                    </SubmenuLink>

                                </div>
                            )}

                    </div>


                    {/* ==========================================
                        ANALYTICS
                    ========================================== */}

                    <div className="mb-1">

                        <button
                            type="button"
                            onClick={() => {
                                toggleMenu("analytics");
                            }}
                            className={`
                                group
                                flex
                                w-full
                                items-center
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                transition
                                duration-200

                                ${
                                    isActive("/analytics") ||
                                    isActive("/analytics/date-wise") ||
                                    isActive("/analytics/source-wise") ||
                                    isActive("/analytics/program-wise") ||
                                    isActive("/analytics/user-wise")
                                        ? "bg-[#F6C945]/10 text-[#F6C945]"
                                        : "text-gray-300 hover:bg-[#F6C945]/10 hover:text-[#F6C945]"
                                }
                            `}
                            title={
                                sidebarCollapsed
                                    ? "Analytics"
                                    : ""
                            }
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    text-gray-400
                                    transition
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                "
                            >
                                <AdminIcon
                                    type="analytics"
                                    className="h-5 w-5"
                                />
                            </span>


                            {!sidebarCollapsed && (
                                <span
                                    className="
                                        ml-3
                                        font-medium
                                    "
                                >
                                    Analytics
                                </span>
                            )}


                            {!sidebarCollapsed && (
                                <svg
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenu("analytics");
                                    }}
                                    className={`
                                        ml-auto
                                        h-4
                                        w-4
                                        cursor-pointer
                                        text-gray-500
                                        transition-transform
                                        group-hover:text-[#F6C945]

                                        ${
                                            openMenu ===
                                            "analytics"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}

                        </button>


                        {!sidebarCollapsed &&
                            openMenu === "analytics" && (

                                <div
                                    className="
                                        ml-9
                                        space-y-1
                                        border-l
                                        border-white/10
                                        pl-4
                                    "
                                >

                                    <SubmenuLink to="/analytics">
                                        Overall
                                    </SubmenuLink>


                                    <SubmenuLink to="/analytics/date-wise">
                                        Date Wise
                                    </SubmenuLink>


                                    <SubmenuLink to="/analytics/source-wise">
                                        Source Wise
                                    </SubmenuLink>


                                    <SubmenuLink to="/analytics/program-wise">
                                        Program Wise
                                    </SubmenuLink>


                                    <SubmenuLink to="/analytics/user-wise">
                                        User Views
                                    </SubmenuLink>

                                </div>
                            )}

                    </div>


                    {/* ==========================================
                        SETTINGS
                    ========================================== */}

                    <div className="mb-1">

                        <button
                            type="button"
                            onClick={() =>
                                toggleMenu("settings")
                            }
                            className="
                                group
                                flex
                                w-full
                                items-center
                                rounded-xl
                                px-3
                                py-3
                                text-left
                                text-gray-300
                                transition
                                duration-200
                                hover:bg-[#F6C945]/10
                                hover:text-[#F6C945]
                            "
                            title={
                                sidebarCollapsed
                                    ? "Settings"
                                    : ""
                            }
                        >

                            <span
                                className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    text-gray-400
                                    transition
                                    group-hover:bg-[#F6C945]
                                    group-hover:text-[#102236]
                                "
                            >
                                <AdminIcon
                                    type="settings"
                                    className="h-5 w-5"
                                />
                            </span>


                            {!sidebarCollapsed && (
                                <span
                                    className="
                                        ml-3
                                        font-medium
                                    "
                                >
                                    Settings
                                </span>
                            )}


                            {!sidebarCollapsed && (
                                <svg
                                    className={`
                                        ml-auto
                                        h-4
                                        w-4
                                        text-gray-500
                                        transition-transform
                                        group-hover:text-[#F6C945]

                                        ${
                                            openMenu ===
                                            "settings"
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
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            )}

                        </button>


                        {!sidebarCollapsed &&
                            openMenu === "settings" && (

                                <div
                                    className="
                                        ml-9
                                        space-y-1
                                        border-l
                                        border-white/10
                                        pl-4
                                    "
                                >

                                    <SubmenuLink to="/create-institution">
                                        Institution
                                    </SubmenuLink>


                                    <SubmenuLink to="/settings/lead-sources">
                                        Lead Sources
                                    </SubmenuLink>


                                    <SubmenuLink to="/settings/lead-stages">
                                        Lead Stages
                                    </SubmenuLink>


                                    <SubmenuLink to="/settings/roles">
                                        Roles & Permissions
                                    </SubmenuLink>


                                    <SubmenuLink to="/settings/view">
                                        View Settings
                                    </SubmenuLink>

                                </div>
                            )}

                    </div>


                    {/* ==========================================
                        MY PROFILE
                    ========================================== */}

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation("/profile")
                        }
                        className="
                            group
                            mb-2
                            flex
                            w-full
                            items-center
                            rounded-xl
                            px-3
                            py-3
                            text-left
                            text-gray-300
                            transition
                            duration-200
                            hover:bg-[#F6C945]/10
                            hover:text-[#F6C945]
                        "
                        title={
                            sidebarCollapsed
                                ? "My Profile"
                                : ""
                        }
                    >

                        <span
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-white/5
                                text-gray-400
                                transition
                                group-hover:bg-[#F6C945]
                                group-hover:text-[#102236]
                            "
                        >
                            <AdminIcon
                                type="profile"
                                className="h-5 w-5"
                            />
                        </span>


                        {!sidebarCollapsed && (
                            <span
                                className="
                                    ml-3
                                    font-medium
                                "
                            >
                                My Profile
                            </span>
                        )}

                    </button>

                </nav>


                {/* ==========================================
                    BOTTOM SECTION
                ========================================== */}

                <div className="mt-auto px-3 pb-5">

                    <div className="mb-4 border-t border-white/10" />


                    {/* STATUS */}

                    {!sidebarCollapsed && (
                        <div
                            className="
                                mb-3
                                rounded-xl
                                border
                                border-[#F6C945]/10
                                bg-[#F6C945]/5
                                px-3
                                py-3
                            "
                        >

                            <div className="flex items-center justify-between">

                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        text-gray-400
                                    "
                                >
                                    System Status
                                </span>


                                <span
                                    className="
                                        h-2
                                        w-2
                                        rounded-full
                                        bg-[#F6C945]
                                    "
                                />

                            </div>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    font-semibold
                                    text-[#F6C945]
                                "
                            >
                                System Online
                            </p>

                        </div>
                    )}


                    {/* LOGOUT */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className={`
                            group
                            flex
                            w-full
                            items-center
                            rounded-xl
                            px-3
                            py-3
                            text-left
                            text-gray-300
                            transition
                            duration-200
                            hover:bg-[#F6C945]/10
                            hover:text-[#F6C945]

                            ${
                                sidebarCollapsed
                                    ? "justify-center"
                                    : ""
                            }
                        `}
                        title={
                            sidebarCollapsed
                                ? "Logout"
                                : ""
                        }
                    >

                        <span
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-white/5
                                text-gray-400
                                transition
                                group-hover:bg-[#F6C945]
                                group-hover:text-[#102236]
                            "
                        >
                            <AdminIcon
                                type="logout"
                                className="h-5 w-5"
                            />
                        </span>


                        {!sidebarCollapsed && (
                            <span
                                className="
                                    ml-3
                                    font-medium
                                "
                            >
                                Logout
                            </span>
                        )}

                    </button>

                </div>

            </aside>
        </>
    );
}

export default AdminSidebar;