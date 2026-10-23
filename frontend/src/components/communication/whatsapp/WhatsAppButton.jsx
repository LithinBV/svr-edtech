import React, { useMemo } from "react";
import { MessageCircle } from "lucide-react";

/**
 * WhatsAppButton
 *
 * Opens the WhatsApp composer for a lead.
 * Enforces 1:1 lead assignment ownership:
 * - Admins & Managers can always message.
 * - Executives can ONLY message leads assigned to them.
 *
 * Props:
 * - leadId       : Lead MongoDB ID
 * - phoneNumber  : Lead WhatsApp/mobile number
 * - leadName     : Lead name
 * - assignedTo   : ID or object of the assigned executive (e.g. lead.assignedTo)
 * - onOpen       : Optional callback
 * - disabled     : Optional disabled override
 * - size         : "sm" | "md" | "lg"
 */

const WhatsAppButton = ({
  leadId,
  phoneNumber,
  leadName = "",
  assignedTo = null,
  onOpen,
  disabled = false,
  size = "md",
}) => {
  // =====================================================
  // CURRENT USER & ROLE RESOLUTION
  // =====================================================

  const currentUser = useMemo(() => {
    try {
      const rawUser =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("authUser");
      if (rawUser) return JSON.parse(rawUser);

      // Fallback: Decode token payload if stored as standard JWT
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");
      if (token && token.includes(".")) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return {
          _id: payload.userId || payload.id || payload._id,
          role: payload.role,
        };
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Determine permissions
  const canAccess = useMemo(() => {
    if (!currentUser) return true; // Default permissive if user object isn't parsed

    const role = String(currentUser.role || "").toLowerCase();
    const isPrivileged =
      role === "admin" ||
      role === "manager" ||
      role === "superadmin";

    if (isPrivileged) return true;

    // If an assigned executive is specified, verify ownership
    if (assignedTo) {
      const assignedId =
        typeof assignedTo === "object"
          ? String(assignedTo._id || assignedTo.id || "")
          : String(assignedTo);

      const myId = String(currentUser._id || currentUser.userId || "");
      if (assignedId && myId && assignedId !== myId) {
        return false; // Owned by another executive
      }
    }

    return true;
  }, [currentUser, assignedTo]);

  // =====================================================
  // SIZE STYLES
  // =====================================================

  const sizeClasses = {
    sm: { button: "w-9 h-9", icon: 16 },
    md: { button: "w-10 h-10", icon: 18 },
    lg: { button: "w-11 h-11", icon: 20 },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;
  const isDisabled = disabled || !canAccess;

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleClick = () => {
    if (isDisabled) return;

    if (!leadId) {
      console.error("WhatsAppButton: leadId is required");
      return;
    }

    if (!phoneNumber) {
      console.error("WhatsAppButton: phoneNumber is required");
      return;
    }

    if (onOpen) {
      onOpen({
        leadId,
        phoneNumber,
        leadName,
        assignedTo,
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent("open-whatsapp-composer", {
        detail: {
          leadId,
          phoneNumber,
          leadName,
          assignedTo,
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
      disabled={isDisabled}
      title={
        !canAccess
          ? "Assigned to another executive"
          : "Send WhatsApp message"
      }
      aria-label="Send WhatsApp message"
      className={`
        ${currentSize.button}
        inline-flex items-center justify-center rounded-xl transition-all duration-200 border shrink-0
        ${
          isDisabled
            ? `
              bg-gray-100
              text-gray-400
              border-gray-200
              cursor-not-allowed
              opacity-60
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
      <MessageCircle size={currentSize.icon} strokeWidth={2.2} />
    </button>
  );
};

export default WhatsAppButton;