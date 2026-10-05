const Team = require("../models/team");
const User = require("../models/user");

// ==========================================
// CREATE TEAM
// ==========================================

const createTeam = async (req, res) => {
    try {
        const {
            name,
            manager,
            executives = []
        } = req.body;

        // ==========================================
        // VALIDATE TEAM NAME
        // ==========================================

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Team name is required"
            });
        }

        // ==========================================
        // VALIDATE MANAGER
        // ==========================================

        if (!manager) {
            return res.status(400).json({
                success: false,
                message: "Manager is required"
            });
        }

        // ==========================================
        // FIND MANAGER
        // ==========================================

        const managerUser = await User.findById(manager);

        if (!managerUser) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }

        // ==========================================
        // CHECK MANAGER ROLE
        // ==========================================

        if (managerUser.role !== "MANAGER") {
            return res.status(400).json({
                success: false,
                message: "Selected user is not a Manager"
            });
        }

        // ==========================================
        // ONE MANAGER = ONE TEAM
        // ==========================================

        if (managerUser.team) {
            return res.status(400).json({
                success: false,
                message: "This Manager is already assigned to a team"
            });
        }

        // ==========================================
        // VALIDATE EXECUTIVES
        // ==========================================

        let executiveUsers = [];

        if (
            Array.isArray(executives) &&
            executives.length > 0
        ) {
            executiveUsers = await User.find({
                _id: {
                    $in: executives
                }
            });

            // ==========================================
            // CHECK ALL EXECUTIVES EXIST
            // ==========================================

            if (
                executiveUsers.length !==
                executives.length
            ) {
                return res.status(400).json({
                    success: false,
                    message: "One or more executives were not found"
                });
            }

            // ==========================================
            // CHECK EXECUTIVE ROLES
            // ==========================================

            const invalidExecutive =
                executiveUsers.find(
                    (user) =>
                        user.role !== "EXECUTIVE"
                );

            if (invalidExecutive) {
                return res.status(400).json({
                    success: false,
                    message: "Only Executives can be added to a team"
                });
            }

            // ==========================================
            // ONE EXECUTIVE = ONE TEAM
            // ==========================================

            const alreadyAssigned =
                executiveUsers.find(
                    (user) =>
                        user.team
                );

            if (alreadyAssigned) {
                return res.status(400).json({
                    success: false,
                    message: "One or more Executives are already assigned to a team"
                });
            }
        }

        // ==========================================
        // CHECK DUPLICATE TEAM NAME
        // ==========================================

        const existingTeam =
            await Team.findOne({
                name: name.trim()
            });

        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: "A team with this name already exists"
            });
        }

        // ==========================================
        // CREATE TEAM
        // ==========================================

        const team = await Team.create({
            name: name.trim(),

            manager:
                managerUser._id,

            executives:
                executiveUsers.map(
                    (user) =>
                        user._id
                ),

            createdBy:
                req.user.userId,

            status:
                "ACTIVE"
        });

        // ==========================================
        // SAVE TEAM ID INSIDE MANAGER
        // ==========================================

        managerUser.team =
            team._id;

        await managerUser.save();

        // ==========================================
        // SAVE TEAM ID INSIDE EXECUTIVES
        // ==========================================

        if (
            executiveUsers.length > 0
        ) {
            await User.updateMany(
                {
                    _id: {
                        $in:
                            executiveUsers.map(
                                (user) =>
                                    user._id
                            )
                    }
                },
                {
                    $set: {
                        team:
                            team._id
                    }
                }
            );
        }

        // ==========================================
        // RETURN POPULATED TEAM
        // ==========================================

        const populatedTeam =
            await Team.findById(
                team._id
            )
                .populate(
                    "manager",
                    "name email role status team"
                )
                .populate(
                    "executives",
                    "name email role status team"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        return res.status(201).json({
            success: true,

            message:
                "Team created successfully",

            team:
                populatedTeam
        });

    } catch (error) {
        console.error(
            "Create Team Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to create team",

            error:
                error.message
        });
    }
};


// ==========================================
// GET TEAMS
// ==========================================
// SUPER ADMIN
//     → Returns all teams
//
// MANAGER / USER_MANAGER
//     → Returns only teams assigned to
//       the logged-in manager
// ==========================================

const getTeams = async (
    req,
    res
) => {
    try {

        const userId =
            req.user?.userId;

        const userRole =
            String(
                req.user?.role ||
                req.user?.userType ||
                ""
            ).toUpperCase();

        // ==========================================
        // VALIDATE USER
        // ==========================================

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User authentication information is missing"
            });
        }

        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (
            userRole === "SUPER_ADMIN"
        ) {

            const teams =
                await Team.find()
                    .populate(
                        "manager",
                        "name email role status team"
                    )
                    .populate(
                        "executives",
                        "name email role status team"
                    )
                    .populate(
                        "createdBy",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.status(200).json({
                success: true,

                count:
                    teams.length,

                teams
            });
        }

        // ==========================================
        // MANAGER
        // ==========================================

        if (
            userRole === "MANAGER" ||
            userRole === "USER_MANAGER"
        ) {

            const teams =
                await Team.find({
                    manager: userId
                })
                    .populate(
                        "manager",
                        "name email role status team"
                    )
                    .populate(
                        "executives",
                        "name email role status team"
                    )
                    .populate(
                        "createdBy",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.status(200).json({
                success: true,

                count:
                    teams.length,

                teams
            });
        }

        // ==========================================
        // OTHER ROLES
        // ==========================================

        return res.status(403).json({
            success: false,
            message:
                "Access denied. Managers or Super Admin only."
        });

    } catch (error) {

        console.error(
            "Get Teams Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to get teams",

            error:
                error.message
        });
    }
};


// ==========================================
// GET TEAM BY ID
// ==========================================
// SUPER ADMIN
//     → Can view any team
//
// MANAGER
//     → Can view only their own team
// ==========================================

const getTeamById = async (
    req,
    res
) => {
    try {

        const {
            id
        } = req.params;

        const userId =
            req.user?.userId;

        const userRole =
            String(
                req.user?.role ||
                req.user?.userType ||
                ""
            ).toUpperCase();

        // ==========================================
        // VALIDATE USER
        // ==========================================

        if (!userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User authentication information is missing"
            });
        }

        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(id)
                .populate(
                    "manager",
                    "name email role status team"
                )
                .populate(
                    "executives",
                    "name email role status team"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        if (!team) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }

        // ==========================================
        // MANAGER ACCESS CHECK
        // ==========================================

        if (
            userRole === "MANAGER" ||
            userRole === "USER_MANAGER"
        ) {

            if (
                !team.manager ||
                String(team.manager._id) !==
                    String(userId)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Access denied. You can only view your own team."
                });
            }
        }

        // ==========================================
        // CHECK ALLOWED ROLES
        // ==========================================

        if (
            userRole !== "SUPER_ADMIN" &&
            userRole !== "MANAGER" &&
            userRole !== "USER_MANAGER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. Managers or Super Admin only."
            });
        }

        return res.status(200).json({
            success: true,
            team
        });

    } catch (error) {

        console.error(
            "Get Team Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to get team",

            error:
                error.message
        });
    }
};


// ==========================================
// UPDATE TEAM
// ==========================================

const updateTeam = async (
    req,
    res
) => {
    try {

        const {
            id
        } = req.params;

        const {
            name,
            manager
        } = req.body;

        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }

        // ==========================================
        // VALIDATE NAME
        // ==========================================

        if (
            name !== undefined &&
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Team name is required"
            });
        }

        // ==========================================
        // UPDATE TEAM NAME
        // ==========================================

        if (name !== undefined) {

            const duplicateTeam =
                await Team.findOne({
                    name:
                        name.trim(),

                    _id: {
                        $ne: id
                    }
                });

            if (duplicateTeam) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A team with this name already exists"
                });
            }

            team.name =
                name.trim();
        }

        // ==========================================
        // UPDATE MANAGER
        // ==========================================

        if (manager !== undefined) {

            if (!manager) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Manager is required"
                });
            }

            // ==========================================
            // FIND NEW MANAGER
            // ==========================================

            const newManager =
                await User.findById(
                    manager
                );

            if (!newManager) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Manager not found"
                });
            }

            // ==========================================
            // CHECK ROLE
            // ==========================================

            if (
                newManager.role !==
                "MANAGER"
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected user is not a Manager"
                });
            }

            // ==========================================
            // CURRENT MANAGER
            // ==========================================

            const currentManagerId =
                team.manager
                    ? team.manager.toString()
                    : "";

            const newManagerId =
                newManager._id.toString();

            // ==========================================
            // MANAGER CHANGED
            // ==========================================

            if (
                currentManagerId !==
                newManagerId
            ) {

                // ==========================================
                // NEW MANAGER ALREADY HAS ANOTHER TEAM
                // ==========================================

                if (
                    newManager.team &&
                    newManager.team.toString() !==
                        team._id.toString()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "This Manager is already assigned to another team"
                    });
                }

                // ==========================================
                // RELEASE OLD MANAGER
                // ==========================================

                if (team.manager) {

                    await User.findByIdAndUpdate(
                        team.manager,
                        {
                            $set: {
                                team:
                                    null
                            }
                        }
                    );
                }

                // ==========================================
                // ASSIGN NEW MANAGER
                // ==========================================

                newManager.team =
                    team._id;

                await newManager.save();

                team.manager =
                    newManager._id;
            }
        }

        // ==========================================
        // SAVE TEAM
        // ==========================================

        await team.save();

        // ==========================================
        // RETURN UPDATED TEAM
        // ==========================================

        const updatedTeam =
            await Team.findById(
                team._id
            )
                .populate(
                    "manager",
                    "name email role status team"
                )
                .populate(
                    "executives",
                    "name email role status team"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        return res.status(200).json({
            success: true,

            message:
                "Team updated successfully",

            team:
                updatedTeam
        });

    } catch (error) {

        console.error(
            "Update Team Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to update team",

            error:
                error.message
        });
    }
};


// ==========================================
// DELETE TEAM
// ==========================================

const deleteTeam = async (
    req,
    res
) => {
    try {

        const {
            id
        } = req.params;

        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }

        // ==========================================
        // RELEASE MANAGER
        // ==========================================

        if (team.manager) {

            await User.findByIdAndUpdate(
                team.manager,
                {
                    $set: {
                        team:
                            null
                    }
                }
            );
        }

        // ==========================================
        // RELEASE EXECUTIVES
        // ==========================================

        if (
            team.executives &&
            team.executives.length > 0
        ) {

            await User.updateMany(
                {
                    _id: {
                        $in:
                            team.executives
                    }
                },
                {
                    $set: {
                        team:
                            null
                    }
                }
            );
        }

        // ==========================================
        // DELETE TEAM
        // ==========================================

        await Team.findByIdAndDelete(
            id
        );

        return res.status(200).json({
            success: true,

            message:
                "Team deleted successfully. Manager and executives are available again."
        });

    } catch (error) {

        console.error(
            "Delete Team Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to delete team",

            error:
                error.message
        });
    }
};


// ==========================================
// ADD EXECUTIVE TO TEAM
// ==========================================

const addExecutiveToTeam = async (
    req,
    res
) => {
    try {

        const {
            id,
            userId
        } = req.params;

        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }

        // ==========================================
        // FIND EXECUTIVE
        // ==========================================

        const executive =
            await User.findById(
                userId
            );

        if (!executive) {
            return res.status(404).json({
                success: false,
                message:
                    "Executive not found"
            });
        }

        // ==========================================
        // CHECK ROLE
        // ==========================================

        if (
            executive.role !==
            "EXECUTIVE"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Only Executives can be added to a team"
            });
        }

        // ==========================================
        // CHECK ALREADY IN THIS TEAM
        // ==========================================

        const alreadyInTeam =
            team.executives.some(
                (executiveId) =>
                    executiveId.toString() ===
                    userId.toString()
            );

        if (alreadyInTeam) {
            return res.status(400).json({
                success: false,
                message:
                    "Executive is already part of this team"
            });
        }

        // ==========================================
        // ONE EXECUTIVE = ONE TEAM
        // ==========================================

        if (executive.team) {
            return res.status(400).json({
                success: false,
                message:
                    "This Executive is already assigned to a team"
            });
        }

        // ==========================================
        // ADD EXECUTIVE
        // ==========================================

        team.executives.push(
            executive._id
        );

        await team.save();

        // ==========================================
        // UPDATE EXECUTIVE
        // ==========================================

        executive.team =
            team._id;

        await executive.save();

        // ==========================================
        // RETURN UPDATED TEAM
        // ==========================================

        const updatedTeam =
            await Team.findById(
                team._id
            )
                .populate(
                    "manager",
                    "name email role status team"
                )
                .populate(
                    "executives",
                    "name email role status team"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        return res.status(200).json({
            success: true,

            message:
                "Executive added to team successfully",

            team:
                updatedTeam
        });

    } catch (error) {

        console.error(
            "Add Executive Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to add executive",

            error:
                error.message
        });
    }
};


// ==========================================
// REMOVE EXECUTIVE FROM TEAM
// ==========================================

const removeExecutiveFromTeam = async (
    req,
    res
) => {
    try {

        const {
            id,
            userId
        } = req.params;

        // ==========================================
        // FIND TEAM
        // ==========================================

        const team =
            await Team.findById(id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message:
                    "Team not found"
            });
        }

        // ==========================================
        // FIND EXECUTIVE
        // ==========================================

        const executive =
            await User.findById(
                userId
            );

        if (!executive) {
            return res.status(404).json({
                success: false,
                message:
                    "Executive not found"
            });
        }

        // ==========================================
        // CHECK EXECUTIVE BELONGS TO TEAM
        // ==========================================

        const executiveExists =
            team.executives.some(
                (executiveId) =>
                    executiveId.toString() ===
                    userId.toString()
            );

        if (!executiveExists) {
            return res.status(400).json({
                success: false,
                message:
                    "Executive is not part of this team"
            });
        }

        // ==========================================
        // REMOVE EXECUTIVE FROM TEAM
        // ==========================================

        team.executives =
            team.executives.filter(
                (executiveId) =>
                    executiveId.toString() !==
                    userId.toString()
            );

        await team.save();

        // ==========================================
        // RELEASE EXECUTIVE
        // ==========================================

        executive.team =
            null;

        await executive.save();

        // ==========================================
        // RETURN UPDATED TEAM
        // ==========================================

        const updatedTeam =
            await Team.findById(
                team._id
            )
                .populate(
                    "manager",
                    "name email role status team"
                )
                .populate(
                    "executives",
                    "name email role status team"
                )
                .populate(
                    "createdBy",
                    "name email"
                );

        return res.status(200).json({
            success: true,

            message:
                "Executive removed from team successfully",

            team:
                updatedTeam
        });

    } catch (error) {

        console.error(
            "Remove Executive Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Failed to remove executive",

            error:
                error.message
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addExecutiveToTeam,
    removeExecutiveFromTeam
};