const mongoose = require("mongoose");

const Lead = require("../models/lead");
const LeadHistory = require("../models/leadHistory");
const Team = require("../models/team");


// ==========================================
// GET LOGGED-IN USER ID
// ==========================================

const getLoggedInUserId = (req) => {
    return (
        req.user?._id ||
        req.user?.userId ||
        req.user?.id
    );
};


// ==========================================
// GET NORMALIZED USER TYPE
// ==========================================

const getUserType = (req) => {

    const rawUserType =
        req.user?.userType ||
        req.user?.role ||
        "";

    return rawUserType
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
};


// ==========================================
// GET LEAD HISTORY
// ==========================================

const getLeadHistory = async (req, res) => {

    try {

        const { leadId } = req.params;


        // ==========================================
        // VALIDATE LEAD ID
        // ==========================================

        if (!mongoose.Types.ObjectId.isValid(leadId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid lead ID."
            });

        }


        // ==========================================
        // FIND LEAD
        // ==========================================

        const lead = await Lead.findById(leadId);

        if (!lead) {

            return res.status(404).json({
                success: false,
                message: "Lead not found."
            });

        }


        // ==========================================
        // GET USER INFORMATION
        // ==========================================

        const userType = getUserType(req);
        const userId = getLoggedInUserId(req);


        console.log("==========================================");
        console.log("GET LEAD HISTORY - USER INFORMATION");
        console.log("req.user:", req.user);
        console.log("normalized userType:", userType);
        console.log("userId:", userId);
        console.log("leadOwner:", lead.leadOwner);
        console.log("==========================================");


        // ==========================================
        // CHECK AUTHENTICATION
        // ==========================================

        if (!userId) {

            return res.status(401).json({
                success: false,
                message:
                    "User authentication information is missing."
            });

        }


        // ==========================================
        // CHECK USER ROLE
        // ==========================================

        if (
            userType !== "SUPER_ADMIN" &&
            userType !== "MANAGER" &&
            userType !== "EXECUTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view lead history."
            });

        }


        // ==========================================
        // SUPER ADMIN ACCESS
        // ==========================================

        if (userType === "SUPER_ADMIN") {

            // Super Admin can view history
            // for any lead.

        }


        // ==========================================
        // MANAGER ACCESS
        // ==========================================

        else if (userType === "MANAGER") {

            // ==========================================
            // LEAD MUST HAVE AN OWNER
            // ==========================================

            if (!lead.leadOwner) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This lead is not assigned to any user."
                });

            }


            // ==========================================
            // FIND MANAGER'S ACTIVE TEAM
            // ==========================================

            const team = await Team.findOne({
                manager: userId,
                status: "ACTIVE"
            }).select(
                "_id manager executives status"
            );


            // ==========================================
            // GET EXECUTIVES
            // ==========================================

            const executiveIds =
                team?.executives || [];


            // ==========================================
            // ALLOWED LEAD OWNERS
            // ==========================================
            //
            // Manager can view history for:
            //
            // 1. Their own leads
            // 2. Their executives' leads
            //
            // ==========================================

            const allowedOwnerIds = [
                userId,
                ...executiveIds
            ].map(
                id => id.toString()
            );


            // ==========================================
            // CHECK LEAD OWNER
            // ==========================================

            if (
                !allowedOwnerIds.includes(
                    lead.leadOwner.toString()
                )
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this lead history."
                });

            }

        }


        // ==========================================
        // EXECUTIVE ACCESS
        // ==========================================

        else if (userType === "EXECUTIVE") {

            // ==========================================
            // LEAD MUST HAVE AN OWNER
            // ==========================================

            if (!lead.leadOwner) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This lead is not assigned to any user."
                });

            }


            // ==========================================
            // EXECUTIVE CAN ONLY VIEW OWN LEADS
            // ==========================================

            if (
                lead.leadOwner.toString() !==
                userId.toString()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this lead history."
                });

            }

        }


        // ==========================================
        // GET HISTORY
        // ==========================================

        const history = await LeadHistory.find({
            lead: leadId
        })
            .populate(
                "changedBy",
                "name email userType role"
            )
            .sort({
                createdAt: -1
            });


        // ==========================================
        // SUCCESS RESPONSE
        // ==========================================

        return res.status(200).json({

            success: true,

            history

        });


    } catch (error) {

        console.error(
            "Get lead history error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching lead history."

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getLeadHistory
};