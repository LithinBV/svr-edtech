const mongoose = require("mongoose");

const Lead = require("../models/lead");
const Team = require("../models/team");
const User = require("../models/user");
const { createLeadHistory } = require("../utils/leadHistory");

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_GENDERS = [
    "Male",
    "Female",
    "Other",
    "Prefer not to say",
];

const ALLOWED_SOURCES = [
    "FB / Meta",
    "College campaign",
    "LinkedIn",
    "Referral",
    "Inbound",
];

const ALLOWED_LEAD_TYPES = [
    "IT",
    "Non-IT",
];

const IT_PROGRAMS = [
    "Full Stack",
    "Data Analysis",
    "Data Science",
];

const NON_IT_PROGRAMS = [
    "HR",
    "DM",
];

// ============================================================
// HELPERS
// ============================================================

const cleanString = (value) => {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value).trim();

};


const normalizeHeader = (header) => {

    return cleanString(header)
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[_-]/g, "");

};


const normalizeEmail = (email) => {

    return cleanString(email).toLowerCase();

};


const normalizeContact = (contact) => {

    return cleanString(contact)
        .replace(/\s+/g, "")
        .replace(/[()-]/g, "");

};


const isValidEmail = (email) => {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

};


const isValidContact = (contact) => {

    const digits =
        contact.replace(/\D/g, "");

    return (
        digits.length >= 10 &&
        digits.length <= 15
    );

};


const parseYear = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }

    const year =
        Number(value);

    if (
        !Number.isInteger(year) ||
        year < 1900 ||
        year > 2100
    ) {

        return NaN;

    }

    return year;

};

// ============================================================
// USER / ROLE HELPERS
// ============================================================

const getUserRole = (req) => {

    return String(
        req.user?.role ||
        req.user?.userType ||
        ""
    ).toUpperCase();

};


const getLoggedInUserId = (req) => {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId ||
        null
    );

};


const isSuperAdmin = (req) => {

    return getUserRole(req) === "SUPER_ADMIN";

};


const isManager = (req) => {

    const role =
        getUserRole(req);

    return (
        role === "MANAGER" ||
        role === "USER_MANAGER"
    );

};

// ============================================================
// COLUMN ALIASES
// ============================================================

const COLUMN_ALIASES = {

    name: [

        "name",
        "fullname",
        "studentname",
        "leadname",

    ],

    email: [

        "email",
        "emailid",
        "mail",
        "emailaddress",

    ],

    contact: [

        "contact",
        "phone",
        "phonenumber",
        "mobile",
        "mobilenumber",
        "contactnumber",

    ],

    gender: [

        "gender",
        "sex",

    ],

    state: [

        "state",

    ],

    district: [

        "district",

    ],

    collegeName: [

        "collegename",
        "college",
        "institution",
        "institutionname",

    ],

    department: [

        "department",
        "dept",
        "branch",

    ],

    ugYearOfPassout: [

        "ugyearofpassout",
        "ugyear",
        "ugpassoutyear",
        "ugyearofpassing",
        "graduationyear",
        "graduationpassoutyear",

    ],

    pgYearOfPassout: [

        "pgyearofpassout",
        "pgyear",
        "pgpassoutyear",
        "pgyearofpassing",
        "postgraduationyear",

    ],

    leadSource: [

        "leadsource",
        "source",

    ],

    leadType: [

        "leadtype",
        "type",

    ],

    programInterest: [

        "programinterest",
        "program",
        "programname",
        "course",
        "courseinterest",

    ],

};

// ============================================================
// MAP EXCEL / CSV COLUMNS
// ============================================================

const mapRowColumns = (row) => {

    const result = {};

    const originalKeys =
        Object.keys(row);

    for (
        const key of originalKeys
    ) {

        const normalizedKey =
            normalizeHeader(key);

        for (
            const [
                field,
                aliases
            ]
            of Object.entries(
                COLUMN_ALIASES
            )
        ) {

            if (
                aliases.includes(
                    normalizedKey
                )
            ) {

                result[field] =
                    row[key];

                break;

            }

        }

    }

    return result;

};

// ============================================================
// VALIDATE ROW
// ============================================================

const validateRow = (
    rawRow,
    rowNumber
) => {

    const row =
        mapRowColumns(
            rawRow
        );

    const errors = [];


    const name =
        cleanString(
            row.name
        );


    const email =
        normalizeEmail(
            row.email
        );


    const contact =
        normalizeContact(
            row.contact
        );


    const gender =
        cleanString(
            row.gender
        );


    const state =
        cleanString(
            row.state
        );


    const district =
        cleanString(
            row.district
        );


    const collegeName =
        cleanString(
            row.collegeName
        );


    const department =
        cleanString(
            row.department
        );


    const ugYear =
        parseYear(
            row.ugYearOfPassout
        );


    const pgYear =
        parseYear(
            row.pgYearOfPassout
        );


    const leadSource =
        cleanString(
            row.leadSource
        );


    const leadType =
        cleanString(
            row.leadType
        );


    const programInterest =
        cleanString(
            row.programInterest
        );


    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!name) {

        errors.push(
            "Name is required"
        );

    }


    if (!email) {

        errors.push(
            "Email is required"
        );

    }

    else if (
        !isValidEmail(
            email
        )
    ) {

        errors.push(
            "Invalid email"
        );

    }


    if (!contact) {

        errors.push(
            "Contact is required"
        );

    }

    else if (
        !isValidContact(
            contact
        )
    ) {

        errors.push(
            "Contact must contain 10-15 digits"
        );

    }


    if (!gender) {

        errors.push(
            "Gender is required"
        );

    }

    else if (
        !ALLOWED_GENDERS.includes(
            gender
        )
    ) {

        errors.push(
            `Invalid gender. Allowed: ${ALLOWED_GENDERS.join(", ")}`
        );

    }


    if (!state) {

        errors.push(
            "State is required"
        );

    }


    if (!district) {

        errors.push(
            "District is required"
        );

    }


    if (!collegeName) {

        errors.push(
            "College name is required"
        );

    }


    if (!department) {

        errors.push(
            "Department is required"
        );

    }


    // --------------------------------------------------------
    // UG YEAR
    // --------------------------------------------------------

    if (
        row.ugYearOfPassout ===
            undefined ||
        row.ugYearOfPassout ===
            null ||
        cleanString(
            row.ugYearOfPassout
        ) === ""
    ) {

        errors.push(
            "UG year of passout is required"
        );

    }

    else if (
        Number.isNaN(
            ugYear
        )
    ) {

        errors.push(
            "Invalid UG year of passout"
        );

    }


    // --------------------------------------------------------
    // PG YEAR
    // --------------------------------------------------------

    if (
        row.pgYearOfPassout !==
            undefined &&
        row.pgYearOfPassout !==
            null &&
        cleanString(
            row.pgYearOfPassout
        ) !== ""
    ) {

        if (
            Number.isNaN(
                pgYear
            )
        ) {

            errors.push(
                "Invalid PG year of passout"
            );

        }

    }


    // --------------------------------------------------------
    // SOURCE
    // --------------------------------------------------------

    if (!leadSource) {

        errors.push(
            "Lead source is required"
        );

    }

    else if (
        !ALLOWED_SOURCES.includes(
            leadSource
        )
    ) {

        errors.push(
            `Invalid lead source. Allowed: ${ALLOWED_SOURCES.join(", ")}`
        );

    }


    // --------------------------------------------------------
    // LEAD TYPE
    // --------------------------------------------------------

    if (!leadType) {

        errors.push(
            "Lead type is required"
        );

    }

    else if (
        !ALLOWED_LEAD_TYPES.includes(
            leadType
        )
    ) {

        errors.push(
            `Invalid lead type. Allowed: ${ALLOWED_LEAD_TYPES.join(", ")}`
        );

    }


    // --------------------------------------------------------
    // PROGRAM
    // --------------------------------------------------------

    if (!programInterest) {

        errors.push(
            "Program interest is required"
        );

    }

    else if (
        leadType === "IT" &&
        !IT_PROGRAMS.includes(
            programInterest
        )
    ) {

        errors.push(
            `Invalid IT program. Allowed: ${IT_PROGRAMS.join(", ")}`
        );

    }

    else if (
        leadType === "Non-IT" &&
        !NON_IT_PROGRAMS.includes(
            programInterest
        )
    ) {

        errors.push(
            `Invalid Non-IT program. Allowed: ${NON_IT_PROGRAMS.join(", ")}`
        );

    }


    // --------------------------------------------------------
    // RETURN
    // --------------------------------------------------------

    return {

        rowNumber,

        valid:
            errors.length === 0,

        errors,

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
                Number.isNaN(
                    pgYear
                )
                    ? null
                    : pgYear,

            leadSource,

            leadType,

            programInterest,

        },

    };

};

// ============================================================
// BULK UPLOAD
// ============================================================

const bulkUploadLeads = async (
    req,
    res
) => {

    try {

        // ------------------------------------------------------
        // SUPER ADMIN ONLY
        // ------------------------------------------------------

        if (
            !isSuperAdmin(req)
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Only Super Admin can bulk upload leads.",

            });

        }


        // ------------------------------------------------------
        // INPUT
        // ------------------------------------------------------

        const rows =
            Array.isArray(
                req.body.rows
            )
                ? req.body.rows
                : [];


        if (
            !rows.length
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "No rows were provided.",

            });

        }


        // ------------------------------------------------------
        // NO ARTIFICIAL UPLOAD LIMIT
        // ------------------------------------------------------
        //
        // There is intentionally NO
        // 1000-row restriction here.
        //
        // ------------------------------------------------------


        // ------------------------------------------------------
        // VALIDATE ALL ROWS
        // ------------------------------------------------------

        const validationResults =
            rows.map(
                (
                    row,
                    index
                ) =>
                    validateRow(
                        row,
                        index + 2
                    )
            );


        // ------------------------------------------------------
        // DUPLICATES INSIDE UPLOAD
        // ------------------------------------------------------

        const emailMap =
            new Map();


        const contactMap =
            new Map();


        for (
            const result
            of validationResults
        ) {

            if (
                !result.valid
            ) {

                continue;

            }


            const email =
                result.data.email;


            const contact =
                result.data.contact;


            if (
                emailMap.has(
                    email
                )
            ) {

                result.valid =
                    false;

                result.errors.push(
                    `Duplicate email in uploaded file. Same email appears in row ${emailMap.get(email)}.`
                );

            }

            else {

                emailMap.set(
                    email,
                    result.rowNumber
                );

            }


            if (
                contactMap.has(
                    contact
                )
            ) {

                result.valid =
                    false;

                result.errors.push(
                    `Duplicate contact in uploaded file. Same contact appears in row ${contactMap.get(contact)}.`
                );

            }

            else {

                contactMap.set(
                    contact,
                    result.rowNumber
                );

            }

        }


        // ------------------------------------------------------
        // VALID ROWS
        // ------------------------------------------------------

        const validResults =
            validationResults.filter(
                (
                    result
                ) =>
                    result.valid
            );


        // ------------------------------------------------------
        // CHECK EXISTING DATABASE RECORDS
        // ------------------------------------------------------

        const emails =
            validResults.map(
                (
                    result
                ) =>
                    result.data.email
            );


        const contacts =
            validResults.map(
                (
                    result
                ) =>
                    result.data.contact
            );


        const existingLeads =
            await Lead.find({

                $or: [

                    {

                        email: {

                            $in:
                                emails,

                        },

                    },

                    {

                        contact: {

                            $in:
                                contacts,

                        },

                    },

                ],

            })
                .select(
                    "email contact"
                )
                .lean();


        const existingEmails =
            new Set(

                existingLeads

                    .map(
                        (
                            lead
                        ) =>
                            lead.email
                    )

                    .filter(Boolean)

                    .map(
                        (
                            email
                        ) =>
                            String(
                                email
                            ).toLowerCase()
                    )

            );


        const existingContacts =
            new Set(

                existingLeads

                    .map(
                        (
                            lead
                        ) =>
                            lead.contact
                    )

                    .filter(Boolean)

                    .map(
                        (
                            contact
                        ) =>
                            String(
                                contact
                            )
                                .replace(
                                    /\s+/g,
                                    ""
                                )
                    )

            );


        // ------------------------------------------------------
        // REMOVE DATABASE DUPLICATES
        // ------------------------------------------------------

        for (
            const result
            of validResults
        ) {

            if (
                existingEmails.has(
                    result.data.email
                )
            ) {

                result.valid =
                    false;

                result.errors.push(
                    "Email already exists in the database."
                );

            }


            if (
                existingContacts.has(
                    result.data.contact
                )
            ) {

                result.valid =
                    false;

                result.errors.push(
                    "Contact already exists in the database."
                );

            }

        }


        // ------------------------------------------------------
        // FINAL VALID ROWS
        // ------------------------------------------------------

        const finalValidResults =
            validationResults.filter(
                (
                    result
                ) =>
                    result.valid
            );


        // ------------------------------------------------------
        // CREATE LEADS
        // ------------------------------------------------------

        const createdLeads = [];

        const failedRows = [];


        for (
            const result
            of finalValidResults
        ) {

            try {

                const lead =
                    new Lead({

                        ...result.data,

                        // Bulk uploaded leads
                        // are initially unassigned.

                        leadOwner:
                            null,

                        createdVia:
                            "BULK_UPLOAD",

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
                            null,

                    });


                await lead.save();


                // ------------------------------------------------
                // HISTORY
                // ------------------------------------------------

                try {

                    if (
                        typeof createLeadHistory ===
                        "function"
                    ) {

                        await createLeadHistory({

                            leadId:
                                lead._id,

                            action:
                                "LEAD_CREATED",

                            changedBy:
                                req.user?._id ||
                                req.user?.id ||
                                null,

                            changes: {

                                createdVia:
                                    "BULK_UPLOAD",

                            },

                        });

                    }

                }

                catch (
                    historyError
                ) {

                    console.error(
                        "Bulk upload history error:",
                        historyError.message
                    );

                }


                createdLeads.push(
                    lead
                );

            }

            catch (
                createError
            ) {

                failedRows.push({

                    rowNumber:
                        result.rowNumber,

                    errors: [

                        createError.message,

                    ],

                });

            }

        }


        // ------------------------------------------------------
        // ALL FAILED VALIDATION ROWS
        // ------------------------------------------------------

        const validationFailedRows =
            validationResults

                .filter(
                    (
                        result
                    ) =>
                        !result.valid
                )

                .map(
                    (
                        result
                    ) => ({

                        rowNumber:
                            result.rowNumber,

                        errors:
                            result.errors,

                    })
                );


        const allFailedRows = [

            ...validationFailedRows,

            ...failedRows,

        ];


        // ------------------------------------------------------
        // RESPONSE
        // ------------------------------------------------------

        return res.status(201).json({

            success:
                true,

            message:
                "Bulk upload completed.",

            summary: {

                totalRows:
                    rows.length,

                uploaded:
                    createdLeads.length,

                failed:
                    allFailedRows.length,

            },

            failedRows:
                allFailedRows,

            leads:
                createdLeads,

        });

    }

    catch (
        error
    ) {

        console.error(
            "Bulk upload error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Bulk upload failed.",

        });

    }

};


// ============================================================
// GET UNASSIGNED BULK LEADS
//
// GET /api/leads/bulk-upload/unassigned
//
// IMPORTANT:
// Backend returns ALL unassigned bulk-uploaded leads.
// Frontend handles display pagination.
// ============================================================

const getUnassignedBulkLeads =
    async (
        req,
        res
    ) => {

        try {

            // ------------------------------------------------
            // SUPER ADMIN ONLY
            // ------------------------------------------------

            if (
                !isSuperAdmin(req)
            ) {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "Only Super Admin can access bulk uploaded leads.",

                });

            }


            // ------------------------------------------------
            // QUERY
            // ------------------------------------------------

            const query = {

                createdVia:
                    "BULK_UPLOAD",

                leadOwner:
                    null,

            };


            // ------------------------------------------------
            // FETCH ALL UNASSIGNED BULK LEADS
            //
            // NO BACKEND PAGINATION
            //
            // No:
            // getPagination()
            // countDocuments()
            // skip()
            // limit()
            // getPaginationMeta()
            //
            // Frontend handles display pagination.
            // ------------------------------------------------

            const leads =
                await Lead.find(query)

                    .populate(
                        "leadOwner",
                        "name email role"
                    )

                    .sort({

                        createdAt:
                            -1,

                    })

                    .lean();


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.json({

                success:
                    true,

                count:
                    leads.length,

                leads,

            });

        }

        catch (
            error
        ) {

            console.error(
                "Get unassigned bulk leads error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to fetch bulk uploaded leads.",

                error:
                    error.message,

            });

        }

    };


// ============================================================
// ASSIGN BULK LEADS TO MANAGER OR EXECUTIVE
//
// POST /api/leads/bulk-upload/assign
// ============================================================

const assignBulkLeads =
    async (
        req,
        res
    ) => {

        try {

            const role =
                getUserRole(req);

            const loggedInUserId =
                getLoggedInUserId(req);


            // ------------------------------------------------
            // INPUT
            // ------------------------------------------------

            const {
                leadIds,
                ownerId,
                ownerType,
            } = req.body;


            if (
                !Array.isArray(
                    leadIds
                ) ||
                leadIds.length === 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Please select at least one lead.",

                });

            }


            if (
                !ownerId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Please select a lead owner.",

                });

            }


            const normalizedOwnerType =
                String(
                    ownerType || ""
                ).toUpperCase();


            if (
                ![
                    "MANAGER",
                    "EXECUTIVE",
                ].includes(
                    normalizedOwnerType
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Owner type must be MANAGER or EXECUTIVE.",

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    ownerId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid owner ID.",

                });

            }


            // ------------------------------------------------
            // VALID LEAD IDS
            // ------------------------------------------------

            const validLeadIds = [

                ...new Set(

                    leadIds

                        .filter(
                            (
                                id
                            ) =>
                                mongoose.Types.ObjectId.isValid(
                                    id
                                )
                        )

                        .map(
                            (
                                id
                            ) =>
                                String(id)
                        )

                ),

            ];


            if (
                validLeadIds.length ===
                0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "No valid lead IDs were provided.",

                });

            }


            // ------------------------------------------------
            // FIND OWNER
            // ------------------------------------------------

            const owner =
                await User.findById(
                    ownerId
                );


            if (!owner) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Selected owner not found.",

                });

            }


            // ------------------------------------------------
            // CHECK OWNER ROLE
            // ------------------------------------------------

            const actualOwnerRole =
                String(
                    owner.role ||
                    owner.userType ||
                    ""
                ).toUpperCase();


            if (
                normalizedOwnerType ===
                    "MANAGER" &&
                actualOwnerRole !==
                    "MANAGER"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Selected user is not a Manager.",

                });

            }


            if (
                normalizedOwnerType ===
                    "EXECUTIVE" &&
                actualOwnerRole !==
                    "EXECUTIVE"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Selected user is not an Executive.",

                });

            }


            // ------------------------------------------------
            // AUTHORIZATION
            // ------------------------------------------------

            // ================================================
            // SUPER ADMIN
            // ================================================

            if (
                role === "SUPER_ADMIN"
            ) {

                // Super Admin can assign
                // to Manager or Executive.

            }


            // ================================================
            // MANAGER
            // ================================================

            else if (
                isManager(req)
            ) {

                if (
                    !loggedInUserId
                ) {

                    return res.status(401).json({

                        success:
                            false,

                        message:
                            "Unable to identify logged-in Manager.",

                    });

                }


                // Manager can assign
                // ONLY to Executive.

                if (
                    normalizedOwnerType !==
                    "EXECUTIVE"
                ) {

                    return res.status(403).json({

                        success:
                            false,

                        message:
                            "Manager can assign leads only to Executives.",

                    });

                }


                // ------------------------------------------------
                // FIND MANAGER TEAM
                // ------------------------------------------------

                const team =
                    await Team.findOne({

                        manager:
                            loggedInUserId,

                        status:
                            "ACTIVE",

                    }).select(
                        "_id name manager executives status"
                    );


                if (!team) {

                    return res.status(404).json({

                        success:
                            false,

                        message:
                            "No active team found for this Manager.",

                    });

                }


                // ------------------------------------------------
                // CHECK EXECUTIVE BELONGS TO TEAM
                // ------------------------------------------------

                const executiveBelongsToTeam =
                    Array.isArray(
                        team.executives
                    ) &&
                    team.executives.some(
                        (
                            executiveId
                        ) =>
                            String(
                                executiveId
                            ) ===
                            String(
                                ownerId
                            )
                    );


                if (
                    !executiveBelongsToTeam
                ) {

                    return res.status(403).json({

                        success:
                            false,

                        message:
                            "You can assign leads only to Executives in your team.",

                    });

                }

            }


            // ================================================
            // OTHER USERS
            // ================================================

            else {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "You do not have permission to assign bulk leads.",

                });

            }


            // ------------------------------------------------
            // GET SELECTED LEADS
            // ------------------------------------------------

            const selectedLeads =
                await Lead.find({

                    _id: {

                        $in:
                            validLeadIds,

                    },

                    createdVia:
                        "BULK_UPLOAD",

                }).select(
                    "_id name email leadOwner createdVia"
                );


            // ------------------------------------------------
            // FOUND IDS
            // ------------------------------------------------

            const foundLeadIds =
                selectedLeads.map(
                    (
                        lead
                    ) =>
                        String(
                            lead._id
                        )
                );


            const missingLeadIds =
                validLeadIds.filter(
                    (
                        id
                    ) =>
                        !foundLeadIds.includes(
                            String(id)
                        )
                );


            // ------------------------------------------------
            // ONLY UNASSIGNED LEADS
            // ------------------------------------------------

            const assignableLeads =
                selectedLeads.filter(
                    (
                        lead
                    ) =>
                        !lead.leadOwner
                );


            const alreadyAssignedLeads =
                selectedLeads.filter(
                    (
                        lead
                    ) =>
                        lead.leadOwner
                );


            // ------------------------------------------------
            // NOTHING TO ASSIGN
            // ------------------------------------------------

            if (
                assignableLeads.length ===
                0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "All selected leads are already assigned.",

                    assigned:
                        0,

                    skipped:
                        alreadyAssignedLeads.length,

                    missing:
                        missingLeadIds.length,

                });

            }


            // ------------------------------------------------
            // ASSIGNABLE IDS
            // ------------------------------------------------

            const assignableIds =
                assignableLeads.map(
                    (
                        lead
                    ) =>
                        lead._id
                );


            // ------------------------------------------------
            // UPDATE LEADS
            // ------------------------------------------------

            const result =
                await Lead.updateMany(

                    {

                        _id: {

                            $in:
                                assignableIds,

                        },

                        createdVia:
                            "BULK_UPLOAD",

                        leadOwner:
                            null,

                    },

                    {

                        $set: {

                            leadOwner:
                                owner._id,

                        },

                    }

                );


            // ------------------------------------------------
            // CREATE HISTORY
            // ------------------------------------------------

            try {

                if (
                    typeof createLeadHistory ===
                    "function"
                ) {

                    for (
                        const leadId
                        of assignableIds
                    ) {

                        await createLeadHistory({

                            leadId,

                            action:
                                "LEAD_ASSIGNED",

                            changedBy:
                                loggedInUserId,

                            changes: {

                                leadOwner:
                                    owner._id,

                                ownerType:
                                    normalizedOwnerType,

                            },

                        });

                    }

                }

            }

            catch (
                historyError
            ) {

                console.error(
                    "Lead assignment history error:",
                    historyError.message
                );

            }


            // ------------------------------------------------
            // RESPONSE
            // ------------------------------------------------

            return res.json({

                success:
                    true,

                message:
                    `Selected leads assigned to ${normalizedOwnerType.toLowerCase()} successfully.`,

                assigned:
                    result.modifiedCount,

                skipped:
                    alreadyAssignedLeads.length,

                missing:
                    missingLeadIds.length,

                owner: {

                    id:
                        owner._id,

                    name:
                        owner.name,

                    email:
                        owner.email,

                    role:
                        actualOwnerRole,

                },

                skippedLeadIds:
                    alreadyAssignedLeads.map(
                        (
                            lead
                        ) =>
                            lead._id
                    ),

                missingLeadIds,

            });

        }

        catch (
            error
        ) {

            console.error(
                "Assign bulk leads error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to assign leads.",

            });

        }

    };


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    bulkUploadLeads,

    getUnassignedBulkLeads,

    assignBulkLeads,

};