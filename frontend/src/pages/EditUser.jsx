import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditUser() {

    const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000")
  .replace(/\/$/, "");
  
    const navigate = useNavigate();
    const { id } = useParams();

    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "EXECUTIVE",
        status: "ACTIVE",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    // =========================================================
    // AUTHENTICATION + LOAD USER
    // =========================================================

    useEffect(() => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        const userType =
            localStorage.getItem("userType");

        if (!token) {
            navigate("/login", {
                replace: true,
            });
            return;
        }

        if (userType !== "SUPER_ADMIN") {
            localStorage.removeItem("token");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userType");

            navigate("/login", {
                replace: true,
            });
            return;
        }

        if (!id) {
            setError("User ID is missing.");
            setLoading(false);
            return;
        }

        fetchUser(token);
    }, [id]);

    // =========================================================
    // GET USER
    // =========================================================

    const fetchUser = async (token) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/users/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("userType");

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load user details."
                );
            }

            if (!data.user) {
                throw new Error(
                    "User information was not returned."
                );
            }

            const loadedUser = data.user;

            setUser(loadedUser);

            setFormData({
                name: loadedUser.name || "",
                email: loadedUser.email || "",
                role:
                    loadedUser.role ||
                    "EXECUTIVE",
                status:
                    loadedUser.status ||
                    "ACTIVE",
            });
        } catch (err) {
            console.error(
                "Error loading user:",
                err
            );

            setError(
                err.message ||
                    "Failed to load user."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // =========================================================
    // UPDATE USER
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const name =
            formData.name.trim();

        const email =
            formData.email.trim();

        if (!name) {
            setError(
                "Please enter the user's name."
            );
            return;
        }

        if (!email) {
            setError(
                "Please enter the user's email."
            );
            return;
        }

        if (!formData.role) {
            setError(
                "Please select a role."
            );
            return;
        }

        if (!formData.status) {
            setError(
                "Please select a status."
            );
            return;
        }

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        if (!token) {
            navigate("/login", {
                replace: true,
            });
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/api/users/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        role: formData.role,
                        status: formData.status,
                    }),
                }
            );

            const data =
                await response.json();

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem(
                    "accessToken"
                );
                localStorage.removeItem(
                    "userType"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update user."
                );
            }

            setUser((previous) => ({
                ...previous,
                ...(data.user || {}),
                name,
                email,
                role: formData.role,
                status: formData.status,
            }));

            setFormData({
                name,
                email,
                role: formData.role,
                status: formData.status,
            });

            setSuccess(
                "User details updated successfully."
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (err) {
            console.error(
                "Error updating user:",
                err
            );

            setError(
                err.message ||
                    "Failed to update user."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE USER
    // =========================================================

    const handleDelete = async () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken");

        if (!token) {
            navigate("/login", {
                replace: true,
            });
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/users/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data =
                await response.json();

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem(
                    "accessToken"
                );
                localStorage.removeItem(
                    "userType"
                );

                navigate("/login", {
                    replace: true,
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete user."
                );
            }

            setShowDeleteModal(false);

            navigate("/view-users", {
                replace: true,
                state: {
                    message:
                        "User deleted successfully.",
                },
            });
        } catch (err) {
            console.error(
                "Error deleting user:",
                err
            );

            setError(
                err.message ||
                    "Failed to delete user."
            );

            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goToViewUsers = () => {
        navigate("/view-users");
    };

    // =========================================================
    // INITIALS
    // =========================================================

    const getInitials = (name = "") => {
        const words = name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (words.length === 0) {
            return "U";
        }

        if (words.length === 1) {
            return words[0]
                .charAt(0)
                .toUpperCase();
        }

        return (
            words[0].charAt(0) +
            words[words.length - 1].charAt(0)
        ).toUpperCase();
    };

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "N/A";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="
                min-h-screen
                bg-[#F7F9FC]
                flex
                items-center
                justify-center
                px-5
            ">
                <div className="
                    flex
                    flex-col
                    items-center
                    gap-4
                ">

                    <div className="
                        h-11
                        w-11
                        animate-spin
                        rounded-full
                        border-4
                        border-[#102236]/10
                        border-t-[#F6C945]
                    " />

                    <p className="
                        text-sm
                        font-semibold
                        text-[#102236]
                    ">
                        Loading user details...
                    </p>

                </div>
            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="
            min-h-screen
            bg-[#F7F9FC]
            text-[#102236]
        ">

            {/* =====================================================
                TOP HEADER
            ===================================================== */}

            <header className="
                relative
                overflow-hidden
                bg-[#102236]
                border-b
                border-[#F6C945]/20
            ">

                {/* Decorative circles */}

                <div className="
                    pointer-events-none
                    absolute
                    -right-24
                    -top-32
                    h-72
                    w-72
                    rounded-full
                    bg-[#F6C945]/10
                " />

                <div className="
                    pointer-events-none
                    absolute
                    -bottom-24
                    left-[40%]
                    h-48
                    w-48
                    rounded-full
                    bg-[#F6C945]/5
                " />

                <div className="
                    relative
                    mx-auto
                    max-w-[1500px]
                    px-4
                    py-6
                    sm:px-6
                    lg:px-8
                ">

                    <div className="
                        flex
                        flex-col
                        gap-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    ">

                        {/* TITLE */}

                        <div className="
                            flex
                            items-center
                            gap-4
                        ">

                            <div className="
                                flex
                                h-14
                                w-14
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-[#F6C945]
                                text-[#102236]
                                shadow-lg
                            ">

                                <svg
                                    className="h-7 w-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20 21a8 8 0 00-16 0"
                                    />

                                    <circle
                                        cx="12"
                                        cy="7"
                                        r="4"
                                    />
                                </svg>

                            </div>

                            <div>

                                <p className="
                                    text-xs
                                    font-bold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[#F6C945]
                                ">
                                    User Management
                                </p>

                                <h1 className="
                                    mt-1
                                    text-2xl
                                    font-black
                                    text-white
                                    sm:text-3xl
                                ">
                                    Edit User
                                </h1>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-white/60
                                ">
                                    Update account information
                                </p>

                            </div>

                        </div>

                        {/* BACK BUTTON */}

                        <button
                            type="button"
                            onClick={
                                goToViewUsers
                            }
                            className="
                                inline-flex
                                h-11
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-white/10
                                bg-white/5
                                px-5
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:border-[#F6C945]/40
                                hover:bg-[#F6C945]
                                hover:text-[#102236]
                            "
                        >

                            <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 12H5"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 19l-7-7 7-7"
                                />
                            </svg>

                            <span>
                                Back to Users
                            </span>

                        </button>

                    </div>

                </div>

            </header>

            {/* =====================================================
                CONTENT
            ===================================================== */}

            <main className="
                mx-auto
                max-w-[1500px]
                px-4
                py-7
                sm:px-6
                lg:px-8
            ">

                {/* ERROR */}

                {error && (
                    <div className="
                        mb-5
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        px-5
                        py-4
                        text-sm
                        font-semibold
                        text-red-700
                    ">

                        <span className="
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-red-600
                            text-xs
                            font-black
                            text-white
                        ">
                            !
                        </span>

                        <span>
                            {error}
                        </span>

                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="
                        mb-5
                        flex
                        items-start
                        gap-3
                        rounded-2xl
                        border
                        border-[#F6C945]/40
                        bg-[#F6C945]/10
                        px-5
                        py-4
                        text-sm
                        font-semibold
                        text-[#6E5900]
                    ">

                        <span className="
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F6C945]
                            text-xs
                            font-black
                            text-[#102236]
                        ">
                            ✓
                        </span>

                        <span>
                            {success}
                        </span>

                    </div>
                )}

                {/* =================================================
                    USER NOT FOUND
                ================================================= */}

                {!user && error ? (
                    <div className="
                        rounded-[26px]
                        border
                        border-slate-200
                        bg-white
                        p-10
                        text-center
                        shadow-sm
                    ">

                        <div className="
                            mx-auto
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-2xl
                            bg-red-50
                            text-xl
                            font-black
                            text-red-600
                        ">
                            !
                        </div>

                        <h2 className="
                            mt-5
                            text-xl
                            font-black
                            text-[#102236]
                        ">
                            Unable to load user
                        </h2>

                        <p className="
                            mt-2
                            text-sm
                            text-slate-500
                        ">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                goToViewUsers
                            }
                            className="
                                mt-6
                                rounded-xl
                                bg-[#102236]
                                px-6
                                py-3
                                text-sm
                                font-bold
                                text-white
                                transition
                                hover:bg-[#18344F]
                                hover:text-[#F6C945]
                            "
                        >
                            Back to Users
                        </button>

                    </div>
                ) : (
                    <div className="
                        grid
                        grid-cols-1
                        gap-6
                        xl:grid-cols-[minmax(0,1fr)_350px]
                    ">

                        {/* =================================================
                            LEFT - EDIT FORM
                        ================================================== */}

                        <section className="
                            overflow-hidden
                            rounded-[26px]
                            border
                            border-slate-200
                            bg-white
                            shadow-[0_8px_30px_rgba(16,34,54,0.05)]
                        ">

                            {/* PROFILE HEADER */}

                            <div className="
                                relative
                                overflow-hidden
                                bg-[#102236]
                                px-5
                                py-6
                                sm:px-7
                            ">

                                <div className="
                                    pointer-events-none
                                    absolute
                                    -right-12
                                    -top-16
                                    h-48
                                    w-48
                                    rounded-full
                                    bg-[#F6C945]/10
                                " />

                                <div className="
                                    relative
                                    flex
                                    flex-col
                                    gap-5
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                ">

                                    <div className="
                                        flex
                                        min-w-0
                                        items-center
                                        gap-4
                                    ">

                                        <div className="
                                            flex
                                            h-16
                                            w-16
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            bg-[#F6C945]
                                            text-xl
                                            font-black
                                            text-[#102236]
                                        ">
                                            {getInitials(
                                                user?.name ||
                                                    formData.name
                                            )}
                                        </div>

                                        <div className="
                                            min-w-0
                                        ">

                                            <p className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-[#F6C945]
                                            ">
                                                User Account
                                            </p>

                                            <h2 className="
                                                mt-1
                                                truncate
                                                text-xl
                                                font-black
                                                text-white
                                            ">
                                                {user?.name ||
                                                    formData.name ||
                                                    "User"}
                                            </h2>

                                            <p className="
                                                mt-1
                                                truncate
                                                text-sm
                                                text-white/55
                                            ">
                                                {user?.email ||
                                                    formData.email ||
                                                    "No email"}
                                            </p>

                                            <div className="
                                                mt-3
                                                flex
                                                flex-wrap
                                                gap-2
                                            ">

                                                <span className="
                                                    rounded-full
                                                    bg-[#F6C945]
                                                    px-3
                                                    py-1
                                                    text-[11px]
                                                    font-black
                                                    text-[#102236]
                                                ">
                                                    {formData.role}
                                                </span>

                                                <span className="
                                                    rounded-full
                                                    border
                                                    border-white/10
                                                    bg-white/10
                                                    px-3
                                                    py-1
                                                    text-[11px]
                                                    font-bold
                                                    text-white
                                                ">
                                                    {formData.status}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        px-4
                                        py-3
                                        sm:text-right
                                    ">

                                        <p className="
                                            text-[10px]
                                            font-bold
                                            uppercase
                                            tracking-widest
                                            text-white/40
                                        ">
                                            User ID
                                        </p>

                                        <p className="
                                            mt-1
                                            max-w-[240px]
                                            break-all
                                            text-xs
                                            font-medium
                                            text-white/70
                                        ">
                                            {user?._id || id}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="
                                    px-5
                                    py-7
                                    sm:px-7
                                ">

                                    <div className="
                                        mb-7
                                    ">

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                        ">

                                            <div className="
                                                h-1
                                                w-8
                                                rounded-full
                                                bg-[#F6C945]
                                            " />

                                            <h3 className="
                                                text-lg
                                                font-black
                                                text-[#102236]
                                            ">
                                                Account Information
                                            </h3>

                                        </div>

                                        <p className="
                                            mt-2
                                            text-sm
                                            text-slate-500
                                        ">
                                            Update the user's
                                            account details below.
                                        </p>

                                    </div>

                                    <div className="
                                        grid
                                        grid-cols-1
                                        gap-5
                                        lg:grid-cols-2
                                    ">

                                        {/* NAME */}

                                        <div>

                                            <label
                                                htmlFor="name"
                                                className="
                                                    mb-2
                                                    block
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                "
                                            >
                                                Full Name
                                            </label>

                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={
                                                    formData.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter full name"
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-4
                                                    py-3.5
                                                    text-sm
                                                    font-medium
                                                    text-[#102236]
                                                    outline-none
                                                    transition
                                                    placeholder:text-slate-400
                                                    hover:border-[#102236]/20
                                                    focus:border-[#F6C945]
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-[#F6C945]/15
                                                "
                                            />

                                        </div>

                                        {/* EMAIL */}

                                        <div>

                                            <label
                                                htmlFor="email"
                                                className="
                                                    mb-2
                                                    block
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                "
                                            >
                                                Email Address
                                            </label>

                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={
                                                    formData.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Enter email address"
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-4
                                                    py-3.5
                                                    text-sm
                                                    font-medium
                                                    text-[#102236]
                                                    outline-none
                                                    transition
                                                    placeholder:text-slate-400
                                                    hover:border-[#102236]/20
                                                    focus:border-[#F6C945]
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-[#F6C945]/15
                                                "
                                            />

                                        </div>

                                        {/* ROLE */}

                                        <div>

                                            <label
                                                htmlFor="role"
                                                className="
                                                    mb-2
                                                    block
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                "
                                            >
                                                Role
                                            </label>

                                            <select
                                                id="role"
                                                name="role"
                                                value={
                                                    formData.role
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-4
                                                    py-3.5
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                    outline-none
                                                    transition
                                                    focus:border-[#F6C945]
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-[#F6C945]/15
                                                "
                                            >

                                                <option value="EXECUTIVE">
                                                    EXECUTIVE
                                                </option>

                                                <option value="MANAGER">
                                                    MANAGER
                                                </option>

                                            </select>

                                        </div>

                                        {/* STATUS */}

                                        <div>

                                            <label
                                                htmlFor="status"
                                                className="
                                                    mb-2
                                                    block
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                "
                                            >
                                                Status
                                            </label>

                                            <select
                                                id="status"
                                                name="status"
                                                value={
                                                    formData.status
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-4
                                                    py-3.5
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                    outline-none
                                                    transition
                                                    focus:border-[#F6C945]
                                                    focus:bg-white
                                                    focus:ring-4
                                                    focus:ring-[#F6C945]/15
                                                "
                                            >

                                                <option value="ACTIVE">
                                                    ACTIVE
                                                </option>

                                                <option value="INACTIVE">
                                                    INACTIVE
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                    {/* ACTION AREA */}

                                    <div className="
                                        my-8
                                        border-t
                                        border-slate-100
                                    " />

                                    <div className="
                                        flex
                                        flex-col-reverse
                                        gap-3
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    ">

                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowDeleteModal(
                                                    true
                                                )
                                            }
                                            className="
                                                inline-flex
                                                w-full
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-2xl
                                                border
                                                border-red-200
                                                bg-red-50
                                                px-5
                                                py-3.5
                                                text-sm
                                                font-bold
                                                text-red-600
                                                transition
                                                hover:bg-red-100
                                                sm:w-auto
                                            "
                                        >

                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 6h18"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M8 6V4h8v2M19 6l-1 15H6L5 6"
                                                />
                                            </svg>

                                            Delete User

                                        </button>

                                        <div className="
                                            flex
                                            flex-col
                                            gap-3
                                            sm:flex-row
                                        ">

                                            <button
                                                type="button"
                                                onClick={
                                                    goToViewUsers
                                                }
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    px-6
                                                    py-3.5
                                                    text-sm
                                                    font-bold
                                                    text-[#102236]
                                                    transition
                                                    hover:border-[#102236]/20
                                                    hover:bg-slate-50
                                                    sm:w-auto
                                                "
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={
                                                    saving
                                                }
                                                className="
                                                    w-full
                                                    rounded-2xl
                                                    bg-[#F6C945]
                                                    px-7
                                                    py-3.5
                                                    text-sm
                                                    font-black
                                                    text-[#102236]
                                                    shadow-lg
                                                    shadow-[#F6C945]/15
                                                    transition
                                                    hover:bg-[#FFD95A]
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-60
                                                    sm:w-auto
                                                "
                                            >

                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </form>

                        </section>

                        {/* =================================================
                            RIGHT SIDEBAR
                        ================================================== */}

                        <aside className="
                            space-y-6
                        ">

                            {/* ACCOUNT SUMMARY */}

                            <div className="
                                overflow-hidden
                                rounded-[26px]
                                border
                                border-slate-200
                                bg-white
                                shadow-[0_8px_30px_rgba(16,34,54,0.05)]
                            ">

                                <div className="
                                    bg-[#102236]
                                    px-5
                                    py-5
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-[#F6C945]
                                            text-[#102236]
                                        ">

                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="8"
                                                    r="3"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 20a7 7 0 0114 0"
                                                />
                                            </svg>

                                        </div>

                                        <div>

                                            <h3 className="
                                                text-base
                                                font-black
                                                text-white
                                            ">
                                                Account Summary
                                            </h3>

                                            <p className="
                                                mt-0.5
                                                text-xs
                                                text-white/50
                                            ">
                                                Current account state
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                <div className="
                                    divide-y
                                    divide-slate-100
                                ">

                                    {/* ROLE */}

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        px-5
                                        py-4
                                    ">

                                        <span className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Role
                                        </span>

                                        <span className="
                                            rounded-full
                                            bg-[#F6C945]/15
                                            px-3
                                            py-1
                                            text-xs
                                            font-black
                                            text-[#806500]
                                        ">
                                            {formData.role}
                                        </span>

                                    </div>

                                    {/* STATUS */}

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        px-5
                                        py-4
                                    ">

                                        <span className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Status
                                        </span>

                                        <span className={`
                                            rounded-full
                                            px-3
                                            py-1
                                            text-xs
                                            font-black
                                            ${
                                                formData.status ===
                                                "ACTIVE"
                                                    ? "bg-[#F6C945]/15 text-[#806500]"
                                                    : "bg-slate-100 text-slate-500"
                                            }
                                        `}>
                                            {formData.status}
                                        </span>

                                    </div>

                                    {/* CREATED */}

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        px-5
                                        py-4
                                    ">

                                        <span className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Created
                                        </span>

                                        <span className="
                                            text-right
                                            text-sm
                                            font-bold
                                            text-[#102236]
                                        ">
                                            {formatDate(
                                                user?.createdAt
                                            )}
                                        </span>

                                    </div>

                                    {/* UPDATED */}

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        px-5
                                        py-4
                                    ">

                                        <span className="
                                            text-sm
                                            font-medium
                                            text-slate-500
                                        ">
                                            Updated
                                        </span>

                                        <span className="
                                            text-right
                                            text-sm
                                            font-bold
                                            text-[#102236]
                                        ">
                                            {formatDate(
                                                user?.updatedAt
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {/* ACTIVITY */}

                            <div className="
                                rounded-[26px]
                                border
                                border-slate-200
                                bg-white
                                p-5
                                shadow-[0_8px_30px_rgba(16,34,54,0.05)]
                                sm:p-6
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                    <div className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#F6C945]/15
                                        text-[#806500]
                                    ">

                                        <svg
                                            className="h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 8v4l3 2"
                                            />

                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                            />
                                        </svg>

                                    </div>

                                    <div>

                                        <h3 className="
                                            text-base
                                            font-black
                                            text-[#102236]
                                        ">
                                            Activity
                                        </h3>

                                        <p className="
                                            text-xs
                                            text-slate-400
                                        ">
                                            Account timeline
                                        </p>

                                    </div>

                                </div>

                                <div className="
                                    mt-6
                                    space-y-6
                                ">

                                    {/* CREATED */}

                                    <div className="
                                        relative
                                        flex
                                        gap-3
                                    ">

                                        <div className="
                                            relative
                                            flex
                                            w-5
                                            justify-center
                                        ">

                                            <span className="
                                                mt-1.5
                                                h-3
                                                w-3
                                                rounded-full
                                                bg-[#F6C945]
                                                ring-4
                                                ring-[#F6C945]/15
                                            " />

                                        </div>

                                        <div>

                                            <p className="
                                                text-sm
                                                font-bold
                                                text-[#102236]
                                            ">
                                                Account created
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            ">
                                                {formatDate(
                                                    user?.createdAt
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                    {/* UPDATED */}

                                    <div className="
                                        flex
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            w-5
                                            justify-center
                                        ">

                                            <span className="
                                                mt-1.5
                                                h-3
                                                w-3
                                                rounded-full
                                                bg-[#102236]
                                                ring-4
                                                ring-[#102236]/10
                                            " />

                                        </div>

                                        <div>

                                            <p className="
                                                text-sm
                                                font-bold
                                                text-[#102236]
                                            ">
                                                Last updated
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            ">
                                                {formatDate(
                                                    user?.updatedAt
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                    {/* STATUS */}

                                    <div className="
                                        flex
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            w-5
                                            justify-center
                                        ">

                                            <span className="
                                                mt-1.5
                                                h-3
                                                w-3
                                                rounded-full
                                                bg-slate-300
                                                ring-4
                                                ring-slate-100
                                            " />

                                        </div>

                                        <div>

                                            <p className="
                                                text-sm
                                                font-bold
                                                text-[#102236]
                                            ">
                                                Current account status
                                            </p>

                                            <p className="
                                                mt-1
                                                text-xs
                                                font-semibold
                                                text-slate-400
                                            ">
                                                {formData.status}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </aside>

                    </div>
                )}

            </main>

            {/* =====================================================
                DELETE CONFIRMATION MODAL
            ===================================================== */}

            {showDeleteModal && (
                <div className="
                    fixed
                    inset-0
                    z-[100]
                    flex
                    items-center
                    justify-center
                    bg-[#102236]/75
                    px-4
                    backdrop-blur-sm
                ">

                    <div className="
                        w-full
                        max-w-md
                        overflow-hidden
                        rounded-[26px]
                        bg-white
                        shadow-2xl
                    ">

                        {/* MODAL HEADER */}

                        <div className="
                            bg-[#102236]
                            px-6
                            py-5
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-red-500
                                    text-white
                                ">

                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v4"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 17h.01"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.3 3.7L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.7a2 2 0 00-3.4 0z"
                                        />
                                    </svg>

                                </div>

                                <div>

                                    <h2 className="
                                        text-lg
                                        font-black
                                        text-white
                                    ">
                                        Delete User?
                                    </h2>

                                    <p className="
                                        text-xs
                                        text-white/50
                                    ">
                                        This action requires
                                        confirmation
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* MODAL BODY */}

                        <div className="p-6">

                            <p className="
                                text-sm
                                leading-6
                                text-slate-500
                            ">
                                Are you sure you want to delete{" "}
                                <span className="
                                    font-black
                                    text-[#102236]
                                ">
                                    {user?.name ||
                                        "this user"}
                                </span>
                                ? This action cannot be undone.
                            </p>

                            <div className="
                                mt-7
                                flex
                                flex-col-reverse
                                gap-3
                                sm:flex-row
                                sm:justify-end
                            ">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-5
                                        py-3
                                        text-sm
                                        font-bold
                                        text-[#102236]
                                        transition
                                        hover:bg-slate-50
                                        disabled:opacity-60
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="
                                        rounded-2xl
                                        bg-red-600
                                        px-5
                                        py-3
                                        text-sm
                                        font-bold
                                        text-white
                                        transition
                                        hover:bg-red-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : "Yes, Delete User"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default EditUser;