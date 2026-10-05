import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import sLogo from "../../assets/images/s-logo.png";
import Icon from "./ExecutiveIcon";

const ExecutiveSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    executiveName,
    profileImage,
    profileInitial,
    stats,
    handleMyLeads,
    handleFollowUps,
    handleProfile,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // ============================================================
    // PROFILE DATA
    // ============================================================

    const [profile, setProfile] = useState(null);

    // ============================================================
    // GET TOKEN
    // ============================================================

    const getStoredToken = () => {
        return (
            localStorage.getItem("executiveToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    };

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = async () => {
        try {
            const refreshToken =
                localStorage.getItem("executiveRefreshToken") ||
                localStorage.getItem("refreshToken");

            const API_URL =
                import.meta.env.VITE_API_URL || "";

            if (refreshToken) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        refreshToken,
                    }),
                    keepalive: true,
                });
            }
        } catch (error) {
            console.error("Executive logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("executiveToken");
            localStorage.removeItem("access_token");
            localStorage.removeItem("jwt");
            localStorage.removeItem("authToken");

            localStorage.removeItem("refreshToken");
            localStorage.removeItem("executiveRefreshToken");

            localStorage.removeItem("userType");
            localStorage.removeItem("executiveUserType");
            localStorage.removeItem("userName");
            localStorage.removeItem("executiveUserName");
            localStorage.removeItem("profileImage");
            localStorage.removeItem("executiveProfileImage");

            navigate("/login", {
                replace: true,
            });
        }
    };

    // ============================================================
    // FETCH PROFILE
    // ============================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = getStoredToken();

                if (!token) {
                    return;
                }

                const API_URL =
                    import.meta.env.VITE_API_URL || "";

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

                const data = await response.json();

                if (response.ok && data.success) {
                    setProfile(data.user);
                } else {
                    console.error(
                        "Executive profile fetch failed:",
                        data
                    );
                }
            } catch (error) {
                console.error(
                    "Executive profile fetch error:",
                    error
                );
            }
        };

        loadProfile();
    }, []);

    // ============================================================
    // FINAL USER DETAILS
    // ============================================================

    const finalExecutiveName =
        profile?.name ||
        executiveName ||
        localStorage.getItem("executiveUserName") ||
        localStorage.getItem("userName") ||
        "Executive";

    const finalProfileImage =
        profile?.profileImage ||
        profileImage ||
        localStorage.getItem("executiveProfileImage") ||
        localStorage.getItem("profileImage") ||
        "";

    const finalProfileInitial =
        finalExecutiveName
            ?.trim()
            ?.charAt(0)
            ?.toUpperCase() ||
        profileInitial ||
        "E";

    // ============================================================
    // ACTIVE ROUTE
    // ============================================================

    const isActive = (path) => {
        return location.pathname === path;
    };

    // ============================================================
    // NAVIGATION
    // ============================================================

    const goToDashboard = () => {
        setSidebarOpen(false);
        navigate("/executive-dashboard");
    };

    const goToLeads = () => {
        setSidebarOpen(false);
        handleMyLeads();
    };

    const goToFinishedLeads = () => {
        setSidebarOpen(false);
        navigate("/executive-finished-leads");
    };

    const goToFollowUps = () => {
        setSidebarOpen(false);
        handleFollowUps();
    };

    const goToProfile = () => {
        setSidebarOpen(false);
        handleProfile();
    };

    // ============================================================
    // MENU BUTTON STYLE
    // ============================================================

    const getMenuButtonClass = (active) => {
        return `
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
                    ? `
                        bg-[#FECA42]
                        text-[#102236]
                        shadow-lg
                        shadow-black/20
                    `
                    : `
                        text-gray-200
                        hover:bg-white/10
                        hover:text-[#FECA42]
                    `
            }
        `;
    };

    // ============================================================
    // ICON STYLE
    // ============================================================

    const getIconClass = (active) => {
        return `
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
                    ? `
                        bg-[#102236]/15
                        text-[#102236]
                    `
                    : `
                        bg-white/5
                        text-gray-400
                        group-hover:bg-[#FECA42]/15
                        group-hover:text-[#FECA42]
                    `
            }
        `;
    };

    // ============================================================
    // RENDER
    // ============================================================

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
                                text-[#FECA42]
                            "
                        >
                            Executive Portal
                        </p>
                    </div>

                    {/* Mobile Close */}

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

                <div
                    className="
                        mx-4
                        mt-5
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-4
                        transition-all
                        duration-200
                        hover:border-[#FECA42]/30
                        hover:bg-[#FECA42]/10
                    "
                >
                    <div className="flex items-center gap-3">

                        {/* Profile Image */}

                        {finalProfileImage ? (
                            <img
                                src={finalProfileImage}
                                alt={finalExecutiveName}
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
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
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
                                {finalProfileInitial}
                            </div>
                        )}

                        {/* User Details */}

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
                                {finalExecutiveName}
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
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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

                    {/* ==================================================
                        DASHBOARD
                    ================================================== */}

                    <button
                        type="button"
                        onClick={goToDashboard}
                        className={getMenuButtonClass(
                            isActive(
                                "/executive-dashboard"
                            )
                        )}
                    >
                        <span
                            className={getIconClass(
                                isActive(
                                    "/executive-dashboard"
                                )
                            )}
                        >
                            <Icon
                                type="dashboard"
                                className="h-5 w-5"
                            />
                        </span>

                        <span
                            className={`
                                ml-3
                                text-sm
                                ${
                                    isActive(
                                        "/executive-dashboard"
                                    )
                                        ? "font-bold"
                                        : "font-medium group-hover:text-[#FECA42]"
                                }
                            `}
                        >
                            Dashboard
                        </span>

                        <span
                            className={`
                                ml-auto
                                rounded-full
                                px-2
                                py-1
                                text-[9px]
                                font-bold
                                ${
                                    isActive(
                                        "/executive-dashboard"
                                    )
                                        ? "bg-[#102236]/10 text-[#102236]"
                                        : "bg-white/5 text-gray-400 group-hover:bg-[#FECA42] group-hover:text-[#102236]"
                                }
                            `}
                        >
                            HOME
                        </span>
                    </button>

                    {/* ==================================================
                        MY LEADS
                        NO COUNT BADGE
                    ================================================== */}

                    <button
                        type="button"
                        onClick={goToLeads}
                        className={getMenuButtonClass(
                            isActive(
                                "/executive-leads"
                            )
                        )}
                    >
                        <span
                            className={getIconClass(
                                isActive(
                                    "/executive-leads"
                                )
                            )}
                        >
                            <Icon
                                type="leads"
                                className="h-5 w-5"
                            />
                        </span>

                        <span
                            className={`
                                ml-3
                                text-sm
                                ${
                                    isActive(
                                        "/executive-leads"
                                    )
                                        ? "font-bold"
                                        : "font-medium group-hover:text-[#FECA42]"
                                }
                            `}
                        >
                            My Leads
                        </span>
                    </button>

                    {/* ==================================================
                        FINISHED LEADS
                    ================================================== */}

                    <button
                        type="button"
                        onClick={goToFinishedLeads}
                        className={getMenuButtonClass(
                            isActive(
                                "/executive-finished-leads"
                            )
                        )}
                    >
                        <span
                            className={getIconClass(
                                isActive(
                                    "/executive-finished-leads"
                                )
                            )}
                        >
                            <Icon
                                type="check"
                                className="h-5 w-5"
                            />
                        </span>

                        <span
                            className={`
                                ml-3
                                text-sm
                                ${
                                    isActive(
                                        "/executive-finished-leads"
                                    )
                                        ? "font-bold"
                                        : "font-medium group-hover:text-[#FECA42]"
                                }
                            `}
                        >
                            Finished Leads
                        </span>
                    </button>

                    {/* ==================================================
                        FOLLOW-UPS
                        NO COUNT BADGE
                    ================================================== */}

                    <button
                        type="button"
                        onClick={goToFollowUps}
                        className={getMenuButtonClass(
                            isActive(
                                "/executive-follow-ups"
                            )
                        )}
                    >
                        <span
                            className={getIconClass(
                                isActive(
                                    "/executive-follow-ups"
                                )
                            )}
                        >
                            <Icon
                                type="clock"
                                className="h-5 w-5"
                            />
                        </span>

                        <span
                            className={`
                                ml-3
                                text-sm
                                ${
                                    isActive(
                                        "/executive-follow-ups"
                                    )
                                        ? "font-bold"
                                        : "font-medium group-hover:text-[#FECA42]"
                                }
                            `}
                        >
                            Follow-ups
                        </span>
                    </button>

                    {/* ==================================================
                        MY PROFILE
                    ================================================== */}

                    <button
                        type="button"
                        onClick={goToProfile}
                        className={getMenuButtonClass(
                            isActive(
                                "/executive-profile"
                            )
                        )}
                    >
                        <span
                            className={getIconClass(
                                isActive(
                                    "/executive-profile"
                                )
                            )}
                        >
                            <Icon
                                type="profile"
                                className="h-5 w-5"
                            />
                        </span>

                        <span
                            className={`
                                ml-3
                                text-sm
                                ${
                                    isActive(
                                        "/executive-profile"
                                    )
                                        ? "font-bold"
                                        : "font-medium group-hover:text-[#FECA42]"
                                }
                            `}
                        >
                            My Profile
                        </span>
                    </button>
                </nav>

                {/* ==================================================
                    BOTTOM SECTION
                ================================================== */}

                <div
                    className="
                        mt-auto
                        px-4
                        pb-4
                        pt-6
                    "
                >
                    <div className="mb-4 border-t border-white/10" />

                    {/* ==================================================
                        EXECUTIVE PORTAL CARD
                    ================================================== */}

                    <div
                        className="
                            mb-3
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
                                Executive Portal
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
                            Manage your leads and
                            follow-ups from one place.
                        </p>
                    </div>

                    {/* ==================================================
                        LOGOUT
                    ================================================== */}

                    <button
                        type="button"
                        onClick={handleLogout}
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
                            duration-200
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
                                transition-all
                                duration-200
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
};

export default ExecutiveSidebar;