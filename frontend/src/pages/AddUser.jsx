import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddUser() {

    const API_URL = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "EXECUTIVE",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setMessage("");
        setIsError(false);
    };

    const validatePassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
            password
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setIsError(false);

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        if (!token) {
            setMessage("Session expired. Please login again.");
            setIsError(true);
            return;
        }

        if (!formData.name.trim()) {
            setMessage("Please enter the user's name.");
            setIsError(true);
            return;
        }

        if (!formData.email.trim()) {
            setMessage("Please enter the user's email.");
            setIsError(true);
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage(
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
            );
            setIsError(true);
            return;
        }

        if (
            formData.role !== "EXECUTIVE" &&
            formData.role !== "MANAGER"
        ) {
            setMessage("Please select a valid role.");
            setIsError(true);
            return;
        }

        try {
            setIsCreating(true);

            const response = await fetch(`${API_URL}/api/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role,
                }),
            });

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userType");

                navigate("/login", { replace: true });
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "Unable to create user."
                );
            }

            setMessage(
                data.message || "User created successfully."
            );

            setIsError(false);

            setFormData({
                name: "",
                email: "",
                password: "",
                role: "EXECUTIVE",
            });

            setTimeout(() => {
                navigate("/view-users");
            }, 1200);
        } catch (error) {
            console.error("Create user error:", error);

            setMessage(
                error.message ||
                    "Something went wrong while creating the user."
            );

            setIsError(true);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-70px)] bg-[#f4f6f8]">

            {/* PAGE CONTAINER */}
            <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

                {/* ================= HEADER ================= */}
                <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">

                    <div className="flex min-w-0 items-center gap-3">

                        {/* ICON */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102236] text-xl font-bold text-[#F6C945] shadow-sm sm:h-12 sm:w-12">
                            +
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold tracking-tight text-[#102236] sm:text-2xl">
                                Add User
                            </h1>

                            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                Create a manager or executive account.
                            </p>
                        </div>

                    </div>

                    {/* BACK BUTTON */}
                    <button
                        type="button"
                        onClick={() => navigate("/view-users")}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#F6C945] hover:bg-[#fffaf0] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                        <span className="text-base">←</span>

                        <span className="hidden sm:inline">
                            Back to Users
                        </span>

                        <span className="sm:hidden">
                            Back
                        </span>
                    </button>

                </div>


                {/* ================= MAIN CARD ================= */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

                    {/* CARD HEADER */}
                    <div className="border-b border-slate-100 bg-[#102236] px-4 py-4 sm:px-6 sm:py-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6C945] text-[#102236]">

                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                                    <circle
                                        cx="12"
                                        cy="7"
                                        r="4"
                                    />
                                </svg>

                            </div>

                            <div>
                                <h2 className="text-sm font-bold text-white sm:text-base">
                                    User Information
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-300 sm:text-sm">
                                    Enter the details for the new user.
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* ================= FORM ================= */}
                    <form onSubmit={handleSubmit}>

                        <div className="p-4 sm:p-6 lg:p-7">

                            {/* ================= BASIC INFORMATION ================= */}
                            <div className="mb-7">

                                <div className="mb-4 flex items-center gap-2">

                                    <div className="h-5 w-1 rounded-full bg-[#F6C945]" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#102236] sm:text-sm">
                                        Basic Information
                                    </h3>

                                </div>


                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* NAME */}
                                    <div>

                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Full Name
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter full name"
                                            disabled={isCreating}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:bg-slate-100"
                                        />

                                    </div>


                                    {/* EMAIL */}
                                    <div>

                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email Address
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                            disabled={isCreating}
                                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:bg-slate-100"
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* ================= ACCOUNT INFORMATION ================= */}
                            <div>

                                <div className="mb-4 flex items-center gap-2">

                                    <div className="h-5 w-1 rounded-full bg-[#F6C945]" />

                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#102236] sm:text-sm">
                                        Account Information
                                    </h3>

                                </div>


                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    {/* PASSWORD */}
                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Password
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <input
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter password"
                                                disabled={isCreating}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:bg-slate-100"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                disabled={isCreating}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#102236] transition hover:bg-[#fff7d6] hover:text-[#102236] disabled:opacity-50"
                                            >
                                                {showPassword
                                                    ? "Hide"
                                                    : "Show"}
                                            </button>

                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            Minimum 8 characters with uppercase,
                                            lowercase, number and special
                                            character.
                                        </p>

                                    </div>


                                    {/* ROLE */}
                                    <div>

                                        <label
                                            htmlFor="role"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            User Role
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <div className="relative">

                                            <select
                                                id="role"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                disabled={isCreating}
                                                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-800 outline-none transition hover:border-slate-300 focus:border-[#F6C945] focus:ring-4 focus:ring-[#F6C945]/15 disabled:bg-slate-100"
                                            >
                                                <option value="EXECUTIVE">
                                                    Executive
                                                </option>

                                                <option value="MANAGER">
                                                    Manager
                                                </option>
                                            </select>

                                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                ▼
                                            </div>

                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            Select the user's access role.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ================= MESSAGE ================= */}
                            {message && (
                                <div
                                    className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                                        isError
                                            ? "border-red-200 bg-red-50 text-red-700"
                                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    }`}
                                >

                                    <span className="mt-0.5 shrink-0 font-bold">
                                        {isError ? "!" : "✓"}
                                    </span>

                                    <span className="leading-5">
                                        {message}
                                    </span>

                                </div>
                            )}


                            {/* ================= ACTIONS ================= */}
                            <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/view-users")
                                    }
                                    disabled={isCreating}
                                    className="order-2 w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 sm:order-1 sm:w-auto"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="order-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#102236] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#182f48] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:w-auto"
                                >
                                    {isCreating ? (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#F6C945]" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-[#F6C945]">
                                                +
                                            </span>
                                            Create User
                                        </>
                                    )}
                                </button>

                            </div>

                        </div>

                    </form>

                </div>


                {/* FOOTER NOTE */}
                <p className="mt-4 text-center text-xs text-slate-400">
                    Fields marked with{" "}
                    <span className="text-red-500">*</span>{" "}
                    are required.
                </p>

            </div>

        </div>
    );
}

export default AddUser;