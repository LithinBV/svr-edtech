import React from "react";

const getUserId = (user) => {
  if (!user) return null;
  return user._id || user.id || null;
};

const getUserName = (user) => {
  if (!user) return "Unknown";
  return user.name || user.fullName || user.email || "Unknown";
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
};

const TeamCard = ({
  team,
  removingExecutive,
  onEdit,
  onDelete,
  onRemoveExecutive,
}) => {
  const manager = team?.manager;
  const executives = Array.isArray(team?.executives)
    ? team.executives
    : [];

  const teamName = team?.name || "Unnamed Team";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(16,34,54,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,34,54,0.14)]">

      {/* Top Theme Section */}
      <div className="relative overflow-hidden bg-[#102236] px-6 pb-7 pt-6">

        {/* Decorative circles */}
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#F6C945]/10" />
        <div className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#F6C945]/5" />

        <div className="relative z-10">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#F6C945]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F6C945]">
                  TEAM
                </span>
              </div>

              <h3 className="truncate text-2xl font-extrabold tracking-tight text-white">
                {teamName}
              </h3>

              <p className="mt-1 text-sm text-slate-300">
                {executives.length}{" "}
                {executives.length === 1 ? "Executive" : "Executives"}
              </p>
            </div>

            {/* Team Icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#F6C945]/30 bg-[#F6C945]/10 text-[#F6C945]">
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20a4 4 0 00-8 0"
                />
                <circle cx="13" cy="7" r="3" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 20a4 4 0 014-4M7 20a4 4 0 01-4-4"
                />
                <circle cx="5" cy="9" r="2.5" />
                <circle cx="19" cy="9" r="2.5" />
              </svg>
            </div>
          </div>

          {/* Manager */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-3">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6C945] font-extrabold text-[#102236] shadow-sm">
                {getInitials(getUserName(manager))}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Team Manager
                </p>

                <p className="truncate text-sm font-bold text-white">
                  {getUserName(manager)}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#F6C945]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F6C945]">
              Manager
            </span>
          </div>
        </div>
      </div>

      {/* Yellow accent line */}
      <div className="h-1 bg-[#F6C945]" />

      {/* Body */}
      <div className="p-6">

        {/* Executive Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#102236]">
              Team Executives
            </h4>

            <p className="mt-0.5 text-xs text-slate-500">
              Members assigned to this team
            </p>
          </div>

          <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#102236] px-2 text-xs font-bold text-[#F6C945]">
            {executives.length}
          </span>
        </div>

        {/* Executives */}
        {executives.length > 0 ? (
          <div className="space-y-2.5">
            {executives.map((executive, index) => {
              const executiveId = getUserId(executive);
              const name = getUserName(executive);
              const isRemoving = removingExecutive === executiveId;

              return (
                <div
                  key={executiveId || index}
                  className="group/member flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 transition-all duration-200 hover:border-[#F6C945]/50 hover:bg-[#FFFBE8]"
                >
                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-xs font-extrabold text-[#F6C945]">
                      {getInitials(name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#102236]">
                        {name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {executive?.email || "Executive"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveExecutive(team._id, executiveId)
                    }
                    disabled={isRemoving}
                    title="Remove executive"
                    className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          d="M6 6l12 12M18 6L6 18"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#102236] text-[#F6C945]">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                />
                <circle cx="9" cy="7" r="4" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                />
              </svg>
            </div>

            <p className="text-sm font-bold text-[#102236]">
              No executives assigned
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Add executives to this team from the edit option.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">

          <button
            type="button"
            onClick={() => onEdit(team)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102236] px-4 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-[#17324D] hover:shadow-lg"
          >
            <svg
              className="h-4 w-4 text-[#F6C945]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20h9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
              />
            </svg>

            Edit Team
          </button>

          <button
            type="button"
            onClick={() => onDelete(team._id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            title="Delete team"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 6V4h8v2M19 6l-1 14H6L5 6"
              />
              <path
                strokeLinecap="round"
                d="M10 11v5M14 11v5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;