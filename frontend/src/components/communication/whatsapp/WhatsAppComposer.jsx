import React, { useEffect, useMemo, useState } from "react";

import {
  X,
  ExternalLink,
  Loader2,
  MessageCircle,
  User,
  Phone,
  History,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  getWhatsAppTemplates,
  prepareAndOpenWhatsApp,
} from "../../../services/whatsappApi";

import WhatsAppTemplateList from "./WhatsAppTemplates";
import WhatsAppMessagePreview from "./WhatsAppMessagePreview";
import WhatsAppLeadInfo from "./WhatsAppLeadInfo";

const WhatsAppComposer = ({
  isOpen,
  onClose,
  onHistory,
  leadId,
  phoneNumber,
  leadName = "",
  onSent,
  lead = {},
  agent = {},
}) => {
  // =====================================================
  // STATE
  // =====================================================

  const [templates, setTemplates] = useState([]);

  const [selectedTemplate, setSelectedTemplate] =
    useState(null);

  const [message, setMessage] = useState("");

  const [loadingTemplates, setLoadingTemplates] =
    useState(false);

  const [openingWhatsApp, setOpeningWhatsApp] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // GET LEAD INFORMATION
  // =====================================================

  const leadData = useMemo(() => {
    return {
      ...lead,

      _id: lead?._id || leadId,

      name:
        lead?.name ||
        lead?.fullName ||
        lead?.leadName ||
        leadName ||
        "",

      phone:
        lead?.contact ||
        lead?.phone ||
        lead?.mobile ||
        lead?.phoneNumber ||
        phoneNumber ||
        "",

      email:
        lead?.email ||
        lead?.leadEmail ||
        "",

      course:
        lead?.course ||
        lead?.courseName ||
        lead?.interestedCourse ||
        "",

      location:
        lead?.location ||
        lead?.city ||
        lead?.place ||
        "",

      institute:
        lead?.institute ||
        lead?.institution ||
        lead?.college ||
        "",
    };
  }, [
    lead,
    leadId,
    phoneNumber,
    leadName,
  ]);

  // =====================================================
  // LOAD TEMPLATES
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        setError("");

        const data =
          await getWhatsAppTemplates();

        const templateList =
          data?.templates ||
          data?.data ||
          (Array.isArray(data) ? data : []);

        setTemplates(
          Array.isArray(templateList)
            ? templateList
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load WhatsApp templates:",
          err
        );

        setError(
          err?.message ||
            "Failed to load WhatsApp templates."
        );
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadTemplates();
  }, [isOpen]);

  // =====================================================
  // RESET WHEN OPENING
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedTemplate(null);
    setMessage("");
    setError("");
    setSuccess("");
  }, [isOpen]);

  // =====================================================
  // REPLACE VARIABLES
  // =====================================================

  const replaceVariables = (text) => {
    if (!text) {
      return "";
    }

    const agentName =
      agent?.agentName ||
      agent?.name ||
      agent?.fullName ||
      agent?.username ||
      lead?.assignedTo?.name ||
      lead?.assignedExecutive?.name ||
      "";

    const values = {
      name:
        leadData?.name || "",

      leadName:
        leadData?.name || "",

      course:
        leadData?.course || "",

      courseName:
        leadData?.course || "",

      institute:
        leadData?.institute || "",

      institution:
        leadData?.institute || "",

      location:
        leadData?.location || "",

      city:
        leadData?.location || "",

      phone:
        leadData?.phone || "",

      phoneNumber:
        leadData?.phone || "",

      email:
        leadData?.email || "",

      leadEmail:
        leadData?.email || "",

      executive:
        agentName,

      agent:
        agentName,

      agentName:
        agentName,

      companyName:
        "SVR-EDTECH",
    };

    return text.replace(
      /{{\s*([^}]+?)\s*}}/g,
      (match, key) => {
        const cleanKey =
          String(key).trim();

        if (
          values[cleanKey] !== undefined &&
          values[cleanKey] !== ""
        ) {
          return values[cleanKey];
        }

        return match;
      }
    );
  };

  // =====================================================
  // SELECT TEMPLATE
  // =====================================================

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);

    setError("");
    setSuccess("");

    if (!template) {
      setMessage("");
      return;
    }

    const templateMessage =
      template?.message ||
      template?.content ||
      template?.body ||
      "";

    setMessage(
      replaceVariables(templateMessage)
    );
  };

  // =====================================================
  // OPEN WHATSAPP
  // =====================================================

  const handleOpenWhatsApp = async () => {
    if (openingWhatsApp) {
      return;
    }

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // Validate lead
    // -------------------------------------------------

    if (!leadId) {
      setError(
        "Lead information is missing."
      );

      return;
    }

    // -------------------------------------------------
    // Validate phone
    // -------------------------------------------------

    if (!phoneNumber) {
      setError(
        "This lead does not have a WhatsApp/mobile number."
      );

      return;
    }

    // -------------------------------------------------
    // Validate message
    // -------------------------------------------------

    if (!message.trim()) {
      setError(
        "Please select a template or enter a WhatsApp message."
      );

      return;
    }

    try {
      setOpeningWhatsApp(true);

      const data =
        await prepareAndOpenWhatsApp({
          leadId,

          phoneNumber,

          message:
            message.trim(),

          templateName:
            selectedTemplate?.name ||
            null,

          templateId:
            selectedTemplate?._id ||
            selectedTemplate?.id ||
            null,

          lead: {
            ...leadData,

            leadName:
              leadData?.name ||
              leadName,

            phoneNumber,

            email:
              leadData?.email || "",
          },

          agent: {
            ...agent,

            agentName:
              agent?.agentName ||
              agent?.name ||
              agent?.fullName ||
              "",
          },
        });

      if (data?.success) {
        setSuccess(
          "WhatsApp opened. Review the message and press Send in WhatsApp."
        );

        if (onSent) {
          onSent(data);
        }
      }
    } catch (err) {
      console.error(
        "WhatsApp open error:",
        err
      );

      setError(
        err?.message ||
          "Unable to open WhatsApp."
      );
    } finally {
      setOpeningWhatsApp(false);
    }
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleClose = () => {
    if (openingWhatsApp) {
      return;
    }

    setError("");
    setSuccess("");
    setSelectedTemplate(null);
    setMessage("");

    onClose?.();
  };

  // =====================================================
  // DON'T RENDER
  // =====================================================

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/60
        p-3 sm:p-5
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="
          flex
          h-[95vh]
          max-h-[900px]
          w-full
          max-w-[1450px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          sm:h-[92vh]
          sm:rounded-3xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex shrink-0
            items-center justify-between
            border-b border-white/10
            bg-[#102236]
            px-4 py-4
            sm:px-6
          "
        >
          {/* Header title */}

          <div
            className="
              flex items-center gap-3
            "
          >
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-[#25D366]
                text-white
              "
            >
              <MessageCircle
                size={21}
                strokeWidth={2.2}
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-bold
                  text-white
                  sm:text-lg
                "
              >
                Send WhatsApp Message
              </h2>

              <p
                className="
                  text-xs
                  text-white/60
                "
              >
                Prepare and open WhatsApp
              </p>
            </div>
          </div>

          {/* =================================================
              HISTORY + CLOSE
          ================================================= */}

          <div className="flex items-center gap-2">

            {/* History button */}

            <button
              type="button"
              onClick={onHistory}
              disabled={!leadId}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-3 py-2
                text-xs
                font-semibold
                text-white/80
                transition
                hover:bg-white/10
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
                sm:px-3.5
                sm:text-sm
              "
              title="WhatsApp History"
            >
              <History size={16} />

              <span>
                History
              </span>
            </button>

            {/* Close button */}

            <button
              type="button"
              onClick={handleClose}
              disabled={openingWhatsApp}
              className="
                rounded-lg
                p-2
                text-white/70
                transition
                hover:bg-white/10
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title="Close"
            >
              <X size={20} />
            </button>

          </div>
        </div>

        {/* =================================================
            LEAD INFORMATION
        ================================================= */}

        <div
          className="
            shrink-0
            border-b border-gray-100
            bg-gray-50
            px-4 py-3
            sm:px-6
          "
        >
          <div
            className="
              flex items-center
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex min-w-0
                items-center gap-3
              "
            >
              <div
                className="
                  flex h-10 w-10
                  shrink-0
                  items-center justify-center
                  rounded-full
                  bg-[#102236]
                  text-white
                "
              >
                <User size={18} />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                >
                  {leadData?.name ||
                    "Lead"}
                </p>

                <div
                  className="
                    mt-0.5
                    flex items-center
                    gap-1.5
                    text-xs
                    text-gray-500
                  "
                >
                  <Phone size={12} />

                  <span>
                    {leadData?.phone ||
                      "No phone number"}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-3 py-1.5
                  text-xs
                  font-semibold
                  text-emerald-600
                "
              >
                WhatsApp
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-hidden
          "
        >
          <div
            className="
              grid
              h-full
              min-h-0
              grid-cols-1
              lg:grid-cols-[280px_minmax(0,1fr)_320px]
            "
          >

            {/* =================================================
                LEFT — TEMPLATES
            ================================================= */}

            <div
              className="
                hidden
                min-h-0
                border-r
                border-gray-100
                p-5
                lg:block
              "
            >
              <WhatsAppTemplateList
                templates={templates}
                selectedTemplate={
                  selectedTemplate
                }
                onSelect={
                  handleTemplateSelect
                }
                loading={
                  loadingTemplates
                }
              />
            </div>

            {/* =================================================
                CENTER — MESSAGE
            ================================================= */}

            <div
              className="
                min-h-0
                overflow-y-auto
                p-4
                sm:p-6
              "
            >

              {/* Mobile template list */}

              <div className="mb-5 lg:hidden">
                <WhatsAppTemplateList
                  templates={templates}
                  selectedTemplate={
                    selectedTemplate
                  }
                  onSelect={
                    handleTemplateSelect
                  }
                  loading={
                    loadingTemplates
                  }
                />
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    mb-4
                    flex items-start gap-2
                    rounded-xl
                    border border-red-200
                    bg-red-50
                    px-3 py-3
                    text-sm text-red-700
                  "
                >
                  <AlertCircle
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {/* Success */}

              {success && (
                <div
                  className="
                    mb-4
                    flex items-start gap-2
                    rounded-xl
                    border border-green-200
                    bg-green-50
                    px-3 py-3
                    text-sm text-green-700
                  "
                >
                  <CheckCircle2
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                    "
                  />

                  <span>
                    {success}
                  </span>
                </div>
              )}

              {/* =================================================
                  MESSAGE PREVIEW

                  IMPORTANT FIX:
                  Pass leadName and phoneNumber.
              ================================================= */}

              <WhatsAppMessagePreview
                template={selectedTemplate}
                message={message}
                onMessageChange={setMessage}
                leadName={
                  leadData?.name ||
                  leadName ||
                  "Lead"
                }
                phoneNumber={
                  leadData?.phone ||
                  phoneNumber ||
                  ""
                }
              />

            </div>

            {/* =================================================
                RIGHT — LEAD INFO
            ================================================= */}

            <div
              className="
                hidden
                min-h-0
                overflow-y-auto
                border-l
                border-gray-100
                bg-gray-50/50
                p-5
                lg:block
              "
            >
              <WhatsAppLeadInfo
                lead={leadData}
                agent={agent}
              />
            </div>

          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            flex shrink-0
            flex-col-reverse
            gap-3
            border-t
            border-gray-100
            bg-gray-50
            px-4 py-4
            sm:flex-row
            sm:justify-end
            sm:px-6
          "
        >

          {/* Cancel */}

          <button
            type="button"
            onClick={handleClose}
            disabled={openingWhatsApp}
            className="
              rounded-xl
              border border-gray-200
              bg-white
              px-5 py-2.5
              text-sm
              font-semibold
              text-gray-700
              transition
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          {/* Open WhatsApp */}

          <button
            type="button"
            onClick={
              handleOpenWhatsApp
            }
            disabled={
              openingWhatsApp ||
              !message.trim() ||
              !phoneNumber
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#25D366]
              px-5 py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-[#20BD5A]
              hover:shadow-md
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:bg-gray-300
              disabled:text-gray-500
              disabled:shadow-none
            "
          >
            {openingWhatsApp ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Opening WhatsApp...
              </>
            ) : (
              <>
                <ExternalLink
                  size={17}
                  strokeWidth={2.2}
                />

                Open WhatsApp
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default WhatsAppComposer;