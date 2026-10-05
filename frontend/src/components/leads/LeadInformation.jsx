import React from "react";
import { useNavigate } from "react-router-dom";
import DetailField from "./DetailField";

const LeadInformation = ({ lead }) => {
    // =========================================================
    // PHONE / EMAIL
    // =========================================================

    const navigate = useNavigate();

    const hasPhone = Boolean(lead?.contact);
    const hasEmail = Boolean(lead?.email);

    const leadId = lead?._id || lead?.id || "";

    // =========================================================
    // WHATSAPP
    // =========================================================

    const handleWhatsApp = () => {
        if (!hasPhone || !leadId) return;

        navigate(`/communications/whatsapp/${leadId}`, {
            state: {
                lead,
            },
        });
    };

    // =========================================================
    // CALL
    // =========================================================

    const handleCall = () => {
        if (!hasPhone || !leadId) return;

        navigate(`/communications/calls/${leadId}`, {
            state: {
                lead,
            },
        });
    };

    // =========================================================
    // EMAIL
    // =========================================================

    const handleEmail = () => {
        if (!hasEmail || !leadId) return;

        navigate(`/communications/email/${leadId}`, {
            state: {
                lead,
            },
        });
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <>
            {/* =================================================
                ANIMATION
            ================================================= */}

            <style>
                {`
                    @keyframes leadInfoFade {
                        from {
                            opacity: 0;
                            transform: translateY(4px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            <section
                className="
                    group
                    mb-5
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:shadow-md
                    animate-[leadInfoFade_0.25s_ease-out]
                "
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        relative
                        overflow-hidden
                        border-b
                        border-slate-200
                        bg-[#102236]
                        px-5
                        py-5
                        sm:px-6
                    "
                >
                    {/* Yellow accent */}

                    <div
                        className="
                            absolute
                            right-0
                            top-0
                            h-full
                            w-1
                            bg-[#F6C945]
                        "
                    />

                    <div className="flex items-center gap-3">

                        {/* Header Icon */}

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#F6C945]
                                text-[#102236]
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                />

                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 8v6"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M22 11h-6"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Lead Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-300">
                                Basic information of the lead.
                            </p>
                        </div>

                    </div>
                </div>

                {/* =================================================
                    MAIN CONTENT

                    LEFT  = LEAD DETAILS
                    RIGHT = CONTACT ACTIONS
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-[1fr_300px]
                    "
                >

                    {/* =================================================
                        LEFT SIDE - LEAD DETAILS
                    ================================================= */}

                    <div
                        className="
                            p-5
                            sm:p-6
                            lg:border-r
                            lg:border-slate-200
                        "
                    >

                        <div className="mb-5">

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-[#102236]
                                "
                            >
                                Lead Details
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Basic details provided by the lead.
                            </p>

                        </div>

                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-x-8
                                gap-y-6
                                sm:grid-cols-2
                            "
                        >

                            <DetailField
                                label="Full Name"
                                value={lead?.name}
                            />

                            <DetailField
                                label="Email"
                                value={lead?.email}
                            />

                            <DetailField
                                label="Contact Number"
                                value={lead?.contact}
                            />

                            <DetailField
                                label="Gender"
                                value={lead?.gender}
                            />

                            <DetailField
                                label="Lead Source"
                                value={lead?.leadSource}
                            />

                            <DetailField
                                label="Lead Type"
                                value={lead?.leadType}
                            />

                            <DetailField
                                label="Program Interest"
                                value={lead?.programInterest}
                            />

                        </div>
                    </div>

                    {/* =================================================
                        RIGHT SIDE - CONTACT LEAD
                    ================================================= */}

                    <div
                        className="
                            border-t
                            border-slate-200
                            bg-slate-50
                            p-5
                            sm:p-6
                            lg:border-t-0
                        "
                    >

                        <div className="mb-5">

                            <p
                                className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    text-[#102236]
                                "
                            >
                                Contact Lead
                            </p>

                            <p className="mt-1 text-sm leading-5 text-slate-500">
                                Choose an action to contact this lead.
                            </p>

                        </div>

                        {/* =================================================
                            CONTACT BUTTONS
                        ================================================= */}

                        <div className="flex flex-col gap-3">

                            {/* =================================================
                                WHATSAPP
                            ================================================= */}

                            <button
                                type="button"
                                onClick={handleWhatsApp}
                                disabled={!hasPhone || !leadId}
                                className={`
                                    group
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition-all
                                    duration-200
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60

                                    ${
                                        hasPhone && leadId
                                            ? "border-slate-200 bg-white text-slate-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                    }
                                `}
                            >

                                <span
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-green-100
                                        text-green-600
                                        transition
                                        duration-200
                                        group-hover:bg-green-200
                                    "
                                >

                                    {/* WhatsApp icon */}

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.4 8.4 0 0 1-4.1-1.1L3 20l1.2-4.7A8.4 8.4 0 0 1 3 11.2a8.5 8.5 0 1 1 18 .3Z" />

                                        <path d="M8.5 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2.1.4-.1.6l-.5.6c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.6.7c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.4.3-1 .4-1.5.3-1-.2-2.1-.8-3.2-1.8-1.1-1-1.7-2.1-1.9-3.1-.1-.5 0-1.1.2-1.5Z" />
                                    </svg>

                                </span>

                                <span>
                                    WhatsApp
                                </span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="
                                        ml-auto
                                        h-4
                                        w-4
                                        opacity-0
                                        transition-all
                                        duration-200
                                        group-hover:translate-x-1
                                        group-hover:opacity-100
                                    "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 18 6-6-6-6"
                                    />
                                </svg>

                            </button>

                            {/* =================================================
                                CALL
                            ================================================= */}

                            <button
                                type="button"
                                onClick={handleCall}
                                disabled={!hasPhone || !leadId}
                                className={`
                                    group
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition-all
                                    duration-200
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60

                                    ${
                                        hasPhone && leadId
                                            ? "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                    }
                                `}
                            >

                                <span
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-indigo-100
                                        text-indigo-600
                                        transition
                                        duration-200
                                        group-hover:bg-indigo-200
                                    "
                                >

                                    {/* Phone icon */}

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                                    </svg>

                                </span>

                                <span>
                                    Call Lead
                                </span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="
                                        ml-auto
                                        h-4
                                        w-4
                                        opacity-0
                                        transition-all
                                        duration-200
                                        group-hover:translate-x-1
                                        group-hover:opacity-100
                                    "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 18 6-6-6-6"
                                    />
                                </svg>

                            </button>

                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <button
                                type="button"
                                onClick={handleEmail}
                                disabled={!hasEmail || !leadId}
                                className={`
                                    group
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    px-4
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition-all
                                    duration-200
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60

                                    ${
                                        hasEmail && leadId
                                            ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                    }
                                `}
                            >

                                <span
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        bg-blue-100
                                        text-blue-600
                                        transition
                                        duration-200
                                        group-hover:bg-blue-200
                                    "
                                >

                                    {/* Email icon */}

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <rect
                                            width="20"
                                            height="16"
                                            x="2"
                                            y="4"
                                            rx="2"
                                        />

                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>

                                </span>

                                <span>
                                    Send Email
                                </span>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="
                                        ml-auto
                                        h-4
                                        w-4
                                        opacity-0
                                        transition-all
                                        duration-200
                                        group-hover:translate-x-1
                                        group-hover:opacity-100
                                    "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9 18 6-6-6-6"
                                    />
                                </svg>

                            </button>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LeadInformation;