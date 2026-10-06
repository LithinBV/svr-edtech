import React, { useEffect, useState } from "react";

import {
    ArrowLeft,
    UserPlus,
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    GraduationCap,
    BriefcaseBusiness,
    Save,
    RotateCcw,
    ChevronDown,
    UserCheck
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import indianRegions from "../../data/indianRegions";

const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// INDIAN STATES
// ============================================================

const indianStates = [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
];

// ============================================================
// AUTH TOKEN
// ============================================================

const getAuthToken = () => {
    const keys = [
        "managerToken",
        "token",
        "accessToken",
        "access_token",
        "jwt",
        "authToken"
    ];

    for (const key of keys) {
        const value = localStorage.getItem(key);

        if (value) {
            return value;
        }
    }

    return null;
};

// ============================================================
// AUTHENTICATED FETCH
// ============================================================

const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include"
    });
};

// ============================================================
// PROGRAMS
// ============================================================

const IT_PROGRAMS = [
    "Full Stack",
    "Data Analysis",
    "Data Science"
];

const NON_IT_PROGRAMS = [
    "HR",
    "DM"
];

// ============================================================
// INITIAL FORM
// ============================================================

const initialForm = {
    name: "",
    email: "",
    contact: "",
    gender: "",
    state: "",
    district: "",
    collegeName: "",
    department: "",
    ugYearOfPassout: "",
    pgYearOfPassout: "",
    leadSource: "",
    leadType: "",
    programInterest: "",
    remarks: ""
};

// ============================================================
// COMPONENT
// ============================================================

const ManagerAddLead = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(false);
    const [loadingExecutives, setLoadingExecutives] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ========================================================
    // EXECUTIVES
    // ========================================================

    const [executives, setExecutives] = useState([]);

    const [selectedExecutive, setSelectedExecutive] =
        useState("");

    const [showExecutiveDropdown, setShowExecutiveDropdown] =
        useState(false);

    // ========================================================
    // AVAILABLE PROGRAMS
    // ========================================================

    const availablePrograms =
        form.leadType === "IT"
            ? IT_PROGRAMS
            : form.leadType === "Non-IT"
                ? NON_IT_PROGRAMS
                : [];

    // ========================================================
    // AVAILABLE DISTRICTS
    // ========================================================

    const availableDistricts =
        form.state && indianRegions[form.state]
            ? indianRegions[form.state]
            : [];

    // ========================================================
    // FETCH MANAGER EXECUTIVES
    // ========================================================

    useEffect(() => {
        const fetchExecutives = async () => {
            try {
                setLoadingExecutives(true);

                const response =
                    await authenticatedFetch(
                        `${API_URL}/api/manager/leads/executives`
                    );

                const data =
                    await response.json();

                console.log(
                    "Manager executives response:",
                    response.status,
                    data
                );

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        "Unable to load executives."
                    );
                }

                setExecutives(
                    Array.isArray(data?.executives)
                        ? data.executives
                        : []
                );
            } catch (err) {
                console.error(
                    "Fetch manager executives error:",
                    err
                );

                setExecutives([]);

                setError(
                    err.message ||
                    "Unable to load executives."
                );
            } finally {
                setLoadingExecutives(false);
            }
        };

        fetchExecutives();
    }, []);

    // ========================================================
    // RESET PROGRAM WHEN LEAD TYPE CHANGES
    // ========================================================

    useEffect(() => {
        if (
            form.programInterest &&
            !availablePrograms.includes(
                form.programInterest
            )
        ) {
            setForm((previous) => ({
                ...previous,
                programInterest: ""
            }));
        }
    }, [form.leadType]);

    // ========================================================
    // RESET DISTRICT WHEN STATE CHANGES
    // ========================================================

    useEffect(() => {
        if (
            form.district &&
            !availableDistricts.includes(
                form.district
            )
        ) {
            setForm((previous) => ({
                ...previous,
                district: ""
            }));
        }
    }, [form.state]);

    // ========================================================
    // INPUT CHANGE
    // ========================================================

    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // ========================================================
    // STATE CHANGE
    // ========================================================

    const handleStateChange = (event) => {
        const value = event.target.value;

        setForm((previous) => ({
            ...previous,
            state: value,
            district: ""
        }));

        setError("");
        setSuccess("");
    };

    // ========================================================
    // LEAD TYPE CHANGE
    // ========================================================

    const handleLeadTypeChange = (event) => {
        const value = event.target.value;

        setForm((previous) => ({
            ...previous,
            leadType: value,
            programInterest: ""
        }));

        setError("");
        setSuccess("");
    };

    // ========================================================
    // EXECUTIVE SELECTION
    // ========================================================

    const handleExecutiveSelect = (executiveId) => {
        setSelectedExecutive(executiveId);

        setShowExecutiveDropdown(false);

        setError("");
        setSuccess("");
    };

    // ========================================================
    // SELECTED EXECUTIVE OBJECT
    // ========================================================

    const selectedExecutiveData =
        executives.find(
            (executive) =>
                String(executive._id) ===
                String(selectedExecutive)
        );

    // ========================================================
    // VALIDATION
    // ========================================================

    const validateForm = () => {
        const requiredFields = [
            ["name", "Name"],
            ["email", "Email"],
            ["contact", "Contact"],
            ["gender", "Gender"],
            ["state", "State"],
            ["district", "District"],
            ["collegeName", "College Name"],
            ["department", "Department"],
            [
                "ugYearOfPassout",
                "UG Year of Passout"
            ],
            ["leadSource", "Lead Source"],
            ["leadType", "Lead Type"],
            [
                "programInterest",
                "Program Interest"
            ]
        ];

        for (const [field, label] of requiredFields) {
            if (
                !String(
                    form[field] || ""
                ).trim()
            ) {
                return `${label} is required.`;
            }
        }

        // ====================================================
        // EMAIL
        // ====================================================

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(
                form.email.trim()
            )
        ) {
            return "Please enter a valid email address.";
        }

        // ====================================================
        // CONTACT
        // ====================================================

        const contact =
            form.contact.replace(
                /\D/g,
                ""
            );

        if (contact.length !== 10) {
            return "Contact number must contain 10 digits.";
        }

        // ====================================================
        // UG YEAR
        // ====================================================

        const ugYear =
            Number(
                form.ugYearOfPassout
            );

        if (
            !Number.isInteger(ugYear) ||
            ugYear < 1950 ||
            ugYear > 2100
        ) {
            return "Please enter a valid UG year of passout.";
        }

        // ====================================================
        // PG YEAR
        // ====================================================

        if (form.pgYearOfPassout) {
            const pgYear =
                Number(
                    form.pgYearOfPassout
                );

            if (
                !Number.isInteger(pgYear) ||
                pgYear < 1950 ||
                pgYear > 2100
            ) {
                return "Please enter a valid PG year of passout.";
            }
        }

        // ====================================================
        // STATE VALIDATION
        // ====================================================

        if (
            !indianStates.includes(
                form.state
            )
        ) {
            return "Please select a valid state.";
        }

        // ====================================================
        // DISTRICT VALIDATION
        // ====================================================

        if (
            !availableDistricts.includes(
                form.district
            )
        ) {
            return "Please select a valid district.";
        }

        // ====================================================
        // PROGRAM VALIDATION
        // ====================================================

        if (form.leadType === "IT") {
            if (
                !IT_PROGRAMS.includes(
                    form.programInterest
                )
            ) {
                return "Please select a valid IT program.";
            }
        }

        if (form.leadType === "Non-IT") {
            if (
                !NON_IT_PROGRAMS.includes(
                    form.programInterest
                )
            ) {
                return "Please select a valid Non-IT program.";
            }
        }

        return "";
    };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        setShowExecutiveDropdown(false);

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: form.name.trim(),

                email: form.email.trim(),

                contact: form.contact.trim(),

                gender: form.gender,

                state: form.state.trim(),

                district: form.district.trim(),

                collegeName:
                    form.collegeName.trim(),

                department:
                    form.department.trim(),

                ugYearOfPassout:
                    Number(
                        form.ugYearOfPassout
                    ),

                pgYearOfPassout:
                    form.pgYearOfPassout
                        ? Number(
                            form.pgYearOfPassout
                        )
                        : null,

                leadSource:
                    form.leadSource,

                leadType:
                    form.leadType,

                programInterest:
                    form.programInterest,

                remarks:
                    form.remarks.trim() ||
                    null,

                executiveId:
                    selectedExecutive ||
                    null
            };

            // =================================================
            // MANAGER CREATE LEAD API
            // =================================================

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/manager/leads`,
                    {
                        method: "POST",

                        body: JSON.stringify(
                            payload
                        )
                    }
                );

            const data =
                await response.json();

            console.log(
                "Manager add lead response:",
                response.status,
                data
            );

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Failed to create lead. Status: ${response.status}`
                );
            }

            setSuccess(
                data?.message ||
                "Lead added successfully."
            );

            // Reset form
            setForm(initialForm);

            // Reset executive
            setSelectedExecutive("");

        } catch (err) {
            console.error(
                "Manager add lead error:",
                err
            );

            setError(
                err.message ||
                "Unable to add lead."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // RESET
    // ========================================================

    const handleReset = () => {
        setForm(initialForm);

        setSelectedExecutive("");

        setShowExecutiveDropdown(false);

        setError("");
        setSuccess("");
    };

    // ========================================================
    // STYLES
    // ========================================================

    const inputClass =
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";

    const labelClass =
        "mb-2 block text-sm font-semibold text-slate-700";

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8">

                {/* ==================================================
                    HERO HEADER
                ================================================== */}

                <div className="mb-5 overflow-hidden rounded-2xl bg-[#102236] text-white shadow-lg">

                    <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(-1)
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                            >
                                <ArrowLeft
                                    size={19}
                                />
                            </button>

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:h-12 sm:w-12">
                                <UserPlus
                                    size={21}
                                />
                            </div>

                            <div className="min-w-0">

                                <h1 className="truncate text-xl font-bold sm:text-2xl">
                                    Add Lead
                                </h1>

                                <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                                    Add and assign a new lead to your team
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {success && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm">
                        {success}
                    </div>
                )}

                {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
                        {error}
                    </div>
                )}

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* ==================================================
                        PERSONAL DETAILS
                    ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

                        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                                <User
                                    size={19}
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Personal Details
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Basic information about the lead
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {/* NAME */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter full name"
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            {/* EMAIL */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Email *
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter email"
                                        className={`${inputClass} pl-11`}
                                    />

                                </div>
                            </div>

                            {/* CONTACT */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Contact *
                                </label>

                                <div className="relative">

                                    <Phone
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="tel"
                                        name="contact"
                                        value={
                                            form.contact
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10 digit mobile number"
                                        maxLength={10}
                                        className={`${inputClass} pl-11`}
                                    />

                                </div>
                            </div>

                            {/* GENDER */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Gender *
                                </label>

                                <select
                                    name="gender"
                                    value={
                                        form.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                        </div>

                    </section>

                    {/* ==================================================
                        EDUCATION & LOCATION
                    ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

                        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Building2
                                    size={19}
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Education & Location
                                </h2>

                                <p className="text-xs text-slate-500">
                                    College, department and location
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {/* STATE */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    State *
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={17}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        name="state"
                                        value={
                                            form.state
                                        }
                                        onChange={
                                            handleStateChange
                                        }
                                        className={`${inputClass} appearance-none pl-11 pr-10`}
                                    >
                                        <option value="">
                                            Select state
                                        </option>

                                        {indianStates.map(
                                            (state) => (
                                                <option
                                                    key={
                                                        state
                                                    }
                                                    value={
                                                        state
                                                    }
                                                >
                                                    {
                                                        state
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                </div>
                            </div>

                            {/* DISTRICT */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    District *
                                </label>

                                <div className="relative">

                                    <MapPin
                                        size={17}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        name="district"
                                        value={
                                            form.district
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            !form.state
                                        }
                                        className={`${inputClass} appearance-none pl-11 pr-10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                                    >

                                        <option value="">
                                            {form.state
                                                ? "Select district"
                                                : "Select state first"}
                                        </option>

                                        {availableDistricts.map(
                                            (district) => (
                                                <option
                                                    key={
                                                        district
                                                    }
                                                    value={
                                                        district
                                                    }
                                                >
                                                    {
                                                        district
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                </div>
                            </div>

                            {/* COLLEGE */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    College Name *
                                </label>

                                <div className="relative">

                                    <Building2
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="collegeName"
                                        value={
                                            form.collegeName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter college name"
                                        className={`${inputClass} pl-11`}
                                    />

                                </div>
                            </div>

                            {/* DEPARTMENT */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Department *
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    value={
                                        form.department
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter department"
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                            {/* UG YEAR */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    UG Year of Passout *
                                </label>

                                <div className="relative">

                                    <GraduationCap
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="number"
                                        name="ugYearOfPassout"
                                        value={
                                            form.ugYearOfPassout
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: 2025"
                                        className={`${inputClass} pl-11`}
                                    />

                                </div>
                            </div>

                            {/* PG YEAR */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    PG Year of Passout

                                    <span className="ml-2 font-normal text-slate-400">
                                        Optional
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    name="pgYearOfPassout"
                                    value={
                                        form.pgYearOfPassout
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Example: 2027"
                                    className={
                                        inputClass
                                    }
                                />
                            </div>

                        </div>

                    </section>

                    {/* ==================================================
                        LEAD DETAILS
                    ================================================== */}

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:p-6">

                        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <BriefcaseBusiness
                                    size={19}
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Lead Details
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Source, type, program and assignment
                                </p>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {/* LEAD SOURCE */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Lead Source *
                                </label>

                                <select
                                    name="leadSource"
                                    value={
                                        form.leadSource
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    <option value="">
                                        Select lead source
                                    </option>

                                    <option value="FB / Meta">
                                        FB / Meta
                                    </option>

                                    <option value="College campaign">
                                        College campaign
                                    </option>

                                    <option value="LinkedIn">
                                        LinkedIn
                                    </option>

                                    <option value="Referral">
                                        Referral
                                    </option>

                                    <option value="Inbound">
                                        Inbound
                                    </option>
                                </select>
                            </div>

                            {/* LEAD TYPE */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Lead Type *
                                </label>

                                <select
                                    name="leadType"
                                    value={
                                        form.leadType
                                    }
                                    onChange={
                                        handleLeadTypeChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >
                                    <option value="">
                                        Select lead type
                                    </option>

                                    <option value="IT">
                                        IT
                                    </option>

                                    <option value="Non-IT">
                                        Non-IT
                                    </option>
                                </select>
                            </div>

                            {/* PROGRAM */}

                            <div>
                                <label
                                    className={labelClass}
                                >
                                    Program Interest *
                                </label>

                                <select
                                    name="programInterest"
                                    value={
                                        form.programInterest
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        !form.leadType
                                    }
                                    className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                                >

                                    <option value="">
                                        {form.leadType
                                            ? "Select program"
                                            : "Select lead type first"}
                                    </option>

                                    {availablePrograms.map(
                                        (program) => (
                                            <option
                                                key={
                                                    program
                                                }
                                                value={
                                                    program
                                                }
                                            >
                                                {
                                                    program
                                                }
                                            </option>
                                        )
                                    )}

                                </select>
                            </div>

                            {/* ==================================================
                                EXECUTIVE ASSIGNMENT
                            ================================================== */}

                            <div className="md:col-span-2 lg:col-span-3">

                                <label
                                    className={labelClass}
                                >
                                    Assign to Executive

                                    <span className="ml-2 font-normal text-slate-400">
                                        Optional
                                    </span>
                                </label>

                                <div className="relative">

                                    {/* DROPDOWN BUTTON */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowExecutiveDropdown(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        disabled={
                                            loadingExecutives
                                        }
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 outline-none transition hover:border-cyan-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <UserCheck
                                                size={18}
                                                className="shrink-0 text-cyan-600"
                                            />

                                            <div className="min-w-0">

                                                {loadingExecutives ? (
                                                    <span className="text-slate-400">
                                                        Loading executives...
                                                    </span>
                                                ) : selectedExecutiveData ? (
                                                    <div>

                                                        <p className="truncate font-semibold text-slate-800">
                                                            {
                                                                selectedExecutiveData.name ||
                                                                "Unnamed Executive"
                                                            }
                                                        </p>

                                                        {selectedExecutiveData.email && (
                                                            <p className="truncate text-xs text-slate-400">
                                                                {
                                                                    selectedExecutiveData.email
                                                                }
                                                            </p>
                                                        )}

                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">
                                                        Unassigned
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        <ChevronDown
                                            size={18}
                                            className={`shrink-0 text-slate-400 transition ${
                                                showExecutiveDropdown
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />

                                    </button>

                                    {/* DROPDOWN MENU */}

                                    {showExecutiveDropdown &&
                                        !loadingExecutives && (
                                            <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

                                                {/* UNASSIGNED */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleExecutiveSelect(
                                                            ""
                                                        )
                                                    }
                                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50 ${
                                                        selectedExecutive ===
                                                        ""
                                                            ? "bg-cyan-50"
                                                            : ""
                                                    }`}
                                                >

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                        <User
                                                            size={17}
                                                        />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            Unassigned
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            Keep lead with manager
                                                        </p>
                                                    </div>

                                                </button>

                                                {/* EXECUTIVES */}

                                                {executives.length ===
                                                0 ? (
                                                    <div className="px-3 py-5 text-center">

                                                        <p className="text-sm font-medium text-slate-600">
                                                            No executives found
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            No active executives are available in your team.
                                                        </p>

                                                    </div>
                                                ) : (
                                                    executives.map(
                                                        (
                                                            executive
                                                        ) => {
                                                            const isSelected =
                                                                String(
                                                                    selectedExecutive
                                                                ) ===
                                                                String(
                                                                    executive._id
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        executive._id
                                                                    }
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleExecutiveSelect(
                                                                            executive._id
                                                                        )
                                                                    }
                                                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50 ${
                                                                        isSelected
                                                                            ? "bg-cyan-50"
                                                                            : ""
                                                                    }`}
                                                                >

                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 font-bold text-cyan-600">

                                                                        {(
                                                                            executive.name ||
                                                                            "E"
                                                                        )
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()}

                                                                    </div>

                                                                    <div className="min-w-0 flex-1">

                                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                                            {
                                                                                executive.name ||
                                                                                "Unnamed Executive"
                                                                            }
                                                                        </p>

                                                                        {executive.email && (
                                                                            <p className="truncate text-xs text-slate-400">
                                                                                {
                                                                                    executive.email
                                                                                }
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                    {isSelected && (
                                                                        <div className="shrink-0 text-xs font-bold text-cyan-600">
                                                                            Selected
                                                                        </div>
                                                                    )}

                                                                </button>
                                                            );
                                                        }
                                                    )
                                                )}

                                            </div>
                                        )}

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Optional. If you don't select an executive, the lead will remain assigned to you.
                                </p>

                            </div>

                            {/* REMARKS */}

                            <div className="md:col-span-2 lg:col-span-3">

                                <label
                                    className={labelClass}
                                >
                                    Remarks

                                    <span className="ml-2 font-normal text-slate-400">
                                        Optional
                                    </span>
                                </label>

                                <textarea
                                    name="remarks"
                                    value={
                                        form.remarks
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={4}
                                    placeholder="Add any remarks about this lead..."
                                    className={`${inputClass} resize-none`}
                                />

                            </div>

                        </div>

                    </section>

                    {/* ==================================================
                        ACTION BUTTONS
                    ================================================== */}

                    <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">

                        <button
                            type="button"
                            onClick={
                                handleReset
                            }
                            disabled={
                                loading
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            <RotateCcw
                                size={17}
                            />

                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading
                            }
                            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                            <Save
                                size={17}
                            />

                            {loading
                                ? "Adding Lead..."
                                : "Add Lead"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default ManagerAddLead;