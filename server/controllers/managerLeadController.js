// ============================================================
// MANAGER LEAD CONTROLLER
// ============================================================

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

// LINE 15
function getUserType(req) {

    return String(
        req.user?.userType ||
        req.user?.role ||
        ""
    ).toUpperCase();

}


// LINE 29
function getLoggedInUserId(req) {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId
    );

}


// LINE 40
function isManager(req) {

    const userType =
        getUserType(req);

    return (
        userType === "MANAGER" ||
        userType === "USER_MANAGER"
    );

}


// LINE 52
function parseDate(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return null;

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date;

}


// ============================================================
// GET MANAGER TEAM
// ============================================================

async function getManagerTeam(managerId) {

    return await Team.findOne({

        manager:
            managerId,

        status:
            "ACTIVE"

    }).populate({

        path:
            "executives",

        select:
            "_id name email role userType status"

    });

}


// ============================================================
// GET MANAGER LEADS
//
// GET /api/manager/leads
//
// Backend returns ALL matching leads.
// Frontend handles display pagination.
// ============================================================

const getManagerLeads = async (
    req,
    res
) => {

    try {

        // LINE 119
        const userType =
            getUserType(req);

        const managerId =
            getLoggedInUserId(req);


        // ====================================================
        // CHECK MANAGER
        // ====================================================

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Manager can access manager leads."

            });

        }


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


        // ====================================================
        // GET QUERY FILTERS
        // ====================================================

        const {
            status,
            executive,
            search,
            type
        } = req.query;


        // ====================================================
        // FIND MANAGER ACTIVE TEAM
        // ====================================================

        const team =
            await Team.findOne({

                manager:
                    managerId,

                status:
                    "ACTIVE"

            }).populate({

                path:
                    "executives",

                select:
                    "_id name email role userType status"

            });


        const executives =
            team?.executives || [];


        const executiveIds =
            executives.map(
                executive =>
                    executive._id
            );


        // ====================================================
        // BASE QUERY
        // ====================================================

        const query = {
    latestRemark: {
        $nin: [
            "ENROLLED",
            "NOT_INTERESTED"
        ]
    }
};


        // ====================================================
        // NORMALIZE FILTERS
        // ====================================================

        const normalizedType =
            String(
                type || "ALL"
            )
                .trim()
                .toUpperCase();


        const selectedExecutive =
            executive &&
            String(executive).trim() !== "" &&
            String(executive).toUpperCase() !== "ALL"

                ? String(executive).trim()

                : null;


        // ====================================================
// LEAD OWNER FILTER
//
// ALL:
// Manager + Executives
//
// DIRECT:
// Manager's leads
//
// EXECUTIVE:
// All executives' leads
//
// SPECIFIC EXECUTIVE:
// Selected executive's leads
// ====================================================

if (
    selectedExecutive
) {

    if (
        !mongoose.Types.ObjectId.isValid(
            selectedExecutive
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid executive ID."

        });

    }


    const belongsToTeam =
        executiveIds.some(
            id =>
                String(id) ===
                String(selectedExecutive)
        );


    if (
        !belongsToTeam
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Selected executive does not belong to your team."

        });

    }


    query.leadOwner =
        selectedExecutive;

}


else if (
    normalizedType === "DIRECT"
) {

    query.leadOwner =
        managerId;

}


else if (
    normalizedType === "EXECUTIVE"
) {

    query.leadOwner = {

        $in:
            executiveIds

    };

}


else {

    query.leadOwner = {

        $in: [

            managerId,

            ...executiveIds

        ]

    };

}


// ====================================================
// STATUS FILTER
// ====================================================

if (
    status &&
    String(status).trim() !== "" &&
    String(status).toUpperCase() !== "ALL"
) {

    query.status =
        String(status).trim();

}


// ====================================================
// SEARCH FILTER
// ====================================================

if (
    search &&
    String(search).trim() !== ""
) {

    const searchValue =
        String(search).trim();


    query.$or = [

        {

            name: {

                $regex:
                    searchValue,

                $options:
                    "i"

            }

        },

        {

            email: {

                $regex:
                    searchValue,

                $options:
                    "i"

            }

        },

        {

            contact: {

                $regex:
                    searchValue,

                $options:
                    "i"

            }

        },

        {

            collegeName: {

                $regex:
                    searchValue,

                $options:
                    "i"

            }

        },

        {

            department: {

                $regex:
                    searchValue,

                $options:
                    "i"

            }

        }

    ];

}

        // ====================================================
        // FETCH ALL MANAGER LEADS
        //
        // IMPORTANT:
        // NO backend pagination.
        //
        // No getPagination()
        // No countDocuments()
        // No .skip()
        // No .limit()
        //
        // Frontend will handle display pagination.
        // ====================================================

        const leads =
            await Lead.find(query)

                .populate(
                    "leadOwner",
                    "_id name email role userType status"
                )

                .populate(
                    "followUpCompletedBy",
                    "_id name email role userType status"
                )

                .sort({

                    createdAt:
                        -1

                });


        // ====================================================
        // DYNAMIC FOLLOW-UP STATUS
        // ====================================================

        const formattedLeads =
            leads.map(
                lead => {

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

                }
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success:
                true,

            count:
                formattedLeads.length,

            leads:
                formattedLeads

        });

    }


    catch (error) {

        console.error(
            "Get manager leads error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error while fetching manager leads.",

            error:
                error.message

        });

    }

};


// ============================================================
// GET MANAGER LEAD EXECUTIVES
//
// GET /api/manager/leads/executives
// ============================================================

const getManagerLeadExecutives = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const managerId =
            getLoggedInUserId(req);


        // ====================================================
        // CHECK MANAGER
        // ====================================================

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Manager can access executives."

            });

        }


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


        // ====================================================
        // FIND TEAM
        // ====================================================

        const team =
            await Team.findOne({

                manager:
                    managerId,

                status:
                    "ACTIVE"

            }).populate({

                path:
                    "executives",

                select:
                    "name email role status"

            });


        if (!team) {

            return res.json({

                success:
                    true,

                executives:
                    []

            });

        }


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success:
                true,

            executives:
                team.executives || []

        });

    }


    catch (error) {

        console.error(
            "Get manager executives error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error while fetching executives."

        });

    }

};


// ============================================================
// CREATE LEAD BY MANAGER
//
// POST /api/manager/leads
// ============================================================

const createManagerLead = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const managerId =
            getLoggedInUserId(req);


        // ====================================================
        // CHECK MANAGER
        // ====================================================

        if (
            userType !== "MANAGER" &&
            userType !== "USER_MANAGER"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Manager can create leads."

            });

        }


        // ====================================================
        // CHECK MANAGER ID
        // ====================================================

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
            programInterest
        } = req.body;


        // ====================================================
        // REQUIRED FIELDS
        // ====================================================

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


        // ====================================================
        // CLEAN VALUES
        // ====================================================

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

        const cleanedState =
            String(state).trim();

        const cleanedDistrict =
            String(district).trim();

        const cleanedCollegeName =
            String(collegeName).trim();

        const cleanedDepartment =
            String(department).trim();

        const cleanedLeadSource =
            String(leadSource).trim();

        const cleanedLeadType =
            String(leadType).trim();

        const cleanedProgramInterest =
            String(programInterest).trim();


        // ====================================================
        // GENDER
        // ====================================================

        const allowedGenders = [
            "Male",
            "Female",
            "Other",
            "Prefer not to say"
        ];


        if (
            !allowedGenders.includes(
                cleanedGender
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid gender."

            });

        }


        // ====================================================
        // EMAIL
        // ====================================================

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanedEmail
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid email address."

            });

        }


        // ====================================================
        // CONTACT
        // ====================================================

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


        // ====================================================
        // UG YEAR
        // ====================================================

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


        // ====================================================
        // PG YEAR
        // ====================================================

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


        // ====================================================
        // LEAD SOURCE
        // ====================================================

        const allowedSources = [
            "FB / Meta",
            "College campaign",
            "LinkedIn",
            "Referral",
            "Inbound"
        ];


        if (
            !allowedSources.includes(
                cleanedLeadSource
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid lead source."

            });

        }


        // ====================================================
        // LEAD TYPE
        // ====================================================

        const allowedLeadTypes = [
            "IT",
            "Non-IT"
        ];


        if (
            !allowedLeadTypes.includes(
                cleanedLeadType
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid lead type."

            });

        }


        // ====================================================
        // PROGRAM
        // ====================================================

        const validPrograms =
            cleanedLeadType === "IT"

                ? [
                    "Full Stack",
                    "Data Analysis",
                    "Data Science"
                ]

                : [
                    "HR",
                    "DM"
                ];


        if (
            !validPrograms.includes(
                cleanedProgramInterest
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Selected program is not valid for the selected lead type."

            });

        }


        // ====================================================
        // GET MANAGER TEAM
        // ====================================================

        const team =
            await getManagerTeam(
                managerId
            );


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Active team not found."

            });

        }


        // ====================================================
        // SELECT OWNER
        // ====================================================

        let leadOwnerId =
            managerId;


        if (leadOwner) {

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


            const selectedOwner =
                await User.findById(
                    leadOwner
                ).select(
                    "_id name email role userType status"
                );


            if (!selectedOwner) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Selected lead owner not found."

                });

            }


            if (
                String(
                    selectedOwner.status
                ).toUpperCase() !== "ACTIVE"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Selected lead owner is inactive."

                });

            }


            const selectedOwnerRole =
                String(
                    selectedOwner.role ||
                    selectedOwner.userType ||
                    ""
                ).toUpperCase();


            if (
                selectedOwnerRole === "MANAGER"
            ) {

                leadOwnerId =
                    selectedOwner._id;

            }


            else if (
                selectedOwnerRole === "EXECUTIVE"
            ) {

                const executiveIds =
                    (team.executives || []).map(
                        executive =>
                            String(
                                executive?._id ||
                                executive
                            )
                    );


                const belongsToTeam =
                    executiveIds.includes(
                        String(
                            selectedOwner._id
                        )
                    );


                if (!belongsToTeam) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "You can assign leads only to executives in your team."

                    });

                }


                leadOwnerId =
                    selectedOwner._id;

            }


            else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Lead can only be assigned to a manager or executive."

                });

            }

        }


        // ====================================================
        // CREATE LEAD
        // ====================================================

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
                    leadOwnerId,

                createdVia:
                    "MANUAL",

                leadSource:
                    cleanedLeadSource,

                leadType:
                    cleanedLeadType,

                programInterest:
                    cleanedProgramInterest,

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


        // ====================================================
        // SAVE
        // ====================================================

        await lead.save();


        // ====================================================
        // POPULATE OWNER
        // ====================================================

        await lead.populate({

            path:
                "leadOwner",

            select:
                "_id name email role status"

        });


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.status(201).json({

            success:
                true,

            message:
                "Lead created successfully.",

            lead: {

                ...lead.toObject(),

                ...getFollowUpStatus(
                    lead
                )

            }

        });

    }


    catch (error) {

        console.error(
            "Create manager lead error:",
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
                "Server error while creating manager lead.",

            error:
                error.message

        });

    }

};


// ============================================================
// BULK UPLOAD MANAGER LEADS
//
// POST /api/manager/leads/bulk-upload
// ============================================================

const bulkUploadManagerLeads = async (
    req,
    res
) => {

    try {

        // ====================================================
        // MANAGER CHECK
        // ====================================================

        if (
            !isManager(req)
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Only managers can bulk upload leads."

            });

        }


        // ====================================================
        // MANAGER ID
        // ====================================================

        const managerId =
            getLoggedInUserId(req);


        if (
            !managerId ||
            !mongoose.Types.ObjectId.isValid(
                managerId
            )
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Unable to identify logged-in manager."

            });

        }


        // ====================================================
        // GET MANAGER TEAM
        // ====================================================

        const team =
            await getManagerTeam(
                managerId
            );


        if (!team) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Active team not found."

            });

        }


        // ====================================================
        // INPUT
        // ====================================================

        const {
            rows,
            leadOwner
        } = req.body;


        if (
            !Array.isArray(rows) ||
            rows.length === 0
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "No lead data was provided."

            });

        }


        // ====================================================
        // EXECUTIVES
        // ====================================================

        const executiveIds =
            (team.executives || []).map(
                executive =>
                    String(
                        executive?._id ||
                        executive
                    )
            );


        // ====================================================
        // DEFAULT OWNER = MANAGER
        // ====================================================

        let leadOwnerId =
            managerId;


        let selectedOwner =
            null;


        // ====================================================
        // SELECT BULK UPLOAD OWNER
        //
        // Allowed:
        // 1. Any active manager
        // 2. Executive from current manager's team
        // ====================================================

        if (
            leadOwner
        ) {

            // ------------------------------------------------
            // Validate owner ID
            // ------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    leadOwner
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid lead owner."

                });

            }


            // ------------------------------------------------
            // Find selected owner
            // ------------------------------------------------

            selectedOwner =
                await User.findById(
                    leadOwner
                ).select(
                    "_id name email role userType status"
                );


            if (!selectedOwner) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Selected lead owner not found."

                });

            }


            // ------------------------------------------------
            // Owner must be active
            // ------------------------------------------------

            if (
                String(
                    selectedOwner.status
                ).toUpperCase() !== "ACTIVE"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Selected lead owner is inactive."

                });

            }


            // ------------------------------------------------
            // Get owner role
            // ------------------------------------------------

            const selectedOwnerRole =
                String(
                    selectedOwner.role ||
                    selectedOwner.userType ||
                    ""
                ).toUpperCase();


            // ------------------------------------------------
            // MANAGER
            // ------------------------------------------------

            if (
                selectedOwnerRole === "MANAGER"
            ) {

                leadOwnerId =
                    selectedOwner._id;

            }


            // ------------------------------------------------
            // EXECUTIVE
            // ------------------------------------------------

            else if (
                selectedOwnerRole === "EXECUTIVE"
            ) {

                if (
                    !executiveIds.includes(
                        String(
                            selectedOwner._id
                        )
                    )
                ) {

                    return res.status(403).json({

                        success:
                            false,

                        message:
                            "You can upload leads only for executives in your team."

                    });

                }


                leadOwnerId =
                    selectedOwner._id;

            }


            // ------------------------------------------------
            // INVALID ROLE
            // ------------------------------------------------

            else {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Lead can only be assigned to a manager or executive."

                });

            }

        }


        // ====================================================
        // RESULT ARRAYS
        // ====================================================

        const successfulLeads =
            [];

        const failedRows =
            [];


        // ====================================================
        // PREPARE / VALIDATE ALL ROWS
        // ====================================================

        const preparedRows =
            [];


        for (
            let index = 0;
            index < rows.length;
            index++
        ) {

            const row =
                rows[index];


            try {

                // ==================================================
                // BASIC FIELDS
                // ==================================================

                const name =
                    String(
                        row.name ||
                        row.Name ||
                        ""
                    ).trim();


                const email =
                    String(
                        row.email ||
                        row.Email ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                const contact =
                    String(
                        row.contact ||
                        row.Contact ||
                        row.phone ||
                        row.Phone ||
                        ""
                    ).trim();


                const gender =
                    String(
                        row.gender ||
                        row.Gender ||
                        ""
                    ).trim();


                const state =
                    String(
                        row.state ||
                        row.State ||
                        ""
                    ).trim();


                const district =
                    String(
                        row.district ||
                        row.District ||
                        ""
                    ).trim();


                const collegeName =
                    String(
                        row.collegeName ||
                        row.CollegeName ||
                        row.college ||
                        row.College ||
                        ""
                    ).trim();


                const department =
                    String(
                        row.department ||
                        row.Department ||
                        ""
                    ).trim();


                // ==================================================
                // UG YEAR
                // ==================================================

                const ugYear =
                    Number(
                        row.ugYearOfPassout ||
                        row.UGYearOfPassout ||
                        row.ugYear ||
                        row.UGYear
                    );


                // ==================================================
                // PG YEAR
                // ==================================================

                const pgValue =
                    row.pgYearOfPassout ||
                    row.PGYearOfPassout ||
                    row.pgYear ||
                    row.PGYear;


                const pgYear =
                    pgValue === undefined ||
                    pgValue === null ||
                    String(pgValue).trim() === ""

                        ? null

                        : Number(
                            pgValue
                        );


                // ==================================================
                // LEAD SOURCE
                // ==================================================

                const leadSource =
                    String(
                        row.leadSource ||
                        row.LeadSource ||
                        row.source ||
                        row.Source ||
                        ""
                    ).trim();


                // ==================================================
                // LEAD TYPE
                // ==================================================

                const leadType =
                    String(
                        row.leadType ||
                        row.LeadType ||
                        ""
                    ).trim();


                // ==================================================
                // PROGRAM
                // ==================================================

                const programInterest =
                    String(
                        row.programInterest ||
                        row.ProgramInterest ||
                        row.program ||
                        row.Program ||
                        ""
                    ).trim();


                // ==================================================
                // REQUIRED VALIDATION
                // ==================================================

                if (
                    !name ||
                    !email ||
                    !contact ||
                    !gender ||
                    !state ||
                    !district ||
                    !collegeName ||
                    !department ||
                    !Number.isInteger(
                        ugYear
                    ) ||
                    !leadSource ||
                    !leadType ||
                    !programInterest
                ) {

                    throw new Error(
                        "Required lead details are missing."
                    );

                }


                // ==================================================
                // EMAIL VALIDATION
                // ==================================================

                if (
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        email
                    )
                ) {

                    throw new Error(
                        "Invalid email address."
                    );

                }


                // ==================================================
                // CONTACT VALIDATION
                // ==================================================

                if (
                    !/^[0-9+\-\s()]{7,20}$/.test(
                        contact
                    )
                ) {

                    throw new Error(
                        "Invalid contact number."
                    );

                }


                // ==================================================
                // GENDER VALIDATION
                // ==================================================

                const allowedGenders = [

                    "Male",
                    "Female",
                    "Other",
                    "Prefer not to say"

                ];


                if (
                    !allowedGenders.includes(
                        gender
                    )
                ) {

                    throw new Error(
                        "Invalid gender."
                    );

                }


                // ==================================================
                // UG YEAR VALIDATION
                // ==================================================

                if (
                    !Number.isInteger(
                        ugYear
                    ) ||
                    ugYear < 1900 ||
                    ugYear > 2100
                ) {

                    throw new Error(
                        "Invalid UG year."
                    );

                }


                // ==================================================
                // PG YEAR VALIDATION
                // ==================================================

                if (
                    pgYear !== null &&
                    (
                        !Number.isInteger(
                            pgYear
                        ) ||
                        pgYear < 1900 ||
                        pgYear > 2100
                    )
                ) {

                    throw new Error(
                        "Invalid PG year."
                    );

                }


                // ==================================================
                // SOURCE VALIDATION
                // ==================================================

                const allowedSources = [

                    "FB / Meta",
                    "College campaign",
                    "LinkedIn",
                    "Referral",
                    "Inbound"

                ];


                if (
                    !allowedSources.includes(
                        leadSource
                    )
                ) {

                    throw new Error(
                        "Invalid lead source."
                    );

                }


                // ==================================================
                // LEAD TYPE VALIDATION
                // ==================================================

                const allowedLeadTypes = [

                    "IT",
                    "Non-IT"

                ];


                if (
                    !allowedLeadTypes.includes(
                        leadType
                    )
                ) {

                    throw new Error(
                        "Invalid lead type."
                    );

                }


                // ==================================================
                // PROGRAM VALIDATION
                // ==================================================

                const validPrograms =
                    leadType === "IT"

                        ? [

                            "Full Stack",
                            "Data Analysis",
                            "Data Science"

                        ]

                        : [

                            "HR",
                            "DM"

                        ];


                if (
                    !validPrograms.includes(
                        programInterest
                    )
                ) {

                    throw new Error(
                        "Program is not valid for the selected lead type."
                    );

                }


                // ==================================================
                // ADD VALIDATED ROW
                // ==================================================

                preparedRows.push({

                    rowNumber:
                        index + 2,

                    row,

                    data: {

                        name,

                        email,

                        contact,

                        gender,

                        state,

                        district,

                        collegeName,

                        department,

                        ugYearOfPassout:
                            ugYear,

                        pgYearOfPassout:
                            pgYear,

                        leadSource,

                        leadType,

                        programInterest

                    }

                });

            }


            catch (rowError) {

                failedRows.push({

                    rowNumber:
                        index + 2,

                    row,

                    reason:
                        rowError.message ||
                        "Invalid lead data."

                });

            }

        }


        // ====================================================
        // DUPLICATE CHECK INSIDE EXCEL
        // EMAIL + CONTACT
        // ====================================================

        const emailMap =
            new Map();


        const contactMap =
            new Map();


        const nonDuplicateRows =
            [];


        for (
            const item of preparedRows
        ) {

            const email =
                String(
                    item.data.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const contact =
                String(
                    item.data.contact ||
                    ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        ""
                    );


            let isDuplicate =
                false;


            // ==================================================
            // EMAIL DUPLICATE
            // ==================================================

            if (
                emailMap.has(
                    email
                )
            ) {

                failedRows.push({

                    rowNumber:
                        item.rowNumber,

                    row:
                        item.row,

                    reason:
                        `Duplicate email in uploaded file. Same email appears in row ${emailMap.get(email)}.`

                });


                isDuplicate =
                    true;

            }


            else {

                emailMap.set(
                    email,
                    item.rowNumber
                );

            }


            // ==================================================
            // CONTACT DUPLICATE
            // ==================================================

            if (
                contactMap.has(
                    contact
                )
            ) {

                failedRows.push({

                    rowNumber:
                        item.rowNumber,

                    row:
                        item.row,

                    reason:
                        `Duplicate contact in uploaded file. Same contact appears in row ${contactMap.get(contact)}.`

                });


                isDuplicate =
                    true;

            }


            else {

                contactMap.set(
                    contact,
                    item.rowNumber
                );

            }


            if (
                !isDuplicate
            ) {

                nonDuplicateRows.push(
                    item
                );

            }

        }


        // ====================================================
        // CHECK DATABASE DUPLICATES
        // EMAIL + CONTACT
        // ====================================================

        const emails =
            nonDuplicateRows.map(
                item =>
                    item.data.email
            );


        const contacts =
            nonDuplicateRows.map(
                item =>
                    String(
                        item.data.contact ||
                        ""
                    )
                        .trim()
                        .replace(
                            /\s+/g,
                            ""
                        )
            );


        const existingLeads =
            await Lead.find({

                $or: [

                    {

                        email: {

                            $in:
                                emails

                        }

                    },

                    {

                        contact: {

                            $in:
                                contacts

                        }

                    }

                ]

            })
                .select(
                    "email contact"
                )
                .lean();


        // ====================================================
        // EXISTING EMAILS
        // ====================================================

        const existingEmails =
            new Set(

                existingLeads

                    .map(
                        lead =>
                            lead.email
                    )

                    .filter(Boolean)

                    .map(
                        email =>
                            String(
                                email
                            )
                                .trim()
                                .toLowerCase()
                    )

            );


        // ====================================================
        // EXISTING CONTACTS
        // ====================================================

        const existingContacts =
            new Set(

                existingLeads

                    .map(
                        lead =>
                            lead.contact
                    )

                    .filter(Boolean)

                    .map(
                        contact =>
                            String(
                                contact
                            )
                                .trim()
                                .replace(
                                    /\s+/g,
                                    ""
                                )
                    )

            );


        // ====================================================
        // REMOVE DATABASE DUPLICATES
        // ====================================================

        const finalRows =
            [];


        for (
            const item of nonDuplicateRows
        ) {

            const email =
                String(
                    item.data.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const contact =
                String(
                    item.data.contact ||
                    ""
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        ""
                    );


            let isDuplicate =
                false;


            // ==================================================
            // EMAIL EXISTS
            // ==================================================

            if (
                existingEmails.has(
                    email
                )
            ) {

                failedRows.push({

                    rowNumber:
                        item.rowNumber,

                    row:
                        item.row,

                    reason:
                        "Email already exists in the database."

                });


                isDuplicate =
                    true;

            }


            // ==================================================
            // CONTACT EXISTS
            // ==================================================

            if (
                existingContacts.has(
                    contact
                )
            ) {

                failedRows.push({

                    rowNumber:
                        item.rowNumber,

                    row:
                        item.row,

                    reason:
                        "Contact already exists in the database."

                });


                isDuplicate =
                    true;

            }


            if (
                !isDuplicate
            ) {

                finalRows.push(
                    item
                );

            }

        }


        // ====================================================
        // CREATE ONLY CLEAN LEADS
        // ====================================================

        for (
            const item of finalRows
        ) {

            try {

                const lead =
                    new Lead({

                        name:
                            item.data.name,

                        email:
                            item.data.email,

                        contact:
                            item.data.contact,

                        gender:
                            item.data.gender,

                        state:
                            item.data.state,

                        district:
                            item.data.district,

                        collegeName:
                            item.data.collegeName,

                        department:
                            item.data.department,

                        ugYearOfPassout:
                            item.data.ugYearOfPassout,

                        pgYearOfPassout:
                            item.data.pgYearOfPassout,

                        leadOwner:
                            leadOwnerId,

                        createdVia:
                            "BULK_UPLOAD",

                        leadSource:
                            item.data.leadSource,

                        leadType:
                            item.data.leadType,

                        programInterest:
                            item.data.programInterest,

                        status:
                            "NEW",

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


                successfulLeads.push(
                    lead
                );

            }


            catch (rowError) {

                failedRows.push({

                    rowNumber:
                        item.rowNumber,

                    row:
                        item.row,

                    reason:
                        rowError.message ||
                        "Failed to create lead."

                });

            }

        }


        // ====================================================
        // POPULATE SUCCESSFUL LEADS
        // ====================================================

        await Lead.populate(

            successfulLeads,

            {

                path:
                    "leadOwner",

                select:
                    "_id name email role userType status"

            }

        );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.status(201).json({

            success:
                true,

            message:
                successfulLeads.length > 0

                    ? "Bulk upload completed."

                    : "No leads were uploaded.",


            totalRows:
                rows.length,


            successCount:
                successfulLeads.length,


            failedCount:
                failedRows.length,


            assignedTo:
                selectedOwner

                    ? {

                        type:
                            String(
                                selectedOwner.role ||
                                selectedOwner.userType ||
                                ""
                            ).toUpperCase(),

                        _id:
                            selectedOwner._id,

                        name:
                            selectedOwner.name,

                        email:
                            selectedOwner.email

                    }

                    : {

                        type:
                            "MANAGER",

                        _id:
                            managerId

                    },


            failedRows,


            leads:
                successfulLeads.map(
                    lead => ({

                        ...lead.toObject(),

                        ...getFollowUpStatus(
                            lead
                        )

                    })
                )

        });

    }


    catch (error) {

        console.error(
            "MANAGER BULK UPLOAD ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Server error during bulk upload.",

            error:
                error.message

        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getManagerLeads,

    getManagerLeadExecutives,

    createManagerLead,

    bulkUploadManagerLeads

};