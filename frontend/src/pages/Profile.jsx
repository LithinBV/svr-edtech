import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const Profile = () => {
    const [profile, setProfile] = useState(null);

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    // ==================================================
    // GET TOKEN
    // ==================================================

    const getToken = () => {
        return (
            localStorage.getItem("managerToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("jwt") ||
            localStorage.getItem("authToken")
        );
    };

    // ==================================================
    // GET PROFILE
    // ==================================================

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Authentication token not found.");
                return;
            }

            const response = await fetch(
                `${API_URL}/api/profile`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load profile."
                );
            }

            setProfile(data.user);

            setName(data.user?.name || "");
            setContact(data.user?.contact || "");

        } catch (err) {
            console.error(
                "Profile fetch error:",
                err
            );

            setError(
                err.message ||
                "Failed to load profile."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // LOAD PROFILE
    // ==================================================

    useEffect(() => {
        fetchProfile();
    }, []);

    // ==================================================
    // UPDATE PROFILE
    // ==================================================

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Authentication token not found."
                );
                return;
            }

            if (!name.trim()) {
                setError(
                    "Name cannot be empty."
                );
                return;
            }

            const response = await fetch(
                `${API_URL}/api/profile`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: name.trim(),
                        contact: contact.trim()
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update profile."
                );
            }

            setProfile((previous) => ({
                ...previous,
                ...data.user
            }));

            setName(
                data.user?.name ||
                ""
            );

            setContact(
                data.user?.contact ||
                ""
            );

            setMessage(
                "Profile updated successfully."
            );

        } catch (err) {
            console.error(
                "Profile update error:",
                err
            );

            setError(
                err.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    // ==================================================
    // SELECT PROFILE IMAGE
    // ==================================================

    const handleChangePhoto = () => {
        if (uploadingImage) {
            return;
        }

        fileInputRef.current?.click();
    };

    // ==================================================
    // UPLOAD PROFILE IMAGE
    // ==================================================

    const handleImageSelected = async (e) => {
        const file = e.target.files?.[0];

        // Reset input immediately
        e.target.value = "";

        if (!file) {
            return;
        }

        setMessage("");
        setError("");

        // ------------------------------------------
        // VALIDATE IMAGE TYPE
        // ------------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, PNG, or WebP image."
            );
            return;
        }

        // ------------------------------------------
        // VALIDATE IMAGE SIZE
        // ------------------------------------------

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Image size must be less than 5 MB."
            );
            return;
        }

        try {
            setUploadingImage(true);

            const token = getToken();

            if (!token) {
                setError(
                    "Authentication token not found."
                );
                return;
            }

            // ------------------------------------------
            // CREATE FORMDATA
            // ------------------------------------------

            const formData = new FormData();

            formData.append(
                "profileImage",
                file
            );

            // ------------------------------------------
            // UPLOAD TO BACKEND
            // ------------------------------------------

            const response = await fetch(
                `${API_URL}/api/profile/image`,
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to upload profile image."
                );
            }

            // ------------------------------------------
            // UPDATE PROFILE IMAGE
            // ------------------------------------------

            setProfile((previous) => ({
                ...previous,
                profileImage:
                    data.profileImage
            }));

            setMessage(
                "Profile image uploaded successfully."
            );

        } catch (err) {
            console.error(
                "Profile image upload error:",
                err
            );

            setError(
                err.message ||
                "Failed to upload profile image."
            );
        } finally {
            setUploadingImage(false);
        }
    };

    // ==================================================
    // REMOVE PROFILE IMAGE
    // ==================================================

    const handleRemovePhoto = async () => {
        try {
            setMessage("");
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Authentication token not found."
                );
                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to remove your profile photo?"
                );

            if (!confirmed) {
                return;
            }

            const response = await fetch(
                `${API_URL}/api/profile/image`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to remove profile image."
                );
            }

            setProfile((previous) => ({
                ...previous,
                profileImage: null
            }));

            setMessage(
                "Profile image removed successfully."
            );

        } catch (err) {
            console.error(
                "Remove profile image error:",
                err
            );

            setError(
                err.message ||
                "Failed to remove profile image."
            );
        }
    };

    // ==================================================
    // INITIALS
    // ==================================================

    const getInitials = (value) => {
        if (!value) {
            return "U";
        }

        const words =
            value
                .trim()
                .split(/\s+/);

        if (words.length === 1) {
            return words[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    };

    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                    <p className="text-sm font-medium text-slate-600">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    // ==================================================
    // PAGE
    // ==================================================

    return (
        <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">

            <div className="mx-auto w-full max-w-7xl">

                {/* =========================================
                    PAGE HEADER
                ========================================= */}

                <div className="mb-5 sm:mb-7">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Account Settings
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                                My Profile
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 sm:text-base">
                                Manage your personal profile information.
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    PROFILE HERO CARD
                ========================================= */}

                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                    {/* Decorative background */}

                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-slate-100" />

                    <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-slate-50" />


                    <div className="relative p-5 sm:p-7 lg:p-8">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                            {/* LEFT PROFILE AREA */}

                            <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center">

                                {/* PROFILE IMAGE */}

                                <div className="relative flex-shrink-0">

                                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-lg ring-1 ring-slate-200 sm:h-32 sm:w-32">

                                        {profile?.profileImage ? (

                                            <img
                                                src={
                                                    profile.profileImage
                                                }
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />

                                        ) : (

                                            <span className="text-3xl font-bold text-slate-500 sm:text-4xl">
                                                {getInitials(
                                                    profile?.name
                                                )}
                                            </span>

                                        )}

                                    </div>


                                    {/* CAMERA BUTTON */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleChangePhoto
                                        }
                                        disabled={
                                            uploadingImage
                                        }
                                        className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-base text-white shadow-lg transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Change photo"
                                    >
                                        {uploadingImage
                                            ? "..."
                                            : "📷"}
                                    </button>


                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={
                                            handleImageSelected
                                        }
                                        className="hidden"
                                    />

                                </div>


                                {/* PROFILE DETAILS */}

                                <div className="min-w-0 text-center sm:text-left">

                                    <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                        {profile?.name ||
                                            "User"}
                                    </h2>

                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {profile?.email ||
                                            "No email available"}
                                    </p>


                                    {/* BADGES */}

                                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">

                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">

                                            {profile?.userType ||
                                                profile?.role ||
                                                "USER"}

                                        </span>


                                        {profile?.team?.name && (

                                            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                                                {profile.team.name}

                                            </span>

                                        )}

                                    </div>


                                    {/* PHOTO BUTTONS */}

                                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">

                                        <button
                                            type="button"
                                            onClick={
                                                handleChangePhoto
                                            }
                                            disabled={
                                                uploadingImage
                                            }
                                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {uploadingImage
                                                ? "Uploading..."
                                                : "Change Photo"}
                                        </button>


                                        {profile?.profileImage && (

                                            <button
                                                type="button"
                                                onClick={
                                                    handleRemovePhoto
                                                }
                                                disabled={
                                                    uploadingImage
                                                }
                                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Remove Photo
                                            </button>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* ACCOUNT STATUS CARD */}

                            <div className="w-full lg:max-w-xs">

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                                            ✓
                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                Account
                                            </p>

                                            <p className="mt-0.5 text-sm font-bold text-slate-800">
                                                Profile Active
                                            </p>

                                        </div>

                                    </div>

                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                        Your profile information is securely connected to your account.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    MAIN CONTENT CARDS
                ========================================= */}

                <form
                    onSubmit={handleSave}
                    className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3"
                >

                    {/* =====================================
                        PERSONAL INFORMATION
                    ===================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                                    👤
                                </div>

                                <div>

                                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                        Personal Information
                                    </h3>

                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        Update your basic account details.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">

                            {/* NAME */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    placeholder="Enter your name"
                                />

                            </div>


                            {/* CONTACT */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Contact Number
                                </label>

                                <input
                                    type="tel"
                                    value={contact}
                                    onChange={(e) =>
                                        setContact(
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                                    placeholder="Enter contact number"
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="md:col-span-2">

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Email
                                </label>

                                <div className="relative">

                                    <input
                                        type="email"
                                        value={
                                            profile?.email ||
                                            ""
                                        }
                                        readOnly
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-12 text-sm text-slate-500 outline-none"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm">
                                        🔒
                                    </span>

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Email address cannot be changed.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        ROLE & TEAM CARD
                    ===================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-xl">
                                    🛡️
                                </div>

                                <div>

                                    <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                                        Account Details
                                    </h3>

                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        Your assigned role and team.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="space-y-5 p-5 sm:p-6">

                            {/* ROLE */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Role
                                </label>

                                <div className="relative">

                                    <input
                                        type="text"
                                        value={
                                            profile?.userType ||
                                            profile?.role ||
                                            ""
                                        }
                                        readOnly
                                        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 pr-12 text-sm text-slate-500 outline-none"
                                    />

                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm">
                                        🔒
                                    </span>

                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Role can only be changed by an administrator.
                                </p>

                            </div>


                            {/* TEAM */}

                            {profile?.team?.name ? (

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Team
                                    </label>

                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                                                👥
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-bold text-emerald-800">
                                                    {profile.team.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-emerald-600">
                                                    Assigned team
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Team assignment can only be changed by an administrator.
                                    </p>

                                </div>

                            ) : (

                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">

                                    <p className="text-sm font-semibold text-slate-500">
                                        No team assigned
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Your team assignment can be updated by an administrator.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =====================================
                        MESSAGES + SAVE
                    ===================================== */}

                    <div className="xl:col-span-3">

                        {message && (

                            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">

                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold">
                                    ✓
                                </span>

                                <p className="pt-0.5">
                                    {message}
                                </p>

                            </div>

                        )}


                        {error && (

                            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                                    !
                                </span>

                                <p className="pt-0.5">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* SAVE CARD */}

                        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <p className="text-sm font-bold text-slate-800">
                                        Save your changes
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Your name and contact number will be updated.
                                    </p>

                                </div>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default Profile;