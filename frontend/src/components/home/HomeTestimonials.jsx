import React from "react";
import {
    ArrowRight,
    Building2,
    Quote,
    Star,
    Users,
} from "lucide-react";

const HomeTestimonials = () => {
    const testimonials = [
        {
            text:
                "SVR-EDTECH gives our admissions team a much simpler way to organize leads and stay on top of every follow-up.",
            name: "Education Manager",
            role: "Admissions Team",
            type: "Admissions",
            icon: Building2,
            rating: 5,
            color: "blue",
        },
        {
            text:
                "Managing team assignments and following lead progress has become much easier. Everyone knows what needs to be done.",
            name: "Operations Manager",
            role: "Education Institution",
            type: "Operations",
            icon: Users,
            rating: 5,
            color: "amber",
        },
        {
            text:
                "Having lead information, follow-ups and performance insights together gives our team much better visibility.",
            name: "Team Lead",
            role: "Admissions Department",
            type: "Team Management",
            icon: Users,
            rating: 5,
            color: "emerald",
        },
        {
            text:
                "The platform helps us keep our workflow organized while giving our team a clear view of the opportunities we are handling.",
            name: "Admissions Coordinator",
            role: "Education Team",
            type: "Workflow",
            icon: Building2,
            rating: 5,
            color: "purple",
        },
    ];

    return (
        <section
            className="
                relative
                overflow-hidden
                bg-white
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
                        -top-40
                        left-1/2
                        -translate-x-1/2
                        w-[600px]
                        h-[600px]
                        rounded-full
                        bg-[#F6C945]/7
                        blur-[120px]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-[-250px]
                        left-[-150px]
                        w-[500px]
                        h-[500px]
                        rounded-full
                        bg-[#102236]/5
                        blur-[110px]
                    "
                />

                <div
                    className="
                        absolute
                        top-20
                        right-10
                        w-16
                        h-16
                        rounded-full
                        border
                        border-[#F6C945]/30
                        animate-[spin_16s_linear_infinite]
                    "
                />

                <div
                    className="
                        absolute
                        bottom-20
                        left-10
                        w-10
                        h-10
                        rounded-full
                        border
                        border-[#102236]/10
                        animate-[spin_12s_linear_infinite_reverse]
                    "
                />
            </div>

            <div className="relative">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">

                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#102236]/10
                            bg-[#F7F9FC]
                            px-4
                            py-2
                        "
                    >
                        <Quote
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
                            Built Around Your Team
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
                        What Teams{" "}
                        <span className="text-[#F6C945]">
                            Say
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
                        A platform designed around the people who
                        manage leads, teams and opportunities every
                        day.
                    </p>
                </div>

                {/* =================================================
                    ROLLING TESTIMONIALS
                ================================================= */}

                <div
                    className="
                        relative
                        mt-14
                        overflow-hidden
                        group/slider
                    "
                >
                    {/* Left fade */}

                    <div
                        className="
                            absolute
                            z-20
                            left-0
                            top-0
                            bottom-0
                            w-16
                            sm:w-32
                            bg-gradient-to-r
                            from-white
                            to-transparent
                            pointer-events-none
                        "
                    />

                    {/* Right fade */}

                    <div
                        className="
                            absolute
                            z-20
                            right-0
                            top-0
                            bottom-0
                            w-16
                            sm:w-32
                            bg-gradient-to-l
                            from-white
                            to-transparent
                            pointer-events-none
                        "
                    />

                    <div
                        className="
                            flex
                            w-max
                            animate-[testimonialRoll_35s_linear_infinite]
                            group-hover/slider:[animation-play-state:paused]
                        "
                    >
                        <TestimonialSet
                            testimonials={testimonials}
                        />

                        <TestimonialSet
                            testimonials={testimonials}
                        />

                        <TestimonialSet
                            testimonials={testimonials}
                        />
                    </div>
                </div>

                {/* =================================================
                    TRUST STRIP
                ================================================= */}

                <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-14">

                    <div
                        className="
                            rounded-3xl
                            bg-[#102236]
                            px-6
                            sm:px-8
                            py-7
                            overflow-hidden
                            relative
                        "
                    >
                        {/* Moving line */}

                        <div
                            className="
                                absolute
                                top-0
                                left-0
                                h-1
                                w-36
                                rounded-full
                                bg-[#F6C945]
                                animate-[testimonialLine_4s_linear_infinite]
                            "
                        />

                        <div
                            className="
                                relative
                                z-10
                                flex
                                flex-col
                                md:flex-row
                                items-center
                                justify-between
                                gap-5
                            "
                        >
                            <div className="text-center md:text-left">

                                <p
                                    className="
                                        text-[#F6C945]
                                        text-xs
                                        font-black
                                        tracking-[0.18em]
                                        uppercase
                                    "
                                >
                                    Made For Education Teams
                                </p>

                                <p
                                    className="
                                        mt-2
                                        text-white
                                        text-xl
                                        font-black
                                    "
                                >
                                    Manage more. Follow up better.
                                    Grow smarter.
                                </p>
                            </div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    font-bold
                                    text-white/60
                                "
                            >
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(
                                        (item) => (
                                            <Star
                                                key={item}
                                                size={15}
                                                fill="currentColor"
                                                className="text-[#F6C945]"
                                            />
                                        )
                                    )}
                                </div>

                                <span>
                                    Built for better workflows
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`
                @keyframes testimonialRoll {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-33.333%);
                    }
                }

                @keyframes testimonialLine {
                    0% {
                        transform: translateX(-180px);
                    }

                    100% {
                        transform: translateX(100vw);
                    }
                }
            `}</style>
        </section>
    );
};

// =============================================================
// TESTIMONIAL SET
// =============================================================

const TestimonialSet = ({ testimonials }) => {
    return (
        <div className="flex shrink-0 gap-5 px-2.5">
            {testimonials.map((testimonial, index) => (
                <TestimonialCard
                    key={`${testimonial.name}-${index}`}
                    testimonial={testimonial}
                />
            ))}
        </div>
    );
};

// =============================================================
// TESTIMONIAL CARD
// =============================================================

const TestimonialCard = ({ testimonial }) => {
    const Icon = testimonial.icon;

    const colorStyles = {
        blue: {
            icon: "bg-blue-50 text-blue-600",
            accent: "bg-blue-500",
            tag: "bg-blue-50 text-blue-600",
        },

        amber: {
            icon: "bg-amber-50 text-amber-600",
            accent: "bg-amber-500",
            tag: "bg-amber-50 text-amber-600",
        },

        emerald: {
            icon: "bg-emerald-50 text-emerald-600",
            accent: "bg-emerald-500",
            tag: "bg-emerald-50 text-emerald-600",
        },

        purple: {
            icon: "bg-purple-50 text-purple-600",
            accent: "bg-purple-500",
            tag: "bg-purple-50 text-purple-600",
        },
    };

    const styles =
        colorStyles[testimonial.color];

    return (
        <article
            className="
                group
                relative
                w-[310px]
                sm:w-[390px]
                overflow-hidden
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
            "
        >
            {/* Accent */}

            <div
                className={`
                    absolute
                    top-0
                    left-0
                    w-full
                    h-1
                    ${styles.accent}
                `}
            />

            {/* Quote decoration */}

            <div
                className="
                    absolute
                    top-5
                    right-6
                    text-slate-100
                    transition-all
                    duration-500
                    group-hover:text-[#F6C945]/20
                    group-hover:scale-110
                "
            >
                <Quote
                    size={48}
                    fill="currentColor"
                />
            </div>

            {/* Profile icon */}

            <div
                className={`
                    relative
                    w-12
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    ${styles.icon}
                    transition-all
                    duration-500
                    group-hover:rotate-6
                    group-hover:scale-110
                `}
            >
                <Icon size={23} />
            </div>

            {/* Rating */}

            <div className="flex gap-1 mt-5">

                {Array.from({
                    length: testimonial.rating,
                }).map((_, index) => (
                    <Star
                        key={index}
                        size={14}
                        fill="currentColor"
                        className="text-[#F6C945]"
                    />
                ))}
            </div>

            {/* Quote */}

            <p
                className="
                    mt-5
                    text-sm
                    sm:text-base
                    leading-7
                    text-slate-600
                    min-h-[105px]
                "
            >
                "{testimonial.text}"
            </p>

            {/* Bottom */}

            <div
                className="
                    mt-6
                    pt-5
                    border-t
                    border-slate-100
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >
                <div>
                    <p
                        className="
                            text-sm
                            font-black
                            text-[#102236]
                        "
                    >
                        {testimonial.name}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        {testimonial.role}
                    </p>
                </div>

                <span
                    className={`
                        rounded-full
                        px-2.5
                        py-1.5
                        text-[9px]
                        font-black
                        whitespace-nowrap
                        ${styles.tag}
                    `}
                >
                    {testimonial.type}
                </span>
            </div>

            {/* Hover arrow */}

            <div
                className="
                    absolute
                    bottom-6
                    left-1/2
                    -translate-x-1/2
                    opacity-0
                    translate-y-3
                    group-hover:opacity-100
                    group-hover:translate-y-0
                    transition-all
                    duration-300
                    text-[#102236]
                "
            >
                <ArrowRight size={16} />
            </div>
        </article>
    );
};

export default HomeTestimonials;