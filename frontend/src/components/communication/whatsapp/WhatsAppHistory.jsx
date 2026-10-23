import React, { useEffect, useMemo, useState, useRef } from "react";
import { getWhatsAppHistory } from "../../../services/whatsappApi";

const WhatsAppHistory = ({ isOpen, onClose, leadId, lead }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatBottomRef = useRef(null);

  const leadName =
    lead?.name ||
    lead?.fullName ||
    lead?.leadName ||
    "Lead";

  const phoneNumber =
    lead?.contact ||
    lead?.phone ||
    lead?.mobile ||
    lead?.phoneNumber ||
    "";

  /*
   * Fetch full chat history whenever popup opens
   */
  useEffect(() => {
    if (!isOpen || !leadId) return;

    let isMounted = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getWhatsAppHistory(leadId);

        if (!isMounted) return;

        const messages = Array.isArray(response)
          ? response
          : response?.messages ||
            response?.history ||
            response?.data ||
            [];

        setHistory(messages);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load WhatsApp history:", err);
        setError(err?.message || "Failed to load WhatsApp history.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [isOpen, leadId]);

  /*
   * Auto-scroll to bottom of chat once loaded
   */
  useEffect(() => {
    if (!loading && history.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, history]);

  /*
   * Group messages by calendar date (Ascending timeline)
   */
  const groupedHistory = useMemo(() => {
    const groups = {};

    history.forEach((item) => {
      const dateValue = item.createdAt || item.openedAt || item.updatedAt;
      const date = dateValue ? new Date(dateValue) : new Date();
      const key = date.toISOString().split("T")[0];

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // Oldest day first
      .map(([date, messages]) => ({
        date,
        messages: messages.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.openedAt || 0).getTime();
          const timeB = new Date(b.createdAt || b.openedAt || 0).getTime();
          return timeA - timeB; // Oldest message on top, newest at bottom
        }),
      }));
  }, [history]);

  const formatDateHeading = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = today.toISOString().split("T")[0];
    const yesterdayString = yesterday.toISOString().split("T")[0];

    if (dateString === todayString) return "TODAY";
    if (dateString === yesterdayString) return "YESTERDAY";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  };

  const formatTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#efeae2] shadow-2xl sm:h-[84vh] sm:rounded-3xl border border-slate-300">
        
        {/* ================= HEADER ================= */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-[#102236] px-5 py-3.5 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.83 11.83 0 0 0 12.04 0C5.52 0 .22 5.3.22 11.82c0 2.08.54 4.1 1.56 5.88L.12 24l6.44-1.63a11.8 11.8 0 0 0 5.48 1.35h.01c6.52 0 11.82-5.3 11.82-11.82 0-3.16-1.23-6.13-3.35-8.42ZM12.05 21.7a9.84 9.84 0 0 1-4.99-1.36l-.36-.21-3.82.97 1.02-3.72-.23-.38a9.84 9.84 0 1 1 8.38 4.7Zm5.4-7.39c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold sm:text-lg">
                {leadName}
              </h2>
              <p className="truncate text-xs text-white/70">
                {phoneNumber ? `${phoneNumber} • Two-Way WhatsApp History` : "Two-Way WhatsApp History"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* ================= CHAT BODY ================= */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#25D366]" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
              <span className="text-3xl mb-2">💬</span>
              <h3 className="text-base font-bold text-[#102236]">No message history yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Messages sent via WhatsApp or received back from {leadName} will show up here automatically.
              </p>
            </div>
          )}

          {!loading && !error && groupedHistory.length > 0 && (
            <div className="space-y-6">
              {groupedHistory.map(({ date, messages }) => (
                <div key={date} className="space-y-3">
                  {/* Date Badge */}
                  <div className="flex justify-center">
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-slate-600 shadow-sm border border-slate-200">
                      {formatDateHeading(date)}
                    </span>
                  </div>

                  {/* Messages In Day */}
                  {messages.map((item, idx) => {
                    const isOutbound = item.direction === "OUTBOUND";
                    const isLeadInbound = item.direction === "INBOUND";
                    const senderName = isOutbound
                      ? (item.agentId?.name || "Executive")
                      : leadName;

                    return (
                      <div
                        key={item._id || item.whatsappMessageId || idx}
                        className={`flex w-full ${isOutbound ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm border text-sm ${
                            isOutbound
                              ? "bg-[#dcf8c6] border-[#c2e7a3] text-slate-900 rounded-tr-none"
                              : "bg-white border-slate-200 text-slate-900 rounded-tl-none"
                          }`}
                        >
                          {/* Sender Label */}
                          <div className="mb-1 flex items-center justify-between gap-3 text-[11px]">
                            <span className={`font-semibold ${isOutbound ? "text-emerald-800" : "text-blue-700"}`}>
                              {isOutbound ? `You (${senderName})` : senderName}
                            </span>
                            {item.templateName && (
                              <span className="text-[10px] text-slate-400 bg-white/70 px-1.5 py-0.5 rounded">
                                {item.templateName}
                              </span>
                            )}
                          </div>

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap break-words leading-relaxed text-[13px] sm:text-sm">
                            {item.message}
                          </p>

                          {/* Timestamp & Status */}
                          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-500">
                            <span>{formatTime(item.createdAt || item.openedAt)}</span>
                            {isOutbound && (
                              <span className="text-emerald-600 font-bold">
                                {item.status === "OPENED" ? "↗ Opened" : "✓✓ Sent"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
          <p className="text-xs text-slate-500">
            {history.length} {history.length === 1 ? "interaction logged" : "interactions logged"}
          </p>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppHistory;