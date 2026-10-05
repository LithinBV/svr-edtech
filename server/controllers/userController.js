const bcrypt = require("bcryptjs");
const User = require("../models/user");


// ==================================================
// PASSWORD VALIDATION
// ==================================================

function isValidPassword(password) {

    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
        password
    );
}


// ==================================================
// EMAIL VALIDATION
// ==================================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );
}


// ==================================================
// ACTIVITY SETTINGS
// ==================================================

const ACTIVITY_TIMEOUT_MINUTES = 30;

const ACTIVITY_TIMEOUT_MS =
    ACTIVITY_TIMEOUT_MINUTES * 60 * 1000;


// ==================================================
// GET ACTIVITY STATUS
// ==================================================

function getActivityStatus(user) {

    // Activity tracking is only for
    // Manager and Executive

    if (
        !user ||
        (
            user.role !== "MANAGER" &&
            user.role !== "EXECUTIVE"
        )
    ) {
        return "ACTIVE";
    }


    // If user has never logged in/activity

    if (!user.lastActivityAt) {
        return "INACTIVE";
    }


    const lastActivity =
        new Date(user.lastActivityAt).getTime();

    const inactiveTime =
        Date.now() - lastActivity;


    if (inactiveTime >= ACTIVITY_TIMEOUT_MS) {
        return "INACTIVE";
    }


    return "ACTIVE";
}


// ==================================================
// CREATE USER
// ==================================================

const createUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // -------------------------------
        // Validate required fields
        // -------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !role
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, email, password and role are required"
            });
        }


        // -------------------------------
        // Validate role
        // -------------------------------

        if (
            role !== "MANAGER" &&
            role !== "EXECUTIVE"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid role"
            });
        }


        // -------------------------------
        // Validate email
        // -------------------------------

        const normalizedEmail =
            email.trim().toLowerCase();


        if (!isValidEmail(normalizedEmail)) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address"
            });
        }


        // -------------------------------
        // Validate password
        // -------------------------------

        if (!isValidPassword(password)) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
            });
        }


        // -------------------------------
        // Check duplicate email
        // -------------------------------

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "A user with this email already exists"
            });
        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // -------------------------------
        // Create user
        // -------------------------------

        const user =
            await User.create({

                name:
                    name.trim(),

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                role,

                status:
                    "ACTIVE",

                createdBy:
                    req.user?.userType === "SUPER_ADMIN"
                        ? req.user.userId
                        : null,

                lastActivityAt:
                    null
            });


        return res.status(201).json({

            success: true,

            message:
                "User created successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                status:
                    user.status,

                team:
                    user.team || null,

                activityStatus:
                    getActivityStatus(user),

                lastActivityAt:
                    user.lastActivityAt,

                createdAt:
                    user.createdAt
            }
        });


    } catch (error) {

        console.error(
            "Create user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// GET ALL USERS
// ==================================================

const getUsers = async (req, res) => {

    try {

        const users =
            await User.find()
                .select(
                    "-password " +
                    "-otpHash " +
                    "-otpExpiresAt " +
                    "-otpAttempts " +
                    "-resetOtpHash " +
                    "-resetOtpExpiresAt " +
                    "-resetOtpAttempts " +
                    "-refreshTokenHash " +
                    "-refreshTokenExpiresAt"
                )
                .sort({
                    createdAt: -1
                });


        const formattedUsers =
            users.map(user => ({

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                status:
                    user.status,


                // ==================================================
                // TEAM
                // ==================================================
                //
                // This is important for Executives.
                //
                // If team is null:
                //     Executive is available.
                //
                // If team has an ID:
                //     Executive is already assigned.
                //
                // Managers can ignore this field because
                // Managers can belong to multiple teams.

                team:
                    user.team || null,


                // -------------------------------
                // 30 minute activity status
                // -------------------------------

                activityStatus:
                    getActivityStatus(user),

                lastActivityAt:
                    user.lastActivityAt,

                createdAt:
                    user.createdAt,

                updatedAt:
                    user.updatedAt

            }));


        return res.json({

            success: true,

            users:
                formattedUsers
        });


    } catch (error) {

        console.error(
            "Get users error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// GET USER BY ID
// ==================================================

const getUserById = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const user =
            await User.findById(id)
                .select(
                    "-password " +
                    "-otpHash " +
                    "-otpExpiresAt " +
                    "-otpAttempts " +
                    "-resetOtpHash " +
                    "-resetOtpExpiresAt " +
                    "-resetOtpAttempts " +
                    "-refreshTokenHash " +
                    "-refreshTokenExpiresAt"
                );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        return res.json({

            success: true,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                status:
                    user.status,

                team:
                    user.team || null,

                activityStatus:
                    getActivityStatus(user),

                lastActivityAt:
                    user.lastActivityAt,

                createdAt:
                    user.createdAt,

                updatedAt:
                    user.updatedAt
            }
        });


    } catch (error) {

        console.error(
            "Get user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// UPDATE USER
// ==================================================

const updateUser = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const {
            name,
            email,
            role,
            status
        } = req.body;


        const user =
            await User.findById(id);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        // -------------------------------
        // Validate name
        // -------------------------------

        if (name !== undefined) {

            if (!name.trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Name cannot be empty"
                });
            }


            user.name =
                name.trim();
        }


        // -------------------------------
        // Validate email
        // -------------------------------

        if (email !== undefined) {

            const normalizedEmail =
                email.trim().toLowerCase();


            if (!isValidEmail(normalizedEmail)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter a valid email address"
                });
            }


            const duplicateUser =
                await User.findOne({

                    email:
                        normalizedEmail,

                    _id: {
                        $ne: id
                    }

                });


            if (duplicateUser) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A user with this email already exists"
                });
            }


            user.email =
                normalizedEmail;
        }


        // -------------------------------
        // Validate role
        // -------------------------------

        if (role !== undefined) {

            if (
                role !== "MANAGER" &&
                role !== "EXECUTIVE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid role"
                });
            }


            user.role =
                role;
        }


        // -------------------------------
        // Validate status
        // -------------------------------

        if (status !== undefined) {

            if (
                status !== "ACTIVE" &&
                status !== "INACTIVE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid status"
                });
            }


            user.status =
                status;
        }


        await user.save();


        return res.json({

            success: true,

            message:
                "User updated successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                status:
                    user.status,

                team:
                    user.team || null,

                activityStatus:
                    getActivityStatus(user),

                lastActivityAt:
                    user.lastActivityAt,

                createdAt:
                    user.createdAt,

                updatedAt:
                    user.updatedAt
            }
        });


    } catch (error) {

        console.error(
            "Update user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// DELETE USER
// ==================================================

const deleteUser = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        // -------------------------------
        // Find user first
        // -------------------------------

        const user =
            await User.findById(id);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        // -------------------------------
        // Delete user
        // -------------------------------

        await User.findByIdAndDelete(id);


        return res.json({

            success: true,

            message:
                "User deleted successfully"
        });


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete user"
        });
    }
};


// ==================================================
// UPDATE CURRENT USER ACTIVITY
// ==================================================

const updateActivity = async (req, res) => {

    try {

        // -----------------------------------------
        // Authentication is required
        // -----------------------------------------

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"
            });
        }


        // -----------------------------------------
        // Only Manager and Executive can update
        // their own activity
        // -----------------------------------------

        if (
            req.user.userType !== "MANAGER" &&
            req.user.userType !== "EXECUTIVE"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Activity tracking is only available for Manager and Executive"
            });
        }


        const user =
            await User.findById(
                req.user.userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        // -----------------------------------------
        // Account must still be manually ACTIVE
        // -----------------------------------------

        if (user.status !== "ACTIVE") {

            return res.status(403).json({

                success: false,

                message:
                    "Your account is inactive"
            });
        }


        // -----------------------------------------
        // User is actively working
        // -----------------------------------------

        user.lastActivityAt =
            new Date();


        await user.save();


        return res.json({

            success: true,

            activityStatus:
                "ACTIVE",

            lastActivityAt:
                user.lastActivityAt
        });


    } catch (error) {

        console.error(
            "Update activity error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// MARK CURRENT USER INACTIVE
// ==================================================
//
// Called when the frontend detects that the user
// is closing the application/tab/browser.
//
// IMPORTANT:
// The 30-minute timeout remains the fallback for
// cases where the browser cannot send this request.
// ==================================================

const markInactive = async (req, res) => {

    try {

        // -----------------------------------------
        // Authentication is required
        // -----------------------------------------

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"
            });
        }


        // -----------------------------------------
        // Only Manager and Executive are tracked
        // -----------------------------------------

        if (
            req.user.userType !== "MANAGER" &&
            req.user.userType !== "EXECUTIVE"
        ) {

            return res.json({

                success: true,

                activityStatus:
                    "INACTIVE"
            });
        }


        const user =
            await User.findById(
                req.user.userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        // -----------------------------------------
        // CLEAR ACTIVITY
        // -----------------------------------------

        user.lastActivityAt =
            null;


        await user.save();


        return res.json({

            success: true,

            activityStatus:
                "INACTIVE"
        });


    } catch (error) {

        console.error(
            "Mark inactive error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error"
        });
    }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    createUser,

    getUsers,

    getUserById,

    updateUser,

    deleteUser,

    updateActivity,

    markInactive,

    getActivityStatus
};