import React from "react";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";

/**
 * WhatsAppLeadInfo
 *
 * Displays lead information inside the WhatsApp composer.
 *
 * Props:
 * - lead       : Lead object
 * - leadName   : Lead name fallback
 * - phoneNumber: Phone number fallback
 * - agent      : Current executive/agent
 */

const WhatsAppLeadInfo = ({
  lead = {},
  leadName = "",
  phoneNumber = "",
  agent = null,
}) => {
  // =====================================================
  // HELPERS
  // =====================================================

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return String(value).trim();
      }
    }

    return "";
  };

  const name = getValue(
    lead?.name,
    lead?.fullName,
    lead?.leadName,
    leadName
  );

  const phone = getValue(
    lead?.phone,
    lead?.phoneNumber,
    lead?.mobile,
    lead?.contact,
    phoneNumber
  );

  const email = getValue(
    lead?.email,
    lead?.emailAddress
  );

  const course = getValue(
    lead?.course,
    lead?.courseName,
    lead?.interestedCourse,
    lead?.program
  );

  const institution = getValue(
    lead?.institution,
    lead?.institute,
    lead?.college,
    lead?.company
  );

  const location = getValue(
    lead?.location,
    lead?.city,
    lead?.address
  );

  const executive = getValue(
    agent?.name,
    agent?.fullName,
    agent?.username,
    lead?.executiveName,
    lead?.assignedToName
  );


  // =====================================================
  // INITIAL
  // =====================================================

  const initial = name
    ? name.charAt(0).toUpperCase()
    : "L";


  // =====================================================
  // INFORMATION ROW
  // =====================================================

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div
          className="
            w-8 h-8
            rounded-lg
            bg-gray-50
            text-gray-500
            flex items-center justify-center
            shrink-0
          "
        >
          <Icon size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
            {label}
          </p>

          <p className="text-sm text-[#102236] font-medium mt-0.5 break-words">
            {value}
          </p>
        </div>
      </div>
    );
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="h-full flex flex-col">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#102236]">
          Lead Information
        </h3>

        <p className="text-xs text-gray-500 mt-0.5">
          Details used for personalization
        </p>
      </div>


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div
        className="
          rounded-2xl
          border border-gray-200
          bg-gradient-to-br
          from-[#102236]
          to-[#18344B]
          p-4
          mb-4
        "
      >
        <div className="flex items-center gap-3">

          <div
            className="
              w-12 h-12
              rounded-xl
              bg-[#F6C945]
              text-[#102236]
              flex items-center justify-center
              text-lg font-bold
              shrink-0
            "
          >
            {initial}
          </div>

          <div className="min-w-0">
            <p className="text-white font-semibold truncate">
              {name || "Unknown Lead"}
            </p>

            <div className="flex items-center gap-1.5 mt-1 text-white/60">
              <Phone size={12} />

              <span className="text-xs truncate">
                {phone || "No phone number"}
              </span>
            </div>
          </div>

        </div>
      </div>


      {/* =================================================
          DETAILS
      ================================================= */}

      <div
        className="
          rounded-2xl
          border border-gray-200
          bg-white
          px-4
          overflow-hidden
        "
      >

        <InfoRow
          icon={Phone}
          label="Phone"
          value={phone}
        />

        <InfoRow
          icon={Mail}
          label="Email"
          value={email}
        />

        <InfoRow
          icon={GraduationCap}
          label="Course"
          value={course}
        />

        <InfoRow
          icon={Building2}
          label="Institution"
          value={institution}
        />

        <InfoRow
          icon={MapPin}
          label="Location"
          value={location}
        />

        <InfoRow
          icon={Briefcase}
          label="Executive"
          value={executive}
        />

      </div>


      {/* =================================================
          PERSONALIZATION INFO
      ================================================= */}

      <div
        className="
          mt-4
          rounded-xl
          bg-[#F6C945]/10
          border border-[#F6C945]/30
          px-3.5 py-3
        "
      >
        <p className="text-xs font-semibold text-[#806400] mb-1">
          Personalization
        </p>

        <p className="text-[11px] text-gray-600 leading-relaxed">
          Template variables are automatically replaced with
          this lead's information before opening WhatsApp.
        </p>
      </div>

    </div>
  );
};

export default WhatsAppLeadInfo;