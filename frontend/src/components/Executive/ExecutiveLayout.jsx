import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import ExecutiveSidebar from "./ExecutiveSidebar";
import ExecutiveNavbar from "./ExecutiveNavbar";

const ExecutiveLayout = () => {
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ============================================================
    // EXECUTIVE PROFILE
    // ============================================================

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

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
    // FETCH EXECUTIVE PROFILE
    // ============================================================

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const token = getStoredToken();

                if (!token) {
                    setProfileLoading(false);
                    return;
                }

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

                const data = await response.json();

                if (response.ok && data.success) {
                    setProfile(data.user);
                } else {
                    console.error(
                        "Failed to fetch executive profile:",
                        data
                    );
                }
            } catch (error) {
                console.error(
                    "Executive profile fetch error:",
                    error
                );
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
    }, []);

    // ============================================================
    // EXECUTIVE USER DETAILS
    // ============================================================

    const executiveName =
        profile?.name ||
        localStorage.getItem("executiveUserName") ||
        localStorage.getItem("userName") ||
        "Executive";

    const profileImage =
        profile?.profileImage ||
        localStorage.getItem("executiveProfileImage") ||
        localStorage.getItem("profileImage") ||
        "";

    const profileInitial = useMemo(() => {
        return (
            executiveName
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || "E"
        );
    }, [executiveName]);

    // ============================================================
    // SIDEBAR STATS
    // ============================================================

    const [stats] = useState({
        total: 0,
        upcoming: 0,
    });

    // ============================================================
    // NAVIGATION
    // ============================================================

    const handleMyLeads = () => {
        setSidebarOpen(false);
        navigate("/executive-leads");
    };

    const handleFollowUps = () => {
        setSidebarOpen(false);
        navigate("/executive-follow-ups");
    };

    const handleProfile = () => {
        setSidebarOpen(false);
        navigate("/executive-profile");
    };

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        // Executive-specific storage
        localStorage.removeItem("executiveToken");
        localStorage.removeItem("executiveRefreshToken");
        localStorage.removeItem("executiveUserType");
        localStorage.removeItem("executiveUserName");
        localStorage.removeItem("executiveInstitutionId");
        localStorage.removeItem("executiveProfileImage");

        // Generic storage
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("authToken");

        localStorage.removeItem("userType");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("institutionId");
        localStorage.removeItem("profileImage");

        setSidebarOpen(false);

        navigate("/login", {
            replace: true,
        });
    };

    // ============================================================
    // LAYOUT
    // ============================================================

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            {/* ==================================================
                SHARED EXECUTIVE SIDEBAR
            ================================================== */}

            <ExecutiveSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                executiveName={executiveName}
                profileImage={profileImage}
                profileInitial={profileInitial}
                stats={stats}
                handleMyLeads={handleMyLeads}
                handleFollowUps={handleFollowUps}
                handleProfile={handleProfile}
                handleLogout={handleLogout}
            />

            {/* ==================================================
                MAIN AREA
            ================================================== */}

            <main className="min-h-screen lg:ml-[252px]">

                {/* ==================================================
                    SHARED EXECUTIVE NAVBAR
                ================================================== */}

                <ExecutiveNavbar
                    setSidebarOpen={setSidebarOpen}
                    executiveName={executiveName}
                    profileImage={profileImage}
                    profileInitial={profileInitial}
                />

                {/* ==================================================
                    PAGE CONTENT
                ================================================== */}

                <Outlet />

            </main>
        </div>
    );
};

export default ExecutiveLayout;