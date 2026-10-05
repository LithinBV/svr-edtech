import React from "react";
import { Mail } from "lucide-react";

const EmailButton = ({
  leadId,
  email,
  leadName = "",
  onOpen,
  disabled = false,
  className = "",
}) => {
  const handleClick = () => {
    if (disabled) return;

    if (!leadId) {
      console.error("EmailButton: leadId is required");
      return;
    }

    if (!email) {
      console.error(
        "EmailButton: lead email is required"
      );
      return;
    }

    if (typeof onOpen === "function") {
      onOpen({
        leadId,
        email,
        leadName,
      });

      return;
    }

    // Fallback event so the composer can be opened
    // even when onOpen is not passed directly.
    window.dispatchEvent(
      new CustomEvent("open-email-composer", {
        detail: {
          leadId,
          email,
          leadName,
        },
      })
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title="Send Email"
      aria-label="Send Email"
      className={`
        group
        relative
        inline-flex
        min-h-[42px]
        items-center
        justify-center
        gap-2
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-2.5
        text-sm
        font-semibold
        text-[#102236]
        shadow-sm
        transition-all
        duration-200
        hover:border-[#F6C945]
        hover:bg-[#F6C945]/10
        hover:text-[#102236]
        hover:shadow-md
        active:scale-[0.97]
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:border-slate-200
        disabled:hover:bg-white
        disabled:hover:shadow-sm
        ${className}
      `}
    >
      {/* Small yellow accent */}
      <span
        className="
          absolute
          left-0
          top-0
          h-full
          w-1
          bg-[#F6C945]
          transition-all
          duration-200
          group-hover:w-1.5
        "
      />

      {/* Email icon */}
      <span
        className="
          relative
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#F6C945]/15
          text-[#806400]
          transition-all
          duration-200
          group-hover:bg-[#F6C945]/25
        "
      >
        <Mail
          size={16}
          strokeWidth={2.2}
        />
      </span>

      <span className="relative">
        Email
      </span>
    </button>
  );
};

export default EmailButton;