import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowDown,
    BarChart3,
    CalendarCheck,
    CheckCircle2,
    GraduationCap,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react";

import svrLogo from "../../assets/images/svr-logo.png";

const HomeHero = () => {
    const navigate = useNavigate();

    const [leadCount, setLeadCount] = useState(0);
    const [teamCount, setTeamCount] = useState(0);
    const [followUpCount, setFollowUpCount] = useState(0);

    // =========================================================
    // ANIMATED COUNTERS
    // =========================================================

    useEffect(() => {
        const duration = 1800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            // Smooth ease-out
            const eased =
                1 - Math.pow(1 - progress, 3);

            setLeadCount(
                Math.floor(100000 * eased)
            );

            setTeamCount(
                Math.floor(50 * eased)
            );

            setFollowUpCount(
                Math.floor(1000 * eased)
            );

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        const animationFrame =
            requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goToLogin = () => {
        navigate("/login");
    };

    const goToDemo = () => {
        navigate("/request-demo");
    };

    const scrollDown = () => {
        document
            .getElementById("features")
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };

    return (
        <section
            id="home"
            className="
                relative
                min-h-screen
                pt-[79px]
                overflow-hidden
                bg-[#102236]
            "
        >
            {/* =====================================================
                MAIN BACKGROUND
            ===================================================== */}

            <div className="absolute inset-0">

                {/* Deep gradient */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-[#102236]
                        via-[#12364A]
                        to-[#00323F]
                    "
                />

                {/* Yellow glow */}

                <div
                    className="
                        absolute
                        -top-40
                        -right-40
                        w-[550px]
                        h-[550px]
                        rounded-full
                        bg-[#F6C945]/20
                        blur-[100px]
                        animate-pulse
                    "
                />

                {/* Teal glow */}

                <div
                    className="
                        absolute
                        -bottom-48
                        -left-48
                        w-[600px]
                        h-[600px]
                        rounded-full
                        bg-cyan-500/10
                        blur-[120px]
                    "
                />

                {/* =================================================
                    MOVING GRID
                ================================================= */}

                <div
                    className="
                        absolute
                        inset-0
                        opacity-[0.08]
                        bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
                        bg-[size:55px_55px]
                    "
                />

                {/* =================================================
                    LARGE DECORATIVE RINGS
                ================================================= */}

                <div
                    className="
                        absolute
                        -top-40
                        -left-40
                        w-[520px]
                        h-[520px]
                        rounded-full
                        border-[2px]
                        border-[#F6C945]/10
                        animate-[spin_25s_linear_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        -top-20
                        -left-20
                        w-[360px]
                        h-[360px]
                        rounded-full
                        border
                        border-white/10
                        animate-[spin_18s_linear_infinite_reverse]
                    "
                />

                <div
                    className="
                        absolute
                        right-[-220px]
                        bottom-[-220px]
                        w-[600px]
                        h-[600px]
                        rounded-full
                        border-[70px]
                        border-[#F6C945]/10
                    "
                />

            </div>

            {/* =====================================================
                FLOATING PARTICLES
            ===================================================== */}

            <FloatingParticle
                className="top-[18%] left-[8%]"
                delay="0s"
            />

            <FloatingParticle
                className="top-[30%] left-[44%]"
                delay="1.2s"
                small
            />

            <FloatingParticle
                className="top-[14%] right-[36%]"
                delay="0.5s"
            />

            <FloatingParticle
                className="bottom-[25%] left-[40%]"
                delay="1.8s"
                small
            />

            <FloatingParticle
                className="bottom-[18%] right-[10%]"
                delay="0.8s"
            />

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    max-w-7xl
                    mx-auto
                    px-5
                    sm:px-8
                "
            >
                <div
                    className="
                        min-h-[calc(100vh-79px)]
                        grid
                        lg:grid-cols-[1.05fr_0.95fr]
                        gap-10
                        lg:gap-4
                        items-center
                        py-16
                        lg:py-12
                    "
                >

                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div
                        className="
                            text-white
                            max-w-3xl
                            lg:pr-6
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
                                shadow-lg
                                animate-[fadeSlideUp_0.8s_ease-out]
                            "
                        >
                            <span
                                className="
                                    relative
                                    flex
                                    w-2.5
                                    h-2.5
                                "
                            >
                                <span
                                    className="
                                        absolute
                                        inline-flex
                                        w-full
                                        h-full
                                        rounded-full
                                        bg-[#F6C945]
                                        opacity-75
                                        animate-ping
                                    "
                                />

                                <span
                                    className="
                                        relative
                                        inline-flex
                                        w-2.5
                                        h-2.5
                                        rounded-full
                                        bg-[#F6C945]
                                    "
                                />
                            </span>

                            <span
                                className="
                                    text-[10px]
                                    sm:text-xs
                                    font-black
                                    tracking-[0.15em]
                                    text-white/90
                                "
                            >
                                SMART EDUCATION MANAGEMENT
                            </span>
                        </div>

                        {/* =================================================
                            MAIN HEADING
                        ================================================= */}

                        <h1
                            className="
                                mt-7
                                text-5xl
                                sm:text-6xl
                                lg:text-[70px]
                                xl:text-[78px]
                                font-black
                                leading-[0.98]
                                tracking-[-0.04em]
                                animate-[fadeSlideUp_0.9s_ease-out]
                            "
                        >
                            Empowering

                            <br />

                            <span
                                className="
                                    relative
                                    inline-block
                                    text-[#F6C945]
                                "
                            >
                                Education
                                <span
                                    className="
                                        absolute
                                        left-0
                                        bottom-[-4px]
                                        w-full
                                        h-1
                                        rounded-full
                                        bg-[#F6C945]
                                        origin-left
                                        animate-[growLine_1.2s_ease-out]
                                    "
                                />
                            </span>

                            <span className="text-white">
                                .
                            </span>

                            <br />

                            Building{" "}
                            <span className="relative inline-block">

                                Futures

                                <span
                                    className="
                                        absolute
                                        -right-5
                                        top-0
                                        text-[#F6C945]
                                        animate-bounce
                                    "
                                >
                                    .
                                </span>
                            </span>
                        </h1>

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <p
                            className="
                                mt-7
                                max-w-2xl
                                text-base
                                sm:text-lg
                                lg:text-xl
                                leading-8
                                text-white/65
                                animate-[fadeSlideUp_1s_ease-out]
                            "
                        >
                            SVR-EDTECH brings your leads, teams,
                            follow-ups and performance together in
                            one intelligent education management
                            platform.
                        </p>

                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-wrap
                                gap-4
                                mt-9
                                animate-[fadeSlideUp_1.1s_ease-out]
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
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    bg-[#F6C945]
                                    px-6
                                    sm:px-7
                                    py-4
                                    font-black
                                    text-[#102236]
                                    shadow-[0_15px_40px_rgba(246,201,69,0.25)]
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-[0_20px_50px_rgba(246,201,69,0.35)]
                                "
                            >
                                <span
                                    className="
                                        absolute
                                        inset-0
                                        bg-white/25
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
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    border
                                    border-white/25
                                    bg-white/5
                                    backdrop-blur-md
                                    px-6
                                    sm:px-7
                                    py-4
                                    font-bold
                                    text-white
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:bg-white
                                    hover:text-[#102236]
                                    hover:border-white
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

                                Request Demo
                            </button>
                        </div>

                        {/* =================================================
                            QUICK BENEFITS
                        ================================================= */}

                        <div
                            className="
                                flex
                                flex-wrap
                                gap-x-8
                                gap-y-4
                                mt-10
                                animate-[fadeSlideUp_1.2s_ease-out]
                            "
                        >
                            <HeroBenefit
                                icon={<CheckCircle2 size={17} />}
                                text="Easy to Manage"
                            />

                            <HeroBenefit
                                icon={<CheckCircle2 size={17} />}
                                text="Team Focused"
                            />

                            <HeroBenefit
                                icon={<CheckCircle2 size={17} />}
                                text="Data Driven"
                            />
                        </div>

                    </div>

                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <div
                        className="
                            relative
                            min-h-[500px]
                            lg:min-h-[600px]
                            flex
                            items-center
                            justify-center
                        "
                    >

                        {/* =================================================
                            OUTER ROTATING RING
                        ================================================= */}

                        <div
                            className="
                                absolute
                                w-[340px]
                                h-[340px]
                                sm:w-[430px]
                                sm:h-[430px]
                                lg:w-[500px]
                                lg:h-[500px]
                                rounded-full
                                border
                                border-[#F6C945]/20
                                animate-[spin_25s_linear_infinite]
                            "
                        >
                            <span
                                className="
                                    absolute
                                    -top-2
                                    left-1/2
                                    w-4
                                    h-4
                                    rounded-full
                                    bg-[#F6C945]
                                    shadow-[0_0_25px_#F6C945]
                                "
                            />
                        </div>

                        {/* =================================================
                            INNER RING
                        ================================================= */}

                        <div
                            className="
                                absolute
                                w-[280px]
                                h-[280px]
                                sm:w-[350px]
                                sm:h-[350px]
                                lg:w-[400px]
                                lg:h-[400px]
                                rounded-full
                                border
                                border-white/10
                                animate-[spin_18s_linear_infinite_reverse]
                            "
                        />

                        {/* =================================================
                            MAIN DASHBOARD CARD
                        ================================================= */}

                        <div
                            className="
                                relative
                                z-20
                                w-[285px]
                                sm:w-[350px]
                                lg:w-[390px]
                                rounded-[32px]
                                border
                                border-white/20
                                bg-white/10
                                backdrop-blur-2xl
                                p-5
                                sm:p-6
                                shadow-[0_30px_100px_rgba(0,0,0,0.35)]
                                animate-[floatCard_5s_ease-in-out_infinite]
                            "
                        >

                            {/* Card header */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    pb-5
                                    border-b
                                    border-white/10
                                "
                            >
                                <div className="flex items-center gap-3">

                                    <div
                                        className="
                                            w-11
                                            h-11
                                            rounded-xl
                                            bg-[#F6C945]
                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >
                                        <img
                                            src={svrLogo}
                                            alt="SVR"
                                            className="
                                                w-8
                                                h-8
                                                object-contain
                                            "
                                        />
                                    </div>

                                    <div>
                                        <p className="text-white font-black">
                                            SVR-EDTECH
                                        </p>

                                        <p className="text-white/45 text-xs">
                                            Dashboard
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="
                                        w-2.5
                                        h-2.5
                                        rounded-full
                                        bg-emerald-400
                                        shadow-[0_0_15px_rgba(52,211,153,0.8)]
                                        animate-pulse
                                    "
                                />
                            </div>

                            {/* =================================================
                                DASHBOARD MINI STATS
                            ================================================= */}

                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                    mt-5
                                "
                            >
                                <MiniStat
                                    label="Leads"
                                    value="1L+"
                                    icon={
                                        <Users size={17} />
                                    }
                                    iconClass="bg-blue-500/20 text-blue-300"
                                />

                                <MiniStat
                                    label="Growth"
                                    value="+28%"
                                    icon={
                                        <TrendingUp size={17} />
                                    }
                                    iconClass="bg-emerald-500/20 text-emerald-300"
                                />

                                <MiniStat
                                    label="Teams"
                                    value="50+"
                                    icon={
                                        <Users size={17} />
                                    }
                                    iconClass="bg-purple-500/20 text-purple-300"
                                />

                                <MiniStat
                                    label="Follow-ups"
                                    value="1K+"
                                    icon={
                                        <CalendarCheck size={17} />
                                    }
                                    iconClass="bg-orange-500/20 text-orange-300"
                                />
                            </div>

                            {/* =================================================
                                MINI CHART
                            ================================================= */}

                            <div
                                className="
                                    mt-4
                                    rounded-2xl
                                    bg-black/10
                                    border
                                    border-white/10
                                    p-4
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-4
                                    "
                                >
                                    <div>
                                        <p className="text-white/45 text-[10px] uppercase tracking-wider">
                                            Lead Growth
                                        </p>

                                        <p className="text-white font-black text-xl">
                                            +32.8%
                                        </p>
                                    </div>

                                    <BarChart3
                                        size={20}
                                        className="text-[#F6C945]"
                                    />
                                </div>

                                <MiniChart />
                            </div>

                            {/* =================================================
                                PROGRESS
                            ================================================= */}

                            <div className="mt-4">

                                <div
                                    className="
                                        flex
                                        justify-between
                                        text-xs
                                        mb-2
                                    "
                                >
                                    <span className="text-white/50">
                                        Team Performance
                                    </span>

                                    <span className="text-[#F6C945] font-bold">
                                        86%
                                    </span>
                                </div>

                                <div
                                    className="
                                        h-2
                                        rounded-full
                                        bg-white/10
                                        overflow-hidden
                                    "
                                >
                                    <div
                                        className="
                                            h-full
                                            w-[86%]
                                            rounded-full
                                            bg-gradient-to-r
                                            from-[#F6C945]
                                            to-yellow-300
                                            animate-[progressGrow_2s_ease-out]
                                        "
                                    />
                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            FLOATING CARD — LEADS
                        ================================================= */}

                        <div
                            className="
                                absolute
                                z-30
                                top-[10%]
                                left-0
                                sm:left-2
                                lg:left-[-20px]
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-3
                                sm:p-4
                                shadow-[0_20px_50px_rgba(0,0,0,0.25)]
                                animate-[floatLeft_4s_ease-in-out_infinite]
                            "
                        >
                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        w-11
                                        h-11
                                        rounded-xl
                                        bg-blue-50
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <Users
                                        size={22}
                                        className="text-blue-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] text-slate-400">
                                        Total Leads
                                    </p>

                                    <p className="text-lg font-black text-[#102236]">
                                        1L+
                                    </p>

                                    <p className="text-[10px] text-emerald-600 font-bold">
                                        Growing daily
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* =================================================
                            FLOATING CARD — FOLLOW UP
                        ================================================= */}

                        <div
                            className="
                                absolute
                                z-30
                                bottom-[9%]
                                right-0
                                sm:right-1
                                lg:right-[-25px]
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-3
                                sm:p-4
                                shadow-[0_20px_50px_rgba(0,0,0,0.25)]
                                animate-[floatRight_4.5s_ease-in-out_infinite]
                            "
                        >
                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        w-11
                                        h-11
                                        rounded-xl
                                        bg-emerald-50
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <CheckCircle2
                                        size={22}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-[10px] text-slate-400">
                                        Follow-ups
                                    </p>

                                    <p className="text-lg font-black text-[#102236]">
                                        1K+
                                    </p>

                                    <p className="text-[10px] text-emerald-600 font-bold">
                                        On track
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* =================================================
                            FLOATING ZAP
                        ================================================= */}

                        <div
                            className="
                                absolute
                                z-30
                                top-[38%]
                                right-[-5px]
                                lg:right-[-35px]
                                w-12
                                h-12
                                rounded-full
                                bg-[#F6C945]
                                text-[#102236]
                                flex
                                items-center
                                justify-center
                                shadow-[0_0_35px_rgba(246,201,69,0.5)]
                                animate-[floatCard_3s_ease-in-out_infinite]
                            "
                        >
                            <Zap
                                size={22}
                                fill="currentColor"
                            />
                        </div>

                    </div>
                </div>

                {/* =================================================
                    SCROLL INDICATOR
                ================================================= */}

                <button
                    type="button"
                    onClick={scrollDown}
                    className="
                        hidden
                        lg:flex
                        absolute
                        bottom-7
                        left-1/2
                        -translate-x-1/2
                        flex-col
                        items-center
                        gap-2
                        text-white/45
                        hover:text-white
                        transition
                    "
                >
                    <span
                        className="
                            text-[10px]
                            uppercase
                            tracking-[0.3em]
                            font-bold
                        "
                    >
                        Explore
                    </span>

                    <span
                        className="
                            w-8
                            h-12
                            rounded-full
                            border
                            border-white/20
                            flex
                            justify-center
                            pt-2
                        "
                    >
                        <span
                            className="
                                w-1.5
                                h-3
                                rounded-full
                                bg-[#F6C945]
                                animate-bounce
                            "
                        />
                    </span>
                </button>
            </div>

            {/* =====================================================
                LOCAL ANIMATIONS
            ===================================================== */}

            <style>{`

                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(35px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes growLine {
                    from {
                        transform: scaleX(0);
                    }

                    to {
                        transform: scaleX(1);
                    }
                }

                @keyframes floatCard {
                    0%,
                    100% {
                        transform: translateY(0) rotate(0deg);
                    }

                    50% {
                        transform: translateY(-12px) rotate(0.5deg);
                    }
                }

                @keyframes floatLeft {
                    0%,
                    100% {
                        transform: translateY(0) rotate(-2deg);
                    }

                    50% {
                        transform: translateY(-14px) rotate(1deg);
                    }
                }

                @keyframes floatRight {
                    0%,
                    100% {
                        transform: translateY(0) rotate(2deg);
                    }

                    50% {
                        transform: translateY(12px) rotate(-1deg);
                    }
                }

                @keyframes progressGrow {
                    from {
                        width: 0%;
                    }

                    to {
                        width: 86%;
                    }
                }

            `}</style>
        </section>
    );
};

// =============================================================
// HERO BENEFIT
// =============================================================

const HeroBenefit = ({ icon, text }) => {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-[#F6C945]">
                {icon}
            </span>

            <span className="text-white/70 font-semibold">
                {text}
            </span>
        </div>
    );
};

// =============================================================
// FLOATING PARTICLE
// =============================================================

const FloatingParticle = ({
    className,
    delay,
    small = false,
}) => {
    return (
        <span
            className={`
                absolute
                z-[2]
                rounded-full
                bg-[#F6C945]
                shadow-[0_0_15px_rgba(246,201,69,0.7)]
                animate-[particleFloat_4s_ease-in-out_infinite]
                ${small ? "w-1.5 h-1.5" : "w-2 h-2"}
                ${className}
            `}
            style={{
                animationDelay: delay,
            }}
        />
    );
};

// =============================================================
// MINI STAT
// =============================================================

const MiniStat = ({
    label,
    value,
    icon,
    iconClass,
}) => {
    return (
        <div
            className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-3
                transition-all
                duration-300
                hover:bg-white/10
                hover:-translate-y-1
            "
        >
            <div className="flex items-center gap-2.5">

                <div
                    className={`
                        w-9
                        h-9
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        ${iconClass}
                    `}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-[9px] text-white/40">
                        {label}
                    </p>

                    <p className="text-white font-black">
                        {value}
                    </p>
                </div>

            </div>
        </div>
    );
};

// =============================================================
// MINI CHART
// =============================================================

const MiniChart = () => {
    return (
        <div className="relative h-20 w-full">

            {/* Grid */}

            <div
                className="
                    absolute
                    inset-0
                    opacity-20
                    bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)]
                    bg-[size:100%_20px]
                "
            />

            {/* Chart */}

            <svg
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient
                        id="chartGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="#F6C945"
                            stopOpacity="0.35"
                        />

                        <stop
                            offset="100%"
                            stopColor="#F6C945"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>

                <path
                    d="
                        M0,82
                        C25,78 35,70 55,72
                        C80,74 88,58 110,62
                        C135,66 145,48 170,52
                        C195,55 210,38 230,43
                        C255,48 270,29 290,34
                        C315,39 330,18 350,24
                        C370,28 385,12 400,15
                        L400,100
                        L0,100
                        Z
                    "
                    fill="url(#chartGradient)"
                />

                <path
                    d="
                        M0,82
                        C25,78 35,70 55,72
                        C80,74 88,58 110,62
                        C135,66 145,48 170,52
                        C195,55 210,38 230,43
                        C255,48 270,29 290,34
                        C315,39 330,18 350,24
                        C370,28 385,12 400,15
                    "
                    fill="none"
                    stroke="#F6C945"
                    strokeWidth="4"
                    strokeLinecap="round"
                    pathLength="1"
                    className="animate-[chartDraw_2s_ease-out]"
                />
            </svg>
        </div>
    );
};

export default HomeHero;