import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  User,
  Users,
  GraduationCap,
} from "lucide-react";

import svrLogo from "../assets/images/svr-logo.png";

const RequestDemo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    companyName: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Demo Request:", formData);

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-100">

        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <div className="h-[90px] flex items-center justify-between">

            {/* LOGO */}

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >

              <img
                src={svrLogo}
                alt="SVR-EDTECH"
                className="w-20 h-24 object-contain"
              />

              <div>

                <h1 className="text-xl sm:text-2xl font-extrabold">

                  <span className="text-[#00323F]">
                    SVR-
                  </span>

                  <span className="text-[#F5B900]">
                    EDTECH
                  </span>

                </h1>

                <p className="text-[10px] tracking-[0.25em] text-slate-500">
                  LEARN · LEAD · GROW
                </p>

              </div>

            </div>


            {/* LOGIN */}

            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-[#00323F] hover:text-[#F5B900] transition"
            >
              Already have an account? Login
            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="min-h-[calc(100vh-90px)] py-12 px-5">

        <div className="max-w-6xl mx-auto">

          {/* BACK */}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#00323F] transition mb-8"
          >

            <ArrowLeft size={18} />

            Back to Home

          </button>


          <div className="grid lg:grid-cols-2 gap-10 items-center">


            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="hidden lg:block">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FECA42]/20 text-[#00323F] text-sm font-bold">

                <CalendarCheck size={17} />

                Request a Demo

              </div>


              <h2 className="text-5xl font-black text-[#00323F] leading-tight mt-6">

                See What

                <br />

                <span className="text-[#F5B900]">
                  SVR-EDTECH
                </span>

                <br />

                Can Do For You

              </h2>


              <p className="text-slate-500 leading-8 mt-6 max-w-lg">

                Tell us a little about yourself and your organization.
                Our team can show you how SVR-EDTECH can help manage
                leads, teams, follow-ups and analytics.

              </p>


              {/* BENEFITS */}

              <div className="space-y-5 mt-8">


                <DemoBenefit
                  icon={<Users size={21} />}
                  title="Manage Leads"
                  text="Organize and track your education leads."
                />


                <DemoBenefit
                  icon={<GraduationCap size={21} />}
                  title="Improve Admissions"
                  text="Create a more organized admission workflow."
                />


                <DemoBenefit
                  icon={<CheckCircle2 size={21} />}
                  title="Track Follow-ups"
                  text="Make sure your team never misses important follow-ups."
                />

              </div>

            </div>


            {/* =================================================
                FORM CARD
            ================================================= */}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-7 sm:p-10">

              {!submitted ? (

                <>

                  <div className="mb-8">

                    <div className="w-14 h-14 rounded-2xl bg-[#FECA42]/20 flex items-center justify-center mb-5">

                      <CalendarCheck
                        size={28}
                        className="text-[#00323F]"
                      />

                    </div>


                    <h1 className="text-3xl font-black text-[#00323F]">
                      Request a Demo
                    </h1>


                    <p className="text-sm text-slate-500 mt-2 leading-6">
                      Fill in your details and our team will get in touch
                      with you.
                    </p>

                  </div>


                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >


                    {/* NAME */}

                    <div>

                      <label className="block text-sm font-bold text-[#00323F] mb-2">
                        Full Name
                      </label>

                      <div className="relative">

                        <User
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10 outline-none transition text-sm"
                        />

                      </div>

                    </div>


                    {/* EMAIL */}

                    <div>

                      <label className="block text-sm font-bold text-[#00323F] mb-2">
                        Email Address
                      </label>

                      <div className="relative">

                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10 outline-none transition text-sm"
                        />

                      </div>

                    </div>


                    {/* CONTACT */}

                    <div>

                      <label className="block text-sm font-bold text-[#00323F] mb-2">
                        Contact Number
                      </label>

                      <div className="relative">

                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="tel"
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          placeholder="Enter your contact number"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10 outline-none transition text-sm"
                        />

                      </div>

                    </div>


                    {/* COMPANY */}

                    <div>

                      <label className="block text-sm font-bold text-[#00323F] mb-2">
                        Company / Institution Name
                      </label>

                      <div className="relative">

                        <Building2
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Enter company or institution name"
                          required
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-[#00323F] focus:ring-2 focus:ring-[#00323F]/10 outline-none transition text-sm"
                        />

                      </div>

                    </div>


                    {/* SUBMIT */}

                    <button
                      type="submit"
                      className="w-full h-13 py-3.5 flex items-center justify-center gap-3 bg-[#FECA42] hover:bg-[#f4bb25] text-[#00323F] rounded-xl font-bold shadow-md hover:shadow-lg transition"
                    >

                      Request Demo

                      <CalendarCheck size={19} />

                    </button>


                    <p className="text-xs text-center text-slate-400">
                      Your information will only be used to contact you
                      regarding the demo.
                    </p>

                  </form>

                </>

              ) : (

                /* =================================================
                   SUCCESS
                ================================================= */

                <div className="text-center py-10">

                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">

                    <CheckCircle2
                      size={42}
                      className="text-emerald-600"
                    />

                  </div>


                  <h2 className="text-3xl font-black text-[#00323F] mt-6">
                    Request Received!
                  </h2>


                  <p className="text-slate-500 leading-7 mt-4 max-w-md mx-auto">

                    Thank you for your interest in SVR-EDTECH.
                    Our team will contact you soon.

                  </p>


                  <button
                    onClick={() => navigate("/")}
                    className="mt-8 inline-flex items-center gap-2 bg-[#00323F] hover:bg-[#002630] text-white px-7 py-3.5 rounded-xl font-bold transition"
                  >

                    <ArrowLeft size={18} />

                    Back to Home

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};


/* =============================================================
   DEMO BENEFIT
============================================================= */

const DemoBenefit = ({
  icon,
  title,
  text,
}) => {

  return (

    <div className="flex items-center gap-4">

      <div className="w-11 h-11 rounded-xl bg-[#00323F] text-[#FECA42] flex items-center justify-center flex-shrink-0">

        {icon}

      </div>


      <div>

        <h3 className="font-bold text-[#00323F]">
          {title}
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          {text}
        </p>

      </div>

    </div>

  );
};


export default RequestDemo;