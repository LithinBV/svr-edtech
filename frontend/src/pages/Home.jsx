import React from "react";

import HomeHeader from "../components/home/HomeHeader";
import HomeHero from "../components/home/HomeHero";
import HomeFeatures from "../components/home/HomeFeatures";
import HomeStats from "../components/home/HomeStats";
import HomeHowItWorks from "../components/home/HomeHowItWorks";
import HomeTestimonials from "../components/home/HomeTestimonials";
import HomeCTA from "../components/home/HomeCTA";
import HomeFooter from "../components/home/HomeFooter";

const Home = () => {
    return (
        <div className="min-h-screen overflow-x-hidden bg-[#F7F9FC]">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <HomeHeader />

            {/* =====================================================
                HERO
            ===================================================== */}

            <main>
                <HomeHero />

                {/* =================================================
                    FEATURES
                ================================================= */}

                <HomeFeatures />

                {/* =================================================
                    STATS
                ================================================= */}

                <HomeStats />

                {/* =================================================
                    HOW IT WORKS / ABOUT
                ================================================= */}

                <HomeHowItWorks />

                {/* =================================================
                    TESTIMONIALS
                ================================================= */}

                <section id="testimonials">
                    <HomeTestimonials />
                </section>

                {/* =================================================
                    CTA / CONTACT
                ================================================= */}

                <section id="contact">
                    <HomeCTA />
                </section>
            </main>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <HomeFooter />
        </div>
    );
};

export default Home;