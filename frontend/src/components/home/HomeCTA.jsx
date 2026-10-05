import React from "react";
import {
    ArrowRight,
    CalendarCheck,
    CheckCircle2,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeCTA = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate("/login");
    };

    const goToDemo = () => {
        navigate("/request-demo");
    };

    return (
        <section
            className="
                relative
                overflow-hidden
                bg-[#102236]
                py-20
                sm:py-24
            "
        >
            {/* =====================================================
                BACKGROUND
            ===================================================== */}

            <div className="absolute inset-0 pointer-events-none">

                {/* Main gradient */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-[#102236]
                        via-[#12384A]
                        to-[#00323F]
                    "
                />

                {/* Yellow glow */}

                <div
                    className="
                        absolute
                        -top-48
                        -right-48
                        w-[550px]
                        h-[550px]
                        rounded-full
                        bg-[#F6C945]/15
                        blur-[110px]
                        animate-pulse
                    "
                />

                {/* Blue glow */}

                <div
                    className="
                        absolute
                        -bottom-48
                        -left-48
                        w-[550px]
                        h-[550px]
                        rounded-full
                        bg-cyan-400/10
                        blur-[110px]
                    "
                />

                {/* Grid */}

                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.06]
                        bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
                        bg-[size:50px_50px]
                    "
                />

                {/* Rotating circles */}

                <div
                    className="
                        absolute
                        -top-32
                        left-[-100px]
                        w-[400px]
                        h-[400px]
                        rounded-full
                        border
                        border-[#F6C945]/20
                        animate-[spin_22s_linear_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-180px]
                        right-[-100px]
                        w-[450px]
                        h-[450px]
                        rounded-full
                        border-[60px]
                        border-white/5
                        animate-[spin_28s_linear_infinite_reverse]
                    "
                />
            </div>

            {/* =====================================================
                FLOATING PARTICLES
            ===================================================== */}

            <span
                className="
                    absolute
                    top-[20%]
                    left-[15%]
                    w-2
                    h-2
                    rounded-full
                    bg-[#F6C945]
                    shadow-[0_0_15px_#F6C945]
                    animate-[ctaParticle_4s_ease-in-out_infinite]
                "
            />

            <span
                className="
                    absolute
                    top-[30%]
                    right-[15%]
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-cyan-300
                    shadow-[0_0_15px_rgba(103,232,249,0.7)]
                    animate-[ctaParticle_5s_ease-in-out_infinite]
                "
            />

            <span
                className="
                    absolute
                    bottom-[20%]
                    left-[35%]
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-[#F6C945]
                    animate-[ctaParticle_3.5s_ease-in-out_infinite]
                "
            />

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    max-w-6xl
                    mx-auto
                    px-5
                    sm:px-8
                    text-center
                "
            >
                {/* Badge */}

                <div
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[#F6C945]/30
                        bg-white/5
                        backdrop-blur-md
                        px-4
                        py-2
                        text-[#F6C945]
                    "
                >
                    <Sparkles
                        size={15}
                        className="animate-pulse"
                    />

                    <span
                        className="
                            text-[10px]
                            sm:text-xs
                            font-black
                            tracking-[0.18em]
                            uppercase
                        "
                    >
                        Ready To Grow?
                    </span>
                </div>

                {/* Heading */}

                <h2
                    className="
                        mt-6
                        text-4xl
                        sm:text-5xl
                        lg:text-6xl
                        xl:text-7xl
                        font-black
                        leading-[1.02]
                        tracking-tight
                        text-white
                    "
                >
                    Your Next{" "}
                    <span className="text-[#F6C945]">
                        1L+ Leads
                    </span>
                    <br />
                    Start With One Step.
                </h2>

                {/* Description */}

                <p
                    className="
                        max-w-2xl
                        mx-auto
                        mt-6
                        text-base
                        sm:text-lg
                        leading-8
                        text-white/60
                    "
                >
                    Bring your leads, team and follow-ups together
                    with a platform built to make education
                    management simpler and smarter.
                </p>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        justify-center
                        gap-4
                        mt-9
                    "
                >
                    {/* Login */}

                    <button
                        type="button"
                        onClick={goToLogin}
                        className="
                            group
                            relative
                            overflow-hidden
                            inline-flex
                            items-center
                            justify-center
                            gap-3
                            rounded-2xl
                            bg-[#F6C945]
                            px-7
                            sm:px-9
                            py-4
                            font-black
                            text-[#102236]
                            shadow-[0_15px_45px_rgba(246,201,69,0.25)]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-[0_20px_55px_rgba(246,201,69,0.4)]
                        "
                    >
                        <span
                            className="
                                absolute
                                inset-0
                                bg-white/30
                                -translate-x-full
                                group-hover:translate-x-full
                                transition-transform
                                duration-700
                            "
                        />

                        <span className="relative">
                            Login to Continue
                        </span>

                        <ArrowRight
                            size={19}
                            className="
                                relative
                                transition-transform
                                duration-300
                                group-hover:translate-x-1.5
                            "
                        />
                    </button>

                    {/* Demo */}

                    <button
                        type="button"
                        onClick={goToDemo}
                        className="
                            group
                            inline-flex
                            items-center
                            justify-center
                            gap-3
                            rounded-2xl
                            border
                            border-white/25
                            bg-white/5
                            backdrop-blur-md
                            px-7
                            sm:px-9
                            py-4
                            font-bold
                            text-white
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:bg-white
                            hover:text-[#102236]
                        "
                    >
                        <CalendarCheck
                            size={19}
                            className="
                                transition-transform
                                duration-300
                                group-hover:rotate-6
                            "
                        />

                        Request a Demo
                    </button>
                </div>

                {/* =================================================
                    BENEFITS
                ================================================= */}

                <div
                    className="
                        mt-10
                        flex
                        flex-wrap
                        justify-center
                        gap-x-7
                        gap-y-3
                    "
                >
                    <CTAFeature text="Easy to Start" />

                    <CTAFeature text="Team Friendly" />

                    <CTAFeature text="Built for Growth" />

                    <CTAFeature text="1L+ Lead Ready" />
                </div>

                {/* =================================================
                    ROLLING DATA CARD
                ================================================= */}

                <div
                    className="
                        mt-14
                        mx-auto
                        max-w-4xl
                        overflow-hidden
                        rounded-3xl
                        border
                        border-white/10
                        bg-white/5
                        backdrop-blur-xl
                    "
                >
                    <div
                        className="
                            flex
                            w-max
                            animate-[ctaMarquee_22s_linear_infinite]
                        "
                    >
                        <CTAStats />

                        <CTAStats />

                        <CTAStats />
                    </div>
                </div>

                {/* =================================================
                    FINAL MESSAGE
                ================================================= */}

                <div
                    className="
                        mt-10
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-white/35
                    "
                >
                    <Zap
                        size={14}
                        className="text-[#F6C945]"
                    />

                    <span className="text-xs font-semibold">
                        Smarter workflow. Stronger team. Bigger
                        possibilities.
                    </span>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`
                @keyframes ctaMarquee {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-33.333%);
                    }
                }

                @keyframes ctaParticle {
                    0%,
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.5;
                    }

                    50% {
                        transform: translateY(-25px) scale(1.5);
                        opacity: 1;
                    }
                }
            `}</style>
        </section>
    );
};

// =============================================================
// CTA FEATURE
// =============================================================

const CTAFeature = ({ text }) => {
    return (
        <div className="flex items-center gap-2">
            <CheckCircle2
                size={15}
                className="text-[#F6C945]"
            />

            <span
                className="
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-white/60
                "
            >
                {text}
            </span>
        </div>
    );
};

// =============================================================
// CTA STATS
// =============================================================

const CTAStats = () => {
    return (
        <div className="flex items-center shrink-0">

            <CTAStat
                number="1L+"
                label="Leads Managed"
            />

            <Divider />

            <CTAStat
                number="50+"
                label="Team Members"
            />

            <Divider />

            <CTAStat
                number="1K+"
                label="Follow-ups"
            />

            <Divider />

            <CTAStat
                number="95%"
                label="Satisfaction"
            />

            <Divider />

            <CTAStat
                number="24/7"
                label="Workflow Visibility"
            />
        </div>
    );
};

// =============================================================
// CTA STAT
// =============================================================

const CTAStat = ({ number, label }) => {
    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                min-w-[145px]
                px-6
                py-5
            "
        >
            <span
                className="
                    text-2xl
                    sm:text-3xl
                    font-black
                    text-[#F6C945]
                "
            >
                {number}
            </span>

            <span
                className="
                    mt-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-white/40
                    whitespace-nowrap
                "
            >
                {label}
            </span>
        </div>
    );
};

// =============================================================
// DIVIDER
// =============================================================

const Divider = () => {
    return (
        <span
            className="
                w-px
                h-10
                bg-white/10
                shrink-0
            "
        />
    );
};

export default HomeCTA;