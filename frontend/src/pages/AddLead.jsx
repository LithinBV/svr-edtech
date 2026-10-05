import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";

function AddLead() {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingOwners, setLoadingOwners] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [leadOwners, setLeadOwners] = useState([]);

    const [formData, setFormData] = useState({
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

        leadName: "",
        leadEmail: "",
        leadOwner: "",
        leadSource: "",
        leadType: "",
        programInterest: "",
    });

    const [errors, setErrors] = useState({});

    // ============================================================
    // TOKEN
    // ============================================================

    const getToken = () => {
        return (
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token")
        );
    };

    // ============================================================
    // INPUT CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setSuccessMessage("");
        setErrorMessage("");
    };

    // ============================================================
    // AUTH CHECK
    // ============================================================

    useEffect(() => {
        const token = getToken();

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        loadLeadOwners();
    }, []);

    // ============================================================
    // LOAD MANAGERS + EXECUTIVES
    // ============================================================

    const loadLeadOwners = async () => {
        const token = getToken();

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setLoadingOwners(true);

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                navigate("/login", { replace: true });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load lead owners."
                );
            }

            const users = Array.isArray(data)
                ? data
                : data.users || data.data || [];

            const filteredOwners = users.filter((user) => {
                const role = String(
                    user.role ||
                    user.userType ||
                    ""
                ).toUpperCase();

                return (
                    role === "MANAGER" ||
                    role === "EXECUTIVE" ||
                    role === "USER_MANAGER" ||
                    role === "USER_EXECUTIVE"
                );
            });

            setLeadOwners(filteredOwners);
        } catch (error) {
            console.error("Load lead owners error:", error);

            setErrorMessage(
                error.message ||
                "Unable to load Managers and Executives."
            );
        } finally {
            setLoadingOwners(false);
        }
    };

    // ============================================================
    // VALIDATION - STEP 1
    // ============================================================

    const validateStepOne = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            newErrors.email = "Enter a valid email address.";
        }

        if (!formData.contact.trim()) {
            newErrors.contact = "Contact is required.";
        } else if (
            !/^[0-9+\-\s()]{7,20}$/.test(
                formData.contact.trim()
            )
        ) {
            newErrors.contact = "Enter a valid contact number.";
        }
        if (!formData.gender) {
    newErrors.gender = "Gender is required.";
}

        if (!formData.state) {
            newErrors.state = "State is required.";
        }

        if (!formData.district) {
            newErrors.district = "District is required.";
        }

        if (!formData.collegeName.trim()) {
            newErrors.collegeName = "College name is required.";
        }

        if (!formData.department.trim()) {
            newErrors.department = "Department is required.";
        }

        if (!formData.ugYearOfPassout) {
            newErrors.ugYearOfPassout =
                "UG year of passout is required.";
        } else {
            const year = Number(formData.ugYearOfPassout);

            if (
                !Number.isInteger(year) ||
                year < 1900 ||
                year > 2100
            ) {
                newErrors.ugYearOfPassout =
                    "Enter a valid year.";
            }
        }

        if (formData.pgYearOfPassout) {
            const year = Number(formData.pgYearOfPassout);

            if (
                !Number.isInteger(year) ||
                year < 1900 ||
                year > 2100
            ) {
                newErrors.pgYearOfPassout =
                    "Enter a valid year.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ============================================================
    // VALIDATION - STEP 2
    // ============================================================

    const validateStepTwo = () => {
        const newErrors = {};

        if (!formData.leadName.trim()) {
            newErrors.leadName = "Lead name is required.";
        }

        if (!formData.leadEmail.trim()) {
            newErrors.leadEmail = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.leadEmail.trim()
            )
        ) {
            newErrors.leadEmail =
                "Enter a valid email address.";
        }

        if (!formData.leadOwner) {
            newErrors.leadOwner =
                "Please select a Lead Owner.";
        }

        if (!formData.leadSource) {
            newErrors.leadSource =
                "Please select a Lead Source.";
        }

        if (!formData.leadType) {
            newErrors.leadType =
                "Please select a Lead Type.";
        }

        if (!formData.programInterest) {
            newErrors.programInterest =
                "Please select a Program / Interest.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // ============================================================
    // NEXT STEP
    // ============================================================

    const handleNext = () => {
        setSuccessMessage("");
        setErrorMessage("");

        if (!validateStepOne()) {
            return;
        }

        setFormData((prev) => ({
            ...prev,

            leadName:
                prev.leadName || prev.name,

            leadEmail:
                prev.leadEmail || prev.email,
        }));

        setCurrentStep(2);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================================================
    // PREVIOUS STEP
    // ============================================================

    const handlePrevious = () => {
        setErrors({});
        setSuccessMessage("");
        setErrorMessage("");

        setCurrentStep(1);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================================================
    // BACK
    // ============================================================

    const handleBack = () => {
        navigate(-1);
    };

    // ============================================================
    // PROGRAM OPTIONS
    // ============================================================

    const getProgramOptions = () => {
        if (formData.leadType === "IT") {
            return [
                "Full Stack",
                "Data Analysis",
                "Data Science",
            ];
        }

        if (formData.leadType === "Non-IT") {
            return [
                "HR",
                "DM",
            ];
        }

        return [];
    };

    // ============================================================
    // LEAD TYPE CHANGE
    // ============================================================

    const handleLeadTypeChange = (e) => {
        const value = e.target.value;

        setFormData((prev) => ({
            ...prev,
            leadType: value,
            programInterest: "",
        }));

        setErrors((prev) => ({
            ...prev,
            leadType: "",
            programInterest: "",
        }));
    };

    // ============================================================
    // SUBMIT
    // ============================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        if (!validateStepTwo()) {
            return;
        }

        const token = getToken();

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        setLoading(true);

        const finalName =
            formData.leadName.trim() ||
            formData.name.trim();

        const finalEmail =
            formData.leadEmail.trim() ||
            formData.email.trim();

        const requestBody = {
            name: finalName,

            email: finalEmail,

            contact: formData.contact.trim(),

            gender: formData.gender,

            state: formData.state,

            district: formData.district,

            collegeName:
                formData.collegeName.trim(),

            department:
                formData.department.trim(),

            ugYearOfPassout:
                Number(formData.ugYearOfPassout),

            pgYearOfPassout:
                formData.pgYearOfPassout
                    ? Number(formData.pgYearOfPassout)
                    : null,

            leadOwner:
                formData.leadOwner,

            leadSource:
                formData.leadSource,

            leadType:
                formData.leadType,

            programInterest:
                formData.programInterest,
        };

        try {
            const response = await fetch(
                `${API_BASE}/leads`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        requestBody
                    ),
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error(
                    "Unable to parse response:",
                    jsonError
                );
            }

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.clear();

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to add lead."
                );
            }

            console.log(
                "Lead created successfully:",
                data
            );

            setSuccessMessage(
                data.message ||
                "Lead added successfully."
            );

            resetForm();

            setCurrentStep(1);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(
                "Add Lead error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to add lead."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // RESET
    // ============================================================

    const resetForm = () => {
        setFormData({
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

            leadName: "",
            leadEmail: "",
            leadOwner: "",
            leadSource: "",
            leadType: "",
            programInterest: "",
        });

        setErrors({});
    };

    // ============================================================
    // ERROR COMPONENT
    // ============================================================

    const FieldError = ({ name }) => {
        if (!errors[name]) {
            return null;
        }

        return (
            <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors[name]}
            </p>
        );
    };

    // ============================================================
    // FIELD COMPONENT
    // ============================================================

    const FieldLabel = ({
        children,
        required = false,
        optional = false,
    }) => {
        return (
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {children}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

                {optional && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                        Optional
                    </span>
                )}
            </label>
        );
    };

    const inputClass = (fieldName) =>
        `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 ${
            errors[fieldName]
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 hover:border-slate-300 focus:border-[#f6c945] focus:ring-4 focus:ring-[#f6c945]/20"
        }`;

    const selectClass = (fieldName) =>
        `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all ${
            errors[fieldName]
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                : "border-slate-200 hover:border-slate-300 focus:border-[#f6c945] focus:ring-4 focus:ring-[#f6c945]/20"
        }`;

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-[calc(100vh-70px)] bg-[#f5f7fa]">

            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* ================================================== */}
                {/* PAGE HEADER */}
                {/* ================================================== */}

                <div className="mb-7 flex items-start justify-between gap-4">

                    <div className="flex items-center gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-lg font-bold text-white shadow-sm">
                            +
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Add Lead
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Add a new lead and assign it to a team member.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleBack}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <span className="mr-1.5">
                            ←
                        </span>

                        <span className="hidden sm:inline">
                            Back
                        </span>
                    </button>

                </div>

                {/* ================================================== */}
                {/* MESSAGES */}
                {/* ================================================== */}

                {successMessage && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
                            ✓
                        </div>

                        <span>
                            {successMessage}
                        </span>

                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 shadow-sm">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                            !
                        </div>

                        <span>
                            {errorMessage}
                        </span>

                    </div>
                )}

                {/* ================================================== */}
                {/* STEP INDICATOR */}
                {/* ================================================== */}

                <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                    <div className="flex items-center">

                        {/* STEP 1 */}

                        <div className="flex min-w-0 items-center gap-3">

                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                                    currentStep === 1
                                        ? "bg-[#f6c945] text-[#102236] shadow-sm"
                                        : "bg-emerald-500 text-white"
                                }`}
                            >
                                {currentStep === 1
                                    ? "1"
                                    : "✓"}
                            </div>

                            <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-slate-800">
                                    Basic Information
                                </p>

                                <p className="hidden text-xs text-slate-400 sm:block">
                                    Lead details
                                </p>

                            </div>

                        </div>

                        {/* CONNECTOR */}

                        <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-6">
                            <div
                                className={`h-full transition-all ${
                                    currentStep === 2
                                        ? "w-full bg-[#fff9df]0"
                                        : "w-0"
                                }`}
                            />
                        </div>

                        {/* STEP 2 */}

                        <div className="flex min-w-0 items-center gap-3">

                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                                    currentStep === 2
                                        ? "bg-[#f6c945] text-[#102236] shadow-sm"
                                        : "bg-slate-100 text-slate-400"
                                }`}
                            >
                                2
                            </div>

                            <div className="min-w-0">

                                <p
                                    className={`truncate text-sm font-bold ${
                                        currentStep === 2
                                            ? "text-slate-800"
                                            : "text-slate-400"
                                    }`}
                                >
                                    Assignment
                                </p>

                                <p className="hidden text-xs text-slate-400 sm:block">
                                    Owner & program
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ================================================== */}
                {/* FORM */}
                {/* ================================================== */}

                <form onSubmit={handleSubmit}>

                    {/* ================================================== */}
                    {/* STEP 1 */}
                    {/* ================================================== */}

                    {currentStep === 1 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

                            {/* CARD HEADER */}

                            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">

                                <div className="mb-2 h-1 w-10 rounded-full bg-[#102236]" />

                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    Basic Information
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the lead's personal and educational details.
                                </p>

                            </div>

                            {/* CARD CONTENT */}

                            <div className="p-5 sm:p-7">

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    {/* NAME */}

                                    <div>
                                        <FieldLabel required>
                                            Name
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                            className={inputClass("name")}
                                        />

                                        <FieldError name="name" />
                                    </div>

                                    {/* EMAIL */}

                                    <div>
                                        <FieldLabel required>
                                            Email
                                        </FieldLabel>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                            className={inputClass("email")}
                                        />

                                        <FieldError name="email" />
                                    </div>

                                    {/* CONTACT */}

                                    <div>
                                        <FieldLabel required>
                                            Contact Number
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            placeholder="Enter contact number"
                                            className={inputClass("contact")}
                                        />

                                        <FieldError name="contact" />
                                    </div>

                                    {/* GENDER */}

<div>
    <FieldLabel required>
        Gender
    </FieldLabel>

    <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className={selectClass("gender")}
    >
        <option value="">
            Select Gender
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

        <option value="Prefer not to say">
            Prefer not to say
        </option>
    </select>

    <FieldError name="gender" />
</div>

                                    {/* STATE */}

                                    <div>
                                        <FieldLabel required>
                                            State
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Enter state"
                                            className={inputClass("state")}
                                        />

                                        <FieldError name="state" />
                                    </div>

                                    {/* DISTRICT */}

                                    <div>
                                        <FieldLabel required>
                                            District
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            placeholder="Enter district"
                                            className={inputClass("district")}
                                        />

                                        <FieldError name="district" />
                                    </div>

                                    {/* COLLEGE */}

                                    <div>
                                        <FieldLabel required>
                                            College Name
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="collegeName"
                                            value={formData.collegeName}
                                            onChange={handleChange}
                                            placeholder="Enter college name"
                                            className={inputClass("collegeName")}
                                        />

                                        <FieldError name="collegeName" />
                                    </div>

                                    {/* DEPARTMENT */}

                                    <div>
                                        <FieldLabel required>
                                            Department
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            placeholder="Enter department"
                                            className={inputClass("department")}
                                        />

                                        <FieldError name="department" />
                                    </div>

                                    {/* UG YEAR */}

                                    <div>
                                        <FieldLabel required>
                                            UG Year of Passout
                                        </FieldLabel>

                                        <input
                                            type="number"
                                            name="ugYearOfPassout"
                                            value={formData.ugYearOfPassout}
                                            onChange={handleChange}
                                            placeholder="2026"
                                            min="1900"
                                            max="2100"
                                            className={inputClass("ugYearOfPassout")}
                                        />

                                        <FieldError name="ugYearOfPassout" />
                                    </div>

                                    {/* PG YEAR */}

                                    <div>
                                        <FieldLabel optional>
                                            PG Year of Passout
                                        </FieldLabel>

                                        <input
                                            type="number"
                                            name="pgYearOfPassout"
                                            value={formData.pgYearOfPassout}
                                            onChange={handleChange}
                                            placeholder="2026"
                                            min="1900"
                                            max="2100"
                                            className={inputClass("pgYearOfPassout")}
                                        />

                                        <FieldError name="pgYearOfPassout" />
                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102236] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18344e] hover:shadow-md"
                                    >
                                        Continue
                                        <span>→</span>
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* ================================================== */}
                    {/* STEP 2 */}
                    {/* ================================================== */}

                    {currentStep === 2 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

                            {/* CARD HEADER */}

                            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">

                                <div className="mb-2 h-1 w-10 rounded-full bg-[#102236]" />

                                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                                    Assignment Details
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Assign the lead and select the interested program.
                                </p>

                            </div>

                            {/* CARD CONTENT */}

                            <div className="p-5 sm:p-7">

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                    {/* LEAD NAME */}

                                    <div>
                                        <FieldLabel required>
                                            Lead Name
                                        </FieldLabel>

                                        <input
                                            type="text"
                                            name="leadName"
                                            value={formData.leadName}
                                            onChange={handleChange}
                                            placeholder="Enter lead name"
                                            className={inputClass("leadName")}
                                        />

                                        <FieldError name="leadName" />
                                    </div>

                                    {/* LEAD EMAIL */}

                                    <div>
                                        <FieldLabel required>
                                            Email
                                        </FieldLabel>

                                        <input
                                            type="email"
                                            name="leadEmail"
                                            value={formData.leadEmail}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                            className={inputClass("leadEmail")}
                                        />

                                        <FieldError name="leadEmail" />
                                    </div>

                                    {/* LEAD OWNER */}

                                    <div>
                                        <FieldLabel required>
                                            Lead Owner
                                        </FieldLabel>

                                        <select
                                            name="leadOwner"
                                            value={formData.leadOwner}
                                            onChange={handleChange}
                                            disabled={loadingOwners}
                                            className={selectClass("leadOwner")}
                                        >
                                            <option value="">
                                                {loadingOwners
                                                    ? "Loading Managers and Executives..."
                                                    : "Select Lead Owner"}
                                            </option>

                                            {leadOwners.map((user) => {
                                                const id =
                                                    user._id ||
                                                    user.id;

                                                const role =
                                                    String(
                                                        user.role ||
                                                        user.userType ||
                                                        ""
                                                    ).toUpperCase();

                                                const roleName =
                                                    role === "MANAGER" ||
                                                    role === "USER_MANAGER"
                                                        ? "Manager"
                                                        : "Executive";

                                                return (
                                                    <option
                                                        key={id}
                                                        value={id}
                                                    >
                                                        {user.name || user.email}
                                                        {" — "}
                                                        {roleName}
                                                    </option>
                                                );
                                            })}
                                        </select>

                                        <p className="mt-2 text-xs text-slate-400">
                                            Managers and Executives can be selected as lead owners.
                                        </p>

                                        <FieldError name="leadOwner" />
                                    </div>

                                    {/* SOURCE */}

                                    <div>
                                        <FieldLabel required>
                                            Lead Source
                                        </FieldLabel>

                                        <select
                                            name="leadSource"
                                            value={formData.leadSource}
                                            onChange={handleChange}
                                            className={selectClass("leadSource")}
                                        >
                                            <option value="">
                                                Select Lead Source
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

                                        <FieldError name="leadSource" />
                                    </div>

                                    {/* TYPE */}

                                    <div>
                                        <FieldLabel required>
                                            Lead Type
                                        </FieldLabel>

                                        <select
                                            name="leadType"
                                            value={formData.leadType}
                                            onChange={handleLeadTypeChange}
                                            className={selectClass("leadType")}
                                        >
                                            <option value="">
                                                Select Lead Type
                                            </option>

                                            <option value="IT">
                                                IT
                                            </option>

                                            <option value="Non-IT">
                                                Non-IT
                                            </option>
                                        </select>

                                        <FieldError name="leadType" />
                                    </div>

                                    {/* PROGRAM */}

                                    <div>
                                        <FieldLabel required>
                                            Program / Interest
                                        </FieldLabel>

                                        <select
                                            name="programInterest"
                                            value={formData.programInterest}
                                            onChange={handleChange}
                                            disabled={!formData.leadType}
                                            className={selectClass("programInterest")}
                                        >
                                            <option value="">
                                                {formData.leadType
                                                    ? "Select Program / Interest"
                                                    : "Select Lead Type First"}
                                            </option>

                                            {getProgramOptions().map(
                                                (program) => (
                                                    <option
                                                        key={program}
                                                        value={program}
                                                    >
                                                        {program}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <FieldError name="programInterest" />
                                    </div>

                                </div>

                                {/* ASSIGNMENT INFO */}

                                <div className="mt-7 rounded-xl border border-[#f6c945]/40 bg-[#fff9df] p-4 sm:p-5">

                                    <div className="flex gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff1ad] text-sm font-bold text-[#102236]">
                                            i
                                        </div>

                                        <div>

                                            <p className="text-sm font-bold text-[#102236]">
                                                Lead Assignment
                                            </p>

                                            <p className="mt-1.5 text-sm leading-6 text-[#102236]">
                                                Only Managers and Executives can be selected as Lead Owners.
                                                Institution Admins are not included.
                                            </p>

                                            <p className="mt-2 text-xs leading-5 text-[#102236]">
                                                The selected owner will be able to see leads assigned to them from their dashboard.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* BUTTONS */}

                                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        ← Previous
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#102236] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18344e] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Adding Lead...
                                            </>
                                        ) : (
                                            <>
                                                <span>＋</span>
                                                Add Lead
                                            </>
                                        )}
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}

                </form>

                {/* FOOTER NOTE */}

                <p className="mt-5 text-center text-xs text-slate-400">
                    Fields marked with{" "}
                    <span className="font-semibold text-red-500">
                        *
                    </span>{" "}
                    are required.
                </p>

            </main>

        </div>
    );
}

export default AddLead;
