import React, { useEffect, useState } from "react";
import {
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { getEmailTemplates } from "../../../services/emailTemplateApi";

const EmailTemplates = ({
  selectedTemplate = null,
  onTemplateSelect,
  leadEmail = "",
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD TEMPLATES
  // ============================================================

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEmailTemplates();

        setTemplates(
          Array.isArray(response?.templates)
            ? response.templates
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load email templates:",
          err
        );

        setError(
          err?.message ||
            "Failed to load email templates."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // ============================================================
  // SELECT TEMPLATE
  // ============================================================

  const handleChange = (event) => {
    const templateId = event.target.value;

    if (!templateId) {
      onTemplateSelect?.(null);
      return;
    }

    const template = templates.find(
      (item) =>
        String(item._id) === String(templateId)
    );

    onTemplateSelect?.(template || null);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}

      <div className="border-b border-slate-100 px-5 py-4">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#FECA42]/20
              text-[#806400]
            "
          >
            <FileText size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#102236]">
              Email Template
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Choose a template for this email
            </p>
          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-5">

        {/* ERROR */}

        {error && (
          <div
            className="
              mb-4
              flex
              items-start
              gap-2
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* SELECT */}

        <div className="relative">

          <select
            value={selectedTemplate?._id || ""}
            onChange={handleChange}
            disabled={
              loading ||
              !leadEmail ||
              templates.length === 0
            }
            className="
              w-full
              appearance-none
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              py-3
              pr-11
              text-sm
              text-slate-700
              outline-none
              transition
              focus:border-[#F6C945]
              focus:bg-white
              focus:ring-2
              focus:ring-[#F6C945]/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <option value="">
              {loading
                ? "Loading email templates..."
                : templates.length === 0
                ? "No email templates available"
                : "Select an email template"}
            </option>

            {templates.map((template) => (
              <option
                key={template._id}
                value={template._id}
              >
                {template.name}
                {template.category
                  ? ` — ${template.category.replace(
                      "_",
                      " "
                    )}`
                  : ""}
              </option>
            ))}

          </select>

          {loading ? (
            <Loader2
              size={18}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                animate-spin
                text-slate-400
              "
            />
          ) : (
            <ChevronDown
              size={18}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />
          )}

        </div>

        {/* SELECTED TEMPLATE */}

        {selectedTemplate && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-[#F6C945]/30
              bg-[#F6C945]/5
              p-4
            "
          >

            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#806400]">
                  Selected Template
                </p>

                <h3 className="mt-1 text-sm font-bold text-[#102236]">
                  {selectedTemplate.name}
                </h3>

              </div>

              {selectedTemplate.category && (
                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-[#FECA42]/20
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#806400]
                  "
                >
                  {selectedTemplate.category.replace(
                    "_",
                    " "
                  )}
                </span>
              )}

            </div>

            {/* SUBJECT */}

            {selectedTemplate.subject && (
              <div className="mt-4">

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Subject
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {selectedTemplate.subject}
                </p>

              </div>
            )}

            {/* MESSAGE */}

            <div className="mt-4">

              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Message Preview
              </p>

              <div
                className="
                  mt-1
                  max-h-40
                  overflow-y-auto
                  whitespace-pre-wrap
                  rounded-lg
                  bg-white
                  p-3
                  text-sm
                  leading-6
                  text-slate-600
                "
              >
                {selectedTemplate.message}
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default EmailTemplates;
