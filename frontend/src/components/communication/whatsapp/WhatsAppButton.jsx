import React from "react";
import { MessageCircle } from "lucide-react";

/**
 * WhatsAppButton
 *
 * Opens the WhatsApp composer for a lead.
 *
 * Props:
 * - leadId       : Lead MongoDB ID
 * - phoneNumber  : Lead WhatsApp/mobile number
 * - leadName     : Lead name
 * - onOpen       : Optional callback
 * - disabled     : Optional disabled state
 * - size         : "sm" | "md" | "lg"
 */

const WhatsAppButton = ({
  leadId,
  phoneNumber,
  leadName = "",
  onOpen,
  disabled = false,
  size = "md",
}) => {
  // =====================================================
  // SIZE
  // =====================================================

  const sizeClasses = {
    sm: {
      button: "w-9 h-9",
      icon: 16,
    },

    md: {
      button: "w-10 h-10",
      icon: 18,
    },

    lg: {
      button: "w-11 h-11",
      icon: 20,
    },
  };

  const currentSize =
    sizeClasses[size] || sizeClasses.md;


  // =====================================================
  // OPEN COMPOSER
  // =====================================================

  const handleClick = () => {
    if (disabled) return;

    if (!leadId) {
      console.error(
        "WhatsAppButton: leadId is required"
      );
      return;
    }

    if (!phoneNumber) {
      console.error(
        "WhatsAppButton: phoneNumber is required"
      );
      return;
    }

    if (onOpen) {
      onOpen({
        leadId,
        phoneNumber,
        leadName,
      });

      return;
    }

    // Fallback event.
    // The parent can listen for this event if required.
    window.dispatchEvent(
      new CustomEvent("open-whatsapp-composer", {
        detail: {
          leadId,
          phoneNumber,
          leadName,
        },
      })
    );
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Send WhatsApp message"
      aria-label="Send WhatsApp message"
      className={`
        ${currentSize.button}
        inline-flex
        items-center
        justify-center
        rounded-xl
        transition-all
        duration-200
        border
        shrink-0

        ${
          disabled
            ? `
              bg-gray-100
              text-gray-400
              border-gray-200
              cursor-not-allowed
            `
            : `
              bg-[#25D366]
              text-white
              border-[#25D366]

              hover:bg-[#20BD5A]
              hover:border-[#20BD5A]

              hover:shadow-md
              hover:scale-105

              active:scale-95
            `
        }
      `}
    >
      <MessageCircle
        size={currentSize.icon}
        strokeWidth={2.2}
      />
    </button>
  );
};

export default WhatsAppButton;