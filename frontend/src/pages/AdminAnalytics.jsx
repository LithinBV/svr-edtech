import React, { useEffect, useState } from "react";

import AnalyticsOverview from "../components/Admin/Analytics/AnalyticsOverview";
import AnalyticsDateWise from "../components/Admin/Analytics/AnalyticsDateWise";
import AnalyticsSourceWise from "../components/Admin/Analytics/AnalyticsSourceWise";
import AnalyticsProgramWise from "../components/Admin/Analytics/AnalyticsProgramWise";
import AnalyticsUserWise from "../components/Admin/Analytics/AnalyticsUserWise";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");

/* ============================================================
   ICON
============================================================ */

const Icon = ({ type, size = 20 }) => {
    const common = {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    const icons = {
        chart: (
            <svg {...common}>
                <line x1="4" y1="19" x2="4" y2="5" />
                <line x1="4" y1="19" x2="20" y2="19" />
                <polyline points="7 15 11 11 14 13 19 7" />
            </svg>
        ),

        refresh: (
            <svg {...common}>
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.5 9a9 9 0 0 1 14.1-3.4L23 10" />
                <path d="M20.5 15a9 9 0 0 1-14.1 3.4L1 14" />
            </svg>
        ),

        alert: (
            <svg {...common}>
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
                <path d="M10.3 3.3 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
            </svg>
        ),

        overview: (
            <svg {...common}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
        ),

        calendar: (
            <svg {...common}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
        ),

        source: (
            <svg {...common}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3v9l6 6" />
            </svg>
        ),

        program: (
            <svg {...common}>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
            </svg>
        ),

        users: (
            <svg {...common}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    };

    return icons[type] || null;
};


/* ============================================================
   TABS
============================================================ */

const tabs = [
    {
        id: "overview",
        label: "Overview",
        icon: "overview",
    },
    {
        id: "date-wise",
        label: "Date Wise",
        icon: "calendar",
    },
    {
        id: "source-wise",
        label: "Source Wise",
        icon: "source",
    },
    {
        id: "program-wise",
        label: "Program Wise",
        icon: "program",
    },
    {
        id: "user-wise",
        label: "User Wise",
        icon: "users",
    },
];


/* ============================================================
   MAIN ADMIN ANALYTICS
============================================================ */

const AdminAnalytics = ({ view = "overview" }) => {

    /* ========================================================
       TAB
    ======================================================== */

    const [activeTab, setActiveTab] = useState(view);

    useEffect(() => {
        setActiveTab(view);
    }, [view]);


    /* ========================================================
       COMMON STATE

       DEFAULT = THIS MONTH
    ======================================================== */

    const [range, setRange] = useState("month");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [refreshing, setRefreshing] = useState(false);


    /* ========================================================
       ANALYTICS DATA
    ======================================================== */

    const [analytics, setAnalytics] = useState(null);

    const [dateData, setDateData] = useState([]);

    const [sourceData, setSourceData] = useState([]);

    const [programData, setProgramData] = useState([]);

    const [userData, setUserData] = useState([]);


    /* ========================================================
       FETCH HELPER
    ======================================================== */

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    };


    const getHeaders = () => {
        const token = getToken();

        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };


    /* ========================================================
       GENERIC API FETCH
    ======================================================== */

    const fetchJson = async (url) => {

        const response = await fetch(url, {
            headers: getHeaders(),
        });

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        if (!response.ok || !result?.success) {
            throw new Error(
                result?.message ||
                `Request failed: ${response.status}`
            );
        }

        return result;
    };


    /* ========================================================
       FETCH OVERVIEW
    ======================================================== */

    const fetchOverview = async () => {

        const result = await fetchJson(
            `${API_BASE}/api/analytics/overview?range=${range}`
        );

        setAnalytics(result.data || null);
    };


    /* ========================================================
       FETCH DATE WISE
    ======================================================== */

    const fetchDateWise = async () => {

        const result = await fetchJson(
            `${API_BASE}/api/analytics/date-wise?range=${range}`
        );

        setDateData(
            Array.isArray(result.data)
                ? result.data
                : []
        );
    };


    /* ========================================================
       FETCH SOURCE WISE
    ======================================================== */

    const fetchSourceWise = async () => {

        try {

            const result = await fetchJson(
                `${API_BASE}/api/analytics/source-wise?range=${range}`
            );

            setSourceData(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );

        } catch (err) {

            console.warn(
                "Source-wise analytics:",
                err.message
            );

            setSourceData([]);
        }
    };


    /* ========================================================
       FETCH PROGRAM WISE
    ======================================================== */

    const fetchProgramWise = async () => {

        try {

            const result = await fetchJson(
                `${API_BASE}/api/analytics/program-wise?range=${range}`
            );

            setProgramData(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );

        } catch (err) {

            console.warn(
                "Program-wise analytics:",
                err.message
            );

            setProgramData([]);
        }
    };


    /* ========================================================
       FETCH USER WISE
    ======================================================== */

    const fetchUserWise = async () => {

        try {

            const result = await fetchJson(
                `${API_BASE}/api/analytics/user-wise?range=${range}`
            );

            setUserData(
                Array.isArray(result.data)
                    ? result.data
                    : []
            );

        } catch (err) {

            console.warn(
                "User-wise analytics:",
                err.message
            );

            setUserData([]);
        }
    };


    /* ========================================================
       FETCH ALL DATA
    ======================================================== */

    const fetchAnalytics = async (showLoader = true) => {

        try {

            if (showLoader) {
                setLoading(true);
            }

            setRefreshing(true);
            setError("");

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Please login again."
                );
            }

            await Promise.all([
                fetchOverview(),
                fetchDateWise(),
                fetchSourceWise(),
                fetchProgramWise(),
                fetchUserWise(),
            ]);

        } catch (err) {

            console.error(
                "Analytics error:",
                err
            );

            setError(
                err.message ||
                "Failed to load analytics"
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    /* ========================================================
       INITIAL LOAD + RANGE CHANGE
    ======================================================== */

    useEffect(() => {

        fetchAnalytics(true);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range]);


    /* ========================================================
       TAB CHANGE
    ======================================================== */

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };


    /* ========================================================
       LOADING SCREEN
    ======================================================== */

    if (loading) {

        return (
            <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6">

                <div className="text-center">

                    <div className="w-14 h-14 border-4 border-slate-200 border-t-[#102236] rounded-full animate-spin mx-auto" />

                    <p className="text-sm font-bold text-[#102236] mt-5">
                        Loading analytics...
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                        Preparing your dashboard
                    </p>

                </div>

            </div>
        );
    }


    /* ========================================================
       ERROR SCREEN
    ======================================================== */

    if (error) {

        return (
            <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6">

                <div className="bg-white rounded-3xl border border-red-200 shadow-lg p-8 max-w-md w-full text-center">

                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">

                        <Icon
                            type="alert"
                            size={28}
                        />

                    </div>

                    <h2 className="text-xl font-black text-slate-900 mt-5">
                        Analytics couldn't load
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={() => fetchAnalytics(true)}
                        className="mt-6 px-6 py-3 rounded-xl bg-[#102236] text-white text-sm font-bold hover:bg-[#1a344e] transition"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    /* ========================================================
       MAIN PAGE
    ======================================================== */

    return (

        <div className="min-h-screen bg-[#f4f7fb] p-3 sm:p-5 lg:p-7">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="relative overflow-hidden bg-[#102236] rounded-[28px] p-5 sm:p-7 lg:p-8 mb-6 shadow-[0_18px_45px_rgba(16,34,54,0.16)]">

                <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-[#F6C945]/10" />

                <div className="absolute right-20 -bottom-28 w-52 h-52 rounded-full bg-blue-400/10" />

                <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                    <div>

                        <div className="flex items-center gap-2 text-[11px] font-black text-[#F6C945] uppercase tracking-[0.2em]">

                            <span className="w-2 h-2 rounded-full bg-[#F6C945]" />

                            Analytics

                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-2">
                            Lead Analytics
                        </h1>

                        <p className="text-sm text-slate-300 mt-2">
                            Track leads, follow-ups and conversion performance.
                        </p>

                    </div>


                    {/* HEADER ACTIONS */}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                        {/* RANGE */}

                        <div className="relative">

                            <select
                                value={range}
                                onChange={(e) =>
                                    setRange(e.target.value)
                                }
                                className="w-full sm:w-auto appearance-none bg-white/10 border border-white/15 rounded-xl px-4 py-3 pr-10 text-sm font-bold text-white outline-none cursor-pointer focus:border-[#F6C945] transition"
                            >

                                <option
                                    value="today"
                                    className="text-slate-900"
                                >
                                    Today
                                </option>

                                <option
                                    value="7days"
                                    className="text-slate-900"
                                >
                                    Last 7 Days
                                </option>

                                <option
                                    value="15days"
                                    className="text-slate-900"
                                >
                                    Last 15 Days
                                </option>

                                <option
                                    value="30days"
                                    className="text-slate-900"
                                >
                                    Last 30 Days
                                </option>

                                <option
                                    value="7weeks"
                                    className="text-slate-900"
                                >
                                    Last 7 Weeks
                                </option>

                                <option
                                    value="3months"
                                    className="text-slate-900"
                                >
                                    Last 3 Months
                                </option>

                                <option
                                    value="6months"
                                    className="text-slate-900"
                                >
                                    Last 6 Months
                                </option>

                                <option
                                    value="month"
                                    className="text-slate-900"
                                >
                                    This Month
                                </option>

                                <option
                                    value="year"
                                    className="text-slate-900"
                                >
                                    This Year
                                </option>

                                <option
                                    value="lastyear"
                                    className="text-slate-900"
                                >
                                    Last Year
                                </option>

                            </select>

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                                ▼
                            </span>

                        </div>


                        {/* REFRESH */}

                        <button
                            onClick={() => fetchAnalytics(false)}
                            disabled={refreshing}
                            className="h-12 px-4 rounded-xl bg-[#F6C945] text-[#102236] flex items-center justify-center gap-2 font-black text-sm hover:bg-[#ffd95a] transition disabled:opacity-60"
                        >

                            <span
                                className={
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            >
                                <Icon
                                    type="refresh"
                                    size={18}
                                />
                            </span>

                            <span className="hidden sm:inline">
                                Refresh
                            </span>

                        </button>

                    </div>

                </div>

            </div>


            {/* =================================================
                TABS
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-2xl p-1.5 mb-6 shadow-sm overflow-x-auto">

                <div className="flex min-w-max gap-1">

                    {tabs.map((tab) => {

                        const active =
                            activeTab === tab.id;

                        return (

                            <button
                                key={tab.id}
                                onClick={() =>
                                    handleTabChange(tab.id)
                                }
                                className={`
                                    relative
                                    flex
                                    items-center
                                    gap-2
                                    px-4 sm:px-5
                                    py-3
                                    rounded-xl
                                    text-sm
                                    font-bold
                                    transition-all
                                    duration-200
                                    ${
                                        active
                                            ? "bg-[#102236] text-[#F6C945] shadow-sm"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-[#102236]"
                                    }
                                `}
                            >

                                <Icon
                                    type={tab.icon}
                                    size={17}
                                />

                                {tab.label}

                            </button>

                        );

                    })}

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div>

                {/* OVERVIEW */}

                {activeTab === "overview" && (

                    <AnalyticsOverview
                        analytics={analytics || {}}
                        dateData={dateData}
                    />

                )}


                {/* DATE WISE */}

                {activeTab === "date-wise" && (

                    <AnalyticsDateWise
                        data={dateData}
                        range={range}
                    />

                )}


                {/* SOURCE WISE */}

                {activeTab === "source-wise" && (

                    <AnalyticsSourceWise
                        data={sourceData}
                    />

                )}


                {/* PROGRAM WISE */}

                {activeTab === "program-wise" && (

                    <AnalyticsProgramWise
                        data={programData}
                    />

                )}


                {/* USER WISE */}

                {activeTab === "user-wise" && (

                    <AnalyticsUserWise
                        data={userData}
                    />

                )}

            </div>

        </div>
    );
};


export default AdminAnalytics;