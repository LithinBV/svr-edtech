import React from "react";

const TeamExecutiveList = ({
    executives = [],
    teamId,
    removingExecutive,
    onRemoveExecutive
}) => {

    // ==========================================
    // NO EXECUTIVES
    // ==========================================

    if (executives.length === 0) {

        return (

            <div className="rounded-lg bg-slate-50 px-3 py-3">

                <p className="text-sm text-slate-400">
                    No executives assigned
                </p>

            </div>

        );
    }


    // ==========================================
    // EXECUTIVE LIST
    // ==========================================

    return (

        <div className="space-y-2">

            {executives.map((executive) => {

                const executiveId =
                    executive._id ||
                    executive.id;

                const firstLetter =
                    executive.name
                        ?.charAt(0)
                        ?.toUpperCase() || "E";

                const isRemoving =
                    removingExecutive ===
                    executiveId;


                return (

                    <div
                        key={executiveId}
                        className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
                    >

                        {/* ==================================
                            AVATAR
                        ================================== */}

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">

                            {firstLetter}

                        </div>


                        {/* ==================================
                            USER DETAILS
                        ================================== */}

                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium text-slate-700">
                                {executive.name || "Unknown Executive"}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                {executive.email || "No email"}
                            </p>

                        </div>


                        {/* ==================================
                            REMOVE BUTTON
                        ================================== */}

                        <button
                            type="button"
                            disabled={isRemoving}
                            onClick={() =>
                                onRemoveExecutive(
                                    teamId,
                                    executiveId,
                                    executive.name
                                )
                            }
                            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {isRemoving
                                ? "Removing..."
                                : "Remove"}

                        </button>

                    </div>

                );

            })}

        </div>

    );
};

export default TeamExecutiveList;