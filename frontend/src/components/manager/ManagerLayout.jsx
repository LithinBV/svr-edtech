import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import ManagerSidebar from "./ManagerSidebar";
import ManagerNavbar from "./ManagerNavbar";

function ManagerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);

        window.location.reload();
    };

    // Open sidebar on mobile
    const openMobileMenu = () => {
        setSidebarOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb]">
            {/* ================= SIDEBAR ================= */}
            <ManagerSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* ================= MAIN CONTENT ================= */}
            <main className="min-h-screen lg:ml-[252px]">
                {/* ================= NAVBAR ================= */}
                <ManagerNavbar
                    openMobileMenu={openMobileMenu}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {/* ================= PAGE CONTENT ================= */}
                <section className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default ManagerLayout;