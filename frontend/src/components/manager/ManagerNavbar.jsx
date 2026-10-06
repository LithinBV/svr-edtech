import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   ICON COMPONENT
   Same SVG style as ExecutiveIcon
============================================================ */

function Icon({
    type,
    className = "h-5 w-5",
}) {
    const commonProps = {
        className,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    switch (type) {
        case "menu":
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
            );

        case "refresh":
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <path d="M20 11a8.1 8.1 0 00-14.8-4L3 10" />
                    <path d="M3 5v5h5" />
                    <path d="M4 13a8.1 8.1 0 0014.8 4L21 14" />
                    <path d="M21 19v-5h-5" />
                </svg>
            );

        case "chevron":
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            );

        case "edit":
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <path d="M16.862 3.487a2.1 2.1 0 013 3L8.5 17.85l-4 1 1-4L16.862 3.487z" />
                </svg>
            );

        case "logout":
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 19V5a2 2 0 00-2-2h-5" />
                </svg>
            );

        default:
            return (
                <svg {...commonProps} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
    }
}

/* ============================================================
   TOKEN
============================================================ */

function getStoredToken() {
    return (
        localStorage.getItem("managerToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken")
    );
}

/* ============================================================
   MANAGER NAVBAR
============================================================ */

function ManagerNavbar({
    sidebarCollapsed,
    setSidebarCollapsed,
    openMobileMenu,
    onRefresh,
    refreshing = false,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [profileMenuOpen, setProfileMenuOpen] =
        useState(false);

    /* ========================================================
       FETCH PROFILE
    ======================================================== */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = getStoredToken();

                if (!token) return;

                const API_URL = import.meta.env.VITE_API_URL;

                const response = await fetch(
                    `${API_URL}/api/profile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch profile"
                    );
                }

                const data = await response.json();

                setProfile(
                    data.user || data
                );
            } catch (error) {
                console.error(
                    "Error fetching manager profile:",
                    error
                );
            }
        };

        fetchProfile();
    }, []);

    /* ========================================================
       PROFILE DATA
    ======================================================== */

    const profileName =
        profile?.name ||
        localStorage.getItem("managerUserName") ||
        localStorage.getItem("userName") ||
        "Manager";

    const profileEmail =
        profile?.email ||
        localStorage.getItem("userEmail") ||
        "";

    const profileImage =
        profile?.profileImage || null;

    const profileRole =
        profile?.role ||
        localStorage.getItem("managerUserType") ||
        "MANAGER";

    const profileInitial =
        profileName?.charAt(0)?.toUpperCase() ||
        "M";

    /* ========================================================
       PAGE TITLE
    ======================================================== */

    const getPageTitle = (pathname) => {
        if (pathname === "/manager-dashboard") {
            return "Manager Dashboard";
        }

        if (pathname === "/manager-team") {
            return "My Team";
        }

        if (pathname === "/manager-leads") {
            return "Leads";
        }

        if (pathname === "/manager-add-lead") {
            return "Add Lead Manually";
        }

        if (pathname === "/manager-bulk-upload") {
            return "Bulk Upload";
        }

        if (pathname === "/manager-follow-ups") {
            return "Follow Ups";
        }

        if (pathname === "/manager-assign-leads") {
            return "Assign Leads";
        }

        if (pathname === "/manager-reports") {
            return "Reports";
        }

        if (pathname === "/manager-profile") {
            return "My Profile";
        }

        return "Manager Portal";
    };

    const pageTitle = getPageTitle(
        location.pathname
    );

    /* ========================================================
       LOGOUT
    ======================================================== */

    const handleLogout = () => {
        localStorage.removeItem("managerToken");
        localStorage.removeItem("managerUserType");
        localStorage.removeItem("managerUserName");
        localStorage.removeItem("managerUserId");

        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userName");
        localStorage.removeItem("userId");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");

        navigate("/login", {
            replace: true,
        });
    };

    /* ========================================================
       EDIT PROFILE
    ======================================================== */

    const handleEditProfile = () => {
        setProfileMenuOpen(false);
        navigate("/manager-profile");
    };

    /* ========================================================
       MOBILE MENU
       
       This works even if openMobileMenu was not connected
       correctly in the parent layout.
    ======================================================== */

    const handleMobileMenu = () => {
        // If parent already provides the function, use it.
        if (typeof openMobileMenu === "function") {
            openMobileMenu();
        }

        // Also send event directly to ManagerSidebar.
        window.dispatchEvent(
            new CustomEvent(
                "manager-open-mobile-sidebar"
            )
        );
    };

    /* ========================================================
       RETURN
    ======================================================== */

    return (
        <header
            className="
                sticky
                top-0
                z-30
                flex
                h-[76px]
                items-center
                justify-between
                border-b
                border-[#102236]/10
                bg-white
                px-4
                sm:px-6
                lg:px-7
            "
        >
            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="
                flex
                items-center
                gap-3
                sm:gap-4
            ">
                {/* DESKTOP SIDEBAR TOGGLE */}

                {setSidebarCollapsed && (
                    <button
                        type="button"
                        onClick={() =>
                            setSidebarCollapsed(
                                (prev) => !prev
                            )
                        }
                        className="
                            hidden
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#102236]
                            text-[#FECA42]
                            shadow-sm
                            transition-all
                            duration-200
                            hover:bg-[#FECA42]
                            hover:text-[#102236]
                            active:scale-95
                            lg:flex
                        "
                        title={
                            sidebarCollapsed
                                ? "Expand Sidebar"
                                : "Collapse Sidebar"
                        }
                    >
                        <Icon
                            type="menu"
                            className="h-5 w-5"
                        />
                    </button>
                )}

                {/* ==================================================
                    MOBILE MENU BUTTON
                ================================================== */}

                <button
                    type="button"
                    onClick={handleMobileMenu}
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#FECA42]
                        text-[#102236]
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-[#102236]
                        hover:text-[#FECA42]
                        active:scale-95
                        lg:hidden
                    "
                    title="Open Menu"
                    aria-label="Open Menu"
                >
                    <Icon
                        type="menu"
                        className="h-6 w-6"
                    />
                </button>

                {/* PAGE TITLE */}

                <div>
                    <h1 className="
                        text-lg
                        font-bold
                        text-[#102236]
                        sm:text-xl
                    ">
                        {pageTitle}
                    </h1>

                    <p className="
                        mt-0.5
                        hidden
                        text-xs
                        text-gray-500
                        sm:block
                    ">
                        Manage your team and leads
                    </p>
                </div>
            </div>

            {/* ==================================================
                RIGHT
            ================================================== */}

            <div className="
                flex
                items-center
                gap-2
                sm:gap-3
            ">
                {/* REFRESH */}

                {onRefresh && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="
                            hidden
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            text-[#102236]
                            transition
                            hover:bg-[#FECA42]/20
                            hover:text-[#102236]
                            disabled:opacity-50
                            sm:flex
                        "
                        title="Refresh"
                    >
                        <Icon
                            type="refresh"
                            className={`
                                h-5
                                w-5
                                ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            `}
                        />
                    </button>
                )}

                {/* PROFILE */}

                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setProfileMenuOpen(
                                (prev) => !prev
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            px-2
                            py-1.5
                            transition
                            hover:bg-[#FECA42]/10
                        "
                    >
                        {/* AVATAR */}

                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={profileName}
                                className="
                                    h-10
                                    w-10
                                    rounded-xl
                                    border
                                    border-gray-200
                                    object-cover
                                    shadow-sm
                                "
                            />
                        ) : (
                            <div className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#FECA42]
                                font-bold
                                text-[#102236]
                                shadow-sm
                            ">
                                {profileInitial}
                            </div>
                        )}

                        {/* USER INFO */}

                        <div className="
                            hidden
                            text-left
                            leading-tight
                            md:block
                        ">
                            <p className="
                                text-sm
                                font-semibold
                                text-gray-800
                            ">
                                {profileName}
                            </p>

                            <p className="
                                mt-0.5
                                text-xs
                                text-gray-500
                            ">
                                {profileRole}
                            </p>
                        </div>

                        {/* ARROW */}

                        <Icon
                            type="chevron"
                            className={`
                                hidden
                                h-4
                                w-4
                                text-gray-400
                                transition-transform
                                duration-200
                                md:block
                                ${
                                    profileMenuOpen
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />
                    </button>

                    {/* ==================================================
                        DROPDOWN
                    ================================================== */}

                    {profileMenuOpen && (
                        <>
                            <div
                                className="
                                    fixed
                                    inset-0
                                    z-40
                                "
                                onClick={() =>
                                    setProfileMenuOpen(
                                        false
                                    )
                                }
                            />

                            <div className="
                                absolute
                                right-0
                                top-[58px]
                                z-50
                                w-64
                                overflow-hidden
                                rounded-2xl
                                border
                                border-gray-200
                                bg-white
                                shadow-xl
                            ">
                                {/* HEADER */}

                                <div className="
                                    bg-[#102236]
                                    px-4
                                    py-4
                                    text-white
                                ">
                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">
                                        {profileImage ? (
                                            <img
                                                src={
                                                    profileImage
                                                }
                                                alt={
                                                    profileName
                                                }
                                                className="
                                                    h-11
                                                    w-11
                                                    rounded-xl
                                                    border-2
                                                    border-white/20
                                                    object-cover
                                                "
                                            />
                                        ) : (
                                            <div className="
                                                flex
                                                h-11
                                                w-11
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-[#FECA42]
                                                font-bold
                                                text-[#102236]
                                            ">
                                                {
                                                    profileInitial
                                                }
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <p className="
                                                truncate
                                                font-semibold
                                            ">
                                                {profileName}
                                            </p>

                                            <p className="
                                                mt-0.5
                                                text-xs
                                                text-white/60
                                            ">
                                                {profileRole}
                                            </p>

                                            {profileEmail && (
                                                <p className="
                                                    mt-0.5
                                                    truncate
                                                    text-[11px]
                                                    text-white/50
                                                ">
                                                    {
                                                        profileEmail
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* MENU */}

                                <div className="p-2">
                                    {/* EDIT */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleEditProfile
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-left
                                            text-gray-700
                                            transition
                                            hover:bg-[#FECA42]/10
                                            hover:text-[#102236]
                                        "
                                    >
                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-[#FECA42]/15
                                            text-[#102236]
                                        ">
                                            <Icon
                                                type="edit"
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        <div>
                                            <p className="
                                                text-sm
                                                font-semibold
                                            ">
                                                Edit Profile
                                            </p>

                                            <p className="
                                                text-xs
                                                text-gray-400
                                            ">
                                                Update your
                                                profile
                                            </p>
                                        </div>
                                    </button>

                                    <div className="
                                        my-1
                                        border-t
                                        border-gray-100
                                    " />

                                    {/* LOGOUT */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleLogout
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-left
                                            text-red-600
                                            transition
                                            hover:bg-red-50
                                        "
                                    >
                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-red-50
                                        ">
                                            <Icon
                                                type="logout"
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        <div>
                                            <p className="
                                                text-sm
                                                font-semibold
                                            ">
                                                Logout
                                            </p>

                                            <p className="
                                                text-xs
                                                text-red-400
                                            ">
                                                Sign out of
                                                your account
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default ManagerNavbar;