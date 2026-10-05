import React, { useEffect, useRef, useState } from "react";

/* =========================================================
   SIMPLE CUSTOM DROPDOWN
========================================================= */

const SimpleDropdown = ({
    value,
    options = [],
    placeholder = "Select",
    onChange,
    disabled = false,
    selectedStyle = "navy",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const getSelectedClass = () => {
        if (selectedStyle === "yellow") {
            return "bg-[#FFF8D8] text-[#102236]";
        }

        if (selectedStyle === "gray") {
            return "bg-slate-100 text-[#102236]";
        }

        return "bg-[#E8EDF2] text-[#102236]";
    };

    return (
        <div
            ref={dropdownRef}
            className="relative w-full"
        >
            {/* =================================================
                BUTTON
            ================================================= */}

            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen((prev) => !prev);
                    }
                }}
                className={`
                    flex w-full items-center
                    justify-between gap-3
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    text-left
                    text-sm font-semibold
                    text-[#102236]
                    shadow-sm
                    outline-none
                    transition-all duration-200

                    ${
                        isOpen
                            ? "border-[#102236] ring-4 ring-[#102236]/10"
                            : "hover:border-slate-300"
                    }

                    ${
                        disabled
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "cursor-pointer"
                    }
                `}
            >
                <span className="truncate">
                    {selectedOption?.label || placeholder}
                </span>

                <span
                    className={`
                        flex h-7 w-7 shrink-0
                        items-center justify-center
                        rounded-lg
                        bg-slate-100
                        text-[#102236]
                        transition-transform duration-200
                        ${isOpen ? "rotate-180" : ""}
                    `}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-4 w-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m6 9 6 6 6-6"
                        />
                    </svg>
                </span>
            </button>

            {/* =================================================
                OPTIONS
            ================================================= */}

            {isOpen && !disabled && (
                <div
                    className="
                        absolute left-0 right-0 z-50 mt-2
                        overflow-hidden
                        rounded-xl
                        border border-slate-200
                        bg-white
                        p-1.5
                        shadow-xl
                        shadow-slate-900/10
                        animate-[dropdownIn_0.15s_ease-out]
                    "
                >
                    <div className="max-h-60 overflow-y-auto">
                        {placeholder && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                                className={`
                                    flex w-full
                                    items-center justify-between
                                    rounded-lg
                                    px-3 py-2.5
                                    text-left
                                    text-sm
                                    font-medium
                                    transition-colors duration-150

                                    ${
                                        !value
                                            ? getSelectedClass()
                                            : "text-slate-600 hover:bg-slate-50"
                                    }
                                `}
                            >
                                <span>{placeholder}</span>

                                {!value && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m5 12 4 4L19 6"
                                        />
                                    </svg>
                                )}
                            </button>
                        )}

                        {options.map((option) => {
                            const selected =
                                option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        flex w-full
                                        items-center
                                        justify-between
                                        rounded-lg
                                        px-3 py-2.5
                                        text-left
                                        text-sm
                                        font-semibold
                                        transition-colors duration-150

                                        ${
                                            selected
                                                ? getSelectedClass()
                                                : "text-slate-700 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    <span className="truncate">
                                        {option.label}
                                    </span>

                                    {selected && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            className="h-4 w-4 shrink-0"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m5 12 4 4L19 6"
                                            />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};


/* =========================================================
   LEAD MANAGEMENT
========================================================= */

const LeadManagement = ({
    lead,
    updatingField,
    savingRemarks,
    pendingRemarks,
    pendingLatestRemark,
    setPendingRemarks,
    setPendingLatestRemark,
    handleLeadFieldUpdate,
    handleSaveRemarks,
    getRemarkStyle,
    formatLabel,
    leadStatuses,
    remarkOptions,
    latestRemarkOptions,
}) => {
    const remarksChanged =
        pendingRemarks !== (lead?.remarks || "");

    const latestRemarkChanged =
        pendingLatestRemark !==
        (lead?.latestRemark || "");

    const hasUnsavedChanges =
        remarksChanged || latestRemarkChanged;

    return (
        <>
            {/* =================================================
                ANIMATIONS
            ================================================= */}

            <style>
                {`
                    @keyframes dropdownIn {
                        from {
                            opacity: 0;
                            transform: translateY(-5px);
                        }

                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }

                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(5px);
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
                    group mb-5 overflow-visible
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                    transition-all duration-300 ease-out
                    hover:-translate-y-[2px]
                    hover:shadow-lg
                "
            >
                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        relative overflow-hidden
                        rounded-t-2xl
                        border-b border-slate-200
                        bg-gradient-to-r
                        from-[#102236]
                        via-[#102236]
                        to-[#172f48]
                        px-5 py-5
                        sm:px-6
                    "
                >
                    <div
                        className="
                            pointer-events-none
                            absolute
                            -right-10
                            -top-12
                            h-32
                            w-32
                            rounded-full
                            bg-[#F6C945]/10
                        "
                    />

                    <div
                        className="
                            pointer-events-none
                            absolute
                            -bottom-16
                            right-24
                            h-32
                            w-32
                            rounded-full
                            border
                            border-[#F6C945]/10
                        "
                    />

                    <div className="relative flex items-center gap-4">
                        {/* Icon */}

                        <div
                            className="
                                flex h-12 w-12 shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-[#F6C945]
                                text-[#102236]
                                shadow-lg
                                shadow-black/10
                                transition-transform duration-300
                                group-hover:scale-105
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-6 w-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.5 3.75h9A2.25 2.25 0 0 1 18.75 6v14.25H5.25V6A2.25 2.25 0 0 1 7.5 3.75Z"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 3.75V2.25h6v1.5"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Lead Management
                            </h2>

                            <p className="mt-1 text-sm text-slate-300">
                                Update status, remarks and lead outcomes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    MANAGEMENT FIELDS
                ================================================= */}

                <div
                    className="
                        grid grid-cols-1
                        gap-5
                        p-5
                        sm:p-6
                        lg:grid-cols-3
                    "
                >
                    {/* =================================================
                        LEAD STATUS
                    ================================================= */}

                    <div
                        className="
                            group/card
                            relative
                            overflow-visible
                            rounded-2xl
                            border border-slate-200
                            bg-slate-50/70
                            p-4
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:border-slate-300
                            hover:bg-white
                            hover:shadow-md
                        "
                    >
                        {/* Accent */}

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                h-1
                                w-full
                                rounded-t-2xl
                                bg-[#102236]
                                transition-all duration-300
                                group-hover/card:h-1.5
                            "
                        />

                        <div
                            className="
                                mb-3
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >
                            <div>
                                <label
                                    className="
                                        text-xs
                                        font-extrabold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Lead Status
                                </label>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Overall lead temperature
                                </p>
                            </div>

                            <div
                                className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-lg
                                    bg-slate-100
                                    text-[#102236]
                                    transition-transform duration-300
                                    group-hover/card:scale-110
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
                                        d="M12 3v18"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 8h14"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7 8c0 3-2 4-2 4h4s-2-1-2-4ZM17 8c0 3-2 4-2 4h4s-2-1-2-4Z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <SimpleDropdown
                            value={lead?.status || "NEW"}
                            options={leadStatuses}
                            placeholder="Select Status"
                            disabled={
                                updatingField === "status"
                            }
                            onChange={(value) =>
                                handleLeadFieldUpdate(
                                    "status",
                                    value
                                )
                            }
                            selectedStyle="navy"
                        />

                        {updatingField === "status" && (
                            <div
                                className="
                                    mt-3
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-semibold
                                    text-[#102236]
                                "
                            >
                                <span
                                    className="
                                        h-3.5 w-3.5
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-300
                                        border-t-[#102236]
                                    "
                                />

                                Saving status...
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        REMARKS
                    ================================================= */}

                    <div
                        className="
                            group/card
                            relative
                            overflow-visible
                            rounded-2xl
                            border border-slate-200
                            bg-slate-50/70
                            p-4
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:border-[#F6C945]
                            hover:bg-white
                            hover:shadow-md
                        "
                    >
                        {/* Accent */}

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                h-1
                                w-full
                                rounded-t-2xl
                                bg-[#F6C945]
                                transition-all duration-300
                                group-hover/card:h-1.5
                            "
                        />

                        <div
                            className="
                                mb-3
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >
                            <div>
                                <label
                                    className="
                                        text-xs
                                        font-extrabold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Remarks
                                </label>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Result of the latest contact attempt
                                </p>
                            </div>

                            <div
                                className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-lg
                                    bg-[#F6C945]/15
                                    text-[#8A6A00]
                                    transition-transform duration-300
                                    group-hover/card:scale-110
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
                                        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <SimpleDropdown
                            value={pendingRemarks}
                            options={remarkOptions}
                            placeholder="Select Remark"
                            disabled={savingRemarks}
                            onChange={(value) =>
                                setPendingRemarks(value)
                            }
                            selectedStyle="yellow"
                        />

                        {pendingRemarks && (
                            <div className="mt-3 animate-[fadeIn_0.2s_ease-out]">
                                <span
                                    className={`
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        px-3 py-1.5
                                        text-xs
                                        font-bold
                                        shadow-sm
                                        ${getRemarkStyle(
                                            pendingRemarks
                                        )}
                                    `}
                                >
                                    <span
                                        className="
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            bg-current
                                        "
                                    />

                                    {formatLabel(
                                        pendingRemarks
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        LATEST REMARK
                    ================================================= */}

                    <div
                        className="
                            group/card
                            relative
                            overflow-visible
                            rounded-2xl
                            border border-slate-200
                            bg-slate-50/70
                            p-4
                            transition-all duration-300
                            hover:-translate-y-1
                            hover:border-slate-300
                            hover:bg-white
                            hover:shadow-md
                        "
                    >
                        {/* Accent */}

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                h-1
                                w-full
                                rounded-t-2xl
                                bg-slate-400
                                transition-all duration-300
                                group-hover/card:h-1.5
                            "
                        />

                        <div
                            className="
                                mb-3
                                flex
                                items-start
                                justify-between
                                gap-3
                            "
                        >
                            <div>
                                <label
                                    className="
                                        text-xs
                                        font-extrabold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Latest Remark
                                </label>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Latest important lead outcome
                                </p>
                            </div>

                            <div
                                className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-lg
                                    bg-slate-100
                                    text-slate-600
                                    transition-transform duration-300
                                    group-hover/card:scale-110
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
                                        d="m12 3 1.9 5.8H20l-4.9 3.6 1.9 5.8-5-3.6 1.9-5.8L4 8.8h6.1L12 3Z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <SimpleDropdown
                            value={pendingLatestRemark}
                            options={latestRemarkOptions}
                            placeholder="Select Latest Remark"
                            disabled={savingRemarks}
                            onChange={(value) =>
                                setPendingLatestRemark(
                                    value
                                )
                            }
                            selectedStyle="gray"
                        />

                        {pendingLatestRemark && (
                            <div className="mt-3 animate-[fadeIn_0.2s_ease-out]">
                                <span
                                    className={`
                                        inline-flex
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        px-3 py-1.5
                                        text-xs
                                        font-bold
                                        shadow-sm
                                        ${getRemarkStyle(
                                            pendingLatestRemark
                                        )}
                                    `}
                                >
                                    <span
                                        className="
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            bg-current
                                        "
                                    />

                                    {formatLabel(
                                        pendingLatestRemark
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* =================================================
                    SAVE CHANGES
                ================================================= */}

                {hasUnsavedChanges && (
                    <div
                        className="
                            border-t
                            border-[#F6C945]/30
                            bg-[#F6C945]/5
                            px-5 py-4
                            animate-[slideUp_0.2s_ease-out]
                            sm:px-6
                        "
                    >
                        <div
                            className="
                                flex flex-col gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        flex h-9 w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#F6C945]
                                        text-[#102236]
                                        animate-pulse
                                    "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v4"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 17h.01"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-bold text-[#102236]">
                                        Unsaved changes
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Save your remark updates before leaving.
                                    </p>
                                </div>
                            </div>

                            {/* Save */}

                            <button
                                type="button"
                                onClick={handleSaveRemarks}
                                disabled={savingRemarks}
                                className="
                                    group/save
                                    relative
                                    overflow-hidden
                                    rounded-xl
                                    bg-[#102236]
                                    px-6 py-3
                                    text-sm font-bold
                                    text-white
                                    shadow-md
                                    shadow-[#102236]/20
                                    transition-all duration-300
                                    hover:-translate-y-0.5
                                    hover:bg-[#172f48]
                                    hover:shadow-lg
                                    active:translate-y-0
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                "
                            >
                                <span
                                    className="
                                        absolute
                                        inset-0
                                        -translate-x-full
                                        bg-gradient-to-r
                                        from-transparent
                                        via-white/10
                                        to-transparent
                                        transition-transform
                                        duration-700
                                        group-hover/save:translate-x-full
                                    "
                                />

                                <span
                                    className="
                                        relative
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                    "
                                >
                                    {savingRemarks ? (
                                        <>
                                            <span
                                                className="
                                                    h-4 w-4
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-white/30
                                                    border-t-white
                                                "
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 12.5 9.5 17 19 7.5"
                                                />
                                            </svg>

                                            Save Changes
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default LeadManagement;