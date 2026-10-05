import React from "react";

const TeamManager = ({ manager }) => {

    // ==========================================
    // NO MANAGER
    // ==========================================

    if (!manager) {

        return (
            <div className="rounded-lg bg-slate-50 px-3 py-3">

                <p className="text-sm text-slate-400">
                    No manager assigned
                </p>

            </div>
        );
    }


    // ==========================================
    // GET FIRST LETTER
    // ==========================================

    const firstLetter =
        manager.name
            ?.charAt(0)
            ?.toUpperCase() || "M";


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="flex items-center gap-3">

            {/* AVATAR */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">

                {firstLetter}

            </div>


            {/* DETAILS */}

            <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-slate-800">
                    {manager.name || "Unknown Manager"}
                </p>

                <p className="truncate text-xs text-slate-400">
                    {manager.email || "No email"}
                </p>

            </div>

        </div>
    );
};

export default TeamManager;