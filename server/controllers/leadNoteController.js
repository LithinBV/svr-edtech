const mongoose = require("mongoose");

const Lead = require("../models/lead");
const LeadNote = require("../models/leadNote");
const Team = require("../models/team");

const { createLeadHistory } = require("../utils/leadHistory");


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
// NORMALIZE USER TYPE
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
// GET CREATED BY MODEL
// ==========================================

const getCreatedByModel = (userType) => {

    switch (userType) {

        case "SUPER_ADMIN":
            return "SuperAdmin";

        case "INSTITUTION_ADMIN":
            return "InstitutionAdmin";

        case "MANAGER":
        case "EXECUTIVE":
            return "User";

        default:
            return null;
    }

};


// ==========================================
// GET NOTES FOR A LEAD
// ==========================================

const getLeadNotes = async (req, res) => {

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
        console.log("LEAD NOTES - USER INFORMATION");
        console.log("req.user:", req.user);
        console.log("userType:", userType);
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
        // CHECK USER TYPE
        // ==========================================

        if (
            userType !== "SUPER_ADMIN" &&
            userType !== "MANAGER" &&
            userType !== "EXECUTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view these notes."
            });

        }


        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (userType === "SUPER_ADMIN") {

            // Super Admin can view notes
            // for any lead.

        }


        // ==========================================
        // MANAGER ACCESS
        // ==========================================

        else if (userType === "MANAGER") {

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


            const executiveIds =
                team?.executives || [];


            // ==========================================
            // ALLOWED LEAD OWNERS
            // ==========================================
            // Manager can access:
            // 1. Their own leads
            // 2. Their executives' leads
            // ==========================================

            const allowedOwnerIds = [
                userId,
                ...executiveIds
            ].map(
                id => id.toString()
            );


            if (
                !allowedOwnerIds.includes(
                    lead.leadOwner.toString()
                )
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this lead."
                });

            }

        }


        // ==========================================
        // EXECUTIVE ACCESS
        // ==========================================

        else if (userType === "EXECUTIVE") {

            if (!lead.leadOwner) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This lead is not assigned to any user."
                });

            }


            // Executive can view only
            // their own leads.

            if (
                lead.leadOwner.toString() !==
                userId.toString()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this lead."
                });

            }

        }


        // ==========================================
        // GET NOTES
        // ==========================================

        const notes = await LeadNote.find({
            lead: leadId
        })
            .populate({
                path: "createdBy",
                select: "name email userType role"
            })
            .sort({
                createdAt: -1
            });


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,
            notes
        });


    } catch (error) {

        console.error(
            "Get lead notes error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching notes."
        });

    }

};


// ==========================================
// ADD NOTE TO A LEAD
// ==========================================

const addLeadNote = async (req, res) => {

    try {

        const { leadId } = req.params;
        const { note } = req.body;


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
        // VALIDATE NOTE
        // ==========================================

        if (
            !note ||
            typeof note !== "string" ||
            !note.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Note cannot be empty."
            });

        }


        const trimmedNote = note.trim();


        // ==========================================
        // CHECK NOTE LENGTH
        // ==========================================

        if (trimmedNote.length > 5000) {

            return res.status(400).json({
                success: false,
                message:
                    "Note cannot exceed 5000 characters."
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
        console.log("ADD LEAD NOTE - USER INFORMATION");
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
        // CHECK USER TYPE
        // ==========================================

        if (
            userType !== "SUPER_ADMIN" &&
            userType !== "MANAGER" &&
            userType !== "EXECUTIVE"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to add notes."
            });

        }


        // ==========================================
        // GET AUTHOR MODEL
        // ==========================================

        const createdByModel =
            getCreatedByModel(userType);


        if (!createdByModel) {

            return res.status(403).json({
                success: false,
                message:
                    "Unable to determine note author."
            });

        }


        // ==========================================
        // SUPER ADMIN
        // ==========================================

        if (userType === "SUPER_ADMIN") {

            // Super Admin can add notes
            // to any lead.

        }


        // ==========================================
        // MANAGER ACCESS
        // ==========================================

        else if (userType === "MANAGER") {

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


            const executiveIds =
                team?.executives || [];


            // ==========================================
            // ALLOWED LEAD OWNERS
            // ==========================================
            // Manager can add notes to:
            // 1. Their own leads
            // 2. Their executives' leads
            // ==========================================

            const allowedOwnerIds = [
                userId,
                ...executiveIds
            ].map(
                id => id.toString()
            );


            if (
                !allowedOwnerIds.includes(
                    lead.leadOwner.toString()
                )
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to add a note to this lead."
                });

            }

        }


        // ==========================================
        // EXECUTIVE ACCESS
        // ==========================================

        else if (userType === "EXECUTIVE") {

            if (!lead.leadOwner) {

                return res.status(403).json({
                    success: false,
                    message:
                        "This lead is not assigned to any user."
                });

            }


            // Executive can add notes only
            // to their own leads.

            if (
                lead.leadOwner.toString() !==
                userId.toString()
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to add a note to this lead."
                });

            }

        }


        // ==========================================
        // CREATE NOTE
        // ==========================================

        const newNote = await LeadNote.create({

            lead: leadId,

            createdBy: userId,

            createdByModel: createdByModel,

            note: trimmedNote

        });


        // ==========================================
        // POPULATE AUTHOR
        // ==========================================

        await newNote.populate({
            path: "createdBy",
            select: "name email userType role"
        });


        // ==========================================
        // CREATE HISTORY
        // ==========================================

        try {

            await createLeadHistory({

                leadId: leadId,

                action: "NOTE_ADDED",

                changedBy: userId,

                field: "note",

                oldValue: null,

                newValue: trimmedNote

            });

        } catch (historyError) {

            console.error(
                "Lead history error while adding note:",
                historyError
            );

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message: "Note added successfully.",

            note: newNote

        });

    } catch (error) {

        console.error(
            "Add lead note error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while adding note."

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getLeadNotes,
    addLeadNote
};