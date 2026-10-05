const mongoose = require("mongoose");

const Lead = require("../models/lead");
const Team = require("../models/team");


// ============================================================
// HELPERS
// ============================================================

const getUserType = (req) => {
    return (
        req.user?.userType ||
        req.user?.role ||
        ""
    ).toUpperCase();
};


const getLoggedInUserId = (req) => {
    return (
        req.user?.userId ||
        req.user?._id ||
        null
    );
};


// ============================================================
// GET FINISHED LEADS
// GET /api/finished-leads
// ============================================================

const getFinishedLeads = async (req, res) => {

    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);


        // ----------------------------------------------------
        // PERMISSION
        // ----------------------------------------------------

        if (
            userType !== "SUPER_ADMIN" &&
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER" &&
            userType !== "EXECUTIVE" &&
            userType !== "USER_EXECUTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view finished leads."
            });

        }


        // ----------------------------------------------------
        // BASE QUERY
        // ----------------------------------------------------

        let query = {

            latestRemark: {
                $in: [
                    "ENROLLED",
                    "NOT_INTERESTED"
                ]
            }

        };


        // ====================================================
        // SUPER ADMIN
        // ====================================================

        if (
            userType === "SUPER_ADMIN"
        ) {

            // Can see all finished leads.

        }


        // ====================================================
        // MANAGER
        // ====================================================

        else if (
            userType === "MANAGER" ||
            userType === "USER_MANAGER"
        ) {

            if (
                !userId ||
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Unable to identify logged-in manager."
                });

            }


            const team =
                await Team.findOne({

                    manager: userId,

                    status: "ACTIVE"

                }).select(
                    "_id manager executives status"
                );


            const executiveIds =
                team?.executives || [];


            query.leadOwner = {
                $in: [
                    userId,
                    ...executiveIds
                ]
            };

        }


        // ====================================================
        // EXECUTIVE
        // ====================================================

        else if (
            userType === "EXECUTIVE" ||
            userType === "USER_EXECUTIVE"
        ) {

            if (
                !userId ||
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Unable to identify logged-in executive."
                });

            }


            query.leadOwner =
                userId;

        }


        // ----------------------------------------------------
        // FETCH FINISHED LEADS
        // ----------------------------------------------------

        const leads =
            await Lead.find(query)

                .populate(
                    "leadOwner",
                    "name email role status"
                )

                .populate(
                    "followUpCompletedBy",
                    "name email role status"
                )

                .sort({
                    createdAt: -1
                });


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.json({

            success: true,

            count:
                leads.length,

            leads

        });

    } catch (error) {

        console.error(
            "Get finished leads error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching finished leads."

        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getFinishedLeads

};