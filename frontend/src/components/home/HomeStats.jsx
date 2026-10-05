import React, { useEffect, useRef, useState } from "react";
import {
    Users,
    CalendarCheck,
    GraduationCap,
    Heart,
    TrendingUp,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";

const HomeStats = () => {
    const sectionRef = useRef(null);
    const [started, setStarted] = useState(false);

    // =========================================================
    // START COUNTER WHEN SECTION ENTERS VIEW
    // =========================================================

    useEffect(() => {
        const element = sectionRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.25,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="
                relative
                overflow-hidden
                bg-white
                py-12
                sm:py-16
            "
        >
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div className="absolute inset-0 pointer-events-none">

                <div
                    className="
                        absolute
                        top-[-180px]
                        left-1/2
                        -translate-x-1/2
                        w-[600px]
                        h-[600px]
                        rounded-full
                        bg-[#F6C945]/5
                        blur-[120px]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-150px]
                        right-[-100px]
                        w-[400px]
                        h-[400px]
                        rounded-full
                        bg-blue-500/5
                        blur-[100px]
                    "
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-5 sm:px-8">

                {/* =================================================
                    SECTION INTRO
                ================================================= */}

                <div className="text-center mb-10">

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-[#102236]/5
                            px-4
                            py-2
                        "
                    >
                        <Sparkles
                            size={14}
                            className="text-[#F6C945]"
                        />

                        <span
                            className="
                                text-[10px]
                                sm:text-xs
                                font-black
                                tracking-[0.18em]
                                uppercase
                                text-[#102236]
                            "
                        >
                            Growing With You
                        </span>
                    </div>

                    <h2
                        className="
                            mt-4
                            text-3xl
                            sm:text-4xl
                            font-black
                            text-[#102236]
                        "
                    >
                        Numbers That{" "}
                        <span className="text-[#F6C945]">
                            Speak
                        </span>
                    </h2>

                    <p
                        className="
                            max-w-xl
                            mx-auto
                            mt-3
                            text-sm
                            sm:text-base
                            text-slate-500
                        "
                    >
                        A growing ecosystem built around better
                        lead management, stronger teams and
                        meaningful results.
                    </p>
                </div>

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                    "
                >
                    <StatCard
                        started={started}
                        icon={<GraduationCap size={25} />}
                        value={100000}
                        suffix="+"
                        label="Leads Managed"
                        description="Across the platform"
                        color="blue"
                        featured
                    />

                    <StatCard
                        started={started}
                        icon={<Users size={25} />}
                        value={50}
                        suffix="+"
                        label="Team Members"
                        description="Working together"
                        color="emerald"
                    />

                    <StatCard
                        started={started}
                        icon={<CalendarCheck size={25} />}
                        value={1000}
                        suffix="+"
                        label="Follow-ups Logged"
                        description="Opportunities tracked"
                        color="amber"
                    />

                    <StatCard
                        started={started}
                        icon={<Heart size={25} />}
                        value={95}
                        suffix="%"
                        label="Client Satisfaction"
                        description="Built around users"
                        color="purple"
                    />
                </div>

                {/* =================================================
                    BOTTOM ROLLING STRIP
                ================================================= */}

                <div
                    className="
                        mt-8
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-[#F7F9FC]
                    "
                >
                    <div
                        className="
                            flex
                            w-max
                            animate-[statsMarquee_24s_linear_infinite]
                        "
                    >
                        <StatsRollingContent />
                        <StatsRollingContent />
                        <StatsRollingContent />
                    </div>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`
                @keyframes statsMarquee {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-33.333%);
                    }
                }
            `}</style>
        </section>
    );
};

// =============================================================
// STAT CARD
// =============================================================

const StatCard = ({
    started,
    icon,
    value,
    suffix,
    label,
    description,
    color,
    featured = false,
}) => {
    const colorStyles = {
        blue: {
            icon:
                "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            glow:
                "group-hover:shadow-blue-100",
            line:
                "bg-blue-500",
            text:
                "text-blue-600",
        },

        emerald: {
            icon:
                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
            glow:
                "group-hover:shadow-emerald-100",
            line:
                "bg-emerald-500",
            text:
                "text-emerald-600",
        },

        amber: {
            icon:
                "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
            glow:
                "group-hover:shadow-amber-100",
            line:
                "bg-amber-500",
            text:
                "text-amber-600",
        },

        purple: {
            icon:
                "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
            glow:
                "group-hover:shadow-purple-100",
            line:
                "bg-purple-500",
            text:
                "text-purple-600",
        },
    };

    const styles = colorStyles[color];

    return (
        <div
            className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                ${
                    featured
                        ? "border-[#F6C945]/50"
                        : "border-slate-200"
                }
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                ${styles.glow}
            `}
        >
            {/* Top line */}

            <div
                className={`
                    absolute
                    top-0
                    left-0
                    h-1
                    w-0
                    group-hover:w-full
                    transition-all
                    duration-500
                    ${styles.line}
                `}
            />

            {/* Featured badge */}

            {featured && (
                <div
                    className="
                        absolute
                        top-4
                        right-4
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-[#F6C945]/15
                        px-2.5
                        py-1
                        text-[9px]
                        font-black
                        text-[#102236]
                    "
                >
                    <TrendingUp size={11} />

                    GROWING
                </div>
            )}

            {/* Icon */}

            <div
                className={`
                    w-13
                    h-13
                    sm:w-14
                    sm:h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-500
                    group-hover:rotate-6
                    group-hover:scale-110
                    ${styles.icon}
                `}
            >
                {icon}
            </div>

            {/* Number */}

            <div className="mt-6 flex items-end gap-1">

                <AnimatedNumber
                    value={value}
                    started={started}
                />

                <span
                    className={`
                        text-2xl
                        sm:text-3xl
                        font-black
                        mb-1
                        ${styles.text}
                    `}
                >
                    {suffix}
                </span>
            </div>

            {/* Label */}

            <h3
                className="
                    mt-2
                    text-lg
                    font-black
                    text-[#102236]
                "
            >
                {label}
            </h3>

            <p
                className="
                    mt-1
                    text-xs
                    text-slate-400
                "
            >
                {description}
            </p>

            {/* Bottom decoration */}

            <div
                className="
                    absolute
                    -bottom-10
                    -right-10
                    w-28
                    h-28
                    rounded-full
                    bg-slate-50
                    transition-transform
                    duration-500
                    group-hover:scale-[1.8]
                "
            />

            {/* Arrow */}

            <div
                className="
                    absolute
                    bottom-5
                    right-5
                    w-8
                    h-8
                    rounded-full
                    bg-slate-50
                    text-slate-300
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    group-hover:bg-[#102236]
                    group-hover:text-[#F6C945]
                "
            >
                <ArrowUpRight
                    size={15}
                    className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                    "
                />
            </div>
        </div>
    );
};

// =============================================================
// ANIMATED NUMBER
// =============================================================

const AnimatedNumber = ({
    value,
    started,
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!started) {
            setCount(0);
            return;
        }

        const duration = 1800;
        const startTime = performance.now();

        let frameId;

        const update = (currentTime) => {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            // Smooth ease-out

            const eased =
                1 - Math.pow(1 - progress, 3);

            setCount(
                Math.floor(value * eased)
            );

            if (progress < 1) {
                frameId =
                    requestAnimationFrame(update);
            } else {
                setCount(value);
            }
        };

        frameId =
            requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [started, value]);

    // =========================================================
    // FORMAT LARGE NUMBERS
    // =========================================================

    const formattedNumber =
        count >= 100000
            ? "1L"
            : count >= 1000
            ? `${Math.floor(count / 1000)}K`
            : count.toLocaleString("en-IN");

    return (
        <span
            className="
                text-4xl
                sm:text-5xl
                font-black
                tracking-tight
                text-[#102236]
                tabular-nums
            "
        >
            {formattedNumber}
        </span>
    );
};

// =============================================================
// ROLLING CONTENT
// =============================================================

const StatsRollingContent = () => {
    return (
        <div className="flex items-center shrink-0">

            <RollingItem
                text="1L+ LEADS"
                icon={<Users size={13} />}
            />

            <RollingItem
                text="50+ TEAM MEMBERS"
                icon={<Users size={13} />}
            />

            <RollingItem
                text="1K+ FOLLOW-UPS"
                icon={<CalendarCheck size={13} />}
            />

            <RollingItem
                text="95% SATISFACTION"
                icon={<Heart size={13} />}
            />

            <RollingItem
                text="SMARTER EDUCATION"
                icon={<GraduationCap size={13} />}
            />
        </div>
    );
};

// =============================================================
// ROLLING ITEM
// =============================================================

const RollingItem = ({ text, icon }) => {
    return (
        <div
            className="
                flex
                items-center
                gap-2
                px-7
                py-3.5
                whitespace-nowrap
            "
        >
            <span className="text-[#F6C945]">
                {icon}
            </span>

            <span
                className="
                    text-[10px]
                    sm:text-[11px]
                    font-black
                    tracking-[0.15em]
                    text-[#102236]
                "
            >
                {text}
            </span>

            <span
                className="
                    ml-5
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-[#F6C945]
                "
            />
        </div>
    );
};

export default HomeStats;