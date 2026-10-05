const mongoose = require("mongoose");

const Lead = require("../models/lead");
const User = require("../models/user");
const Team = require("../models/team");

const {
    createLeadHistory
} = require("../utils/leadHistory");

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


function isSuperAdmin(req) {
    return getUserType(req) === "SUPER_ADMIN";
}


function isManagerOrExecutive(req) {
    const userType = getUserType(req);

    return (
        userType === "MANAGER" ||
        userType === "EXECUTIVE" ||
        userType === "USER_MANAGER" ||
        userType === "USER_EXECUTIVE"
    );
}


function getLoggedInUserId(req) {
    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId
    );
}


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidProgramForLeadType(
    leadType,
    programInterest
) {
    if (leadType === "IT") {
        return [
            "Full Stack",
            "Data Analysis",
            "Data Science"
        ].includes(programInterest);
    }

    if (leadType === "Non-IT") {
        return [
            "HR",
            "DM"
        ].includes(programInterest);
    }

    return false;
}


// ============================================================
// ALLOWED VALUES
// ============================================================

const ALLOWED_STATUSES = [
    "NEW",
    "COLD",
    "WARM",
    "HOT"
];


const ALLOWED_REMARKS = [
    "RNR",
    "CALLBACK",
    "INTERESTED",
    "NOT_INTERESTED",
    "SWITCHED_OFF",
    "WRONG_NUMBER",
    "INVALID_LEAD"
];


const ALLOWED_LATEST_REMARKS = [
    "INTERESTED",
    "NOT_INTERESTED",
    "WALKING_IN",
    "ENROLLED",
    "RNR"
];


const ALLOWED_SOURCES = [
    "FB / Meta",
    "College campaign",
    "LinkedIn",
    "Referral",
    "Inbound"
];


const ALLOWED_LEAD_TYPES = [
    "IT",
    "Non-IT"
];


// ============================================================
// CREATE LEAD
// POST /api/leads
// ============================================================

const createLead = async (req, res) => {
    try {

        if (!isSuperAdmin(req)) {
            return res.status(403).json({
                success: false,
                message:
                    "Only Super Admin can create leads."
            });
        }


        const {
            name,
            email,
            contact,
            gender,
            state,
            district,
            collegeName,
            department,
            ugYearOfPassout,
            pgYearOfPassout,
            leadOwner,
            leadSource,
            leadType,
            programInterest
        } = req.body;


        // ----------------------------------------------------
        // REQUIRED FIELDS
        // ----------------------------------------------------

        if (
            !name ||
            !email ||
            !contact ||
            !gender ||
            !state ||
            !district ||
            !collegeName ||
            !department ||
            !ugYearOfPassout ||
            !leadOwner ||
            !leadSource ||
            !leadType ||
            !programInterest
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all required lead details."
            });
        }


        // ----------------------------------------------------
        // CLEAN VALUES
        // ----------------------------------------------------

        const cleanedName =
            String(name).trim();

        const cleanedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanedContact =
            String(contact).trim();

        const cleanedGender =
            String(gender).trim();

        const ALLOWED_GENDERS = [
            "Male",
            "Female",
            "Other",
            "Prefer not to say"
        ];

        if (
            !ALLOWED_GENDERS.includes(
                cleanedGender
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid gender."
            });
        }

        const cleanedState =
            String(state).trim();

        const cleanedDistrict =
            String(district).trim();

        const cleanedCollegeName =
            String(collegeName).trim();

        const cleanedDepartment =
            String(department).trim();


        // ----------------------------------------------------
        // VALIDATE EMAIL
        // ----------------------------------------------------

        if (!isValidEmail(cleanedEmail)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid email address."
            });
        }


        // ----------------------------------------------------
        // VALIDATE CONTACT
        // ----------------------------------------------------

        if (
            !/^[0-9+\-\s()]{7,20}$/.test(
                cleanedContact
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide a valid contact number."
            });
        }


        // ----------------------------------------------------
        // VALIDATE UG YEAR
        // ----------------------------------------------------

        const ugYear =
            Number(ugYearOfPassout);

        if (
            !Number.isInteger(ugYear) ||
            ugYear < 1900 ||
            ugYear > 2100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid UG year of passout."
            });
        }


        // ----------------------------------------------------
        // VALIDATE PG YEAR
        // ----------------------------------------------------

        let pgYear = null;

        if (
            pgYearOfPassout !== undefined &&
            pgYearOfPassout !== null &&
            String(pgYearOfPassout).trim() !== ""
        ) {

            pgYear =
                Number(pgYearOfPassout);

            if (
                !Number.isInteger(pgYear) ||
                pgYear < 1900 ||
                pgYear > 2100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid PG year of passout."
                });
            }
        }


        // ----------------------------------------------------
        // VALIDATE OWNER ID
        // ----------------------------------------------------

        if (
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
        // FIND OWNER
        // ----------------------------------------------------

        const owner =
            await User.findOne({
                _id: leadOwner,
                role: {
                    $in: [
                        "MANAGER",
                        "EXECUTIVE"
                    ]
                }
            }).select(
                "_id name email role status"
            );


        if (!owner) {
            return res.status(400).json({
                success: false,
                message:
                    "Lead owner must be an existing Manager or Executive."
            });
        }


        // ----------------------------------------------------
        // VALIDATE SOURCE
        // ----------------------------------------------------

        if (
            !ALLOWED_SOURCES.includes(
                leadSource
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead source."
            });
        }


        // ----------------------------------------------------
        // VALIDATE LEAD TYPE
        // ----------------------------------------------------

        if (
            !ALLOWED_LEAD_TYPES.includes(
                leadType
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead type."
            });
        }


        // ----------------------------------------------------
        // VALIDATE PROGRAM
        // ----------------------------------------------------

        if (
            !isValidProgramForLeadType(
                leadType,
                programInterest
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Selected program is not valid for the selected lead type."
            });
        }


        // ----------------------------------------------------
        // CREATE LEAD
        // ----------------------------------------------------

        const lead =
            new Lead({

                name:
                    cleanedName,

                email:
                    cleanedEmail,

                contact:
                    cleanedContact,

                gender:
                    cleanedGender,

                state:
                    cleanedState,

                district:
                    cleanedDistrict,

                collegeName:
                    cleanedCollegeName,

                department:
                    cleanedDepartment,

                ugYearOfPassout:
                    ugYear,

                pgYearOfPassout:
                    pgYear,

                leadOwner:
                    owner._id,

                leadSource,

                leadType,

                programInterest,

                status:
                    "NEW",

                remarks:
                    null,

                latestRemark:
                    null,

                followUpAt:
                    null,

                followUpCompleted:
                    false,

                followUpCompletedAt:
                    null,

                followUpCompletedBy:
                    null
            });


        await lead.save();


        // ----------------------------------------------------
        // HISTORY
        // ----------------------------------------------------

        await createLeadHistory({
            leadId:
                lead._id,

            action:
                "LEAD_CREATED",

            changedBy:
                getLoggedInUserId(req)
        });


        await lead.populate({
            path:
                "leadOwner",

            select:
                "name email role status"
        });


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({
            success: true,

            message:
                "Lead created successfully.",

            lead: {
                id:
                    lead._id,

                name:
                    lead.name,

                email:
                    lead.email,

                contact:
                    lead.contact,

                gender:
                    lead.gender,

                state:
                    lead.state,

                district:
                    lead.district,

                collegeName:
                    lead.collegeName,

                department:
                    lead.department,

                ugYearOfPassout:
                    lead.ugYearOfPassout,

                pgYearOfPassout:
                    lead.pgYearOfPassout,

                leadOwner:
                    lead.leadOwner,

                leadSource:
                    lead.leadSource,

                leadType:
                    lead.leadType,

                programInterest:
                    lead.programInterest,

                status:
                    lead.status,

                remarks:
                    lead.remarks,

                latestRemark:
                    lead.latestRemark,

                followUpAt:
                    lead.followUpAt,

                followUpCompleted:
                    lead.followUpCompleted,

                followUpCompletedAt:
                    lead.followUpCompletedAt,

                followUpCompletedBy:
                    lead.followUpCompletedBy,

                createdAt:
                    lead.createdAt,

                updatedAt:
                    lead.updatedAt
            }
        });

    } catch (error) {

        console.error(
            "Create lead error:",
            error
        );


        if (
            error.name ===
            "ValidationError"
        ) {

            const messages =
                Object.values(
                    error.errors
                ).map(
                    item =>
                        item.message
                );

            return res.status(400).json({
                success: false,
                message:
                    messages.join(", ")
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Server error while creating lead."
        });
    }
};


// ============================================================
// GET LEADS
// GET /api/leads
// ============================================================

const getLeads = async (req, res) => {
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
            !isManagerOrExecutive(req)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view leads."
            });
        }


        // ----------------------------------------------------
        // QUERY
        // ----------------------------------------------------
        // ENROLLED and NOT_INTERESTED leads are finished leads.
        // They should not appear in the normal Leads page.
        // They are handled separately by Finished Leads.
        // ----------------------------------------------------

        let query = {
            latestRemark: {
                $nin: [
                    "ENROLLED",
                    "NOT_INTERESTED"
                ]
            }
        };


        if (
            userType === "SUPER_ADMIN"
        ) {

            // Super Admin can see all ACTIVE leads.
            // Finished leads are excluded above.

            query = {
                latestRemark: {
                    $nin: [
                        "ENROLLED",
                        "NOT_INTERESTED"
                    ]
                }
            };

        } else {

            if (
                !userId ||
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Unable to identify logged-in user."
                });
            }


            // Manager / Executive can only see
            // their own active leads.

            query = {
                leadOwner: userId,

                latestRemark: {
                    $nin: [
                        "ENROLLED",
                        "NOT_INTERESTED"
                    ]
                }
            };
        }


        // ----------------------------------------------------
        // STATUS FILTER
        // ----------------------------------------------------

        const {
            status
        } = req.query;


        if (
            status !== undefined &&
            status !== ""
        ) {

            if (
                !ALLOWED_STATUSES.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid lead status."
                });
            }


            query.status =
                status;
        }


        // ----------------------------------------------------
        // FETCH ALL ACTIVE LEADS
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
        // DYNAMIC FOLLOW-UP STATUS
        // ----------------------------------------------------

        const formattedLeads =
            leads.map((lead) => {

                const leadObject =
                    lead.toObject();

                const followUpInfo =
                    getFollowUpStatus(
                        lead
                    );


                return {

                    ...leadObject,

                    followUpStatus:
                        followUpInfo.followUpStatus,

                    displayFollowUpAt:
                        followUpInfo.displayFollowUpAt,

                    completedToday:
                        followUpInfo.completedToday,

                    hasNewFollowUp:
                        followUpInfo.hasNewFollowUp
                };

            });


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.json({

            success: true,

            count:
                formattedLeads.length,

            leads:
                formattedLeads

        });

    } catch (error) {

        console.error(
            "Get leads error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching leads."

        });

    }
};
// ============================================================
// GET SINGLE LEAD
// GET /api/leads/:id
// ============================================================

const getLeadById = async (req, res) => {
    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);

        const {
            id
        } = req.params;


        // ----------------------------------------------------
        // ID VALIDATION
        // ----------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead ID."
            });
        }


        // ----------------------------------------------------
        // QUERY
        // ----------------------------------------------------

        let query = {
            _id: id
        };


        // ----------------------------------------------------
        // SUPER ADMIN
        // ----------------------------------------------------

        if (
            userType === "SUPER_ADMIN"
        ) {

            // Super Admin can view any lead.

        }


        // ----------------------------------------------------
        // MANAGER
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // EXECUTIVE
        // ----------------------------------------------------

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
        // OTHER USERS
        // ----------------------------------------------------

        else {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view this lead."
            });

        }


        // ----------------------------------------------------
        // FIND LEAD
        // ----------------------------------------------------

        const lead =
            await Lead.findOne(query)
                .populate(
                    "leadOwner",
                    "name email role status"
                );


        // ----------------------------------------------------
        // LEAD NOT FOUND
        // ----------------------------------------------------

        if (!lead) {

            return res.status(404).json({
                success: false,
                message:
                    "Lead not found."
            });
        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        return res.json({
            success: true,

            lead: {
                ...lead.toObject(),

                ...getFollowUpStatus(lead)
            }
        });


    } catch (error) {

        console.error(
            "Get lead by ID error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while fetching lead."
        });

    }
};


// ============================================================
// UPDATE LEAD
// PUT /api/leads/:id
// ============================================================

const updateLead = async (req, res) => {
    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);

        const {
            id
        } = req.params;


        // ----------------------------------------------------
        // ID VALIDATION
        // ----------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead ID."
            });
        }


        // ----------------------------------------------------
        // PERMISSION QUERY
        // ----------------------------------------------------

        let query = {
            _id: id
        };


        // ====================================================
        // SUPER ADMIN
        // ====================================================

        if (
            userType === "SUPER_ADMIN"
        ) {

            // No owner restriction.

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


        // ====================================================
        // OTHER USERS
        // ====================================================

        else {

            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to update leads."
            });
        }


        // ----------------------------------------------------
        // FIND LEAD
        // ----------------------------------------------------

        const lead =
            await Lead.findOne(query);


        if (!lead) {
            return res.status(404).json({
                success: false,
                message:
                    "Lead not found."
            });
        }


        // ====================================================
        // OLD VALUES
        // ====================================================

        const oldLeadValues = {

            name:
                lead.name,

            email:
                lead.email,

            contact:
                lead.contact,

            gender:
                lead.gender,

            state:
                lead.state,

            district:
                lead.district,

            collegeName:
                lead.collegeName,

            department:
                lead.department,

            ugYearOfPassout:
                lead.ugYearOfPassout,

            pgYearOfPassout:
                lead.pgYearOfPassout,

            leadOwner:
                lead.leadOwner?.toString(),

            leadSource:
                lead.leadSource,

            leadType:
                lead.leadType,

            programInterest:
                lead.programInterest,

            status:
                lead.status,

            remarks:
                lead.remarks,

            latestRemark:
                lead.latestRemark
        };


        // ====================================================
        // REQUEST BODY
        // ====================================================

        const {
            name,
            email,
            contact,
            gender,
            state,
            district,
            collegeName,
            department,
            ugYearOfPassout,
            pgYearOfPassout,
            leadOwner,
            leadSource,
            leadType,
            programInterest,
            status,
            remarks,
            latestRemark
        } = req.body;


        // ====================================================
        // BASIC DETAILS
        // ====================================================

        if (name !== undefined) {

            const cleanedName =
                String(name).trim();

            if (!cleanedName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name cannot be empty."
                });
            }

            lead.name =
                cleanedName;
        }


        if (email !== undefined) {

            const cleanedEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            if (
                !isValidEmail(
                    cleanedEmail
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid email address."
                });
            }

            lead.email =
                cleanedEmail;
        }


        if (contact !== undefined) {

            const cleanedContact =
                String(contact).trim();

            if (
                !/^[0-9+\-\s()]{7,20}$/.test(
                    cleanedContact
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid contact number."
                });
            }

            lead.contact =
                cleanedContact;
        }


        if (gender !== undefined) {

            const cleanedGender =
                String(gender).trim();

            const ALLOWED_GENDERS = [
                "Male",
                "Female",
                "Other",
                "Prefer not to say"
            ];

            if (
                !ALLOWED_GENDERS.includes(
                    cleanedGender
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid gender."
                });
            }

            lead.gender =
                cleanedGender;
        }


        if (state !== undefined) {

            const cleanedState =
                String(state).trim();

            if (!cleanedState) {
                return res.status(400).json({
                    success: false,
                    message:
                        "State cannot be empty."
                });
            }

            lead.state =
                cleanedState;
        }


        if (district !== undefined) {

            const cleanedDistrict =
                String(district).trim();

            if (!cleanedDistrict) {
                return res.status(400).json({
                    success: false,
                    message:
                        "District cannot be empty."
                });
            }

            lead.district =
                cleanedDistrict;
        }


        if (collegeName !== undefined) {

            const cleanedCollegeName =
                String(collegeName).trim();

            if (!cleanedCollegeName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "College name cannot be empty."
                });
            }

            lead.collegeName =
                cleanedCollegeName;
        }


        if (department !== undefined) {

            const cleanedDepartment =
                String(department).trim();

            if (!cleanedDepartment) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Department cannot be empty."
                });
            }

            lead.department =
                cleanedDepartment;
        }


        // ====================================================
        // YEARS
        // ====================================================

        if (
            ugYearOfPassout !== undefined
        ) {

            const year =
                Number(
                    ugYearOfPassout
                );

            if (
                !Number.isInteger(year) ||
                year < 1900 ||
                year > 2100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid UG year."
                });
            }

            lead.ugYearOfPassout =
                year;
        }


        if (
            pgYearOfPassout !== undefined
        ) {

            if (
                pgYearOfPassout === null ||
                String(
                    pgYearOfPassout
                ).trim() === ""
            ) {

                lead.pgYearOfPassout =
                    null;

            } else {

                const year =
                    Number(
                        pgYearOfPassout
                    );

                if (
                    !Number.isInteger(year) ||
                    year < 1900 ||
                    year > 2100
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid PG year."
                    });
                }

                lead.pgYearOfPassout =
                    year;
            }
        }


        // ====================================================
        // OWNER
        // ====================================================

        if (
            leadOwner !== undefined
        ) {

            if (
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


            if (
                userType !== "SUPER_ADMIN"
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Managers and Executives cannot reassign leads."
                });
            }


            const owner =
                await User.findOne({
                    _id: leadOwner,
                    role: {
                        $in: [
                            "MANAGER",
                            "EXECUTIVE"
                        ]
                    }
                }).select(
                    "_id name email role status"
                );


            if (!owner) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Lead owner must be a Manager or Executive."
                });
            }


            lead.leadOwner =
                owner._id;
        }


        // ====================================================
        // SOURCE
        // ====================================================

        if (
            leadSource !== undefined
        ) {

            if (
                !ALLOWED_SOURCES.includes(
                    leadSource
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid lead source."
                });
            }

            lead.leadSource =
                leadSource;
        }


        // ====================================================
        // LEAD TYPE
        // ====================================================

        if (
            leadType !== undefined
        ) {

            if (
                !ALLOWED_LEAD_TYPES.includes(
                    leadType
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid lead type."
                });
            }

            lead.leadType =
                leadType;
        }


        // ====================================================
        // PROGRAM
        // ====================================================

        if (
            programInterest !== undefined
        ) {

            lead.programInterest =
                programInterest;
        }


        // ====================================================
        // VALIDATE TYPE + PROGRAM
        // ====================================================

        if (
            leadType !== undefined ||
            programInterest !== undefined
        ) {

            if (
                !isValidProgramForLeadType(
                    lead.leadType,
                    lead.programInterest
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Program is not valid for the selected lead type."
                });
            }
        }


        // ====================================================
        // STATUS
        // ====================================================

        if (
            status !== undefined
        ) {

            if (
                !ALLOWED_STATUSES.includes(
                    status
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid lead status."
                });
            }


            const oldStatus =
                lead.status;

            lead.status =
                status;


            if (
                oldStatus !== status
            ) {

                await createLeadHistory({

                    leadId:
                        lead._id,

                    action:
                        "STATUS_CHANGED",

                    changedBy:
                        userId,

                    field:
                        "status",

                    oldValue:
                        oldStatus,

                    newValue:
                        status
                });
            }
        }


        // ====================================================
        // REMARK
        // ====================================================

        if (
            remarks !== undefined
        ) {

            if (
                remarks !== null &&
                !ALLOWED_REMARKS.includes(
                    remarks
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid lead remark."
                });
            }


            const oldRemarks =
                lead.remarks || null;

            lead.remarks =
                remarks || null;


            if (
                oldRemarks !==
                lead.remarks
            ) {

                await createLeadHistory({

                    leadId:
                        lead._id,

                    action:
                        "REMARK_CHANGED",

                    changedBy:
                        userId,

                    field:
                        "remarks",

                    oldValue:
                        oldRemarks,

                    newValue:
                        lead.remarks
                });
            }
        }


        // ====================================================
        // LATEST REMARK
        // ====================================================

        if (
            latestRemark !== undefined
        ) {

            if (
                latestRemark !== null &&
                !ALLOWED_LATEST_REMARKS.includes(
                    latestRemark
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid latest remark."
                });
            }


            const oldLatestRemark =
                lead.latestRemark || null;

            lead.latestRemark =
                latestRemark || null;


            // ------------------------------------------------
            // HISTORY
            // ------------------------------------------------

            if (
                oldLatestRemark !==
                lead.latestRemark
            ) {

                await createLeadHistory({

                    leadId:
                        lead._id,

                    action:
                        "LATEST_REMARK_CHANGED",

                    changedBy:
                        userId,

                    field:
                        "latestRemark",

                    oldValue:
                        oldLatestRemark,

                    newValue:
                        lead.latestRemark
                });
            }
        }


        // ====================================================
        // SAVE
        // ====================================================

        await lead.save({
            validateModifiedOnly: true
        });


        // ====================================================
        // POPULATE
        // ====================================================

        await lead.populate({
            path:
                "leadOwner",

            select:
                "name email role status"
        });


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            message:
                "Lead updated successfully.",

            lead: {
                ...lead.toObject(),

                ...getFollowUpStatus(lead)
            }
        });

    } catch (error) {

        console.error(
            "Update lead error:",
            error
        );


        if (
            error.name ===
            "ValidationError"
        ) {

            const messages =
                Object.values(
                    error.errors
                ).map(
                    item =>
                        item.message
                );

            return res.status(400).json({

                success: false,

                message:
                    messages.join(", ")
            });
        }


        return res.status(500).json({

            success: false,

            message:
                "Server error while updating lead."
        });
    }
};


// ============================================================
// DELETE LEAD
// DELETE /api/leads/:id
// ============================================================

const deleteLead = async (req, res) => {
    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid lead ID."
            });
        }


        // ----------------------------------------------------
        // DELETE
        // ----------------------------------------------------

        const lead =
            await Lead.findByIdAndDelete(id);


        if (!lead) {
            return res.status(404).json({
                success: false,
                message:
                    "Lead not found."
            });
        }


        return res.json({
            success: true,
            message:
                "Lead deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete lead error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while deleting lead."
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    createLead,

    getLeads,

    getLeadById,

    updateLead,

    deleteLead
};