import React, {
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import sLogo from "../../assets/images/s-logo.png";


/* ============================================================
   ICON COMPONENT
   Same style as ExecutiveIcon
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

        case "dashboard":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />

                    <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                    />
                </svg>
            );


        case "team":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="M17 20h5v-2a4 4 0 00-4-4h-1" />

                    <path d="M9 20H4v-2a4 4 0 014-4h1" />

                    <circle
                        cx="12"
                        cy="7"
                        r="4"
                    />

                    <path d="M18 8a3 3 0 110-6" />

                    <path d="M6 8a3 3 0 100-6" />
                </svg>
            );


        case "leads":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />

                    <path d="M22 21v-2a4 4 0 00-3-3.87" />

                    <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
            );


        /* ========================================================
           FINISHED LEADS ICON
        ======================================================== */

        case "check":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="m5 12 4 4L19 6" />
                </svg>
            );


        case "add":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />

                    <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="16"
                    />

                    <line
                        x1="8"
                        y1="12"
                        x2="16"
                        y2="12"
                    />
                </svg>
            );


        case "upload":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 16V4" />

                    <polyline points="7 9 12 4 17 9" />

                    <path d="M5 20h14" />
                </svg>
            );


        case "followups":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />

                    <polyline points="12 7 12 12 15 14" />
                </svg>
            );


        case "assign":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />

                    <circle
                        cx="9"
                        cy="7"
                        r="4"
                    />

                    <line
                        x1="19"
                        y1="8"
                        x2="19"
                        y2="14"
                    />

                    <polyline points="16 11 19 14 22 11" />
                </svg>
            );


        case "reports":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="4"
                        y1="19"
                        x2="4"
                        y2="5"
                    />

                    <line
                        x1="4"
                        y1="19"
                        x2="21"
                        y2="19"
                    />

                    <line
                        x1="8"
                        y1="16"
                        x2="8"
                        y2="11"
                    />

                    <line
                        x1="12"
                        y1="16"
                        x2="12"
                        y2="7"
                    />

                    <line
                        x1="16"
                        y1="16"
                        x2="16"
                        y2="8"
                    />

                    <line
                        x1="20"
                        y1="16"
                        x2="20"
                        y2="12"
                    />
                </svg>
            );


        case "profile":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <circle
                        cx="12"
                        cy="8"
                        r="4"
                    />

                    <path d="M4 21a8 8 0 0116 0" />
                </svg>
            );


        case "logout":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <path d="M10 17l5-5-5-5" />

                    <path d="M15 12H3" />

                    <path d="M21 19V5a2 2 0 00-2-2h-5" />
                </svg>
            );


        case "close":
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <line
                        x1="18"
                        y1="6"
                        x2="6"
                        y2="18"
                    />

                    <line
                        x1="6"
                        y1="6"
                        x2="18"
                        y2="18"
                    />
                </svg>
            );


        default:
            return (
                <svg
                    {...commonProps}
                    viewBox="0 0 24 24"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    />
                </svg>
            );
    }
}


/* ============================================================
   INITIALS
============================================================ */

function getInitials(name) {

    if (!name) return "M";


    const parts = String(name)
        .trim()
        .split(/\s+/);


    if (parts.length === 1) {

        return parts[0]
            .charAt(0)
            .toUpperCase();
    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
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
   MANAGER SIDEBAR
============================================================ */

function ManagerSidebar({
    sidebarOpen,
    setSidebarOpen,
}) {

    const navigate = useNavigate();

    const location = useLocation();


    const [profile, setProfile] =
        useState(null);


    const [profileLoading, setProfileLoading] =
        useState(true);


    /* ========================================================
       IMPORTANT:
       LISTEN FOR MOBILE MENU EVENT
    ======================================================== */

    useEffect(() => {

        const openSidebar = () => {
            setSidebarOpen(true);
        };


        window.addEventListener(
            "manager-open-mobile-sidebar",
            openSidebar
        );


        return () => {

            window.removeEventListener(
                "manager-open-mobile-sidebar",
                openSidebar
            );

        };

    }, [setSidebarOpen]);


    /* ========================================================
       LOAD PROFILE
    ======================================================== */

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const token =
                    getStoredToken();


                if (!token) {

                    setProfileLoading(false);

                    return;
                }


                const API_URL =
                    import.meta.env.VITE_API_URL ||
                    "";


                const response =
                    await fetch(
                        `${API_URL}/api/profile`,
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


                const data =
                    await response.json();


                if (
                    response.ok &&
                    data.success
                ) {

                    setProfile(
                        data.user
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load sidebar profile:",
                    error
                );

            } finally {

                setProfileLoading(false);
            }
        };


        loadProfile();

    }, []);


    /* ========================================================
       PROFILE
    ======================================================== */

    const managerName =
        profile?.name ||
        localStorage.getItem(
            "managerUserName"
        ) ||
        localStorage.getItem(
            "userName"
        ) ||
        "Manager";


    const profileInitial =
        getInitials(managerName);


    const profileImage =
        profile?.profileImage ||
        null;


    const profileRole =
        profile?.role ||
        profile?.userType ||
        localStorage.getItem(
            "managerUserType"
        ) ||
        "MANAGER";


    const displayRole =
        profileRole === "EXECUTIVE"
            ? "Executive"
            : "Manager";


    /* ========================================================
       ACTIVE ROUTE
    ======================================================== */

    const isActive = (paths) => {

        const pathList =
            Array.isArray(paths)
                ? paths
                : [paths];


        return pathList.some(
            (path) =>
                location.pathname === path
        );
    };


    /* ========================================================
       NAVIGATION
    ======================================================== */

    const goTo = (path) => {

        navigate(path);


        if (
            typeof setSidebarOpen ===
            "function"
        ) {

            setSidebarOpen(false);
        }
    };


    /* ========================================================
       LOGOUT
    ======================================================== */

    /* ========================================================
       LOGOUT
       IMPORTANT:
       Call backend logout BEFORE removing the refresh token.
       This clears lastActivityAt so the manager becomes INACTIVE.
    ======================================================== */

    const handleLogout = async () => {

        try {

            const refreshToken =
                localStorage.getItem(
                    "managerRefreshToken"
                ) ||
                localStorage.getItem(
                    "refreshToken"
                );

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "";

            if (refreshToken) {

                await fetch(
                    `${API_URL}/api/auth/logout`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            refreshToken,
                        }),

                        /*
                         * Helps the logout request finish
                         * while the page is navigating away.
                         */
                        keepalive: true,
                    }
                );
            }

        } catch (error) {

            /*
             * Even if the server request fails,
             * still remove local authentication data
             * and send the user to login.
             */
            console.error(
                "Manager logout error:",
                error
            );

        } finally {

            localStorage.removeItem(
                "managerToken"
            );

            localStorage.removeItem(
                "managerRefreshToken"
            );

            localStorage.removeItem(
                "managerUserType"
            );

            localStorage.removeItem(
                "managerUserName"
            );

            localStorage.removeItem(
                "managerUserId"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "refreshToken"
            );

            localStorage.removeItem(
                "userType"
            );

            localStorage.removeItem(
                "userName"
            );

            localStorage.removeItem(
                "userId"
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
                "profileImage"
            );

            localStorage.removeItem(
                "managerProfileImage"
            );

            navigate(
                "/login",
                {
                    replace: true,
                }
            );
        }
    };


    /* ========================================================
       MENU ITEMS
    ======================================================== */

    const menuItems = [

        {
            label: "Dashboard",
            path: "/manager-dashboard",
            icon: "dashboard",
        },

        {
            label: "My Team",
            path: "/manager-team",
            icon: "team",
        },

        {
            label: "Leads",
            path: "/manager-leads",
            icon: "leads",
        },

        /* ====================================================
           NEW - FINISHED LEADS
        ==================================================== */

        {
            label: "Finished Leads",
            path: "/manager-finished-leads",
            icon: "check",
        },

        {
            label: "Add Lead Manually",
            path: "/manager-add-lead",
            icon: "add",
        },

        {
            label: "Bulk Upload",
            path: "/manager-bulk-upload",
            icon: "upload",
        },

        {
            label: "Follow Ups",
            path: "/manager-follow-ups",
            icon: "followups",
        },

        {
            label: "Assign Leads",
            path: "/manager-assign-leads",
            icon: "assign",
        },

        {
            label: "Reports",
            path: "/manager-reports",
            icon: "reports",
        },

        {
            label: "My Profile",
            path: "/manager-profile",
            icon: "profile",
        },

    ];


    return (
        <>
            {/* ==================================================
                MOBILE OVERLAY
            ================================================== */}

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                    className="
                        fixed
                        inset-0
                        z-30
                        bg-[#102236]/60
                        backdrop-blur-[2px]
                        lg:hidden
                    "
                />
            )}


            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    z-40
                    flex
                    h-screen
                    w-[252px]
                    flex-col
                    overflow-y-auto
                    bg-[#102236]
                    text-white
                    shadow-2xl
                    transition-transform
                    duration-300
                    ease-out
                    lg:translate-x-0
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* ==================================================
                    LOGO
                ================================================== */}

                <div
                    className="
                        flex
                        h-20
                        shrink-0
                        items-center
                        border-b
                        border-white/10
                        bg-[#102236]
                        px-5
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
                            bg-white
                            p-1
                            shadow-lg
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


                    <div className="ml-3">

                        <p
                            className="
                                text-lg
                                font-extrabold
                                tracking-tight
                            "
                        >
                            SVR EDTECH
                        </p>


                        <p
                            className="
                                text-[10px]
                                uppercase
                                tracking-[0.18em]
                                text-[#FECA42]
                            "
                        >
                            Manager Portal
                        </p>

                    </div>


                    {/* MOBILE CLOSE */}

                    <button
                        type="button"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                        className="
                            ml-auto
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-white/5
                            text-gray-300
                            transition-all
                            hover:bg-[#FECA42]
                            hover:text-[#102236]
                            active:scale-95
                            lg:hidden
                        "
                        aria-label="Close menu"
                    >

                        <Icon
                            type="close"
                            className="h-5 w-5"
                        />

                    </button>

                </div>


                {/* ==================================================
                    PROFILE CARD
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        goTo(
                            "/manager-profile"
                        )
                    }
                    className="
                        mx-4
                        mt-5
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-4
                        text-left
                        transition-all
                        duration-200
                        hover:border-[#FECA42]/30
                        hover:bg-[#FECA42]/10
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {profileImage ? (

                            <img
                                src={profileImage}
                                alt={managerName}
                                className="
                                    h-11
                                    w-11
                                    shrink-0
                                    rounded-full
                                    object-cover
                                    shadow-lg
                                    ring-2
                                    ring-[#FECA42]/30
                                "
                            />

                        ) : (

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#FECA42]
                                    font-bold
                                    text-[#102236]
                                    shadow-lg
                                "
                            >
                                {profileInitial}
                            </div>

                        )}


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
                                "
                            >
                                {profileLoading
                                    ? "Loading..."
                                    : managerName}
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
                                        bg-emerald-400
                                    "
                                />


                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        text-emerald-300
                                    "
                                >
                                    {displayRole}
                                </span>

                            </div>

                        </div>

                    </div>

                </button>


                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <nav className="mt-5 px-3">

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


                    {menuItems.map(
                        (item) => {

                            const active =
                                isActive(
                                    item.path
                                );


                            return (
                                <button
                                    key={
                                        item.path
                                    }
                                    type="button"
                                    onClick={() =>
                                        goTo(
                                            item.path
                                        )
                                    }
                                    className={`
                                        group
                                        mb-1.5
                                        flex
                                        w-full
                                        items-center
                                        rounded-xl
                                        px-3
                                        py-3
                                        text-left
                                        transition-all
                                        duration-200
                                        ${
                                            active
                                                ? "bg-[#FECA42] text-[#102236] shadow-lg shadow-black/20"
                                                : "text-gray-200 hover:bg-white/10 hover:text-[#FECA42]"
                                        }
                                    `}
                                >

                                    {/* ICON */}

                                    <span
                                        className={`
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-lg
                                            transition-all
                                            duration-200
                                            ${
                                                active
                                                    ? "bg-[#102236]/15 text-[#102236]"
                                                    : "bg-white/5 text-gray-400 group-hover:bg-[#FECA42]/15 group-hover:text-[#FECA42]"
                                            }
                                        `}
                                    >

                                        <Icon
                                            type={
                                                item.icon
                                            }
                                            className="h-5 w-5"
                                        />

                                    </span>


                                    {/* LABEL */}

                                    <span
                                        className={`
                                            ml-3
                                            text-sm
                                            ${
                                                active
                                                    ? "font-bold text-[#102236]"
                                                    : "font-medium text-gray-200 group-hover:text-[#FECA42]"
                                            }
                                        `}
                                    >
                                        {
                                            item.label
                                        }
                                    </span>

                                </button>
                            );

                        }
                    )}

                </nav>


                {/* ==================================================
                    PORTAL CARD
                ================================================== */}

                <div
                    className="
                        mt-auto
                        px-4
                        pb-4
                        pt-6
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            border
                            border-[#FECA42]/20
                            bg-gradient-to-br
                            from-[#FECA42]/10
                            to-white/5
                            p-4
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
                                className="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-[#FECA42]
                                    shadow-[0_0_8px_rgba(254,202,66,0.7)]
                                "
                            />


                            <span
                                className="
                                    text-xs
                                    font-bold
                                    text-[#FECA42]
                                "
                            >
                                Manager Portal
                            </span>

                        </div>


                        <p
                            className="
                                mt-2
                                text-[10px]
                                leading-relaxed
                                text-gray-400
                            "
                        >
                            Manage your team,
                            leads and follow-ups
                            from one place.
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    LOGOUT
                ================================================== */}

                <div
                    className="
                        border-t
                        border-white/10
                        px-3
                        py-3
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleLogout
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
                            transition-all
                            hover:bg-red-500/10
                        "
                    >

                        <span
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                bg-red-500/10
                                text-red-400
                                transition
                                group-hover:bg-red-500
                                group-hover:text-white
                            "
                        >

                            <Icon
                                type="logout"
                                className="h-5 w-5"
                            />

                        </span>


                        <span
                            className="
                                ml-3
                                text-sm
                                font-medium
                                text-gray-300
                                group-hover:text-red-300
                            "
                        >
                            Logout
                        </span>

                    </button>

                </div>

            </aside>
        </>
    );
}


export default ManagerSidebar;