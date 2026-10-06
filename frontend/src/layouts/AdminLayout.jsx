import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminNavbar from "../components/Admin/AdminNavbar";

const API_URL = import.meta.env.VITE_API_URL;


function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // ==========================================
    // STATE
    // ==========================================

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    // ==========================================
    // PROFILE STATE
    // ==========================================

    const [profile, setProfile] = useState(null);

    // ==========================================
    // AUTH CHECK
    // ==========================================

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");

        if (!token) {
            navigate("/login", {
                replace: true,
            });
            return;
        }

        if (userType !== "SUPER_ADMIN") {
            if (userType === "INSTITUTION_ADMIN") {
                navigate("/institution-admin-dashboard", {
                    replace: true,
                });
            } else {
                localStorage.clear();

                navigate("/login", {
                    replace: true,
                });
            }
        }
    }, [navigate]);

    // ==========================================
    // FETCH SUPER ADMIN PROFILE
    // ==========================================

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    return;
                }

                const response = await fetch(`${API_URL}/api/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();

                console.log("Admin profile:", data);

                setProfile(data.user || data);
            } catch (error) {
                console.error(
                    "Error fetching admin profile:",
                    error
                );
            }
        };

        fetchProfile();
    }, []);

    // ==========================================
    // PROFILE DATA
    // ==========================================

    const profileName =
        profile?.name ||
        localStorage.getItem("userName") ||
        "Super Admin";

    const profileImage =
        profile?.profileImage || null;

    const profileInitial =
        profileName?.charAt(0)?.toUpperCase() || "S";

    // ==========================================
    // SIDEBAR MENU
    // ==========================================

    function toggleMenu(menuName) {
        setSidebarCollapsed(false);

        setOpenMenu((current) =>
            current === menuName ? null : menuName
        );
    }

    // ==========================================
    // MOBILE MENU
    // ==========================================

    function openMobileMenu() {
        setSidebarCollapsed(false);
        setMobileMenuOpen(true);
    }

    function closeMobileMenu() {
        setMobileMenuOpen(false);
    }

    // ==========================================
    // LOGOUT
    // ==========================================

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("institutionId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");

        navigate("/login", {
            replace: true,
        });
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    function handleNavigation(path) {
        if (!path) {
            return;
        }

        console.log("Navigating to:", path);

        // Close mobile sidebar
        setMobileMenuOpen(false);

        // Navigate using React Router
        navigate(path);
    }

    // ==========================================
    // ACTIVE LINK
    // ==========================================

    function isActive(path) {
        const currentPath = location.pathname;

        // Dashboard
        if (path === "/admin-dashboard") {
            return (
                currentPath === "/admin-dashboard" ||
                currentPath === "/admin"
            );
        }

        // Analytics parent
        if (path === "/analytics") {
            return (
                currentPath === "/analytics" ||
                currentPath === "/analytics/date-wise" ||
                currentPath === "/analytics/source-wise" ||
                currentPath === "/analytics/program-wise" ||
                currentPath === "/analytics/user-wise"
            );
        }

        // Exact match for all other routes
        return currentPath === path;
    }

    // ==========================================
    // AUTOMATICALLY OPEN SIDEBAR MENU
    // ==========================================

    useEffect(() => {
        const path = location.pathname;

        if (
            path === "/all-leads" ||
            path === "/new-leads" ||
            path === "/hot-leads" ||
            path === "/warm-leads" ||
            path === "/cold-leads" ||
            path === "/missed-leads" ||
            path === "/add-lead" ||
            path === "/bulk-upload-leads"
        ) {
            setOpenMenu("leads");
        } else if (
            path === "/add-user" ||
            path === "/view-users" ||
            path === "/teams" ||
            path === "/performance"
        ) {
            setOpenMenu("users");
        } else if (
            path === "/follow-ups" ||
            path === "/today-follow-ups" ||
            path === "/upcoming-follow-ups" ||
            path === "/overdue-follow-ups" ||
            path === "/completed-follow-ups"
        ) {
            setOpenMenu("followups");
        } else if (
            path === "/analytics" ||
            path === "/analytics/date-wise" ||
            path === "/analytics/source-wise" ||
            path === "/analytics/program-wise" ||
            path === "/analytics/user-wise"
        ) {
            setOpenMenu("analytics");
        } else if (
            path === "/create-institution" ||
            path === "/settings/lead-sources" ||
            path === "/settings/lead-stages" ||
            path === "/settings/roles" ||
            path === "/settings/view"
        ) {
            setOpenMenu("settings");
        }
    }, [location.pathname]);

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="min-h-screen bg-[#F4F7FA]">

            {/* ==========================================
                ADMIN SIDEBAR
            ========================================== */}

            <AdminSidebar
                sidebarCollapsed={sidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setSidebarCollapsed={setSidebarCollapsed}
                setMobileMenuOpen={setMobileMenuOpen}
                openMenu={openMenu}
                toggleMenu={toggleMenu}
                closeMobileMenu={closeMobileMenu}
                handleLogout={handleLogout}
                handleNavigation={handleNavigation}
                isActive={isActive}
                profileName={profileName}
                profileImage={profileImage}
                profileInitial={profileInitial}
            />

            {/* ==========================================
                MAIN CONTENT AREA
            ========================================== */}

            <div
                className={`
                    min-h-screen
                    transition-all
                    duration-300
                    ${
                        sidebarCollapsed
                            ? "md:ml-[78px]"
                            : "md:ml-[252px]"
                    }
                `}
            >

                {/* ==========================================
                    ADMIN NAVBAR
                ========================================== */}

                <AdminNavbar
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    openMobileMenu={openMobileMenu}
                    profileName={profileName}
                    profileImage={profileImage}
                    profileInitial={profileInitial}
                />

                {/* ==========================================
                    PAGE CONTENT
                ========================================== */}

                <main className="min-h-[calc(100vh-76px)]">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default AdminLayout;