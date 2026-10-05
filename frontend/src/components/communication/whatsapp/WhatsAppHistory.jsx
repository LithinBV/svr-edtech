import React, { useEffect, useMemo, useState } from "react";
import { getWhatsAppHistory } from "../../../services/whatsappApi";

const WhatsAppHistory = ({
  isOpen,
  onClose,
  leadId,
  lead,
}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
   * Load history whenever popup opens
   */
  useEffect(() => {
    if (!isOpen || !leadId) return;

    let cancelled = false;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getWhatsAppHistory(leadId);

        if (cancelled) return;

        const messages = Array.isArray(response)
          ? response
          : response?.messages ||
            response?.history ||
            response?.data ||
            [];

        setHistory(messages);
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load WhatsApp history:",
          err
        );

        setError(
          err?.message ||
            "Failed to load WhatsApp history."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [isOpen, leadId]);

  /*
   * Group messages by date
   */
  const groupedHistory = useMemo(() => {
    const groups = {};

    history.forEach((item) => {
      const dateValue =
        item.createdAt ||
        item.openedAt ||
        item.updatedAt;

      const date = dateValue
        ? new Date(dateValue)
        : new Date();

      const key = date.toISOString().split("T")[0];

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);
    });

    return Object.entries(groups)
      .sort(([dateA], [dateB]) =>
        dateB.localeCompare(dateA)
      )
      .map(([date, messages]) => ({
        date,
        messages: messages.sort((a, b) => {
          const timeA = new Date(
            a.createdAt ||
              a.openedAt ||
              a.updatedAt ||
              0
          ).getTime();

          const timeB = new Date(
            b.createdAt ||
              b.openedAt ||
              b.updatedAt ||
              0
          ).getTime();

          return timeB - timeA;
        }),
      }));
  }, [history]);

  /*
   * Format date heading
   */
  const formatDateHeading = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);

    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = today
      .toISOString()
      .split("T")[0];

    const yesterdayString = yesterday
      .toISOString()
      .split("T")[0];

    if (dateString === todayString) {
      return "TODAY";
    }

    if (dateString === yesterdayString) {
      return "YESTERDAY";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  };

  /*
   * Format time
   */
  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /*
   * Close when ESC is pressed
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[110]
        flex items-center justify-center
        bg-slate-950/60 p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="
          flex h-[90vh] w-full max-w-3xl
          flex-col overflow-hidden
          rounded-2xl bg-white
          shadow-2xl
          sm:h-[82vh] sm:rounded-3xl
        "
      >
        {/* ================= HEADER ================= */}
        <div
          className="
            flex shrink-0 items-center
            justify-between
            border-b border-slate-200
            px-5 py-4
            sm:px-6 sm:py-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* WhatsApp icon */}
            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-full
                bg-[#25D366]
                text-white
              "
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.52 3.48A11.83 11.83 0 0 0 12.04 0C5.52 0 .22 5.3.22 11.82c0 2.08.54 4.1 1.56 5.88L.12 24l6.44-1.63a11.8 11.8 0 0 0 5.48 1.35h.01c6.52 0 11.82-5.3 11.82-11.82 0-3.16-1.23-6.13-3.35-8.42ZM12.05 21.7a9.84 9.84 0 0 1-4.99-1.36l-.36-.21-3.82.97 1.02-3.72-.23-.38a9.84 9.84 0 1 1 8.38 4.7Zm5.4-7.39c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.48-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#102236] sm:text-xl">
                WhatsApp History
              </h2>

              <p className="truncate text-xs text-slate-500 sm:text-sm">
                {leadName}
                {phoneNumber
                  ? ` • ${phoneNumber}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="
              ml-3 flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close history"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* ================= BODY ================= */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">
          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div
                  className="
                    mx-auto h-9 w-9
                    animate-spin rounded-full
                    border-4 border-slate-200
                    border-t-[#25D366]
                  "
                />

                <p className="mt-3 text-sm text-slate-500">
                  Loading WhatsApp history...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              className="
                rounded-2xl
                border border-red-200
                bg-red-50
                p-5 text-center
              "
            >
              <div className="text-2xl">⚠️</div>

              <p className="mt-2 text-sm font-semibold text-red-700">
                Unable to load history
              </p>

              <p className="mt-1 text-xs text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            history.length === 0 && (
              <div
                className="
                  flex min-h-[350px]
                  flex-col items-center
                  justify-center
                  rounded-2xl
                  border border-dashed
                  border-slate-200
                  bg-white
                  px-6 text-center
                "
              >
                <div
                  className="
                    flex h-16 w-16
                    items-center justify-center
                    rounded-full
                    bg-emerald-50
                    text-3xl
                  "
                >
                  💬
                </div>

                <h3 className="mt-4 text-base font-bold text-[#102236]">
                  No WhatsApp history
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  No WhatsApp messages have been prepared or
                  opened for this lead yet.
                </p>
              </div>
            )}

          {/* History */}
          {!loading &&
            !error &&
            groupedHistory.length > 0 && (
              <div className="space-y-7">
                {groupedHistory.map(
                  ({ date, messages }) => (
                    <section key={date}>
                      {/* Date */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />

                        <span
                          className="
                            shrink-0 rounded-full
                            bg-slate-200/70
                            px-3 py-1
                            text-[10px]
                            font-bold
                            tracking-wider
                            text-slate-500
                          "
                        >
                          {formatDateHeading(date)}
                        </span>

                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      {/* Messages */}
                      <div className="space-y-3">
                        {messages.map(
                          (item, index) => {
                            const id =
                              item._id ||
                              item.id ||
                              `${date}-${index}`;

                            const createdAt =
                              item.createdAt ||
                              item.openedAt ||
                              item.updatedAt;

                            const templateName =
                              item.templateName ||
                              item.template?.name ||
                              "WhatsApp Message";

                            const status =
                              String(
                                item.status || "PREPARED"
                              ).toUpperCase();

                            const isOpened =
                              status === "OPENED";

                            return (
                              <div
                                key={id}
                                className="
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-white
                                  p-4
                                  shadow-sm
                                "
                              >
                                {/* Top */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div
                                      className="
                                        flex h-9 w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-emerald-50
                                        text-lg
                                      "
                                    >
                                      💬
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-bold text-[#102236]">
                                        {templateName}
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        {formatTime(
                                          createdAt
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status */}
                                  <span
                                    className={`
                                      inline-flex
                                      shrink-0
                                      items-center
                                      gap-1.5
                                      rounded-full
                                      px-2.5 py-1
                                      text-[10px]
                                      font-bold
                                      ${
                                        isOpened
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-slate-100 text-slate-500"
                                      }
                                    `}
                                  >
                                    <span
                                      className={`
                                        h-1.5 w-1.5
                                        rounded-full
                                        ${
                                          isOpened
                                            ? "bg-emerald-500"
                                            : "bg-slate-400"
                                        }
                                      `}
                                    />

                                    {isOpened
                                      ? "OPENED"
                                      : "PREPARED"}
                                  </span>
                                </div>

                                {/* Message */}
                                <div
                                  className="
                                    mt-4
                                    rounded-xl
                                    bg-slate-50
                                    p-4
                                  "
                                >
                                  <p
                                    className="
                                      whitespace-pre-wrap
                                      break-words
                                      text-sm
                                      leading-6
                                      text-slate-700
                                    "
                                  >
                                    {item.message ||
                                      "No message content available."}
                                  </p>
                                </div>

                                {/* Footer */}
                                <div
                                  className="
                                    mt-3 flex
                                    flex-wrap
                                    items-center
                                    justify-between
                                    gap-2
                                  "
                                >
                                  <span className="text-xs text-slate-400">
                                    {item.phoneNumber ||
                                      phoneNumber ||
                                      ""}
                                  </span>

                                  {item.agent?.name && (
                                    <span className="text-xs text-slate-400">
                                      By{" "}
                                      <span className="font-medium text-slate-500">
                                        {item.agent.name}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </section>
                  )
                )}
              </div>
            )}
        </div>

        {/* ================= FOOTER ================= */}
        <div
          className="
            flex shrink-0
            items-center justify-between
            border-t border-slate-200
            bg-white
            px-5 py-3
            sm:px-6
          "
        >
          <p className="text-xs text-slate-400">
            {history.length}{" "}
            {history.length === 1
              ? "message"
              : "messages"}
          </p>

          <button
            type="button"
            onClick={() => onClose?.()}
            className="
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-2.5
              text-sm font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppHistory;