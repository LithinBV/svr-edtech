import React from "react";

const CreateTeamModal = ({
    show,
    teamName,
    selectedManager,
    selectedExecutives,
    managers,
    executives,
    saving,
    error,
    onClose,
    onSubmit,
    onTeamNameChange,
    onManagerChange,
    onExecutiveChange
}) => {

    if (!show) {
        return null;
    }


    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

                    <div>

                        <h2 className="text-lg font-bold text-slate-900">
                            Create Team
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Create a team and assign members.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        ×
                    </button>

                </div>


                {/* ======================================
                    FORM
                ====================================== */}

                <form
                    onSubmit={onSubmit}
                    className="p-6"
                >

                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        TEAM NAME
                    ================================== */}

                    <div className="mb-5">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Team Name
                        </label>


                        <input
                            type="text"
                            value={teamName}
                            onChange={(event) =>
                                onTeamNameChange(
                                    event.target.value
                                )
                            }
                            placeholder="Enter team name"
                            disabled={saving}
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                        />

                    </div>


                    {/* ==================================
                        MANAGER
                    ================================== */}

                    <div className="mb-5">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Manager
                        </label>


                        <select
                            value={selectedManager}
                            onChange={(event) =>
                                onManagerChange(
                                    event.target.value
                                )
                            }
                            disabled={saving}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                        >

                            <option value="">
                                Select Manager
                            </option>


                            {managers.map(
                                (manager) => {

                                    const managerId =
                                        manager.id ||
                                        manager._id;


                                    return (

                                        <option
                                            key={managerId}
                                            value={managerId}
                                        >
                                            {manager.name}
                                            {" — "}
                                            {manager.email}
                                        </option>

                                    );

                                }
                            )}

                        </select>


                        {managers.length === 0 && (

                            <p className="mt-1.5 text-xs text-slate-400">
                                No managers available.
                            </p>

                        )}


                        {managers.length > 0 && (

                            <p className="mt-1.5 text-xs text-slate-400">
                                Managers can be assigned to multiple teams.
                            </p>

                        )}

                    </div>


                    {/* ==================================
                        EXECUTIVES
                    ================================== */}

                    <div className="mb-6">

                        <div className="mb-2 flex items-center justify-between">

                            <label className="block text-sm font-semibold text-slate-700">
                                Executives
                            </label>


                            <span className="text-xs font-medium text-slate-400">

                                {selectedExecutives.length}
                                {" "}
                                selected

                            </span>

                        </div>


                        {executives.length > 0 ? (

                            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2">

                                {executives.map(
                                    (executive) => {

                                        const executiveId =
                                            executive.id ||
                                            executive._id;


                                        const isSelected =
                                            selectedExecutives.includes(
                                                executiveId
                                            );


                                        const firstLetter =
                                            executive.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                            "E";


                                        return (

                                            <label
                                                key={executiveId}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 transition ${
                                                    isSelected
                                                        ? "bg-indigo-50"
                                                        : "hover:bg-white"
                                                }`}
                                            >

                                                {/* CHECKBOX */}

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        isSelected
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                    onChange={() =>
                                                        onExecutiveChange(
                                                            executiveId
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />


                                                {/* AVATAR */}

                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm">

                                                    {firstLetter}

                                                </div>


                                                {/* DETAILS */}

                                                <div className="min-w-0 flex-1">

                                                    <p className="truncate text-sm font-medium text-slate-700">
                                                        {executive.name || "Unknown Executive"}
                                                    </p>

                                                    <p className="truncate text-xs text-slate-400">
                                                        {executive.email || "No email"}
                                                    </p>

                                                </div>

                                            </label>

                                        );

                                    }
                                )}

                            </div>

                        ) : (

                            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">

                                <p className="text-sm font-medium text-slate-500">
                                    No available executives
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Executives already assigned to a team are hidden.
                                </p>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        BUTTONS
                    ================================== */}

                    <div className="flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {saving
                                ? "Creating..."
                                : "Create Team"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
};

export default CreateTeamModal;