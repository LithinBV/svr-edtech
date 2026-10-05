import React from "react";
import {
    UserPlus,
    Users,
    CheckCircle2,
    BarChart3,
    FileBarChart,
    TrendingUp,
    ArrowRight,
    Sparkles,
    MousePointer2,
} from "lucide-react";

const HomeHowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Login",
            subtitle: "Get Started",
            description:
                "Securely access your SVR-EDTECH workspace and get everything you need in one place.",
            icon: UserPlus,
            color: "blue",
            position: "left",
        },
        {
            number: "02",
            title: "Manage",
            subtitle: "Organize Everything",
            description:
                "Capture leads, organize information and assign opportunities to the right team members.",
            icon: Users,
            color: "amber",
            position: "right",
        },
        {
            number: "03",
            title: "Track",
            subtitle: "Stay Connected",
            description:
                "Track follow-ups, monitor progress and make sure no important opportunity gets missed.",
            icon: CheckCircle2,
            color: "emerald",
            position: "left",
        },
        {
            number: "04",
            title: "Analysis",
            subtitle: "Understand Performance",
            description:
                "Analyze leads, team activity, follow-ups and performance to understand what is working.",
            icon: BarChart3,
            color: "purple",
            position: "right",
        },
        {
            number: "05",
            title: "Reports",
            subtitle: "Measure & Improve",
            description:
                "Generate clear reports and use meaningful data to identify opportunities and improve your workflow.",
            icon: FileBarChart,
            color: "blue",
            position: "left",
        },
        {
            number: "06",
            title: "Growth",
            subtitle: "Turn Insights Into Results",
            description:
                "Use everything you have learned to improve performance, increase opportunities and achieve sustainable growth.",
            icon: TrendingUp,
            color: "amber",
            position: "right",
        },
    ];

    return (
        <section
            id="about"
            className="
                relative
                overflow-hidden
                bg-[#F7F9FC]
                py-24
                sm:py-28
            "
        >
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div className="absolute inset-0 pointer-events-none">

                <div
                    className="
                        absolute
                        top-[-250px]
                        right-[-200px]
                        w-[550px]
                        h-[550px]
                        rounded-full
                        bg-[#F6C945]/8
                        blur-[110px]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-250px]
                        left-[-200px]
                        w-[550px]
                        h-[550px]
                        rounded-full
                        bg-[#102236]/5
                        blur-[110px]
                    "
                />

                {/* Decorative circles */}

                <div
                    className="
                        absolute
                        top-32
                        left-10
                        w-16
                        h-16
                        rounded-full
                        border
                        border-[#F6C945]/30
                        animate-[spin_15s_linear_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-24
                        right-10
                        w-20
                        h-20
                        rounded-full
                        border
                        border-[#102236]/10
                        animate-[spin_20s_linear_infinite_reverse]
                    "
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-5 sm:px-8">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="max-w-3xl mx-auto text-center">

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#102236]/10
                            bg-white
                            px-4
                            py-2
                            shadow-sm
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
                            Simple. Connected. Powerful.
                        </span>
                    </div>

                    <h2
                        className="
                            mt-5
                            text-4xl
                            sm:text-5xl
                            lg:text-6xl
                            font-black
                            leading-tight
                            tracking-tight
                            text-[#102236]
                        "
                    >
                        From First Lead{" "}
                        <span className="text-[#F6C945]">
                            To Growth
                        </span>
                    </h2>

                    <p
                        className="
                            mt-5
                            max-w-2xl
                            mx-auto
                            text-base
                            sm:text-lg
                            leading-8
                            text-slate-500
                        "
                    >
                        A simple workflow designed to help your team
                        move from opportunity to outcome without
                        unnecessary complexity.
                    </p>
                </div>

                {/* =================================================
                    FLOW INTRO
                ================================================= */}

                <div
                    className="
                        mt-14
                        flex
                        items-center
                        justify-center
                        gap-3
                    "
                >
                    <span
                        className="
                            w-2
                            h-2
                            rounded-full
                            bg-[#F6C945]
                            animate-pulse
                        "
                    />

                    <span
                        className="
                            text-xs
                            font-black
                            tracking-[0.18em]
                            uppercase
                            text-slate-400
                        "
                    >
                        Your journey with SVR-EDTECH
                    </span>

                    <span
                        className="
                            w-2
                            h-2
                            rounded-full
                            bg-[#F6C945]
                            animate-pulse
                        "
                    />
                </div>

                {/* =================================================
                    TIMELINE
                ================================================= */}

                <div className="relative mt-12">

                    {/* Desktop central line */}

                    <div
                        className="
                            hidden
                            lg:block
                            absolute
                            left-1/2
                            top-0
                            bottom-0
                            w-px
                            -translate-x-1/2
                            bg-slate-200
                        "
                    />

                    {/* Animated progress line */}

                    <div
                        className="
                            hidden
                            lg:block
                            absolute
                            left-1/2
                            top-0
                            w-[2px]
                            h-full
                            -translate-x-1/2
                            origin-top
                            bg-gradient-to-b
                            from-[#F6C945]
                            via-[#F6C945]
                            to-transparent
                            animate-[timelineGrow_2.5s_ease-out]
                        "
                    />

                    <div className="space-y-10 lg:space-y-0">

                        {steps.map((step, index) => (
                            <StepRow
                                key={step.number}
                                step={step}
                                index={index}
                            />
                        ))}

                    </div>
                </div>

                {/* =================================================
                    BOTTOM MESSAGE
                ================================================= */}

                <div
                    className="
                        relative
                        mt-16
                        overflow-hidden
                        rounded-3xl
                        bg-[#102236]
                        px-6
                        sm:px-10
                        py-8
                        shadow-2xl
                    "
                >
                    {/* Animated glow */}

                    <div
                        className="
                            absolute
                            -right-20
                            -top-32
                            w-72
                            h-72
                            rounded-full
                            bg-[#F6C945]/15
                            blur-[70px]
                            animate-pulse
                        "
                    />

                    <div
                        className="
                            absolute
                            -left-20
                            -bottom-32
                            w-64
                            h-64
                            rounded-full
                            bg-cyan-400/10
                            blur-[60px]
                        "
                    />

                    <div
                        className="
                            relative
                            z-10
                            flex
                            flex-col
                            lg:flex-row
                            items-center
                            justify-between
                            gap-7
                        "
                    >
                        <div className="text-center lg:text-left">

                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    text-[#F6C945]
                                    text-xs
                                    font-black
                                    tracking-[0.18em]
                                    uppercase
                                "
                            >
                                <MousePointer2 size={14} />

                                SIMPLE WORKFLOW
                            </div>

                            <h3
                                className="
                                    mt-2
                                    text-2xl
                                    sm:text-3xl
                                    font-black
                                    text-white
                                "
                            >
                                Everything your team needs.
                            </h3>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-white/50
                                    max-w-xl
                                "
                            >
                                Less manual work. Better visibility.
                                More time to focus on students and
                                opportunities.
                            </p>
                        </div>

                        {/* =================================================
                            6 STEP FLOW PILLS
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                justify-center
                                gap-2
                                max-w-2xl
                            "
                        >
                            <FlowPill text="Login" />

                            <ArrowRight
                                size={14}
                                className="text-white/30 hidden sm:block"
                            />

                            <FlowPill text="Manage" />

                            <ArrowRight
                                size={14}
                                className="text-white/30 hidden sm:block"
                            />

                            <FlowPill text="Track" />

                            <ArrowRight
                                size={14}
                                className="text-white/30 hidden sm:block"
                            />

                            <FlowPill text="Analysis" />

                            <ArrowRight
                                size={14}
                                className="text-white/30 hidden sm:block"
                            />

                            <FlowPill text="Reports" />

                            <ArrowRight
                                size={14}
                                className="text-white/30 hidden sm:block"
                            />

                            <FlowPill
                                text="Growth"
                                active
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`
                @keyframes timelineGrow {
                    from {
                        transform: translateX(-50%) scaleY(0);
                    }

                    to {
                        transform: translateX(-50%) scaleY(1);
                    }
                }

                @keyframes stepReveal {
                    from {
                        opacity: 0;
                        transform: translateY(25px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes connectorPulse {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.7;
                    }

                    50% {
                        transform: scale(1.3);
                        opacity: 1;
                    }
                }
            `}</style>
        </section>
    );
};

// =============================================================
// STEP ROW
// =============================================================

const StepRow = ({ step, index }) => {
    const Icon = step.icon;

    const styles = {
        blue: {
            icon:
                "bg-blue-50 text-blue-600 border-blue-100",
            number:
                "bg-blue-600 text-white",
            line:
                "bg-blue-500",
            accent:
                "text-blue-600",
        },

        amber: {
            icon:
                "bg-amber-50 text-amber-600 border-amber-100",
            number:
                "bg-amber-500 text-white",
            line:
                "bg-amber-500",
            accent:
                "text-amber-600",
        },

        emerald: {
            icon:
                "bg-emerald-50 text-emerald-600 border-emerald-100",
            number:
                "bg-emerald-600 text-white",
            line:
                "bg-emerald-500",
            accent:
                "text-emerald-600",
        },

        purple: {
            icon:
                "bg-purple-50 text-purple-600 border-purple-100",
            number:
                "bg-purple-600 text-white",
            line:
                "bg-purple-500",
            accent:
                "text-purple-600",
        },
    };

    const color = styles[step.color];

    const isLeft = step.position === "left";

    return (
        <div
            className={`
                relative
                lg:grid
                lg:grid-cols-2
                ${
                    index === 0
                        ? ""
                        : "lg:pt-14"
                }
            `}
            style={{
                animation:
                    "stepReveal 0.7s ease-out both",
                animationDelay: `${index * 180}ms`,
            }}
        >

            {/* =================================================
                DESKTOP LEFT
            ================================================= */}

            <div
                className={`
                    hidden
                    lg:flex
                    justify-end
                    pr-16
                    ${
                        isLeft
                            ? ""
                            : "lg:col-start-1"
                    }
                `}
            >
                {isLeft && (
                    <StepCard
                        step={step}
                        color={color}
                        Icon={Icon}
                        align="right"
                    />
                )}
            </div>

            {/* =================================================
                CENTRAL NODE
            ================================================= */}

            <div
                className="
                    hidden
                    lg:flex
                    absolute
                    left-1/2
                    top-0
                    -translate-x-1/2
                    z-20
                    items-center
                    justify-center
                "
            >
                <div
                    className="
                        relative
                        w-14
                        h-14
                        rounded-full
                        bg-white
                        border-4
                        border-[#F6C945]
                        shadow-lg
                        flex
                        items-center
                        justify-center
                    "
                >
                    <span
                        className={`
                            w-9
                            h-9
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-[10px]
                            font-black
                            ${color.number}
                        `}
                    >
                        {step.number}
                    </span>

                    <span
                        className="
                            absolute
                            inset-[-7px]
                            rounded-full
                            border
                            border-[#F6C945]/30
                            animate-[connectorPulse_2s_ease-in-out_infinite]
                        "
                    />
                </div>
            </div>

            {/* =================================================
                DESKTOP RIGHT
            ================================================= */}

            <div
                className={`
                    hidden
                    lg:flex
                    justify-start
                    pl-16
                    ${
                        !isLeft
                            ? ""
                            : "lg:col-start-2"
                    }
                `}
            >
                {!isLeft && (
                    <StepCard
                        step={step}
                        color={color}
                        Icon={Icon}
                        align="left"
                    />
                )}
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="lg:hidden">
                <StepCard
                    step={step}
                    color={color}
                    Icon={Icon}
                    align="left"
                    mobile
                />
            </div>
        </div>
    );
};

// =============================================================
// STEP CARD
// =============================================================

const StepCard = ({
    step,
    color,
    Icon,
    align,
    mobile = false,
}) => {
    return (
        <div
            className={`
                group
                relative
                w-full
                max-w-[500px]
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                sm:p-7
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                ${
                    align === "right"
                        ? "text-right"
                        : "text-left"
                }
            `}
        >
            {/* Top accent */}

            <div
                className={`
                    absolute
                    top-0
                    ${
                        align === "right"
                            ? "right-0"
                            : "left-0"
                    }
                    h-1
                    w-0
                    rounded-full
                    bg-[#F6C945]
                    transition-all
                    duration-500
                    group-hover:w-full
                `}
            />

            {/* Mobile number */}

            {mobile && (
                <div
                    className={`
                        inline-flex
                        items-center
                        justify-center
                        w-9
                        h-9
                        rounded-full
                        text-xs
                        font-black
                        mb-5
                        ${color.number}
                    `}
                >
                    {step.number}
                </div>
            )}

            <div
                className={`
                    flex
                    ${
                        align === "right"
                            ? "justify-end"
                            : "justify-start"
                    }
                `}
            >
                <div
                    className={`
                        relative
                        w-14
                        h-14
                        rounded-2xl
                        border
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-500
                        group-hover:scale-110
                        group-hover:rotate-6
                        ${color.icon}
                    `}
                >
                    <Icon size={27} />

                    <span
                        className="
                            absolute
                            inset-0
                            rounded-2xl
                            border
                            border-current
                            opacity-0
                            scale-75
                            group-hover:opacity-30
                            group-hover:scale-125
                            transition-all
                            duration-500
                        "
                    />
                </div>
            </div>

            {/* Content */}

            <div className="mt-5">

                <div
                    className={`
                        text-[10px]
                        font-black
                        tracking-[0.18em]
                        uppercase
                        ${color.accent}
                    `}
                >
                    {step.subtitle}
                </div>

                <h3
                    className="
                        mt-2
                        text-2xl
                        font-black
                        text-[#102236]
                    "
                >
                    {step.title}
                </h3>

                <p
                    className="
                        mt-3
                        text-sm
                        leading-7
                        text-slate-500
                    "
                >
                    {step.description}
                </p>
            </div>

            {/* Hover arrow */}

            <div
                className={`
                    mt-5
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-black
                    text-slate-300
                    transition-all
                    duration-300
                    ${
                        align === "right"
                            ? "justify-end"
                            : "justify-start"
                    }
                    group-hover:text-[#102236]
                `}
            >
                <span>
                    Step {step.number}
                </span>

                <ArrowRight
                    size={15}
                    className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                    "
                />
            </div>

            {/* Background circle */}

            <div
                className={`
                    absolute
                    ${
                        align === "right"
                            ? "-left-10"
                            : "-right-10"
                    }
                    -bottom-10
                    w-28
                    h-28
                    rounded-full
                    bg-slate-50
                    transition-transform
                    duration-500
                    group-hover:scale-[1.8]
                `}
            />
        </div>
    );
};

// =============================================================
// FLOW PILL
// =============================================================

const FlowPill = ({
    text,
    active = false,
}) => {
    return (
        <span
            className={`
                rounded-full
                px-4
                py-2
                text-xs
                font-black
                ${
                    active
                        ? "bg-[#F6C945] text-[#102236]"
                        : "bg-white/10 text-white/70"
                }
            `}
        >
            {text}
        </span>
    );
};

export default HomeHowItWorks;