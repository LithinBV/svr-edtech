import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
  Send,
  Mail,
  Loader2,
  FileText,
  User,
  History,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  CalendarDays,
  IndianRupee,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { sendEmail } from "../../../services/emailApi";
import { getEmailTemplates } from "../../../services/emailTemplateApi";

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
  // ============================================================
  // STATE
  // ============================================================

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [templateSearch, setTemplateSearch] = useState("");

  const [activeTemplate, setActiveTemplate] =
    useState(selectedTemplate || null);

  const [variableValues, setVariableValues] = useState({
    date: "",
    time: "",
    amount: "",
    mode: "",
    document: "",
    link: "",
  });

  // ============================================================
  // CURRENT USER
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
  // LEAD DATA
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

  const getLeadEmail = () => {
    return (
      lead?.email ||
      lead?.leadEmail ||
      email ||
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

  const getCounsellorName = () => {
    const currentUser = getCurrentUser();

    return (
      currentUser?.name ||
      currentUser?.fullName ||
      currentUser?.userName ||
      currentUser?.username ||
      currentUser?.agentName ||
      currentUser?.counsellor ||
      ""
    );
  };

  // ============================================================
  // TEMPLATE VARIABLES
  // ============================================================

  const getTemplateVariables = () => {
    const counsellor = getCounsellorName();

    const currentLeadName =
      leadName ||
      lead?.name ||
      lead?.fullName ||
      lead?.leadName ||
      "Lead";

    const course = getLeadCourse();
    const phone = getLeadPhone();
    const leadEmail = getLeadEmail();

    return {
      name: currentLeadName,
      counsellor,
      course,

      leadName: currentLeadName,
      leadEmail,
      email: leadEmail,

      agentName: counsellor,
      agent: counsellor,

      courseName: course,

      phone,
      phoneNumber: phone,

      companyName: "SVR-EDTECH",

      date: variableValues.date || "",
      time: variableValues.time || "",
      amount: variableValues.amount || "",
      mode: variableValues.mode || "",
      document: variableValues.document || "",
      link: variableValues.link || "",
    };
  };

  // ============================================================
  // GET TEMPLATE MESSAGE
  // ============================================================

  const getTemplateBody = (template) => {
    if (!template) {
      return "";
    }

    return (
      template.message ||
      template.body ||
      template.content ||
      ""
    );
  };

  // ============================================================
  // FIND TEMPLATE VARIABLES
  // ============================================================

  const templateVariables = useMemo(() => {
    if (!activeTemplate) {
      return [];
    }

    const text = `${activeTemplate.subject || ""}\n${getTemplateBody(
      activeTemplate
    )}`;

    /*
    | IMPORTANT:
    | Correct format:
    | {{name}}
    | {{counsellor}}
    | {{course}}
    |
    | NOT:
    | {{ *name* }}
    */

    const matches =
      text.match(/{{\s*([^}]+?)\s*}}/g) || [];

    const variables = matches
      .map((item) =>
        item
          .replace(/{{/g, "")
          .replace(/}}/g, "")
          .trim()
      )
      .filter(Boolean);

    return [...new Set(variables)];
  }, [activeTemplate]);

  // ============================================================
  // MANUAL VARIABLES
  // ============================================================

  const manualVariables = [
    "date",
    "time",
    "amount",
    "mode",
    "document",
    "link",
  ];

  const requiredManualVariables =
    templateVariables.filter((variable) =>
      manualVariables.includes(variable.toLowerCase())
    );

  // ============================================================
  // REPLACE VARIABLES
  // ============================================================

  const replaceTemplateVariables = (
    text,
    customValues = null
  ) => {
    if (!text) {
      return "";
    }

    const baseVariables = getTemplateVariables();

    const variables = customValues
      ? {
          ...baseVariables,
          ...customValues,
        }
      : baseVariables;

    return text.replace(
      /{{\s*([^}]+?)\s*}}/g,
      (match, key) => {
        const cleanKey = String(key).trim();

        const matchedKey = Object.keys(variables).find(
          (item) =>
            item.toLowerCase() ===
            cleanKey.toLowerCase()
        );

        if (
          matchedKey &&
          variables[matchedKey] !== undefined &&
          variables[matchedKey] !== null &&
          variables[matchedKey] !== ""
        ) {
          return variables[matchedKey];
        }

        return match;
      }
    );
  };

  // ============================================================
  // CHANGE VARIABLE
  // ============================================================

  const handleVariableChange = (
    variable,
    value
  ) => {
    const updatedValues = {
      ...variableValues,
      [variable]: value,
    };

    setVariableValues(updatedValues);

    if (!activeTemplate) {
      return;
    }

    const templateSubject =
      activeTemplate.subject || "";

    const templateMessage =
      getTemplateBody(activeTemplate);

    setSubject(
      replaceTemplateVariables(
        templateSubject,
        updatedValues
      )
    );

    setMessage(
      replaceTemplateVariables(
        templateMessage,
        updatedValues
      )
    );
  };

  // ============================================================
  // LOAD EMAIL TEMPLATES
  // ============================================================

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      setError("");

      const response = await getEmailTemplates();

      console.log(
        "EMAIL TEMPLATES API RESPONSE:",
        response
      );

      let templateList = [];

      if (Array.isArray(response)) {
        templateList = response;
      } else if (
        Array.isArray(response?.templates)
      ) {
        templateList = response.templates;
      } else if (
        Array.isArray(response?.data)
      ) {
        templateList = response.data;
      } else if (
        Array.isArray(response?.data?.templates)
      ) {
        templateList = response.data.templates;
      } else if (
        Array.isArray(response?.result)
      ) {
        templateList = response.result;
      }

      console.log(
        "EMAIL TEMPLATES FOUND:",
        templateList
      );

      setTemplates(
        Array.isArray(templateList)
          ? templateList
          : []
      );

      if (
        !Array.isArray(templateList) ||
        templateList.length === 0
      ) {
        console.warn(
          "No active email templates returned from API."
        );
      }
    } catch (err) {
      console.error(
        "Email template loading error:",
        err
      );

      setTemplates([]);

      setError(
        err?.message ||
          "Failed to load email templates."
      );
    } finally {
      setTemplatesLoading(false);
    }
  };

  // ============================================================
  // INITIALIZE COMPOSER
  // ============================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTo(
      email ||
        lead?.email ||
        lead?.leadEmail ||
        ""
    );

    setError("");
    setSuccess("");
    setTemplateSearch("");

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
          getTemplateBody(selectedTemplate)
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
    lead,
    selectedTemplate,
    leadName,
  ]);

  // ============================================================
  // SELECT TEMPLATE
  // ============================================================

  const handleTemplateSelect = (
    template
  ) => {
    setActiveTemplate(template);

    setError("");
    setSuccess("");

    const resetVariables = {
      date: "",
      time: "",
      amount: "",
      mode: "",
      document: "",
      link: "",
    };

    setVariableValues(resetVariables);

    if (!template) {
      setSubject("");
      setMessage("");
      return;
    }

    setSubject(
      replaceTemplateVariables(
        template.subject || "",
        resetVariables
      )
    );

    setMessage(
      replaceTemplateVariables(
        getTemplateBody(template),
        resetVariables
      )
    );
  };

  // ============================================================
  // FILTER TEMPLATES
  // ============================================================

  const filteredTemplates = templates.filter(
    (template) => {
      const search =
        templateSearch
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      const name =
        template?.name ||
        template?.title ||
        "";

      const category =
        template?.category || "";

      const description =
        template?.description || "";

      return (
        name
          .toLowerCase()
          .includes(search) ||
        category
          .toLowerCase()
          .includes(search) ||
        description
          .toLowerCase()
          .includes(search)
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
      setError(
        "Recipient email is required."
      );
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

    // ----------------------------------------------------------
    // Check manual variables
    // ----------------------------------------------------------

    const unresolvedManualVariables =
      requiredManualVariables.filter(
        (variable) => {
          const value =
            variableValues[variable];

          return !String(value || "").trim();
        }
      );

    if (
      unresolvedManualVariables.length > 0
    ) {
      setError(
        `Please enter: ${unresolvedManualVariables
          .map(
            (item) =>
              item.charAt(0).toUpperCase() +
              item.slice(1)
          )
          .join(", ")}`
      );

      return;
    }

    // ----------------------------------------------------------
    // Check unresolved variables
    // ----------------------------------------------------------

    const unresolvedMatches =
      message.match(
        /{{\s*([^}]+?)\s*}}/g
      ) || [];

    if (unresolvedMatches.length > 0) {
      const unresolvedNames = [
        ...new Set(
          unresolvedMatches.map(
            (item) =>
              item
                .replace(/{{/g, "")
                .replace(/}}/g, "")
                .trim()
          )
        ),
      ];

      setError(
        `Please provide values for: ${unresolvedNames.join(
          ", "
        )}`
      );

      return;
    }

    try {
      setSending(true);

      const response = await sendEmail({
        leadId,
        to: to.trim(),
        cc: null,
        bcc: null,
        subject: subject.trim(),
        message: message.trim(),
        htmlMessage: null,
        templateName:
          activeTemplate?.name || null,
        templateId:
          activeTemplate?._id || null,
      });

      console.log(
        "EMAIL SENT:",
        response
      );

      setSuccess(
        "Email sent successfully."
      );

      if (typeof onSent === "function") {
        onSent(response);
      }
    } catch (err) {
      console.error(
        "Email sending error:",
        err
      );

      setError(
        err?.message ||
          "Failed to send email."
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    if (sending) {
      return;
    }

    setError("");
    setSuccess("");
    onClose?.();
  };

  // ============================================================
  // FORMAT CATEGORY
  // ============================================================

  const formatCategory = (
    category
  ) => {
    if (!category) {
      return "GENERAL";
    }

    return category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  // ============================================================
  // TEMPLATE ICON
  // ============================================================

  const getTemplateIcon = (
    category
  ) => {
    switch (category) {
      case "PAYMENT":
        return (
          <IndianRupee
            size={16}
          />
        );

      case "REMINDER":
        return (
          <Clock size={16} />
        );

      case "FOLLOW_UP":
        return (
          <RefreshCw
            size={16}
          />
        );

      case "COURSE":
        return (
          <FileText
            size={16}
          />
        );

      case "DEMO":
        return (
          <Eye size={16} />
        );

      default:
        return (
          <Mail size={16} />
        );
    }
  };

  // ============================================================
  // MANUAL VARIABLE ICON
  // ============================================================

  const getVariableIcon = (
    variable
  ) => {
    switch (variable) {
      case "date":
        return (
          <CalendarDays
            size={16}
          />
        );

      case "time":
        return (
          <Clock size={16} />
        );

      case "amount":
        return (
          <IndianRupee
            size={16}
          />
        );

      case "link":
        return (
          <LinkIcon
            size={16}
          />
        );

      case "document":
        return (
          <FileText
            size={16}
          />
        );

      default:
        return (
          <Sparkles
            size={16}
          />
        );
    }
  };

  // ============================================================
  // RETURN
  // ============================================================

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102236]/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FECA42]/20 text-[#806400]">
              <Mail size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-[#102236]">
                Compose Email
              </h2>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <User size={13} />

                <span className="truncate">
                  {leadName ||
                    lead?.name ||
                    lead?.fullName ||
                    "Lead"}
                </span>

                {getLeadEmail() && (
                  <>
                    <span>•</span>

                    <span className="truncate">
                      {getLeadEmail()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onHistory && (
              <button
                type="button"
                onClick={onHistory}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-[#F6C945] hover:bg-[#F6C945]/10 hover:text-[#102236] sm:flex"
              >
                <History size={17} />
                History
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              disabled={sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#102236] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={21} />
            </button>
          </div>
        </div>

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {(error || success) && (
          <div className="shrink-0 px-5 pt-4">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            MAIN
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)]">
            {/* =================================================
                LEFT - TEMPLATES
            ================================================= */}

            <div className="flex min-h-0 flex-col border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
              <div className="shrink-0 border-b border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-[#102236]">
                      <FileText
                        size={17}
                      />

                      Templates
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {templatesLoading
                        ? "Loading templates..."
                        : `${templates.length} template${
                            templates.length ===
                            1
                              ? ""
                              : "s"
                          } available`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadTemplates}
                    disabled={
                      templatesLoading
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#102236] disabled:opacity-50"
                    title="Refresh templates"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        templatesLoading
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      templateSearch
                    }
                    onChange={(e) =>
                      setTemplateSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search templates..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#F6C945] focus:bg-white focus:ring-2 focus:ring-[#F6C945]/20"
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {templatesLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2
                        size={24}
                        className="animate-spin"
                      />

                      <span className="text-xs">
                        Loading templates...
                      </span>
                    </div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
                    <FileText
                      size={28}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-600">
                      No templates found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Make sure your email templates
                      exist in MongoDB and are active.
                    </p>

                    <button
                      type="button"
                      onClick={loadTemplates}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#102236] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#18334d]"
                    >
                      <RefreshCw
                        size={14}
                      />
                      Try Again
                    </button>
                  </div>
                ) : filteredTemplates.length ===
                  0 ? (
                  <div className="py-10 text-center">
                    <Search
                      size={25}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-500">
                      No matching templates
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTemplates.map(
                      (template) => {
                        const isSelected =
                          String(
                            activeTemplate?._id
                          ) ===
                          String(
                            template?._id
                          );

                        return (
                          <button
                            key={
                              template._id
                            }
                            type="button"
                            onClick={() =>
                              handleTemplateSelect(
                                template
                              )
                            }
                            className={`group w-full rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? "border-[#F6C945] bg-[#F6C945]/10 shadow-sm"
                                : "border-slate-200 bg-white hover:border-[#F6C945]/60 hover:bg-[#F6C945]/5"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  isSelected
                                    ? "bg-[#F6C945] text-[#102236]"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-[#F6C945]/20 group-hover:text-[#806400]"
                                }`}
                              >
                                {getTemplateIcon(
                                  template?.category
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`line-clamp-2 text-sm font-semibold ${
                                      isSelected
                                        ? "text-[#102236]"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {template?.name ||
                                      template?.title ||
                                      "Untitled Template"}
                                  </p>

                                  {isSelected && (
                                    <ChevronRight
                                      size={16}
                                      className="mt-0.5 shrink-0 text-[#806400]"
                                    />
                                  )}
                                </div>

                                {template?.category && (
                                  <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                    {formatCategory(
                                      template.category
                                    )}
                                  </span>
                                )}

                                {template?.description && (
                                  <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-slate-400">
                                    {
                                      template.description
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                RIGHT - COMPOSER
            ================================================= */}

            <div className="min-h-0 overflow-y-auto bg-white">
              <div className="mx-auto max-w-4xl p-4 sm:p-6">
                {/* =============================================
                    TEMPLATE DETAILS
                ============================================= */}

                {activeTemplate && (
                  <div className="mb-5 rounded-xl border border-[#F6C945]/30 bg-[#F6C945]/5">
                    <div className="flex items-center justify-between gap-3 border-b border-[#F6C945]/20 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6C945]/20 text-[#806400]">
                          <FileText
                            size={17}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#102236]">
                            {activeTemplate.name ||
                              activeTemplate.title ||
                              "Selected Template"}
                          </p>

                          <p className="text-[11px] text-slate-500">
                            {activeTemplate.category
                              ? formatCategory(
                                  activeTemplate.category
                                )
                              : "Email Template"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 shadow-sm">
                        {
                          templateVariables.length
                        }{" "}
                        variable
                        {templateVariables.length ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    {activeTemplate.description && (
                      <div className="px-4 py-3">
                        <p className="text-xs leading-5 text-slate-600">
                          {
                            activeTemplate.description
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* =============================================
                    TO
                ============================================= */}

                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    To
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={to}
                      onChange={(e) =>
                        setTo(
                          e.target.value
                        )
                      }
                      placeholder="recipient@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#F6C945] focus:ring-2 focus:ring-[#F6C945]/20"
                    />
                  </div>
                </div>

                {/* =============================================
                    SUBJECT
                ============================================= */}

                <div className="mb-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                    placeholder="Email subject"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#F6C945] focus:ring-2 focus:ring-[#F6C945]/20"
                  />
                </div>

                {/* =============================================
                    MANUAL VARIABLES
                ============================================= */}

                {requiredManualVariables.length >
                  0 && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={16}
                          className="text-[#806400]"
                        />

                        <h3 className="text-sm font-semibold text-[#102236]">
                          Template Details
                        </h3>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Fill in the details required by
                        this template.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {requiredManualVariables.map(
                        (variable) => (
                          <div
                            key={
                              variable
                            }
                          >
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium capitalize text-slate-600">
                              {getVariableIcon(
                                variable
                              )}

                              {variable}
                            </label>

                            <input
                              type={
                                variable ===
                                "link"
                                  ? "url"
                                  : "text"
                              }
                              value={
                                variableValues[
                                  variable
                                ] || ""
                              }
                              onChange={(
                                e
                              ) =>
                                handleVariableChange(
                                  variable,
                                  e.target
                                    .value
                                )
                              }
                              placeholder={`Enter ${variable}`}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#F6C945] focus:ring-2 focus:ring-[#F6C945]/20"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* =============================================
                    MESSAGE
                ============================================= */}

                <div className="mb-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Message
                    </label>

                    <span className="text-[11px] text-slate-400">
                      {message.length} characters
                    </span>
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    placeholder="Write your email message..."
                    rows={14}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-[#F6C945] focus:ring-2 focus:ring-[#F6C945]/20"
                  />
                </div>

                {/* =============================================
                    PREVIEW
                ============================================= */}

                <div className="rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                    <Eye
                      size={16}
                      className="text-slate-500"
                    />

                    <h3 className="text-sm font-semibold text-[#102236]">
                      Preview
                    </h3>
                  </div>

                  <div className="bg-white p-4">
                    <div className="mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        To
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {to ||
                          "No recipient"}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Subject
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#102236]">
                        {subject ||
                          "No subject"}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {message ||
                          "Your message preview will appear here."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-400">
            {activeTemplate ? (
              <>
                Using{" "}
                <span className="font-semibold text-slate-500">
                  {activeTemplate.name}
                </span>
              </>
            ) : (
              "Select a template to get started"
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={sending}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 rounded-xl bg-[#102236] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18334d] disabled:cursor-not-allowed disabled:opacity-60"
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
                  <Send size={17} />

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