import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CalendarCheck,
    Menu,
    X,
} from "lucide-react";

import svrLogo from "../../assets/images/svr-logo.png";

const HomeHeader = () => {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeNav, setActiveNav] = useState("home");

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goToLogin = () => {
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const goToDemo = () => {
        setMobileMenuOpen(false);
        navigate("/request-demo");
    };

    const scrollToSection = (id) => {
        setActiveNav(id);

        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });

        setMobileMenuOpen(false);
    };

    const goHome = () => {
        setActiveNav("home");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        setMobileMenuOpen(false);
    };

    // =========================================================
    // NAV ITEM
    // =========================================================

    const NavItem = ({ id, children }) => {
        const isActive = activeNav === id;

        return (
            <button
                type="button"
                onClick={() => {
                    if (id === "home") {
                        goHome();
                    } else {
                        scrollToSection(id);
                    }
                }}
                className={`
                    relative
                    py-2
                    text-sm
                    font-bold
                    transition-all
                    duration-300
                    group
                    ${
                        isActive
                            ? "text-[#102236]"
                            : "text-slate-500 hover:text-[#102236]"
                    }
                `}
            >
                {children}

                {/* Animated underline */}

                <span
                    className={`
                        absolute
                        left-0
                        -bottom-1
                        h-[3px]
                        rounded-full
                        bg-[#F6C945]
                        transition-all
                        duration-300
                        ${
                            isActive
                                ? "w-full"
                                : "w-0 group-hover:w-full"
                        }
                    `}
                />

                {/* Small rolling dot */}

                <span
                    className={`
                        absolute
                        -right-2
                        -top-1
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-[#F6C945]
                        transition-all
                        duration-300
                        ${
                            isActive
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
                        }
                    `}
                />
            </button>
        );
    };

    return (
        <header
            className="
                fixed
                top-0
                left-0
                right-0
                z-[100]
                bg-white/90
                backdrop-blur-xl
                border-b
                border-slate-200/70
                shadow-[0_5px_30px_rgba(16,34,54,0.06)]
            "
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================
                    MAIN HEADER
                ================================================= */}

                <div className="h-[76px] flex items-center justify-between">

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <button
                        type="button"
                        onClick={goHome}
                        className="
                            group
                            flex
                            items-center
                            gap-2.5
                            shrink-0
                            text-left
                        "
                    >
                        {/* Logo container */}

                        <div
                            className="
                                relative
                                w-12
                                h-12
                                flex
                                items-center
                                justify-center
                            "
                        >
                            {/* Rotating ring */}

                            <div
                                className="
                                    absolute
                                    inset-0
                                    rounded-full
                                    border-2
                                    border-dashed
                                    border-[#F6C945]/60
                                    animate-[spin_12s_linear_infinite]
                                "
                            />

                            <img
                                src={svrLogo}
                                alt="SVR-EDTECH"
                                className="
                                    relative
                                    z-10
                                    w-10
                                    h-10
                                    object-contain
                                    transition-transform
                                    duration-500
                                    group-hover:scale-110
                                    group-hover:rotate-3
                                "
                            />

                            {/* Floating dot */}

                            <span
                                className="
                                    absolute
                                    -right-1
                                    top-0
                                    w-2
                                    h-2
                                    rounded-full
                                    bg-[#F6C945]
                                    animate-pulse
                                "
                            />
                        </div>

                        <div>
                            <div
                                className="
                                    text-lg
                                    sm:text-xl
                                    font-black
                                    tracking-tight
                                    leading-none
                                "
                            >
                                <span className="text-[#102236]">
                                    SVR-
                                </span>

                                <span className="text-[#F6C945]">
                                    EDTECH
                                </span>
                            </div>

                            <p
                                className="
                                    mt-1
                                    text-[8px]
                                    sm:text-[9px]
                                    tracking-[0.24em]
                                    font-bold
                                    text-slate-400
                                "
                            >
                                LEARN · LEAD · GROW
                            </p>
                        </div>
                    </button>

                    {/* =================================================
                        DESKTOP NAVIGATION
                    ================================================= */}

                    <nav className="hidden lg:flex items-center gap-8">

                        <NavItem id="home">
                            Home
                        </NavItem>

                        <NavItem id="about">
                            About
                        </NavItem>

                        <NavItem id="features">
                            Features
                        </NavItem>

                        <NavItem id="contact">
                            Contact
                        </NavItem>

                    </nav>

                    {/* =================================================
                        DESKTOP ACTIONS
                    ================================================= */}

                    <div className="hidden md:flex items-center gap-3">

                        {/* Demo */}

                        <button
                            type="button"
                            onClick={goToDemo}
                            className="
                                group
                                relative
                                overflow-hidden
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border-2
                                border-[#102236]
                                bg-white
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                text-[#102236]
                                transition-all
                                duration-300
                                hover:bg-[#102236]
                                hover:text-white
                            "
                        >
                            <CalendarCheck
                                size={17}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:rotate-6
                                "
                            />

                            <span>
                                Request Demo
                            </span>
                        </button>

                        {/* Login */}

                        <button
                            type="button"
                            onClick={goToLogin}
                            className="
                                group
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-[#F6C945]
                                px-5
                                py-3
                                text-sm
                                font-black
                                text-[#102236]
                                shadow-[0_8px_20px_rgba(246,201,69,0.25)]
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:bg-[#e9bb32]
                                hover:shadow-[0_12px_28px_rgba(246,201,69,0.35)]
                            "
                        >
                            Login

                            <ArrowRight
                                size={17}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1.5
                                "
                            />
                        </button>

                    </div>

                    {/* =================================================
                        MOBILE MENU BUTTON
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen(
                                (previous) => !previous
                            )
                        }
                        aria-label={
                            mobileMenuOpen
                                ? "Close menu"
                                : "Open menu"
                        }
                        className="
                            md:hidden
                            relative
                            w-11
                            h-11
                            rounded-xl
                            bg-[#102236]
                            text-white
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                            transition-all
                            duration-300
                            hover:bg-[#18324d]
                        "
                    >
                        <span
                            className="
                                absolute
                                inset-0
                                bg-[#F6C945]
                                translate-y-full
                                transition-transform
                                duration-300
                            "
                        />

                        <span className="relative z-10">
                            {mobileMenuOpen ? (
                                <X size={21} />
                            ) : (
                                <Menu size={21} />
                            )}
                        </span>
                    </button>

                </div>

                {/* =================================================
                    MOBILE MENU
                ================================================= */}

                <div
                    className={`
                        md:hidden
                        overflow-hidden
                        transition-all
                        duration-500
                        ease-out
                        ${
                            mobileMenuOpen
                                ? "max-h-[500px] opacity-100 pb-5"
                                : "max-h-0 opacity-0"
                        }
                    `}
                >
                    <div
                        className="
                            pt-3
                            border-t
                            border-slate-100
                            space-y-1
                        "
                    >

                        <MobileNavItem
                            active={activeNav === "home"}
                            onClick={goHome}
                        >
                            Home
                        </MobileNavItem>

                        <MobileNavItem
                            active={activeNav === "about"}
                            onClick={() =>
                                scrollToSection("about")
                            }
                        >
                            About
                        </MobileNavItem>

                        <MobileNavItem
                            active={activeNav === "features"}
                            onClick={() =>
                                scrollToSection("features")
                            }
                        >
                            Features
                        </MobileNavItem>

                        <MobileNavItem
                            active={activeNav === "contact"}
                            onClick={() =>
                                scrollToSection("contact")
                            }
                        >
                            Contact
                        </MobileNavItem>

                        {/* Mobile actions */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                gap-3
                                pt-4
                            "
                        >
                            <button
                                type="button"
                                onClick={goToDemo}
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border-2
                                    border-[#102236]
                                    px-4
                                    py-3
                                    font-bold
                                    text-[#102236]
                                    transition
                                    hover:bg-[#102236]
                                    hover:text-white
                                "
                            >
                                <CalendarCheck size={18} />

                                Request Demo
                            </button>

                            <button
                                type="button"
                                onClick={goToLogin}
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#F6C945]
                                    px-4
                                    py-3
                                    font-black
                                    text-[#102236]
                                    transition
                                    hover:bg-[#e9bb32]
                                "
                            >
                                Login

                                <ArrowRight size={18} />
                            </button>
                        </div>

                    </div>
                </div>

            </div>

        </header>
    );
};

// =============================================================
// MOBILE NAV ITEM
// =============================================================

const MobileNavItem = ({
    active,
    onClick,
    children,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group
                relative
                w-full
                flex
                items-center
                justify-between
                px-4
                py-3.5
                rounded-xl
                text-left
                font-bold
                transition-all
                duration-300
                ${
                    active
                        ? "bg-[#102236] text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#102236]"
                }
            `}
        >
            <span>{children}</span>

            <ArrowRight
                size={17}
                className={`
                    transition-transform
                    duration-300
                    ${
                        active
                            ? "text-[#F6C945]"
                            : "text-slate-300 group-hover:translate-x-1 group-hover:text-[#102236]"
                    }
                `}
            />
        </button>
    );
};

export default HomeHeader;