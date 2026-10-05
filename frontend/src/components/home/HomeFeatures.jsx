import React from "react";
import {
    Users,
    UserPlus,
    CalendarCheck,
    BarChart3,
    ArrowRight,
    Sparkles,
    Mail,
    MessageCircle,
    Bot,
    FileBarChart,
} from "lucide-react";

const HomeFeatures = () => {
    const features = [
        {
            number: "01",
            title: "Lead Management",
            description:
                "Capture, organize and manage every student lead from one centralized platform.",
            icon: Users,
            color: "blue",
            tag: "1L+ Leads",
        },
        {
            number: "02",
            title: "Team Collaboration",
            description:
                "Assign leads, coordinate teams and keep everyone connected throughout the workflow.",
            icon: UserPlus,
            color: "emerald",
            tag: "50+ Members",
        },
        {
            number: "03",
            title: "Follow-up Tracking",
            description:
                "Keep every conversation moving with organized follow-ups and timely reminders.",
            icon: CalendarCheck,
            color: "amber",
            tag: "1K+ Follow-ups",
        },
        {
            number: "04",
            title: "Insights & Analytics",
            description:
                "Understand performance, identify opportunities and make decisions using meaningful data.",
            icon: BarChart3,
            color: "purple",
            tag: "Real-time Insights",
        },
        {
            number: "05",
            title: "Email Campaigns",
            description:
                "Create, manage and send professional email communication directly from your lead workflow.",
            icon: Mail,
            color: "rose",
            tag: "Smart Emailing",
        },
        {
            number: "06",
            title: "WhatsApp Communication",
            description:
                "Connect with leads through organized WhatsApp communication and reusable message templates.",
            icon: MessageCircle,
            color: "cyan",
            tag: "Easy Communication",
        },
        {
            number: "07",
            title: "AI Assistant",
            description:
                "Use AI-powered assistance to summarize leads, generate follow-ups and improve daily productivity.",
            icon: Bot,
            color: "indigo",
            tag: "AI Powered",
        },
        {
            number: "08",
            title: "Reports & Performance",
            description:
                "Track team activity, lead performance and business progress through detailed reports.",
            icon: FileBarChart,
            color: "orange",
            tag: "Actionable Reports",
        },
    ];

    return (
        <section
            id="features"
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

                {/* Soft navy glow */}
                <div
                    className="
                        absolute
                        -top-40
                        -right-40
                        w-[500px]
                        h-[500px]
                        rounded-full
                        bg-[#102236]/5
                        blur-[100px]
                    "
                />

                {/* Yellow glow */}
                <div
                    className="
                        absolute
                        bottom-[-250px]
                        left-[-200px]
                        w-[500px]
                        h-[500px]
                        rounded-full
                        bg-[#F6C945]/10
                        blur-[100px]
                    "
                />

                {/* Decorative circles */}
                <div
                    className="
                        absolute
                        top-24
                        right-10
                        w-20
                        h-20
                        rounded-full
                        border
                        border-[#F6C945]/30
                        animate-[spin_18s_linear_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-20
                        left-10
                        w-14
                        h-14
                        rounded-full
                        border
                        border-[#102236]/10
                        animate-[spin_12s_linear_infinite_reverse]
                    "
                />
            </div>

            <div className="relative max-w-7xl mx-auto px-5 sm:px-8">

                {/* =================================================
                    SECTION HEADER
                ================================================= */}

                <div className="max-w-3xl mx-auto text-center">

                    {/* Animated label */}
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
                            animate-[fadeSlideUp_0.7s_ease-out]
                        "
                    >
                        <Sparkles
                            size={15}
                            className="
                                text-[#F6C945]
                                animate-pulse
                            "
                        />

                        <span
                            className="
                                text-[11px]
                                sm:text-xs
                                font-black
                                tracking-[0.18em]
                                uppercase
                                text-[#102236]
                            "
                        >
                            Everything In One Place
                        </span>
                    </div>

                    {/* Heading */}
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
                        Tools Built For{" "}

                        <span
                            className="
                                relative
                                inline-block
                                text-[#F6C945]
                            "
                        >
                            Growth
                        </span>
                    </h2>

                    <p
                        className="
                            mt-5
                            text-base
                            sm:text-lg
                            leading-8
                            text-slate-500
                        "
                    >
                        From the first lead to the final conversion,
                        SVR-EDTECH gives your team the tools to
                        manage, collaborate, follow up and grow.
                    </p>
                </div>

                {/* =================================================
                    ROLLING HIGHLIGHT
                ================================================= */}

                <div
                    className="
                        mt-12
                        relative
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-sm
                    "
                >
                    <div
                        className="
                            flex
                            w-max
                            animate-[featureMarquee_25s_linear_infinite]
                        "
                    >
                        <RollingContent />
                        <RollingContent />
                        <RollingContent />
                    </div>
                </div>

                {/* =================================================
                    FEATURE GRID
                ================================================= */}

                <div
                    className="
                        mt-10
                        grid
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-5
                    "
                >
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.number}
                            feature={feature}
                            index={index}
                        />
                    ))}
                </div>

                {/* =================================================
                    BOTTOM MESSAGE
                ================================================= */}

                <div
                    className="
                        mt-12
                        flex
                        flex-col
                        sm:flex-row
                        items-center
                        justify-between
                        gap-5
                        rounded-3xl
                        bg-[#102236]
                        px-6
                        sm:px-8
                        py-6
                        overflow-hidden
                        relative
                    "
                >

                    {/* =================================================
                        ANIMATED YELLOW BORDER
                    ================================================= */}

                    <div
                        className="
                            absolute
                            inset-0
                            rounded-3xl
                            pointer-events-none
                        "
                    >
                        {/* Top */}
                        <span
                            className="
                                absolute
                                top-0
                                left-0
                                h-1
                                w-32
                                rounded-full
                                bg-[#F6C945]
                                animate-[borderTop_4s_linear_infinite]
                            "
                        />

                        {/* Right */}
                        <span
                            className="
                                absolute
                                top-0
                                right-0
                                w-1
                                h-24
                                rounded-full
                                bg-[#F6C945]
                                animate-[borderRight_4s_linear_infinite]
                            "
                        />

                        {/* Bottom */}
                        <span
                            className="
                                absolute
                                bottom-0
                                right-0
                                h-1
                                w-32
                                rounded-full
                                bg-[#F6C945]
                                animate-[borderBottom_4s_linear_infinite]
                            "
                        />

                        {/* Left */}
                        <span
                            className="
                                absolute
                                bottom-0
                                left-0
                                w-1
                                h-24
                                rounded-full
                                bg-[#F6C945]
                                animate-[borderLeft_4s_linear_infinite]
                            "
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">

                        <p className="text-white font-black text-lg">
                            One platform. One workflow.{" "}
                            <span className="text-[#F6C945]">
                                Bigger possibilities.
                            </span>
                        </p>

                        <p className="text-white/50 text-sm mt-1">
                            Built to make your education team more
                            organized and productive.
                        </p>
                    </div>

                    {/* Right side */}
                    <div
                        className="
                            relative
                            z-10
                            flex
                            items-center
                            gap-2
                            text-[#F6C945]
                            font-bold
                            text-sm
                        "
                    >
                        <span>
                            1L+ leads ready to scale
                        </span>

                        <ArrowRight
                            size={18}
                            className="
                                animate-[arrowMove_1.5s_ease-in-out_infinite]
                            "
                        />
                    </div>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`

                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes featureMarquee {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-33.333%);
                    }
                }

                /* ==============================================
                   YELLOW BORDER ANIMATION
                ============================================== */

                @keyframes borderTop {
                    0% {
                        transform: translateX(-140px);
                    }

                    25% {
                        transform: translateX(calc(100vw - 180px));
                    }

                    25.01%,
                    100% {
                        transform: translateX(calc(100vw - 180px));
                    }
                }

                @keyframes borderRight {
                    0%,
                    25% {
                        transform: translateY(-140px);
                    }

                    50% {
                        transform: translateY(calc(100% - 100px));
                    }

                    50.01%,
                    100% {
                        transform: translateY(calc(100% - 100px));
                    }
                }

                @keyframes borderBottom {
                    0%,
                    50% {
                        transform: translateX(140px);
                    }

                    75% {
                        transform: translateX(calc(-100vw + 180px));
                    }

                    75.01%,
                    100% {
                        transform: translateX(calc(-100vw + 180px));
                    }
                }

                @keyframes borderLeft {
                    0%,
                    75% {
                        transform: translateY(140px);
                    }

                    100% {
                        transform: translateY(-140px);
                    }
                }

                @keyframes arrowMove {
                    0%,
                    100% {
                        transform: translateX(0);
                    }

                    50% {
                        transform: translateX(6px);
                    }
                }

                @keyframes cardFloat {
                    0%,
                    100% {
                        transform: translateY(0);
                    }

                    50% {
                        transform: translateY(-6px);
                    }
                }

            `}</style>
        </section>
    );
};


/* =============================================================
   FEATURE CARD
============================================================= */

const FeatureCard = ({ feature, index }) => {

    const Icon = feature.icon;

    const colorClasses = {

        blue: {
            icon:
                "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            glow:
                "group-hover:shadow-blue-100",
            line:
                "bg-blue-500",
            tag:
                "bg-blue-50 text-blue-600",
        },

        emerald: {
            icon:
                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
            glow:
                "group-hover:shadow-emerald-100",
            line:
                "bg-emerald-500",
            tag:
                "bg-emerald-50 text-emerald-600",
        },

        amber: {
            icon:
                "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
            glow:
                "group-hover:shadow-amber-100",
            line:
                "bg-amber-500",
            tag:
                "bg-amber-50 text-amber-600",
        },

        purple: {
            icon:
                "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
            glow:
                "group-hover:shadow-purple-100",
            line:
                "bg-purple-500",
            tag:
                "bg-purple-50 text-purple-600",
        },

        rose: {
            icon:
                "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
            glow:
                "group-hover:shadow-rose-100",
            line:
                "bg-rose-500",
            tag:
                "bg-rose-50 text-rose-600",
        },

        cyan: {
            icon:
                "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
            glow:
                "group-hover:shadow-cyan-100",
            line:
                "bg-cyan-500",
            tag:
                "bg-cyan-50 text-cyan-600",
        },

        indigo: {
            icon:
                "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
            glow:
                "group-hover:shadow-indigo-100",
            line:
                "bg-indigo-500",
            tag:
                "bg-indigo-50 text-indigo-600",
        },

        orange: {
            icon:
                "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
            glow:
                "group-hover:shadow-orange-100",
            line:
                "bg-orange-500",
            tag:
                "bg-orange-50 text-orange-600",
        },
    };

    const colors = colorClasses[feature.color];

    return (
        <article
            className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-500
                hover:-translate-y-2
                hover:shadow-2xl
                ${colors.glow}
            `}
            style={{
                animationDelay: `${index * 120}ms`,
            }}
        >

            {/* Top animated line */}
            <div
                className={`
                    absolute
                    top-0
                    left-0
                    h-1
                    w-0
                    rounded-full
                    transition-all
                    duration-500
                    group-hover:w-full
                    ${colors.line}
                `}
            />

            {/* Number */}
            <div
                className="
                    absolute
                    top-5
                    right-5
                    text-[11px]
                    font-black
                    tracking-widest
                    text-slate-200
                    transition-colors
                    duration-300
                    group-hover:text-slate-300
                "
            >
                {feature.number}
            </div>

            {/* Icon */}
            <div
                className={`
                    relative
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-500
                    group-hover:rotate-6
                    group-hover:scale-110
                    ${colors.icon}
                `}
            >
                <Icon size={27} />

                {/* Pulse ring */}
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

            {/* Content */}
            <div className="mt-7">

                <h3
                    className="
                        text-xl
                        font-black
                        text-[#102236]
                        transition-colors
                        duration-300
                        group-hover:text-[#173954]
                    "
                >
                    {feature.title}
                </h3>

                <p
                    className="
                        mt-3
                        text-sm
                        leading-7
                        text-slate-500
                    "
                >
                    {feature.description}
                </p>
            </div>

            {/* Tag */}
            <div className="mt-6">

                <span
                    className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1.5
                        text-[10px]
                        font-black
                        tracking-wide
                        ${colors.tag}
                    `}
                >
                    {feature.tag}
                </span>
            </div>

            {/* Bottom arrow */}
            <div
                className="
                    mt-6
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-black
                    text-slate-300
                    transition-all
                    duration-300
                    group-hover:text-[#102236]
                "
            >
                Explore feature

                <ArrowRight
                    size={15}
                    className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                    "
                />
            </div>

            {/* Background decoration */}
            <div
                className="
                    absolute
                    -bottom-16
                    -right-16
                    w-32
                    h-32
                    rounded-full
                    bg-slate-50
                    transition-all
                    duration-500
                    group-hover:scale-[2]
                "
            />

        </article>
    );
};


/* =============================================================
   ROLLING CONTENT
============================================================= */

const RollingContent = () => {
    return (
        <div className="flex items-center shrink-0">

            <RollingItem text="LEAD MANAGEMENT" />

            <RollingItem text="TEAM COLLABORATION" />

            <RollingItem text="SMART FOLLOW-UPS" />

            <RollingItem text="PERFORMANCE ANALYTICS" />

            <RollingItem text="1L+ LEADS" />

            <RollingItem text="EDUCATION GROWTH" />

        </div>
    );
};


/* =============================================================
   ROLLING ITEM
============================================================= */

const RollingItem = ({ text }) => {
    return (
        <div
            className="
                flex
                items-center
                gap-5
                px-7
                py-4
                whitespace-nowrap
            "
        >

            <span
                className="
                    w-2
                    h-2
                    rounded-full
                    bg-[#F6C945]
                    shadow-[0_0_10px_rgba(246,201,69,0.5)]
                "
            />

            <span
                className="
                    text-[11px]
                    font-black
                    tracking-[0.18em]
                    text-[#102236]
                "
            >
                {text}
            </span>

            <span className="text-slate-200">
                /
            </span>

        </div>
    );
};


export default HomeFeatures;