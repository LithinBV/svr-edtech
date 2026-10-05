import React, { useEffect, useState } from "react";

import {
  X,
  Send,
  Mail,
  Loader2,
  FileText,
  User,
  Phone,
  History,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  GraduationCap,
  Building2,
  Clock,
} from "lucide-react";

import { sendEmail } from "../../../services/emailApi";

const EmailComposer = ({
  isOpen,
  onClose,
  onHistory,
  leadId,
  email,
  leadName = "",
  lead = null,
  selectedTemplate = null,
  onSent,
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(
    selectedTemplate || null
  );

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  };

  // ============================================================
  // GET LEAD VALUES
  // ============================================================

  const getLeadPhone = () => {
    return (
      lead?.phone ||
      lead?.phoneNumber ||
      lead?.mobile ||
      lead?.contact ||
      ""
    );
  };

  const getLeadCourse = () => {
    return (
      lead?.courseName ||
      lead?.course ||
      lead?.programName ||
      lead?.programInterest ||
      ""
    );
  };

  const getLeadLocation = () => {
    return (
      lead?.location ||
      lead?.city ||
      lead?.address ||
      ""
    );
  };

  const getLeadInstitute = () => {
    return (
      lead?.institutionName ||
      lead?.instituteName ||
      lead?.college ||
      lead?.institution ||
      ""
    );
  };

  const getLeadStatus = () => {
    return (
      lead?.status ||
      lead?.leadStatus ||
      lead?.latestRemark ||
      "New"
    );
  };

  // ============================================================
  // TEMPLATE VARIABLES
  // ============================================================

  const getTemplateVariables = () => {
    const currentUser = getCurrentUser();

    const agentName =
      currentUser?.name ||
      currentUser?.fullName ||
      currentUser?.userName ||
      "";

    return {
      leadName: leadName || "Lead",
      leadEmail: email || "",
      agentName,
      courseName: getLeadCourse(),
      phoneNumber: getLeadPhone(),
      companyName: "SVR-EDTECH",
    };
  };

  // ============================================================
  // REPLACE TEMPLATE VARIABLES
  // ============================================================

  const replaceTemplateVariables = (text) => {
    if (!text) return "";

    const variables = getTemplateVariables();

    return text
      .replace(
        /{{leadName}}/gi,
        variables.leadName
      )
      .replace(
        /{{leadEmail}}/gi,
        variables.leadEmail
      )
      .replace(
        /{{agentName}}/gi,
        variables.agentName
      )
      .replace(
        /{{courseName}}/gi,
        variables.courseName
      )
      .replace(
        /{{phoneNumber}}/gi,
        variables.phoneNumber
      )
      .replace(
        /{{companyName}}/gi,
        variables.companyName
      );
  };

  // ============================================================
  // LOAD EMAIL TEMPLATES
  // ============================================================

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);

      const API_BASE =
        import.meta.env.VITE_API_URL ||
        "http://localhost:3000/api";

      const response = await fetch(
        `${API_BASE}/email-templates`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load email templates."
        );
      }

      const data = await response.json();

      const templateList =
        Array.isArray(data)
          ? data
          : data?.templates ||
            data?.data ||
            [];

      setTemplates(templateList);
    } catch (err) {
      console.error(
        "Email template loading error:",
        err
      );

      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // ============================================================
  // INITIALIZE
  // ============================================================

  useEffect(() => {
    if (!isOpen) return;

    setTo(email || "");
    setError("");
    setSuccess("");

    loadTemplates();

    if (selectedTemplate) {
      setActiveTemplate(selectedTemplate);

      setSubject(
        replaceTemplateVariables(
          selectedTemplate.subject || ""
        )
      );

      setMessage(
        replaceTemplateVariables(
          selectedTemplate.message ||
            selectedTemplate.body ||
            selectedTemplate.content ||
            ""
        )
      );
    } else {
      setActiveTemplate(null);
      setSubject("");
      setMessage("");
    }
  }, [
    isOpen,
    email,
    selectedTemplate,
    leadName,
  ]);

  // ============================================================
  // SELECT TEMPLATE
  // ============================================================

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template);

    setError("");
    setSuccess("");

    setSubject(
      replaceTemplateVariables(
        template?.subject || ""
      )
    );

    setMessage(
      replaceTemplateVariables(
        template?.message ||
          template?.body ||
          template?.content ||
          ""
      )
    );
  };

  // ============================================================
  // FILTER TEMPLATES
  // ============================================================

  const filteredTemplates = templates.filter(
    (template) => {
      const search = templateSearch
        .toLowerCase()
        .trim();

      if (!search) return true;

      const name =
        template?.name ||
        template?.title ||
        "";

      const category =
        template?.category || "";

      return (
        name.toLowerCase().includes(search) ||
        category.toLowerCase().includes(search)
      );
    }
  );

  // ============================================================
  // SEND EMAIL
  // ============================================================

  const handleSend = async () => {
    setError("");
    setSuccess("");

    if (!leadId) {
      setError("Lead ID is missing.");
      return;
    }

    if (!to.trim()) {
      setError("Recipient email is required.");
      return;
    }

    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }

    if (!message.trim()) {
      setError("Message is required.");
      return;
    }

    if (sending) return;

    try {
      setSending(true);

      const response = await sendEmail({
        leadId,
        to: to.trim(),
        subject: subject.trim(),
        message: message.trim(),

        templateName:
          activeTemplate?.name ||
          activeTemplate?.title ||
          null,

        templateId:
          activeTemplate?._id ||
          activeTemplate?.id ||
          null,
      });

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Failed to send email."
        );
      }

      setSuccess(
        "Email sent successfully."
      );

      if (typeof onSent === "function") {
        onSent(response);
      }

      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (err) {
      console.error(
        "Email send error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while sending the email."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // CLOSE
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#102236]/70 p-2 backdrop-blur-sm sm:p-4">

      {/* ====================================================== */}
      {/* MAIN WINDOW */}
      {/* ====================================================== */}

      <div className="flex h-[96vh] w-full max-w-[1450px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#F7F9FC] shadow-2xl sm:h-[94vh] sm:rounded-3xl">

        {/* ==================================================== */}
        {/* HEADER */}
        {/* ==================================================== */}

        <div className="relative shrink-0 bg-[#102236] px-4 py-3.5 text-white sm:px-6 sm:py-4">

          {/* Yellow accent */}
          <div className="absolute left-0 right-0 top-0 h-1 bg-[#F6C945]" />

          <div className="flex items-center justify-between gap-3">

            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6C945] text-[#102236] shadow-sm sm:h-11 sm:w-11">
                <Mail
                  size={20}
                  strokeWidth={2.2}
                />
              </div>

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h2 className="truncate text-base font-bold sm:text-lg">
                    Send Email
                  </h2>

                  {activeTemplate && (
                    <span className="hidden items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/80 sm:inline-flex">
                      <FileText size={10} />
                      Template
                    </span>
                  )}

                </div>

                <p className="truncate text-xs text-slate-300 sm:text-sm">
                  Compose and send email to lead
                </p>

              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2">

              {/* HISTORY */}
              <button
                type="button"
                onClick={onHistory}
                disabled={sending}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm"
              >
                <History size={16} />
                <span className="hidden sm:inline">
                  History
                </span>
              </button>

              {/* CLOSE */}
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                aria-label="Close email composer"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50 sm:h-10 sm:w-10"
              >
                <X size={20} />
              </button>

            </div>

          </div>
        </div>

        {/* ==================================================== */}
        {/* BODY */}
        {/* ==================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-4 lg:p-5">

          <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_260px] xl:grid-cols-[285px_minmax(0,1fr)_285px]">

            {/* ================================================= */}
            {/* LEFT — TEMPLATES */}
            {/* ================================================= */}

            <div className="flex min-h-[300px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:min-h-0">

              {/* Header */}
              <div className="shrink-0 border-b border-slate-100 p-4">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6C945]/15 text-[#806400]">
                    <FileText size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#102236]">
                      Email Templates
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Choose a template
                    </p>
                  </div>

                </div>

                {/* Search */}
                <div className="relative mt-3">

                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) =>
                      setTemplateSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search templates..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#F6C945] focus:bg-white focus:ring-2 focus:ring-[#F6C945]/15"
                  />

                </div>
              </div>

              {/* Template list */}
              <div className="min-h-0 flex-1 overflow-y-auto p-2">

                {templatesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2
                      size={22}
                      className="animate-spin text-[#102236]"
                    />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="px-4 py-10 text-center">

                    <FileText
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      No templates found
                    </p>

                  </div>
                ) : (
                  <div className="space-y-1.5">

                    {filteredTemplates.map(
                      (template, index) => {
                        const templateName =
                          template?.name ||
                          template?.title ||
                          `Template ${index + 1}`;

                        const templateCategory =
                          template?.category ||
                          "Email";

                        const isActive =
                          activeTemplate &&
                          (
                            activeTemplate?._id ||
                            activeTemplate?.id
                          ) ===
                            (
                              template?._id ||
                              template?.id
                            );

                        return (
                          <button
                            key={
                              template?._id ||
                              template?.id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              handleTemplateSelect(
                                template
                              )
                            }
                            className={`group w-full rounded-xl border p-3 text-left transition ${
                              isActive
                                ? "border-[#F6C945]/50 bg-[#F6C945]/10 shadow-sm"
                                : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  isActive
                                    ? "bg-[#F6C945] text-[#102236]"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-[#102236] group-hover:text-[#F6C945]"
                                }`}
                              >
                                <Mail size={15} />
                              </div>

                              <div className="min-w-0 flex-1">

                                <p
                                  className={`truncate text-xs font-bold ${
                                    isActive
                                      ? "text-[#102236]"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {templateName}
                                </p>

                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                  {templateCategory}
                                </p>

                              </div>

                              {isActive && (
                                <CheckCircle2
                                  size={16}
                                  className="shrink-0 text-[#806400]"
                                />
                              )}

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </div>

            {/* ================================================= */}
            {/* CENTER — COMPOSER */}
            {/* ================================================= */}

            <div className="min-w-0 space-y-3">

              {/* Recipient */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                <div className="flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#102236] text-sm font-bold text-white">
                      {leadName
                        ? leadName
                            .split(" ")
                            .slice(0, 2)
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .toUpperCase()
                        : "LD"}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-[#102236]">
                        {leadName || "Lead"}
                      </p>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">

                        <Mail
                          size={13}
                          className="shrink-0"
                        />

                        <span className="truncate">
                          {to ||
                            email ||
                            "No email address"}
                        </span>

                      </div>

                    </div>

                  </div>

                  <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 sm:inline-flex">
                    <Mail size={12} />
                    Email
                  </span>

                </div>

                {/* Editable recipient */}
                <div className="mt-4">

                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    To
                  </label>

                  <input
                    type="email"
                    value={to}
                    onChange={(e) =>
                      setTo(e.target.value)
                    }
                    disabled={sending}
                    placeholder="lead@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#F6C945] focus:bg-white focus:ring-2 focus:ring-[#F6C945]/15 disabled:opacity-60"
                  />

                </div>

              </div>

              {/* Subject + Message */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Subject */}
                <div className="border-b border-slate-100 p-4 sm:p-5">

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Subject
                    </label>

                    <span className="text-[10px] text-slate-400">
                      {subject.length}/200
                    </span>

                  </div>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) =>
                      setSubject(e.target.value)
                    }
                    maxLength={200}
                    disabled={sending}
                    placeholder="Enter email subject"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-[#102236] outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#F6C945] focus:bg-white focus:ring-2 focus:ring-[#F6C945]/15 disabled:opacity-60"
                  />

                </div>

                {/* Message */}
                <div className="p-4 sm:p-5">

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Email Message
                    </label>

                    <span className="text-[10px] text-slate-400">
                      {message.length}/5000
                    </span>

                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center gap-1 overflow-x-auto rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 p-2">

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-white"
                    >
                      Normal
                    </button>

                    <div className="mx-1 h-5 w-px bg-slate-200" />

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-white"
                    >
                      B
                    </button>

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm italic text-slate-600 hover:bg-white"
                    >
                      I
                    </button>

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-sm font-medium underline text-slate-600 hover:bg-white"
                    >
                      U
                    </button>

                    <div className="mx-1 h-5 w-px bg-slate-200" />

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-white"
                    >
                      • List
                    </button>

                    <button
                      type="button"
                      className="rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-white"
                    >
                      Link
                    </button>

                  </div>

                  <textarea
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    maxLength={5000}
                    placeholder="Write your email message..."
                    rows={12}
                    disabled={sending}
                    className="min-h-[260px] w-full resize-y rounded-b-xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#F6C945] focus:ring-2 focus:ring-[#F6C945]/15 disabled:opacity-60 sm:min-h-[300px]"
                  />

                </div>

              </div>

              {/* Preview */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-3">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Eye size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#102236]">
                        Email Preview
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Preview before sending
                      </p>
                    </div>

                  </div>

                  <span className="text-[10px] font-semibold text-blue-600">
                    Preview
                  </span>

                </div>

                <div className="p-4 sm:p-5">

                  <div className="rounded-xl border border-slate-200 bg-white">

                    <div className="border-b border-slate-100 p-4">

                      <div className="flex gap-2 text-xs">

                        <span className="font-semibold text-slate-400">
                          To:
                        </span>

                        <span className="break-all text-slate-700">
                          {to || "No recipient"}
                        </span>

                      </div>

                      <div className="mt-2 flex gap-2 text-xs">

                        <span className="font-semibold text-slate-400">
                          Subject:
                        </span>

                        <span className="text-slate-700">
                          {subject ||
                            "(No subject)"}
                        </span>

                      </div>

                    </div>

                    <div className="max-h-[260px] overflow-y-auto p-4">

                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {message ||
                          "Your email message will appear here."}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* RIGHT — LEAD INFORMATION */}
            {/* ================================================= */}

            <div className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Header */}
              <div className="border-b border-slate-100 bg-[#102236] p-4 text-white">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6C945] text-[#102236]">
                    <User size={15} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      Lead Information
                    </h3>

                    <p className="text-[10px] text-slate-300">
                      Contact details
                    </p>
                  </div>

                </div>

              </div>

              {/* Lead */}
              <div className="p-4">

                {/* Name */}
                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F6C945] text-sm font-bold text-[#102236]">
                    {leadName
                      ? leadName
                          .split(" ")
                          .slice(0, 2)
                          .map(
                            (name) =>
                              name[0]
                          )
                          .join("")
                          .toUpperCase()
                      : "LD"}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-[#102236]">
                      {leadName || "Lead"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      Lead
                    </p>

                  </div>

                </div>

                {/* Details */}
                <div className="mt-5 space-y-3">

                  <div className="flex items-start gap-3">

                    <Mail
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="mt-0.5 break-all text-xs font-medium text-slate-700">
                        {email ||
                          "No email"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <Phone
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-slate-700">
                        {getLeadPhone() ||
                          "No phone"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <GraduationCap
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Course
                      </p>

                      <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                        {getLeadCourse() ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Location
                      </p>

                      <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                        {getLeadLocation() ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <Building2
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Institute
                      </p>

                      <p className="mt-0.5 truncate text-xs font-medium text-slate-700">
                        {getLeadInstitute() ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <Clock
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        {getLeadStatus()}
                      </span>

                    </div>

                  </div>

                </div>

                {/* Personalization */}
                <div className="mt-5 rounded-xl border border-[#F6C945]/30 bg-[#F6C945]/10 p-3">

                  <div className="flex items-start gap-2">

                    <Sparkles
                      size={15}
                      className="mt-0.5 shrink-0 text-[#806400]"
                    />

                    <div>

                      <p className="text-xs font-bold text-[#806400]">
                        Personalization
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Template information is
                        automatically personalized
                        using this lead's details.
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* =================================================== */}
          {/* ERROR */}
          {/* =================================================== */}

          {error && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertCircle size={15} />
              </div>

              <p className="pt-1 text-xs leading-5 text-red-700 sm:text-sm">
                {error}
              </p>

            </div>
          )}

          {/* =================================================== */}
          {/* SUCCESS */}
          {/* =================================================== */}

          {success && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={15} />
              </div>

              <p className="pt-1 text-xs leading-5 text-emerald-700 sm:text-sm">
                {success}
              </p>

            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* FOOTER */}
        {/* ==================================================== */}

        <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-5 sm:py-4">

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">

            {/* Cancel */}
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#102236] disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Send */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#102236] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#182d44] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[145px]"
            >

              {sending ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Send
                    size={17}
                    strokeWidth={2.2}
                  />

                  Send Email
                </>
              )}

            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default EmailComposer;