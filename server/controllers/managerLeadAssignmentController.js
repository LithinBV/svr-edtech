const mongoose = require("mongoose");

const Lead = require("../models/lead");
const Team = require("../models/team");
const User = require("../models/user");

const {
    getFollowUpStatus
} = require("./followUpController");


// ============================================================
// HELPERS
// ============================================================

function getUserType(req) {
    return String(
        req.user?.userType ||
        req.user?.role ||
        ""
    ).toUpperCase();
}


function getLoggedInUserId(req) {
    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId
    );
}


function isManager(req) {
    const userType = getUserType(req);

    return (
        userType === "MANAGER" ||
        userType === "USER_MANAGER"
    );
}


// ============================================================
// GET MANAGER TEAM
// ============================================================

async function getManagerTeam(managerId) {
    return await Team.findOne({
        manager: managerId,
        status: "ACTIVE"
    }).populate({
        path: "executives",
        select: "_id name email role userType status"
    });
}


// ============================================================
// GET TEAM EXECUTIVE IDS
// ============================================================

function getTeamExecutiveIds(team) {
    if (!team || !Array.isArray(team.executives)) {
        return [];
    }

    return team.executives.map((executive) => {
        return String(
            executive?._id ||
            executive
        );
    });
}


// ============================================================
// VALIDATE TARGET OWNER
//
// Allowed target:
// 1. Any ACTIVE MANAGER
// 2. ACTIVE EXECUTIVE belonging to current manager's team
// ============================================================

async function validateTargetOwner(
    leadOwner,
    managerId,
    team
) {
    // --------------------------------------------------------
    // Check ObjectId
    // --------------------------------------------------------

    if (
        !leadOwner ||
        !mongoose.Types.ObjectId.isValid(leadOwner)
    ) {
        return {
            valid: false,
            status: 400,
            message: "Invalid lead owner."
        };
    }


    // --------------------------------------------------------
    // Find target user
    // --------------------------------------------------------

    const targetOwner = await User.findById(
        leadOwner
    ).select(
        "_id name email role userType status"
    );


    if (!targetOwner) {
        return {
            valid: false,
            status: 404,
            message: "Target owner not found."
        };
    }


    // --------------------------------------------------------
    // Target must be active
    // --------------------------------------------------------

    if (
        String(targetOwner.status).toUpperCase() !==
        "ACTIVE"
    ) {
        return {
            valid: false,
            status: 400,
            message: "Target owner is inactive."
        };
    }


    // --------------------------------------------------------
    // Get target role
    // --------------------------------------------------------

    const targetRole = String(
        targetOwner.role ||
        targetOwner.userType ||
        ""
    ).toUpperCase();


    // --------------------------------------------------------
    // MANAGER
    //
    // Any active manager is allowed.
    // --------------------------------------------------------

    if (targetRole === "MANAGER") {
        return {
            valid: true,
            targetOwner,
            targetRole
        };
    }


    // --------------------------------------------------------
    // EXECUTIVE
    //
    // Executive must belong to current manager's team.
    // --------------------------------------------------------

    if (targetRole === "EXECUTIVE") {

        const executiveIds =
            getTeamExecutiveIds(team);


        const belongsToTeam =
            executiveIds.includes(
                String(leadOwner)
            );


        if (!belongsToTeam) {
            return {
                valid: false,
                status: 403,
                message:
                    "You can assign leads only to executives in your team."
            };
        }


        return {
            valid: true,
            targetOwner,
            targetRole
        };
    }


    // --------------------------------------------------------
    // INVALID ROLE
    // --------------------------------------------------------

    return {
        valid: false,
        status: 400,
        message:
            "Lead can only be assigned to a manager or executive."
    };
}


// ============================================================
// CHECK CURRENT LEAD OWNER
//
// Manager can only transfer:
// - Their own leads
// - Leads currently owned by their team executives
// ============================================================

function canManagerAccessLeadOwner(
    currentOwner,
    managerId,
    team
) {
    if (!currentOwner) {
        return false;
    }


    const currentOwnerId =
        String(currentOwner);


    // --------------------------------------------------------
    // Lead belongs directly to manager
    // --------------------------------------------------------

    if (
        currentOwnerId ===
        String(managerId)
    ) {
        return true;
    }


    // --------------------------------------------------------
    // Lead belongs to team executive
    // --------------------------------------------------------

    const executiveIds =
        getTeamExecutiveIds(team);


    return executiveIds.includes(
        currentOwnerId
    );
}


// ============================================================
// GET ALL ACTIVE MANAGERS
//
// GET /api/manager/leads/managers
// ============================================================

const getManagerLeadManagers = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------------
        // Check manager
        // ----------------------------------------------------

        if (!isManager(req)) {
            return res.status(403).json({
                success: false,
                message:
                    "Only managers can access managers."
            });
        }


        // ----------------------------------------------------
        // Get logged-in manager
        // ----------------------------------------------------

        const managerId =
            getLoggedInUserId(req);


        if (
            !managerId ||
            !mongoose.Types.ObjectId.isValid(
                managerId
            )
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unable to identify logged-in manager."
            });
        }


        // ----------------------------------------------------
        // Get active managers
        //
        // Exclude current manager from target list.
        // ----------------------------------------------------

        const managers =
            await User.find({
                role: "MANAGER",
                status: "ACTIVE",
                _id: {
                    $ne: managerId
                }
            })
                .select(
                    "_id name email role userType status"
                )
                .sort({
                    name: 1
                });


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.json({
            success: true,
            managers
        });

    } catch (error) {

        console.error(
            "Get manager lead managers error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching managers."
        });
    }
};


// ============================================================
// ASSIGN SINGLE MANAGER LEAD
//
// PUT /api/manager/leads/:leadId/assign
//
// Body:
// {
//     "leadOwner": "USER_ID"
// }
// ============================================================

const assignManagerLead = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);


        const managerId =
            getLoggedInUserId(req);


        const {
            leadId
        } = req.params;


        const {
            leadOwner
        } = req.body;


        // ----------------------------------------------------
        // Check manager
        // ----------------------------------------------------

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Manager can assign leads."
            });
        }


        // ----------------------------------------------------
        // Validate manager ID
        // ----------------------------------------------------

        if (
            !managerId ||
            !mongoose.Types.ObjectId.isValid(
                managerId
            )
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unable to identify logged-in manager."
            });
        }


        // ----------------------------------------------------
        // Validate lead ID
        // ----------------------------------------------------

        if (
            !leadId ||
            !mongoose.Types.ObjectId.isValid(
                leadId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead ID."
            });
        }


        // ----------------------------------------------------
        // Get manager team
        // ----------------------------------------------------

        const team =
            await getManagerTeam(
                managerId
            );


        // ----------------------------------------------------
        // Find lead
        // ----------------------------------------------------

        const lead =
            await Lead.findById(
                leadId
            );


        if (!lead) {
            return res.status(404).json({
                success: false,
                message:
                    "Lead not found."
            });
        }


        // ----------------------------------------------------
        // Check current owner
        // ----------------------------------------------------

        const currentOwner =
            lead.leadOwner
                ? String(lead.leadOwner)
                : null;


        if (
            !canManagerAccessLeadOwner(
                currentOwner,
                managerId,
                team
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can assign only leads owned by you or your team executives."
            });
        }


        // ----------------------------------------------------
        // Validate target owner
        // ----------------------------------------------------

        const targetValidation =
            await validateTargetOwner(
                leadOwner,
                managerId,
                team
            );


        if (!targetValidation.valid) {
            return res.status(
                targetValidation.status
            ).json({
                success: false,
                message:
                    targetValidation.message
            });
        }


        // ----------------------------------------------------
        // Prevent assigning to same owner
        // ----------------------------------------------------

        if (
            String(currentOwner) ===
            String(leadOwner)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Lead is already assigned to this owner."
            });
        }


        // ----------------------------------------------------
        // Store old owner
        // ----------------------------------------------------

        const previousOwner =
            lead.leadOwner
                ? String(lead.leadOwner)
                : null;


        // ----------------------------------------------------
        // Change ONLY leadOwner
        //
        // Follow-up data remains unchanged.
        // ----------------------------------------------------

        lead.leadOwner =
            leadOwner;


        await lead.save();


        // ----------------------------------------------------
        // Populate owner for response
        // ----------------------------------------------------

        await lead.populate({
            path: "leadOwner",
            select:
                "_id name email role userType status"
        });


        // ----------------------------------------------------
        // Follow-up status
        // ----------------------------------------------------

        const followUpInfo =
            getFollowUpStatus(
                lead
            );


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.json({
            success: true,

            message:
                "Lead assigned successfully.",

            lead: {
                ...lead.toObject(),

                previousOwner,

                followUpStatus:
                    followUpInfo.followUpStatus,

                displayFollowUpAt:
                    followUpInfo.displayFollowUpAt,

                completedToday:
                    followUpInfo.completedToday,

                hasNewFollowUp:
                    followUpInfo.hasNewFollowUp
            }
        });

    } catch (error) {

        console.error(
            "Assign manager lead error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while assigning lead.",
            error:
                error.message
        });
    }
};


// ============================================================
// BULK ASSIGN MANAGER LEADS
//
// PUT /api/manager/leads/assign-bulk
//
// Body:
// {
//     "leadIds": ["ID1", "ID2"],
//     "leadOwner": "USER_ID"
// }
// ============================================================

const assignManagerLeadsBulk = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);


        const managerId =
            getLoggedInUserId(req);


        const {
            leadIds,
            leadOwner
        } = req.body;


        // ----------------------------------------------------
        // Check manager
        // ----------------------------------------------------

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Manager can assign leads."
            });
        }


        // ----------------------------------------------------
        // Validate manager
        // ----------------------------------------------------

        if (
            !managerId ||
            !mongoose.Types.ObjectId.isValid(
                managerId
            )
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unable to identify logged-in manager."
            });
        }


        // ----------------------------------------------------
        // Validate lead IDs
        // ----------------------------------------------------

        if (
            !Array.isArray(leadIds) ||
            leadIds.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide at least one lead."
            });
        }


        // ----------------------------------------------------
        // Validate target owner ID
        // ----------------------------------------------------

        if (
            !leadOwner ||
            !mongoose.Types.ObjectId.isValid(
                leadOwner
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead owner."
            });
        }


        // ----------------------------------------------------
        // Validate every lead ID
        // ----------------------------------------------------

        const invalidLeadId =
            leadIds.find(
                id =>
                    !mongoose.Types.ObjectId.isValid(
                        id
                    )
            );


        if (invalidLeadId) {
            return res.status(400).json({
                success: false,
                message:
                    "One or more lead IDs are invalid."
            });
        }


        // ----------------------------------------------------
        // Get manager team
        // ----------------------------------------------------

        const team =
            await getManagerTeam(
                managerId
            );


        // ----------------------------------------------------
        // Validate target owner
        //
        // Manager = any active manager
        // Executive = current manager's team only
        // ----------------------------------------------------

        const targetValidation =
            await validateTargetOwner(
                leadOwner,
                managerId,
                team
            );


        if (!targetValidation.valid) {
            return res.status(
                targetValidation.status
            ).json({
                success: false,
                message:
                    targetValidation.message
            });
        }


        // ----------------------------------------------------
        // Remove duplicate lead IDs
        // ----------------------------------------------------

        const uniqueLeadIds =
            [
                ...new Set(
                    leadIds.map(
                        id => String(id)
                    )
                )
            ];


        // ----------------------------------------------------
        // Find leads
        // ----------------------------------------------------

        const leads =
            await Lead.find({
                _id: {
                    $in: uniqueLeadIds
                }
            }).select(
                "_id leadOwner"
            );


        // ----------------------------------------------------
        // Make sure every requested lead exists
        // ----------------------------------------------------

        const foundLeadIds =
            new Set(
                leads.map(
                    lead =>
                        String(lead._id)
                )
            );


        const missingLeadIds =
            uniqueLeadIds.filter(
                id =>
                    !foundLeadIds.has(
                        String(id)
                    )
            );


        if (
            missingLeadIds.length > 0
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "One or more leads were not found.",
                missingLeadIds
            });
        }


        // ----------------------------------------------------
        // Check lead ownership
        //
        // Manager can transfer:
        // - Own leads
        // - Team executive leads
        // ----------------------------------------------------

        const inaccessibleLeads =
            leads.filter(
                lead => {

                    const currentOwner =
                        lead.leadOwner
                            ? String(
                                lead.leadOwner
                            )
                            : null;

                    return !canManagerAccessLeadOwner(
                        currentOwner,
                        managerId,
                        team
                    );
                }
            );


        if (
            inaccessibleLeads.length > 0
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You can assign only leads owned by you or your team executives.",
                leadIds:
                    inaccessibleLeads.map(
                        lead =>
                            String(
                                lead._id
                            )
                    )
            });
        }


        // ----------------------------------------------------
        // Find leads already assigned to target
        // ----------------------------------------------------

        const alreadyAssigned =
            leads.filter(
                lead =>
                    String(
                        lead.leadOwner
                    ) ===
                    String(leadOwner)
            );


        // ----------------------------------------------------
        // Only update leads that actually need transfer
        // ----------------------------------------------------

        const leadsToUpdate =
            leads.filter(
                lead =>
                    String(
                        lead.leadOwner
                    ) !==
                    String(leadOwner)
            );


        // ----------------------------------------------------
        // If everything already belongs to target
        // ----------------------------------------------------

        if (
            leadsToUpdate.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "All selected leads are already assigned to this owner.",
                updatedCount: 0,
                alreadyAssignedCount:
                    alreadyAssigned.length
            });
        }


        // ----------------------------------------------------
        // Update ownership
        //
        // IMPORTANT:
        // Only leadOwner is changed.
        //
        // Follow-up fields remain untouched.
        // ----------------------------------------------------

        const leadsToUpdateIds =
            leadsToUpdate.map(
                lead =>
                    lead._id
            );


        const updateResult =
            await Lead.updateMany(
                {
                    _id: {
                        $in:
                            leadsToUpdateIds
                    },

                    // Extra protection:
                    // only leads still owned by
                    // manager/team executives
                    leadOwner: {
                        $in: [
                            managerId,

                            ...getTeamExecutiveIds(
                                team
                            )
                        ]
                    }
                },

                {
                    $set: {
                        leadOwner:
                            leadOwner
                    }
                }
            );


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.json({

            success: true,

            message:
                "Leads assigned successfully.",

            requestedCount:
                uniqueLeadIds.length,

            updatedCount:
                updateResult.modifiedCount || 0,

            alreadyAssignedCount:
                alreadyAssigned.length,

            targetOwner: {
                _id:
                    targetValidation
                        .targetOwner
                        ._id,

                name:
                    targetValidation
                        .targetOwner
                        .name,

                email:
                    targetValidation
                        .targetOwner
                        .email,

                role:
                    targetValidation
                        .targetRole
            }

        });

    } catch (error) {

        console.error(
            "Bulk assign manager leads error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while assigning leads.",
            error:
                error.message
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getManagerLeadManagers,

    assignManagerLead,

    assignManagerLeadsBulk

};