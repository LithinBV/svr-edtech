const SuperAdmin = require("../models/superAdmin");
const User = require("../models/user");

const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ==================================================
// GET MY PROFILE
// ==================================================

const getMyProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const { userId, userType } = req.user;

        let user = null;

        // ------------------------------------------
        // FIND USER BASED ON USER TYPE
        // ------------------------------------------

        if (userType === "SUPER_ADMIN") {
            user = await SuperAdmin.findById(userId)
                .select(
                    "-password " +
                    "-otpHash " +
                    "-otpExpiresAt " +
                    "-otpAttempts " +
                    "-otpLastSentAt " +
                    "-otpDailyCount " +
                    "-otpDailyResetAt " +
                    "-resetOtpHash " +
                    "-resetOtpExpiresAt " +
                    "-resetOtpAttempts " +
                    "-refreshTokenHash " +
                    "-refreshTokenExpiresAt"
                );
        } else if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {
            user = await User.findById(userId)
                .populate("team", "name")
                .select(
                    "-password " +
                    "-otpHash " +
                    "-otpExpiresAt " +
                    "-otpAttempts " +
                    "-otpLastSentAt " +
                    "-otpDailyCount " +
                    "-otpDailyResetAt " +
                    "-resetOtpHash " +
                    "-resetOtpExpiresAt " +
                    "-resetOtpAttempts " +
                    "-refreshTokenHash " +
                    "-refreshTokenExpiresAt"
                );
        } else {
            return res.status(403).json({
                success: false,
                message: "Profile access is not available for this account."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        return res.json({
            success: true,
            userType,
            user
        });

    } catch (error) {
        console.error(
            "GET PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while fetching profile."
        });
    }
};


// ==================================================
// UPDATE MY PROFILE
// ==================================================

const updateMyProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const { userId, userType } = req.user;

        // ------------------------------------------
        // ONLY THESE FIELDS CAN BE EDITED
        // ------------------------------------------

        const { name, contact } = req.body;

        // ------------------------------------------
        // VALIDATE NAME
        // ------------------------------------------

        if (
            name !== undefined &&
            (!String(name).trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty."
            });
        }

        // ------------------------------------------
        // FIND ACCOUNT
        // ------------------------------------------

        let user = null;

        if (userType === "SUPER_ADMIN") {
            user = await SuperAdmin.findById(userId);
        } else if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {
            user = await User.findById(userId);
        } else {
            return res.status(403).json({
                success: false,
                message: "Profile update is not available for this account."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        // ------------------------------------------
        // UPDATE ALLOWED FIELDS ONLY
        // ------------------------------------------

        if (name !== undefined) {
            user.name = String(name).trim();
        }

        if (contact !== undefined) {
            user.contact = String(contact).trim();
        }

        // ------------------------------------------
        // EMAIL IS NEVER UPDATED
        // ------------------------------------------

        await user.save();

        return res.json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                contact: user.contact,
                profileImage: user.profileImage,
                role:
                    userType === "SUPER_ADMIN"
                        ? "SUPER_ADMIN"
                        : user.role,
                userType
            }
        });

    } catch (error) {
        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while updating profile."
        });
    }
};


// ==================================================
// UPLOAD PROFILE IMAGE
// ==================================================

const uploadProfileImage = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // ------------------------------------------
        // CHECK IMAGE
        // ------------------------------------------

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image."
            });
        }

        const { userId, userType } = req.user;

        // ------------------------------------------
        // FIND ACCOUNT
        // ------------------------------------------

        let user = null;

        if (userType === "SUPER_ADMIN") {
            user = await SuperAdmin.findById(userId);
        } else if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {
            user = await User.findById(userId);
        } else {
            return res.status(403).json({
                success: false,
                message:
                    "Profile image upload is not available for this account."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        // ------------------------------------------
        // UPLOAD IMAGE TO CLOUDINARY
        // ------------------------------------------

        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {

                const uploadStream =
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "svr-edtech/profile-images",
                            resource_type: "image"
                        },
                        (error, result) => {

                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }

                        }
                    );

                streamifier
                    .createReadStream(req.file.buffer)
                    .pipe(uploadStream);
            });
        };

        const result = await uploadToCloudinary();

        // ------------------------------------------
        // SAVE CLOUDINARY URL IN MONGODB
        // ------------------------------------------

        user.profileImage = result.secure_url;

        await user.save();

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.json({
            success: true,
            message: "Profile image uploaded successfully.",
            profileImage: result.secure_url
        });

    } catch (error) {
        console.error(
            "UPLOAD PROFILE IMAGE ERROR:",
            error
        );
        console.error(
    "FULL CLOUDINARY ERROR:",
    error
);

        return res.status(500).json({
            success: false,
            message: "Server error while uploading profile image."
        });
    }
};


// ==================================================
// REMOVE PROFILE IMAGE
// ==================================================

const removeProfileImage = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const { userId, userType } = req.user;

        let user = null;

        if (userType === "SUPER_ADMIN") {
            user = await SuperAdmin.findById(userId);
        } else if (
            userType === "MANAGER" ||
            userType === "EXECUTIVE"
        ) {
            user = await User.findById(userId);
        } else {
            return res.status(403).json({
                success: false,
                message:
                    "Profile access is not available for this account."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        user.profileImage = null;

        await user.save();

        return res.json({
            success: true,
            message: "Profile image removed successfully.",
            profileImage: null
        });

    } catch (error) {
        console.error(
            "REMOVE PROFILE IMAGE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while removing profile image."
        });
    }
};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
    getMyProfile,
    updateMyProfile,
    uploadProfileImage,
    removeProfileImage
};