import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./ExecutiveIcon";

const ExecutiveNavbar = ({
    setSidebarOpen,
    executiveName,
    profileImage,
    profileInitial,
}) => {
    const navigate = useNavigate();

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    // -----------------------------
    // LOGOUT
    // -----------------------------
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("institutionId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");

        navigate("/login", { replace: true });
    };

    // -----------------------------
    // EDIT PROFILE
    // -----------------------------
    const handleEditProfile = () => {
        setProfileMenuOpen(false);
        navigate("/executive-profile");
    };

    return (
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">

            {/* Left Side */}
            <div className="flex min-w-0 items-center">

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Icon
                        type="menu"
                        className="h-5 w-5"
                    />
                </button>

                {/* Page Title */}
                <div className="min-w-0">
                    <p className="hidden text-xs font-medium text-gray-400 sm:block">
                        Executive
                    </p>

                    <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                        My Dashboard
                    </h1>
                </div>
            </div>

            {/* Right Side */}
            <div className="relative ml-4 flex shrink-0 items-center">

                {/* Profile Button */}
                <button
                    type="button"
                    onClick={() =>
                        setProfileMenuOpen((prev) => !prev)
                    }
                    className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-gray-50"
                    aria-label="Open profile menu"
                >

                    {/* Welcome Text */}
                    <div className="hidden text-right md:block">
                        <p className="text-[11px] font-medium text-gray-400">
                            Welcome back
                        </p>

                        <p className="max-w-[180px] truncate text-sm font-bold text-gray-800">
                            {executiveName}
                        </p>
                    </div>

                    {/* Profile Avatar */}
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white shadow-md ring-2 ring-white">

                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={executiveName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{profileInitial}</span>
                        )}

                    </div>

                    {/* Arrow */}
                    <svg
                        className={`hidden h-4 w-4 text-gray-400 transition-transform duration-200 md:block ${
                            profileMenuOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 9l6 6 6-6"
                        />
                    </svg>

                </button>

                {/* Click Outside */}
                {profileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                    />
                )}

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                    <div className="absolute right-0 top-[58px] z-50 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4 text-white">

                            <div className="flex items-center gap-3">

                                {/* Dropdown Avatar */}
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 font-bold text-white">

                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={executiveName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {profileInitial}
                                        </span>
                                    )}

                                </div>

                                {/* Name */}
                                <div className="min-w-0">
                                    <p className="truncate font-semibold">
                                        {executiveName}
                                    </p>

                                    <p className="mt-0.5 text-xs text-white/70">
                                        Executive
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Dropdown Options */}
                        <div className="p-2">

                            {/* Edit Profile */}
                            <button
                                type="button"
                                onClick={handleEditProfile}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-gray-700 transition hover:bg-gray-100"
                            >

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
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
                                            d="M16.862 3.487a2.1 2.1 0 013 3L8.5 17.85l-4 1 1-4L16.862 3.487z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Edit Profile
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        Update your profile
                                    </p>
                                </div>

                            </button>

                            {/* Divider */}
                            <div className="my-1 border-t border-gray-100" />

                            {/* Logout */}
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-600 transition hover:bg-red-50"
                            >

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
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
                                            d="M10 17l5-5-5-5"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12H3"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 19V5a2 2 0 00-2-2h-6"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">
                                        Logout
                                    </p>

                                    <p className="text-xs text-red-400">
                                        Sign out of your account
                                    </p>
                                </div>

                            </button>

                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default ExecutiveNavbar;