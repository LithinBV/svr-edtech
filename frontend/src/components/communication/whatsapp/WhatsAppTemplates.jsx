import React, { useMemo, useState } from "react";

const CATEGORY_CONFIG = {
  WELCOME: {
    icon: "👋",
    label: "Welcome",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  FOLLOW_UP: {
    icon: "📅",
    label: "Follow Up",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  COURSE: {
    icon: "🎓",
    label: "Course",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  PAYMENT: {
    icon: "💰",
    label: "Payment",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  DEMO: {
    icon: "✨",
    label: "Demo",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  REMINDER: {
    icon: "🔔",
    label: "Reminder",
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
  GENERAL: {
    icon: "💬",
    label: "General",
    bg: "bg-slate-100",
    text: "text-slate-600",
  },
};

const WhatsAppTemplates = ({
  templates = [],
  selectedTemplate = null,
  onSelect,
  loading = false,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const categories = useMemo(() => {
    const available = new Set(
      templates
        .map((template) =>
          String(template?.category || "GENERAL").toUpperCase()
        )
        .filter(Boolean)
    );

    return ["ALL", ...Array.from(available)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return templates.filter((template) => {
      const templateCategory = String(
        template?.category || "GENERAL"
      ).toUpperCase();

      const matchesCategory =
        category === "ALL" ||
        templateCategory === category;

      if (!matchesCategory) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return (
        template?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        template?.description
          ?.toLowerCase()
          .includes(searchValue) ||
        template?.message
          ?.toLowerCase()
          .includes(searchValue) ||
        templateCategory
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [templates, search, category]);

  const isSelected = (template) => {
    if (!template || !selectedTemplate) {
      return false;
    }

    return (
      template?._id === selectedTemplate?._id ||
      template?.id === selectedTemplate?.id
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#102236]">
              Message Templates
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Choose a message to send
            </p>
          </div>

          <span
            className="
              rounded-full bg-emerald-50
              px-2.5 py-1
              text-[11px] font-bold
              text-emerald-600
            "
          >
            {templates.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <svg
            className="
              absolute left-3 top-1/2
              h-4 w-4
              -translate-y-1/2
              text-slate-400
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search templates..."
            className="
              h-10 w-full rounded-xl
              border border-slate-200
              bg-white
              pl-9 pr-3
              text-sm text-slate-700
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-[#25D366]
              focus:ring-2 focus:ring-[#25D366]/10
            "
          />
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div
            className="
              mt-3 flex gap-1.5
              overflow-x-auto pb-1
              scrollbar-hide
            "
          >
            {categories.map((item) => {
              const active = category === item;

              const config =
                CATEGORY_CONFIG[item] ||
                CATEGORY_CONFIG.GENERAL;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`
                    shrink-0 rounded-full
                    px-3 py-1.5
                    text-[11px] font-semibold
                    transition
                    ${
                      active
                        ? "bg-[#102236] text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }
                  `}
                >
                  {item === "ALL"
                    ? "All"
                    : config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Template list */}
      <div
        className="
          mt-4 min-h-0 flex-1
          space-y-2
          overflow-y-auto
          pr-1
        "
      >
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  animate-pulse
                  rounded-xl
                  border border-slate-100
                  bg-slate-50
                  p-3
                "
              >
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-slate-200" />
                    <div className="mt-2 h-2.5 w-full rounded bg-slate-200" />
                    <div className="mt-1.5 h-2.5 w-1/2 rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div
            className="
              flex min-h-[220px]
              flex-col items-center
              justify-center
              rounded-2xl
              border border-dashed
              border-slate-200
              bg-slate-50/70
              px-5
              text-center
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-white
                text-2xl
                shadow-sm
              "
            >
              💬
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              No templates found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or category.
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const selected = isSelected(template);

            const templateCategory = String(
              template?.category || "GENERAL"
            ).toUpperCase();

            const config =
              CATEGORY_CONFIG[templateCategory] ||
              CATEGORY_CONFIG.GENERAL;

            const templateMessage =
              template?.message ||
              template?.content ||
              template?.body ||
              "";

            return (
              <button
                key={template?._id || template?.id}
                type="button"
                onClick={() => onSelect?.(template)}
                className={`
                  group
                  w-full
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition-all
                  ${
                    selected
                      ? "border-[#25D366]/30 bg-emerald-50/70 shadow-sm"
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`
                      flex h-10 w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-lg
                      ${
                        selected
                          ? "bg-white shadow-sm"
                          : `${config.bg} ${config.text}`
                      }
                    `}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`
                          min-w-0 flex-1
                          truncate
                          text-sm font-semibold
                          ${
                            selected
                              ? "text-[#102236]"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {template?.name ||
                          "Untitled Template"}
                      </p>

                      {selected && (
                        <span
                          className="
                            flex h-5 w-5
                            shrink-0
                            items-center justify-center
                            rounded-full
                            bg-[#25D366]
                            text-white
                          "
                        >
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                        </span>
                      )}
                    </div>

                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-xs
                        leading-5
                        text-slate-400
                      "
                    >
                      {templateMessage ||
                        template?.description ||
                        "WhatsApp message template"}
                    </p>

                    <div className="mt-2">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2 py-0.5
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          ${config.bg}
                          ${config.text}
                        `}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`
                      mt-2 h-4 w-4
                      shrink-0
                      transition
                      ${
                        selected
                          ? "text-[#25D366]"
                          : "text-slate-300 group-hover:text-slate-500"
                      }
                    `}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div
        className="
          mt-3 shrink-0
          rounded-xl
          border border-blue-100
          bg-blue-50
          px-3 py-2.5
        "
      >
        <div className="flex gap-2">
          <svg
            className="
              mt-0.5 h-4 w-4
              shrink-0
              text-blue-500
            "
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 8h.01" />
          </svg>

          <p className="text-[11px] leading-4 text-blue-700">
            Select a template to automatically
            personalize the message using lead
            information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplates;