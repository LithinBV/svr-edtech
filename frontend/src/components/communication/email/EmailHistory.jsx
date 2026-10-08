import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  RefreshCw,
  Send,
  User,
  Clock3,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  CalendarDays,
  Inbox,
} from "lucide-react";

import { getEmailHistory } from "../../../services/emailApi";

// ============================================================
// WEEK HELPERS
// ============================================================

const getWeekStart = (dateValue) => {
  const date = new Date(dateValue);
  const day = date.getDay();

  // Monday = first day of week
  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);

  return date;
};

const getWeekKey = (dateValue) => {
  return getWeekStart(dateValue)
    .toISOString()
    .split("T")[0];
};

// ============================================================
// DATE FORMATTERS
// ============================================================

const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatShortDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWeekRange = (weekStart) => {
  const start = new Date(weekStart);
  const end = new Date(start);

  end.setDate(end.getDate() + 6);

  const startText = start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  const endText = end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return `${startText} – ${endText}`;
};

// ============================================================
// STATUS CONFIG
// ============================================================

const getStatusConfig = (status) => {
  switch (status) {
    case "SENT":
      return {
        label: "Sent",
        className: "border-blue-100 bg-blue-50 text-blue-700",
        icon: Send,
      };

    case "DELIVERED":
      return {
        label: "Delivered",
        className: "border-emerald-100 bg-emerald-50 text-emerald-700",
        icon: CheckCircle2,
      };

    case "OPENED":
      return {
        label: "Opened",
        className: "border-violet-100 bg-violet-50 text-violet-700",
        icon: Eye,
      };

    case "CLICKED":
      return {
        label: "Clicked",
        className: "border-indigo-100 bg-indigo-50 text-indigo-700",
        icon: Eye,
      };

    case "FAILED":
    case "BOUNCED":
      return {
        label: status === "BOUNCED" ? "Bounced" : "Failed",
        className: "border-red-100 bg-red-50 text-red-700",
        icon: AlertCircle,
      };

    case "SENDING":
    case "QUEUED":
      return {
        label: status === "QUEUED" ? "Queued" : "Sending",
        className: "border-amber-100 bg-amber-50 text-amber-700",
        icon: Clock3,
      };

    default:
      return {
        label: status || "Unknown",
        className: "border-slate-200 bg-slate-100 text-slate-600",
        icon: Mail,
      };
  }
};

// ============================================================
// INITIAL
// ============================================================

const getInitial = (value = "") => {
  const text = String(value).trim();
  if (!text) return "S";
  return text.charAt(0).toUpperCase();
};

// ============================================================
// EMAIL HISTORY POPUP
// ============================================================

const EmailHistory = ({
  leadId,
  refreshKey = 0,
  isOpen = true,
  onClose = () => {},
}) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [weekExpanded, setWeekExpanded] = useState(true);

  // ==========================================================
  // FETCH EMAIL HISTORY
  // ==========================================================

  const fetchHistory = async () => {
    if (!leadId) {
      setEmails([]);
      setError("Lead ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getEmailHistory(leadId);

      // Normalizes backend variations: response.data, response.emails, or direct array
      const emailList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.emails)
        ? response.emails
        : [];

      setEmails(emailList);
    } catch (err) {
      console.error("Email history error:", err);
      setError(err?.message || "Failed to load email history.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH WHEN POPUP OPENS
  // ==========================================================

  useEffect(() => {
    if (!isOpen) return;
    fetchHistory();
  }, [leadId, refreshKey, isOpen]);

  // ==========================================================
  // RESET PAGINATION
  // ==========================================================

  useEffect(() => {
    if (!isOpen) return;
    setCurrentWeekIndex(0);
    setWeekExpanded(true);
  }, [leadId, refreshKey, isOpen]);

  // ==========================================================
  // ESC KEY
  // ==========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ==========================================================
  // GROUP EMAILS INTO 7-DAY PERIODS
  // ==========================================================

  const groupedEmails = useMemo(() => {
    const groups = {};

    emails.forEach((email) => {
      if (!email?.createdAt) return;

      const weekKey = getWeekKey(email.createdAt);

      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }

      groups[weekKey].push(email);
    });

    return Object.entries(groups)
      .sort(
        ([a], [b]) =>
          new Date(b).getTime() - new Date(a).getTime()
      )
      .map(([weekKey, items]) => ({
        weekKey,
        weekStart: new Date(weekKey),
        items: items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        ),
      }));
  }, [emails]);

  // ==========================================================
  // KEEP PAGINATION VALID
  // ==========================================================

  useEffect(() => {
    if (groupedEmails.length === 0) {
      setCurrentWeekIndex(0);
      return;
    }

    if (currentWeekIndex >= groupedEmails.length) {
      setCurrentWeekIndex(groupedEmails.length - 1);
    }
  }, [groupedEmails, currentWeekIndex]);

  // ==========================================================
  // CURRENT WEEK
  // ==========================================================

  const currentWeek = groupedEmails[currentWeekIndex];

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const goToPreviousWeek = () => {
    setCurrentWeekIndex((previous) =>
      Math.min(previous + 1, groupedEmails.length - 1)
    );
    setWeekExpanded(true);
  };

  const goToNextWeek = () => {
    setCurrentWeekIndex((previous) => Math.max(previous - 1, 0));
    setWeekExpanded(true);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#071522]/70 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      {/* MAIN POPUP */}
      <div
        className="flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 sm:h-[90vh] sm:rounded-3xl"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* HEADER */}
        <div className="shrink-0 bg-[#102236] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6C945] text-[#102236] shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl">
                <Mail size={21} strokeWidth={2.4} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-white sm:text-xl">
                  Email History
                </h2>
                <p className="mt-0.5 truncate text-xs text-white/60 sm:text-sm">
                  Previous email communication with this lead
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                title="Refresh"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white transition hover:bg-[#F6C945] hover:text-[#102236]"
              >
                <X size={19} />
              </button>
            </div>
          </div>
        </div>

        {/* YELLOW ACCENT */}
        <div className="h-1 shrink-0 bg-[#F6C945]" />

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f6f8fa]">
          <div className="mx-auto w-full max-w-5xl p-3 sm:p-5 lg:p-6">
            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F6C945]/15 text-[#806400]">
                    <RefreshCw size={25} className="animate-spin" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    Loading email history...
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Please wait</p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertCircle size={25} />
                  </div>
                  <h3 className="mt-4 text-center text-base font-bold text-[#102236]">
                    Unable to load email history
                  </h3>
                  <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={fetchHistory}
                    className="mx-auto mt-5 flex items-center gap-2 rounded-xl bg-[#102236] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b354d]"
                  >
                    <RefreshCw size={15} />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* EMPTY */}
            {!loading && !error && emails.length === 0 && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102236] text-[#F6C945]">
                    <Inbox size={27} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#102236]">
                    No email history
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    No emails have been sent to this lead yet.
                  </p>
                  <button
                    type="button"
                    onClick={fetchHistory}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#102236] transition hover:border-[#F6C945] hover:bg-[#F6C945]/10"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL HISTORY CONTENT */}
            {!loading && !error && emails.length > 0 && currentWeek && (
              <div className="space-y-4">
                {/* WEEK HEADER */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setWeekExpanded((previous) => !previous)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945]">
                        {weekExpanded ? (
                          <ChevronDown size={19} />
                        ) : (
                          <ChevronRight size={19} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={15}
                            className="hidden text-slate-400 sm:block"
                          />
                          <p className="truncate text-sm font-bold text-[#102236] sm:text-base">
                            {formatWeekRange(currentWeek.weekStart)}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          7-day email history
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden rounded-full bg-[#F6C945]/15 px-3 py-1.5 text-xs font-bold text-[#806400] sm:inline-flex">
                        {currentWeek.items.length}{" "}
                        {currentWeek.items.length === 1 ? "Email" : "Emails"}
                      </span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6C945]/15 text-[#806400]">
                        <Mail size={17} />
                      </div>
                    </div>
                  </button>

                  {/* WEEK EMAILS */}
                  {weekExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                      <div className="space-y-4">
                        {currentWeek.items.map((email, emailIndex) => {
                          const statusConfig = getStatusConfig(email.status);
                          const StatusIcon = statusConfig.icon;
                          const senderName =
                            email.agentId?.name ||
                            email.agentId?.email ||
                            "SVR-EDTECH";

                          return (
                            <article
                              key={
                                email._id ||
                                `${currentWeek.weekKey}-${emailIndex}`
                              }
                              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                              {/* EMAIL CARD HEADER */}
                              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#102236] text-sm font-bold text-[#F6C945]">
                                    {getInitial(senderName)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#102236]">
                                      {senderName}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      Sent an email
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <p className="text-xs font-semibold text-slate-600 sm:text-sm">
                                    {formatShortDate(email.createdAt)}
                                  </p>
                                  <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-slate-400">
                                    <Clock3 size={11} />
                                    {formatTime(email.createdAt)}
                                  </p>
                                </div>
                              </div>

                              {/* EMAIL BODY */}
                              <div className="p-4 sm:p-5">
                                {/* Status */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusConfig.className}`}
                                  >
                                    <StatusIcon size={12} />
                                    {statusConfig.label}
                                  </span>

                                  {email.templateName && (
                                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                      <FileText size={12} />
                                      <span className="max-w-[180px] truncate">
                                        {email.templateName}
                                      </span>
                                    </span>
                                  )}
                                </div>

                                {/* Subject */}
                                <h3 className="mt-4 break-words text-base font-bold leading-6 text-[#102236] sm:text-lg">
                                  {email.subject || "(No subject)"}
                                </h3>

                                {/* Recipient */}
                                <div className="mt-3 flex min-w-0 items-start gap-2 text-xs sm:text-sm">
                                  <span className="shrink-0 font-medium text-slate-400">
                                    To:
                                  </span>
                                  <span className="min-w-0 break-all text-slate-600">
                                    {Array.isArray(email.to)
                                      ? email.to.join(", ")
                                      : email.to || "—"}
                                  </span>
                                </div>

                                {/* Message */}
                                <div className="relative mt-5 overflow-hidden rounded-xl border border-slate-200 bg-[#fafbfc]">
                                  <div className="h-1 bg-[#F6C945]" />
                                  <div className="p-4 sm:p-5">
                                    <div className="mb-4 flex items-center gap-2">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#102236] shadow-sm ring-1 ring-slate-200">
                                        <Mail size={15} />
                                      </div>
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        Email Message
                                      </span>
                                    </div>

                                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                      {email.message || "No message"}
                                    </p>
                                  </div>
                                </div>

                                {/* Sent By */}
                                {email.agentId && (
                                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                                      <User size={14} />
                                    </div>
                                    <p className="min-w-0 truncate text-xs text-slate-500">
                                      Sent by{" "}
                                      <span className="font-semibold text-slate-700">
                                        {email.agentId.name ||
                                          email.agentId.email ||
                                          "Unknown user"}
                                      </span>
                                    </p>
                                  </div>
                                )}

                                {/* Error message if failed */}
                                {(email.errorMessage || email.errorCode) && (
                                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle
                                        size={15}
                                        className="mt-0.5 shrink-0 text-red-600"
                                      />
                                      <p className="break-words text-xs leading-5 text-red-700">
                                        {email.errorCode
                                          ? `${email.errorCode}: `
                                          : ""}
                                        {email.errorMessage || "Email failed"}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                                  <span>{formatDate(email.createdAt)}</span>
                                  <span>{formatTime(email.createdAt)}</span>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* PAGINATION */}
                {groupedEmails.length > 1 && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                    <button
                      type="button"
                      onClick={goToPreviousWeek}
                      disabled={currentWeekIndex >= groupedEmails.length - 1}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#F6C945] hover:bg-[#F6C945]/10 hover:text-[#102236] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Older</span>
                    </button>

                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-[#102236] sm:text-sm">
                        Week {currentWeekIndex + 1} of {groupedEmails.length}
                      </span>
                      <span className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                        {currentWeek?.items.length || 0} emails
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextWeek}
                      disabled={currentWeekIndex <= 0}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-[#F6C945] hover:bg-[#F6C945]/10 hover:text-[#102236] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Newer</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <Mail size={14} />
            <span>Email communication history</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#102236] px-5 text-sm font-semibold text-white transition hover:bg-[#1b354d]"
          >
            <X size={16} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailHistory;