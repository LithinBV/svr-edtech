import React from "react";

const EditTeamModal = ({
    show,
    editingTeam,
    editTeamName,
    editManager,
    editSelectedExecutives,
    managers,
    executives,
    saving,
    error,
    onClose,
    onSubmit,
    onTeamNameChange,
    onManagerChange,
    onExecutiveChange,
}) => {
    // ==========================================
    // MODAL NOT VISIBLE
    // ==========================================

    if (!show || !editingTeam) {
        return null;
    }

    // ==========================================
    // GET USER ID
    // ==========================================

    const getUserId = (user) => {
        if (!user) {
            return "";
        }

        if (typeof user === "string") {
            return user;
        }

        return String(
            user._id ||
                user.id ||
                ""
        );
    };

    // ==========================================
    // CURRENT EXECUTIVES
    // ==========================================

    const currentExecutives =
        Array.isArray(editingTeam.executives)
            ? editingTeam.executives
            : [];

    // ==========================================
    // CURRENT EXECUTIVE IDS
    // ==========================================

    const currentIds =
        currentExecutives
            .map((executive) =>
                getUserId(executive)
            )
            .filter(Boolean);

    // ==========================================
    // AVAILABLE EXECUTIVES
    // ==========================================

    const availableExecutives =
        Array.isArray(executives)
            ? executives
            : [];

    // ==========================================
    // COMBINE EXECUTIVES
    // ==========================================

    const executiveMap = new Map();

    currentExecutives.forEach(
        (executive) => {
            const id =
                getUserId(executive);

            if (id) {
                executiveMap.set(
                    id,
                    executive
                );
            }
        }
    );

    availableExecutives.forEach(
        (executive) => {
            const id =
                getUserId(executive);

            if (id) {
                executiveMap.set(
                    id,
                    executive
                );
            }
        }
    );

    const editExecutives =
        Array.from(
            executiveMap.values()
        );

    // ==========================================
    // SAFE SELECTED EXECUTIVES
    // ==========================================

    const selectedExecutives =
        Array.isArray(
            editSelectedExecutives
        )
            ? editSelectedExecutives.map(
                  (id) => String(id)
              )
            : [];

    // ==========================================
    // INITIALS
    // ==========================================

    const getInitials = (
        name = ""
    ) => {
        return (
            name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) =>
                    part
                        .charAt(0)
                        .toUpperCase()
                )
                .join("") || "U"
        );
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#102236]/70 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            {/* ======================================
                MODAL
            ====================================== */}

            <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_80px_rgba(16,34,54,0.28)]">

                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="relative overflow-hidden bg-[#102236] px-5 py-5 sm:px-7 sm:py-6">

                    {/* Decorative circle */}

                    <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full border-[28px] border-white/[0.04]" />

                    <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-[#F6C945]/[0.06] blur-3xl" />

                    <div className="relative flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-4">

                            {/* ICON */}

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F6C945] text-[#102236] shadow-lg">

                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        d="M12 20h9"
                                        strokeLinecap="round"
                                    />

                                    <path
                                        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                            </div>

                            {/* TITLE */}

                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                                        Edit Team
                                    </h2>

                                    <span className="rounded-full bg-[#F6C945]/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-[#F6C945]">
                                        Management
                                    </span>

                                </div>

                                <p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                                    Update the team name, manager and executives.
                                </p>

                            </div>

                        </div>

                        {/* CLOSE */}

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl leading-none text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            ×
                        </button>

                    </div>

                    {/* TEAM NAME PREVIEW */}

                    <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F6C945]/10 text-[#F6C945]">

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                    strokeLinecap="round"
                                />

                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path
                                    d="M22 21v-2a4 4 0 0 0-3-3.87"
                                    strokeLinecap="round"
                                />

                                <path
                                    d="M16 3.13a4 4 0 0 1 0 7.75"
                                    strokeLinecap="round"
                                />
                            </svg>

                        </div>

                        <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Editing
                            </p>

                            <p className="truncate text-sm font-bold text-white">
                                {editingTeam.name ||
                                    "Team"}
                            </p>

                        </div>

                    </div>

                </div>

                {/* ======================================
                    FORM
                ====================================== */}

                <form
                    onSubmit={onSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >

                    {/* SCROLL AREA */}

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">

                        {/* ==================================
                            ERROR
                        ================================== */}

                        {error && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">

                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="h-4 w-4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path
                                            d="M12 8v4"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M12 16h.01"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs font-extrabold text-red-800">
                                        Unable to update team
                                    </p>

                                    <p className="mt-0.5 text-xs leading-5 text-red-700">
                                        {error}
                                    </p>

                                </div>

                            </div>
                        )}

                        {/* ==================================
                            TEAM INFORMATION
                        ================================== */}

                        <div className="mb-6">

                            <div className="mb-3 flex items-center gap-2">

                                <span className="h-2 w-2 rounded-full bg-[#F6C945]" />

                                <h3 className="text-sm font-extrabold text-[#102236]">
                                    Team Information
                                </h3>

                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">

                                {/* TEAM NAME */}

                                <div>

                                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#102236]">
                                        Team Name
                                    </label>

                                    <div className="relative">

                                        <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400">

                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-4 w-4"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >
                                                <path
                                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                                    strokeLinecap="round"
                                                />

                                                <circle
                                                    cx="9"
                                                    cy="7"
                                                    r="4"
                                                />

                                                <path
                                                    d="M22 21v-2a4 4 0 0 0-3-3.87"
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                        </div>

                                        <input
                                            type="text"
                                            value={
                                                editTeamName
                                            }
                                            onChange={(event) =>
                                                onTeamNameChange(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter team name"
                                            disabled={
                                                saving
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[#102236] outline-none transition placeholder:text-slate-400 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        />

                                    </div>

                                </div>

                                {/* MANAGER */}

                                <div className="mt-4">

                                    <div className="mb-2 flex items-center justify-between">

                                        <label className="block text-xs font-extrabold uppercase tracking-wide text-[#102236]">
                                            Team Manager
                                        </label>

                                        <span className="text-[10px] font-semibold text-slate-400">
                                            One manager
                                        </span>

                                    </div>

                                    <div className="relative">

                                        <select
                                            value={
                                                editManager
                                            }
                                            onChange={(event) =>
                                                onManagerChange(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-[#102236] outline-none transition focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
                                        >

                                            <option value="">
                                                Select Manager
                                            </option>

                                            {Array.isArray(
                                                managers
                                            ) &&
                                                managers.map(
                                                    (manager) => {

                                                        const managerId =
                                                            getUserId(
                                                                manager
                                                            );

                                                        if (
                                                            !managerId
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <option
                                                                key={
                                                                    managerId
                                                                }
                                                                value={
                                                                    managerId
                                                                }
                                                            >
                                                                {manager.name ||
                                                                    "Unknown Manager"}
                                                                {" — "}
                                                                {manager.email ||
                                                                    "No email"}
                                                            </option>
                                                        );
                                                    }
                                                )}

                                        </select>

                                        {/* ARROW */}

                                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">

                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="h-4 w-4"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    d="m6 9 6 6 6-6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>

                                        </div>

                                    </div>

                                    <p className="mt-2 text-[11px] text-slate-400">
                                        Select the manager responsible for this team.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* ==================================
                            EXECUTIVES
                        ================================== */}

                        <div>

                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <span className="h-2 w-2 rounded-full bg-[#F6C945]" />

                                        <h3 className="text-sm font-extrabold text-[#102236]">
                                            Team Executives
                                        </h3>

                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Select the executives assigned to this team.
                                    </p>

                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-full bg-[#102236] px-3 py-1.5">

                                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300">
                                        Selected
                                    </span>

                                    <span className="text-xs font-extrabold text-[#F6C945]">
                                        {selectedExecutives.length}
                                    </span>

                                </div>

                            </div>

                            {/* EXECUTIVE LIST */}

                            {editExecutives.length > 0 ? (

                                <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2.5">

                                    {editExecutives.map(
                                        (executive) => {

                                            const executiveId =
                                                getUserId(
                                                    executive
                                                );

                                            if (
                                                !executiveId
                                            ) {
                                                return null;
                                            }

                                            const isCurrent =
                                                currentIds.includes(
                                                    executiveId
                                                );

                                            const isSelected =
                                                selectedExecutives.includes(
                                                    executiveId
                                                );

                                            const name =
                                                executive.name ||
                                                "Unknown Executive";

                                            const initials =
                                                getInitials(
                                                    name
                                                );

                                            return (
                                                <label
                                                    key={
                                                        executiveId
                                                    }
                                                    className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200 ${
                                                        isSelected
                                                            ? "border-[#F6C945] bg-[#FFFBE8] shadow-sm"
                                                            : "border-transparent bg-white hover:border-slate-200 hover:shadow-sm"
                                                    }`}
                                                >

                                                    {/* CHECKBOX */}

                                                    <div
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                                            isSelected
                                                                ? "border-[#F6C945] bg-[#F6C945]"
                                                                : "border-slate-300 bg-white"
                                                        }`}
                                                    >

                                                        {isSelected && (
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                className="h-3.5 w-3.5 text-[#102236]"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                            >
                                                                <path
                                                                    d="m5 12 4 4L19 6"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        )}

                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isSelected
                                                            }
                                                            disabled={
                                                                saving
                                                            }
                                                            onChange={() => {
                                                                onExecutiveChange(
                                                                    executiveId
                                                                );
                                                            }}
                                                            className="sr-only"
                                                        />

                                                    </div>

                                                    {/* AVATAR */}

                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                                                            isSelected
                                                                ? "bg-[#102236] text-[#F6C945]"
                                                                : "bg-slate-100 text-[#102236]"
                                                        }`}
                                                    >
                                                        {initials}
                                                    </div>

                                                    {/* DETAILS */}

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <p
                                                                className={`truncate text-sm font-bold ${
                                                                    isSelected
                                                                        ? "text-[#102236]"
                                                                        : "text-slate-700"
                                                                }`}
                                                            >
                                                                {name}
                                                            </p>

                                                            {isCurrent && (
                                                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600">
                                                                    Current
                                                                </span>
                                                            )}

                                                        </div>

                                                        <p className="mt-0.5 truncate text-xs text-slate-400">
                                                            {executive.email ||
                                                                "No email"}
                                                        </p>

                                                    </div>

                                                    {/* SELECTED INDICATOR */}

                                                    {isSelected && (
                                                        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#F6C945]" />

                                                            <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#102236]">
                                                                Selected
                                                            </span>

                                                        </div>
                                                    )}

                                                </label>
                                            );
                                        }
                                    )}

                                </div>

                            ) : (

                                /* ==================================
                                   NO EXECUTIVES
                                ================================== */

                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

                                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102236] text-[#F6C945]">

                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="h-6 w-6"
                                            stroke="currentColor"
                                            strokeWidth="1.7"
                                        >
                                            <path
                                                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                                strokeLinecap="round"
                                            />

                                            <circle
                                                cx="9"
                                                cy="7"
                                                r="4"
                                            />

                                            <path
                                                d="M22 21v-2a4 4 0 0 0-3-3.87"
                                                strokeLinecap="round"
                                            />

                                            <path
                                                d="M16 3.13a4 4 0 0 1 0 7.75"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                    </div>

                                    <p className="text-sm font-extrabold text-[#102236]">
                                        No executives available
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Create an Executive first.
                                    </p>

                                </div>
                            )}

                            <div className="mt-3 rounded-xl bg-[#FFFBE8] px-3.5 py-2.5">

                                <div className="flex items-start gap-2">

                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="mt-0.5 h-4 w-4 shrink-0 text-[#C39A00]"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                        />

                                        <path
                                            d="M12 11v5"
                                            strokeLinecap="round"
                                        />

                                        <path
                                            d="M12 8h.01"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    <p className="text-[11px] leading-5 text-[#806500]">
                                        Uncheck an executive to remove them from this team. Removed executives can be assigned to another team.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ======================================
                        FOOTER BUTTONS
                    ====================================== */}

                    <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-7">

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            {/* SAVE */}

                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102236] px-6 py-3 text-sm font-extrabold text-[#F6C945] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#17324D] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {saving ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                className="opacity-30"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />

                                            <path
                                                d="M21 12a9 9 0 0 0-9-9"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className="h-4 w-4"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                d="M5 12.5 9.5 17 19 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        Save Changes
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditTeamModal;