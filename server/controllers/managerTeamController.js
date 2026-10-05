const User = require("../models/user");

const ACTIVITY_TIMEOUT_MINUTES = 30;

const ACTIVITY_TIMEOUT_MS =
    ACTIVITY_TIMEOUT_MINUTES * 60 * 1000;


// ==================================================
// GET MANAGER'S TEAM
// ==================================================

const getMyTeam = async (req, res) => {
    try {

        // ------------------------------------------
        // GET LOGGED-IN USER
        // ------------------------------------------

        const managerId =
            req.user?.userId;

        const userType =
            String(
                req.user?.userType ||
                req.user?.role ||
                ""
            ).toUpperCase();


        // ------------------------------------------
        // VALIDATE MANAGER
        // ------------------------------------------

        if (!managerId) {
            return res.status(401).json({
                success: false,
                message: "Authentication information is missing"
            });
        }

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Managers can access their team"
            });
        }


        // ------------------------------------------
        // FIND MANAGER
        // ------------------------------------------

        const manager =
            await User.findById(managerId)
                .select("_id name email role team");


        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Manager not found"
            });
        }


        // ------------------------------------------
        // CHECK TEAM
        // ------------------------------------------

        if (!manager.team) {
            return res.status(200).json({
                success: true,
                team: null,
                members: [],
                totalMembers: 0,
                activeMembers: 0,
                inactiveMembers: 0
            });
        }


        // ------------------------------------------
        // FIND TEAM MEMBERS
        // ------------------------------------------

        const members =
            await User.find({
                team: manager.team,
                role: "EXECUTIVE"
            })
                .select(
                    "_id name email role status " +
                    "lastActivityAt refreshTokenHash " +
                    "refreshTokenExpiresAt createdAt"
                )
                .sort({
                    name: 1
                });


        // ------------------------------------------
        // CURRENT TIME
        // ------------------------------------------

        const now =
            Date.now();


        // ------------------------------------------
        // CALCULATE ACTIVITY STATUS
        // ------------------------------------------

        const formattedMembers =
            members.map((member) => {

                let isActive = false;


                // ----------------------------------
                // CHECK LAST ACTIVITY
                // ----------------------------------

                if (
                    member.lastActivityAt &&
                    member.refreshTokenHash &&
                    member.refreshTokenExpiresAt
                ) {

                    const lastActivity =
                        new Date(
                            member.lastActivityAt
                        ).getTime();

                    const refreshTokenExpiry =
                        new Date(
                            member.refreshTokenExpiresAt
                        ).getTime();

                    const inactiveTime =
                        now - lastActivity;


                    // ----------------------------------
                    // ACTIVE CONDITIONS
                    // ----------------------------------

                    if (
                        member.status === "ACTIVE" &&
                        inactiveTime < ACTIVITY_TIMEOUT_MS &&
                        refreshTokenExpiry > now
                    ) {
                        isActive = true;
                    }
                }


                // ----------------------------------
                // RETURN SAFE DATA
                // ----------------------------------

                return {
                    id: member._id,

                    name:
                        member.name,

                    email:
                        member.email,

                    role:
                        member.role,

                    // Account status
                    accountStatus:
                        member.status,

                    // Online/activity status
                    activityStatus:
                        isActive
                            ? "ACTIVE"
                            : "INACTIVE",

                    lastActivityAt:
                        member.lastActivityAt,

                    createdAt:
                        member.createdAt
                };
            });


        // ------------------------------------------
        // COUNTS
        // ------------------------------------------

        const activeMembers =
            formattedMembers.filter(
                (member) =>
                    member.activityStatus === "ACTIVE"
            ).length;


        const inactiveMembers =
            formattedMembers.length -
            activeMembers;


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({

            success: true,

            team:
                manager.team,

            members:
                formattedMembers,

            totalMembers:
                formattedMembers.length,

            activeMembers,

            inactiveMembers
        });


    } catch (error) {

        console.error(
            "Get Manager Team Error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to get team"
        });
    }
};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
    getMyTeam
};