import React from "react";

const DetailField = ({
    label,
    value,
}) => {
    const displayValue =
        value === null ||
        value === undefined ||
        value === ""
            ? "-"
            : value;

    return (
        <div
            className="
                group
                relative
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3.5
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:border-slate-300
                hover:shadow-sm
            "
        >
            {/* Yellow hover accent */}

            <div
                className="
                    absolute
                    left-0
                    top-0
                    h-full
                    w-0.5
                    bg-[#F6C945]
                    opacity-0
                    transition-opacity
                    duration-200
                    group-hover:opacity-100
                "
            />

            {/* Label */}

            <div
                className="
                    mb-1.5
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                "
            >
                <span
                    className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-slate-300
                        transition-colors
                        duration-200
                        group-hover:bg-[#F6C945]
                    "
                />

                {label}
            </div>

            {/* Value */}

            <div
                className="
                    break-words
                    text-sm
                    font-semibold
                    leading-6
                    text-[#102236]
                "
            >
                {displayValue}
            </div>
        </div>
    );
};

export default DetailField;