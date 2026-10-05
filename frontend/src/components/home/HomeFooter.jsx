import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowUpRight,
    ChevronRight,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

const HomeFooter = () => {
    const navigate = useNavigate();

    // ============================================================
    // NAVIGATION
    // ============================================================

    const scrollToSection = (id) => {
        const element = document.getElementById(id);

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const goToLogin = () => {
        navigate("/login");
    };

    const goToDemo = () => {
        navigate("/request-demo");
    };

    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer className="relative overflow-hidden bg-[#071824] text-white">

            {/* =====================================================
                TOP ACCENT
            ===================================================== */}

            <div
                className="
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-[#F6C945]
                    to-transparent
                "
            />

            {/* =====================================================
                BACKGROUND GLOW
            ===================================================== */}

            <div
                className="
                    absolute
                    -top-40
                    left-1/2
                    h-80
                    w-80
                    -translate-x-1/2
                    rounded-full
                    bg-[#F6C945]/5
                    blur-[100px]
                    pointer-events-none
                "
            />

            <div
                className="
                    absolute
                    -bottom-40
                    -left-40
                    h-96
                    w-96
                    rounded-full
                    bg-cyan-500/5
                    blur-[100px]
                    pointer-events-none
                "
            />

            <div
                className="
                    absolute
                    -right-40
                    top-1/3
                    h-96
                    w-96
                    rounded-full
                    bg-blue-500/5
                    blur-[100px]
                    pointer-events-none
                "
            />

            {/* =====================================================
                MAIN FOOTER
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    mx-auto
                    max-w-7xl
                    px-5
                    py-16
                    sm:px-8
                    lg:px-10
                "
            >

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div
                    className="
                        grid
                        gap-12
                        lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]
                    "
                >

                    {/* =================================================
                        BRAND
                    ================================================= */}

                    <div>

                        {/* Logo */}

                        <button
                            type="button"
                            onClick={goToTop}
                            className="
                                group
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    relative
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-2xl
                                    bg-[#F6C945]
                                    shadow-[0_8px_30px_rgba(246,201,69,0.18)]
                                    transition-all
                                    duration-300
                                    group-hover:-rotate-3
                                    group-hover:scale-105
                                "
                            >

                                <div
                                    className="
                                        absolute
                                        inset-1
                                        rounded-xl
                                        border
                                        border-[#102236]/20
                                    "
                                />

                                <span
                                    className="
                                        relative
                                        text-lg
                                        font-black
                                        text-[#102236]
                                    "
                                >
                                    SVR
                                </span>

                            </div>

                            <div className="text-left">

                                <div
                                    className="
                                        text-xl
                                        font-black
                                        tracking-tight
                                    "
                                >
                                    SVR
                                </div>

                                <div
                                    className="
                                        text-[9px]
                                        font-bold
                                        uppercase
                                        tracking-[0.25em]
                                        text-white/35
                                    "
                                >
                                    EDTECH
                                </div>

                            </div>

                        </button>

                        {/* Description */}

                        <p
                            className="
                                mt-6
                                max-w-sm
                                text-sm
                                leading-7
                                text-white/45
                            "
                        >
                            A smarter platform for managing leads,
                            teams, follow-ups and education workflows —
                            all in one connected system.
                        </p>

                        {/* =================================================
                            SOCIAL BUTTONS
                        ================================================= */}

                        <div className="mt-7 flex items-center gap-3">

                            <SocialButton label="LI" />

                            <SocialButton label="IG" />

                            <SocialButton label="GH" />

                            <SocialButton label="TW" />

                        </div>

                    </div>

                    {/* =================================================
                        PLATFORM
                    ================================================= */}

                    <FooterColumn title="Platform">

                        <FooterLink
                            label="Features"
                            onClick={() =>
                                scrollToSection("features")
                            }
                        />

                        <FooterLink
                            label="How It Works"
                            onClick={() =>
                                scrollToSection("about")
                            }
                        />

                        <FooterLink
                            label="Login"
                            onClick={goToLogin}
                        />

                        <FooterLink
                            label="Request Demo"
                            onClick={goToDemo}
                        />

                    </FooterColumn>

                    {/* =================================================
                        COMPANY
                    ================================================= */}

                    <FooterColumn title="Company">

                        <FooterLink
                            label="About Us"
                            onClick={() =>
                                scrollToSection("about")
                            }
                        />

                        <FooterLink
                            label="Our Features"
                            onClick={() =>
                                scrollToSection("features")
                            }
                        />

                        <FooterLink
                            label="Testimonials"
                            onClick={() =>
                                scrollToSection("testimonials")
                            }
                        />

                        <FooterLink
                            label="Contact"
                            onClick={() =>
                                scrollToSection("contact")
                            }
                        />

                    </FooterColumn>

                    {/* =================================================
                        CONTACT
                    ================================================= */}

                    <div>

                        <h3
                            className="
                                text-sm
                                font-black
                                uppercase
                                tracking-[0.16em]
                                text-white
                            "
                        >
                            Get In Touch
                        </h3>

                        <div className="mt-6 space-y-4">

                            <ContactItem
                                icon={<Mail size={16} />}
                                text="support@svredtech.com"
                            />

                            <ContactItem
                                icon={<Phone size={16} />}
                                text="+91 00000 00000"
                            />

                            <ContactItem
                                icon={<MapPin size={16} />}
                                text="Bangalore, Karnataka, India"
                            />

                        </div>

                        {/* =================================================
                            CONTACT CTA
                        ================================================= */}

                        <button
                            type="button"
                            onClick={goToDemo}
                            className="
                                group
                                mt-7
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-white/5
                                px-4
                                py-3
                                text-sm
                                font-bold
                                text-white
                                ring-1
                                ring-white/10
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:bg-[#F6C945]
                                hover:text-[#102236]
                                hover:ring-[#F6C945]
                            "
                        >

                            Talk to our team

                            <ArrowUpRight
                                size={16}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                    group-hover:-translate-y-1
                                "
                            />

                        </button>

                    </div>

                </div>

                {/* =====================================================
                    DIVIDER
                ===================================================== */}

                <div className="my-12 h-px bg-white/10" />

                {/* =====================================================
                    ROLLING STRIP
                ===================================================== */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                    "
                >

                    <div
                        className="
                            flex
                            w-max
                            animate-[footerMarquee_20s_linear_infinite]
                        "
                    >

                        <FooterMarquee />

                        <FooterMarquee />

                        <FooterMarquee />

                    </div>

                </div>

                {/* =====================================================
                    BOTTOM AREA
                ===================================================== */}

                <div
                    className="
                        mt-8
                        flex
                        flex-col
                        gap-5
                        text-xs
                        text-white/35
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <p>
                        © {new Date().getFullYear()} SVR EDTECH.
                        All rights reserved.
                    </p>

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-5
                        "
                    >

                        <button
                            type="button"
                            className="
                                transition-colors
                                hover:text-white
                            "
                        >
                            Privacy Policy
                        </button>

                        <button
                            type="button"
                            className="
                                transition-colors
                                hover:text-white
                            "
                        >
                            Terms & Conditions
                        </button>

                        <button
                            type="button"
                            className="
                                transition-colors
                                hover:text-white
                            "
                        >
                            Support
                        </button>

                    </div>

                </div>

            </div>

            {/* =====================================================
                BOTTOM ANIMATED ACCENT
            ===================================================== */}

            <div
                className="
                    relative
                    h-1
                    overflow-hidden
                    bg-[#102236]
                "
            >

                <div
                    className="
                        absolute
                        inset-y-0
                        left-0
                        w-1/3
                        animate-[footerLight_4s_ease-in-out_infinite]
                        bg-[#F6C945]
                    "
                />

            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`

                @keyframes footerMarquee {

                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-33.333%);
                    }

                }

                @keyframes footerLight {

                    0% {
                        transform: translateX(-100%);
                    }

                    50% {
                        transform: translateX(250%);
                    }

                    100% {
                        transform: translateX(350%);
                    }

                }

            `}</style>

        </footer>
    );
};

// ================================================================
// FOOTER COLUMN
// ================================================================

const FooterColumn = ({ title, children }) => {
    return (
        <div>

            <h3
                className="
                    text-sm
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-white
                "
            >
                {title}
            </h3>

            <div className="mt-6 space-y-1">
                {children}
            </div>

        </div>
    );
};

// ================================================================
// FOOTER LINK
// ================================================================

const FooterLink = ({ label, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                group
                flex
                w-full
                items-center
                gap-2
                py-2
                text-left
                text-sm
                text-white/45
                transition-all
                duration-200
                hover:translate-x-1
                hover:text-white
            "
        >

            <ChevronRight
                size={14}
                className="
                    text-[#F6C945]
                    opacity-0
                    transition-all
                    duration-200
                    group-hover:opacity-100
                "
            />

            <span>
                {label}
            </span>

        </button>
    );
};

// ================================================================
// CONTACT ITEM
// ================================================================

const ContactItem = ({ icon, text }) => {
    return (
        <div className="flex items-start gap-3">

            <div
                className="
                    mt-0.5
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#F6C945]/10
                    text-[#F6C945]
                "
            >
                {icon}
            </div>

            <span
                className="
                    pt-1
                    text-sm
                    leading-6
                    text-white/45
                "
            >
                {text}
            </span>

        </div>
    );
};

// ================================================================
// SOCIAL BUTTON
// ================================================================

const SocialButton = ({ label }) => {
    return (
        <button
            type="button"
            className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/5
                text-[10px]
                font-black
                text-white/45
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#F6C945]/40
                hover:bg-[#F6C945]
                hover:text-[#102236]
            "
        >
            {label}
        </button>
    );
};

// ================================================================
// MARQUEE
// ================================================================

const FooterMarquee = () => {
    return (
        <div className="flex shrink-0 items-center">

            <FooterMarqueeItem text="SVR EDTECH" />

            <FooterMarqueeItem text="1L+ LEADS" />

            <FooterMarqueeItem text="SMARTER WORKFLOW" />

            <FooterMarqueeItem text="TEAM COLLABORATION" />

            <FooterMarqueeItem text="SMART FOLLOW-UPS" />

            <FooterMarqueeItem text="EDUCATION GROWTH" />

        </div>
    );
};

// ================================================================
// MARQUEE ITEM
// ================================================================

const FooterMarqueeItem = ({ text }) => {
    return (
        <div
            className="
                flex
                items-center
                gap-6
                px-7
                py-4
            "
        >

            <span
                className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#F6C945]
                "
            />

            <span
                className="
                    whitespace-nowrap
                    text-[10px]
                    font-black
                    tracking-[0.2em]
                    text-white/30
                "
            >
                {text}
            </span>

        </div>
    );
};

export default HomeFooter;