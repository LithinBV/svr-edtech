import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminNavbar({
  sidebarCollapsed,
  setSidebarCollapsed,
  openMobileMenu,
}) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        setProfile(data.user || data);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const profileName =
    profile?.name ||
    localStorage.getItem("userName") ||
    "Super Admin";

  const profileImage = profile?.profileImage;

  const profileInitial =
    profileName?.charAt(0)?.toUpperCase() || "S";

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
    navigate("/profile");
  };

  return (
    <header className="h-[76px] bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-7 sticky top-0 z-30">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={() =>
            setSidebarCollapsed((prev) => !prev)
          }
          className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition"
          title={
            sidebarCollapsed
              ? "Expand Sidebar"
              : "Collapse Sidebar"
          }
        >
          <svg
            className="w-5 h-5"
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
        </button>

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={openMobileMenu}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition"
          title="Open Menu"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#102236]">
            Super Admin Dashboard
          </h1>

          <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
            Manage your platform
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative">

        {/* PROFILE BUTTON */}
        <button
          type="button"
          onClick={() =>
            setProfileMenuOpen((prev) => !prev)
          }
          className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition"
        >

          {/* Avatar */}
          {profileImage ? (
            <img
              src={profileImage}
              alt={profileName}
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#102236] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {profileInitial}
            </div>
          )}

          {/* User Info */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              {profileName}
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              Super Admin
            </p>
          </div>

          {/* Arrow */}
          <svg
            className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
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

        {/* PROFILE DROPDOWN */}
        {profileMenuOpen && (
          <>
            {/* Click outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setProfileMenuOpen(false)}
            />

            <div className="absolute right-0 top-[58px] w-64 bg-white rounded-2xl border border-gray-200 shadow-xl z-50 overflow-hidden">

              {/* Profile Header */}
              <div className="px-4 py-4 bg-[#102236] text-white">

                <div className="flex items-center gap-3">

                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={profileName}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                      {profileInitial}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {profileName}
                    </p>

                    <p className="text-xs text-white/60 mt-0.5">
                      Super Admin
                    </p>
                  </div>

                </div>

              </div>

              {/* Menu */}
              <div className="p-2">

                {/* Edit Profile */}
                <button
                  type="button"
                  onClick={handleEditProfile}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
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
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
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
          </>
        )}
      </div>
    </header>
  );
}

export default AdminNavbar;