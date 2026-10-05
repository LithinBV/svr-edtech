import React from "react";
import {
  MessageCircle,
  Send,
  Info,
  Pencil,
} from "lucide-react";

const WhatsAppMessagePreview = ({
  message = "",
  onMessageChange,
  leadName = "",
  phoneNumber = "",
  disabled = false,
}) => {
  const handleChange = (e) => {
    if (typeof onMessageChange === "function") {
      onMessageChange(e.target.value);
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#102236]">
            Message
          </h3>

          <p className="text-xs text-gray-500 mt-0.5">
            Write your message or use a template
          </p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
          <MessageCircle size={18} />
        </div>
      </div>

      {/* =====================================================
          LEAD INFORMATION
      ===================================================== */}
      <div className="flex items-center gap-3 px-3.5 py-3 mb-4 rounded-xl border border-gray-200 bg-gray-50">

        <div className="w-9 h-9 rounded-full bg-[#102236] text-white flex items-center justify-center text-sm font-bold shrink-0">
          {leadName
            ? leadName.charAt(0).toUpperCase()
            : "L"}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#102236] truncate">
            {leadName || "Lead"}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {phoneNumber || "No phone number"}
          </p>
        </div>
      </div>

      {/* =====================================================
          WRITE MESSAGE
      ===================================================== */}
      <div className="mb-4">

        <div className="flex items-center justify-between mb-2">

          <div className="flex items-center gap-2">
            <Pencil
              size={15}
              className="text-[#102236]"
            />

            <label
              htmlFor="whatsapp-message"
              className="text-sm font-semibold text-[#102236]"
            >
              Write Message
            </label>
          </div>

          <span className="text-[11px] text-gray-400">
            {message.length}/2000
          </span>
        </div>

        <textarea
          id="whatsapp-message"
          value={message}
          onChange={handleChange}
          disabled={disabled}
          maxLength={2000}
          placeholder="Type your WhatsApp message here..."
          className="
            w-full
            min-h-[150px]
            resize-none
            rounded-2xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            text-gray-700
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#F6C945]
            focus:ring-2
            focus:ring-[#F6C945]/20
            disabled:bg-gray-100
            disabled:cursor-not-allowed
          "
        />

        <p className="text-[11px] text-gray-400 mt-1.5">
          You can type your own message or select a template from the left.
        </p>

      </div>

      {/* =====================================================
          WHATSAPP PREVIEW
      ===================================================== */}
      <div className="flex-1 min-h-[260px] rounded-2xl border border-gray-200 bg-[#f5f7f8] overflow-hidden flex flex-col">

        {/* WhatsApp Header */}
        <div className="px-4 py-3 bg-[#102236] text-white flex items-center gap-3">

          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
            <MessageCircle size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              WhatsApp
            </p>

            <p className="text-[10px] text-white/60">
              Message preview
            </p>
          </div>

        </div>

        {/* Chat Area */}
        <div className="flex-1 p-5 flex items-start justify-end flex-col gap-3">

          {message.trim() ? (

            <div className="w-full flex justify-end">

              <div className="relative max-w-[90%] bg-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm border border-gray-100">

                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                  {message}
                </p>

                <div className="flex items-center justify-end gap-1 mt-2">

                  <span className="text-[10px] text-gray-400">
                    Preview
                  </span>

                  <Send
                    size={11}
                    className="text-[#25D366]"
                  />

                </div>

              </div>

            </div>

          ) : (

            <div className="w-full flex-1 flex items-center justify-center text-center px-6">

              <div>

                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">

                  <MessageCircle size={26} />

                </div>

                <p className="text-sm font-semibold text-gray-600">
                  Start writing your message
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Type a custom message or select a template
                </p>

              </div>

            </div>

          )}

        </div>
      </div>

      {/* =====================================================
          INFORMATION
      ===================================================== */}
      <div className="mt-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#F6C945]/10 border border-[#F6C945]/30">

        <Info
          size={16}
          className="text-[#b38a00] mt-0.5 shrink-0"
        />

        <p className="text-xs text-gray-600 leading-relaxed">
          Your message will open in normal WhatsApp.
          Review it there and press <strong>Send</strong> manually.
        </p>

      </div>

    </div>
  );
};

export default WhatsAppMessagePreview;