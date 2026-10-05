const mongoose = require("mongoose");

const Lead = require("../models/lead");
const Team = require("../models/team");

const {
    createLeadHistory
} = require("../utils/leadHistory");


// ============================================================
// HELPERS
// ============================================================

function getUserType(req) {

    return String(
        req.user?.userType ||
        req.user?.role ||
        ""
    )
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
}


function getLoggedInUserId(req) {

    return (
        req.user?._id ||
        req.user?.id ||
        req.user?.userId
    );
}


function parseDate(value) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function dateToString(value) {

    return value
        ? new Date(value).toISOString()
        : null;
}


function isManager(userType) {

    return (
        userType === "MANAGER" ||
        userType === "USER_MANAGER"
    );
}


function isExecutive(userType) {

    return (
        userType === "EXECUTIVE" ||
        userType === "USER_EXECUTIVE"
    );
}


// ============================================================
// FOLLOW-UP STATUS
// ============================================================

function getFollowUpStatus(lead) {

    const now = new Date();


    // --------------------------------------------------------
    // START OF TODAY
    // --------------------------------------------------------

    const startOfToday = new Date(now);

    startOfToday.setHours(
        0,
        0,
        0,
        0
    );


    // --------------------------------------------------------
    // START OF TOMORROW
    // --------------------------------------------------------

    const startOfTomorrow = new Date(
        startOfToday
    );

    startOfTomorrow.setDate(
        startOfTomorrow.getDate() + 1
    );


    // --------------------------------------------------------
    // DATES
    // --------------------------------------------------------

    const followUpDate =
        lead.followUpAt
            ? new Date(lead.followUpAt)
            : null;

    const completedAt =
        lead.followUpCompletedAt
            ? new Date(lead.followUpCompletedAt)
            : null;


    const validFollowUpDate =
        followUpDate &&
        !Number.isNaN(
            followUpDate.getTime()
        );


    const validCompletedAt =
        completedAt &&
        !Number.isNaN(
            completedAt.getTime()
        );


    // --------------------------------------------------------
    // COMPLETED TODAY
    //
    // IMPORTANT:
    // If today's follow-up was automatically completed because
    // it was rescheduled to another date, keep COMPLETED for
    // the entire current calendar day.
    // --------------------------------------------------------

    const completedToday =
        lead.followUpCompleted === true &&
        validCompletedAt &&
        completedAt >= startOfToday &&
        completedAt < startOfTomorrow;


    // --------------------------------------------------------
    // NEW FOLLOW-UP AFTER COMPLETION
    //
    // This means the active follow-up was moved to a time after
    // the completion timestamp.
    // --------------------------------------------------------

    const hasNewFollowUp =
        lead.followUpCompleted === true &&
        validCompletedAt &&
        validFollowUpDate &&
        followUpDate > completedAt;


    let followUpStatus = "NONE";

    let displayFollowUpAt =
        lead.followUpAt || null;


    // --------------------------------------------------------
    // COMPLETED TODAY
    //
    // Once a today's occurrence has been closed by
    // rescheduling it to another date, keep it COMPLETED for
    // the entire day.
    // --------------------------------------------------------

    if (completedToday) {

        followUpStatus = "COMPLETED";

        displayFollowUpAt =
            lead.followUpCompletedAt ||
            lead.followUpAt ||
            null;
    }


    // --------------------------------------------------------
    // FOLLOW-UP EXISTS
    // --------------------------------------------------------

    else if (validFollowUpDate) {

        // ----------------------------------------------------
        // TODAY
        //
        // The active follow-up is today.
        // Its actual time determines TODAY vs MISSED.
        // ----------------------------------------------------

        if (
            followUpDate >= startOfToday &&
            followUpDate < startOfTomorrow
        ) {

            if (followUpDate > now) {

                followUpStatus = "TODAY";

            } else {

                followUpStatus = "MISSED";
            }

            displayFollowUpAt =
                lead.followUpAt;
        }


        // ----------------------------------------------------
        // UPCOMING
        // ----------------------------------------------------

        else if (
            followUpDate > startOfTomorrow
        ) {

            followUpStatus = "UPCOMING";

            displayFollowUpAt =
                lead.followUpAt;
        }


        // ----------------------------------------------------
        // PAST DATE
        // ----------------------------------------------------

        else {

            followUpStatus = "MISSED";

            displayFollowUpAt =
                lead.followUpAt;
        }
    }


    return {

        followUpStatus,

        displayFollowUpAt,

        completedToday:
            Boolean(completedToday),

        hasNewFollowUp:
            Boolean(hasNewFollowUp)

    };
}


// ============================================================
// UPDATE / RESCHEDULE FOLLOW-UP
//
// PUT /api/leads/:id/follow-up
// PUT /api/manager/leads/:leadId/follow-up
// ============================================================

const updateFollowUp = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);

        const id =
            req.params.id ||
            req.params.leadId;


        // ----------------------------------------------------
        // VALIDATE ID
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
        // FIND LEAD
        // ----------------------------------------------------

        const lead =
            await Lead.findById(id);


        if (!lead) {

            return res.status(404).json({

                success: false,

                message:
                    "Lead not found."

            });

        }


        // ----------------------------------------------------
        // PERMISSION
        // ----------------------------------------------------

        if (
            userType !== "SUPER_ADMIN"
        ) {

            let allowed = false;


            // ------------------------------------------------
            // EXECUTIVE
            // ------------------------------------------------

            if (isExecutive(userType)) {

                allowed =
                    String(lead.leadOwner) ===
                    String(userId);
            }


            // ------------------------------------------------
            // MANAGER
            //
            // Manager can update:
            // - own leads
            // - executive leads in active team
            // ------------------------------------------------

            else if (isManager(userType)) {

                if (
                    String(lead.leadOwner) ===
                    String(userId)
                ) {

                    allowed = true;

                } else {

                    const team =
                        await Team.findOne({

                            manager: userId,

                            status: "ACTIVE"

                        }).select(
                            "_id manager executives status"
                        );


                    const executiveIds =
                        team?.executives || [];


                    allowed =
                        executiveIds.some(
                            executiveId =>
                                String(executiveId) ===
                                String(lead.leadOwner)
                        );
                }
            }


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have permission to update this follow-up."

                });

            }
        }


        // ----------------------------------------------------
        // OLD VALUES
        // ----------------------------------------------------

        const oldFollowUpAt =
            dateToString(
                lead.followUpAt
            );

        const oldFollowUpCompleted =
            Boolean(
                lead.followUpCompleted
            );

        const oldFollowUpCompletedAt =
            dateToString(
                lead.followUpCompletedAt
            );

        const oldFollowUpCompletedBy =
            lead.followUpCompletedBy
                ? String(
                    lead.followUpCompletedBy
                )
                : null;


        // ----------------------------------------------------
        // REQUEST BODY
        // ----------------------------------------------------

        const {
            followUpAt,
            followUpCompleted,
            followUpCompletedAt,
            followUpCompletedBy
        } = req.body;


        const followUpWasUpdated =
            followUpAt !== undefined ||
            followUpCompleted !== undefined ||
            followUpCompletedAt !== undefined ||
            followUpCompletedBy !== undefined;


        if (!followUpWasUpdated) {

            return res.status(400).json({

                success: false,

                message:
                    "No follow-up fields were provided."

            });

        }


        let automaticFollowUpCompletion =
            false;


        // ====================================================
        // FOLLOW-UP DATE
        // ====================================================

        if (
            followUpAt !== undefined
        ) {

            // ------------------------------------------------
            // REMOVE FOLLOW-UP
            // ------------------------------------------------

            if (
                followUpAt === null ||
                String(followUpAt).trim() === ""
            ) {

                lead.followUpAt = null;

                lead.followUpCompleted = false;

                lead.followUpCompletedAt = null;

                lead.followUpCompletedBy = null;
            }


            // ------------------------------------------------
            // SET / CHANGE DATE
            // ------------------------------------------------

            else {

                const followUpDate =
                    parseDate(
                        followUpAt
                    );


                if (!followUpDate) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid follow-up date and time."

                    });

                }


                const oldFollowUpDate =
                    lead.followUpAt
                        ? new Date(
                            lead.followUpAt
                        )
                        : null;


                const now = new Date();


                const startOfToday =
                    new Date(now);

                startOfToday.setHours(
                    0,
                    0,
                    0,
                    0
                );


                const startOfTomorrow =
                    new Date(
                        startOfToday
                    );

                startOfTomorrow.setDate(
                    startOfTomorrow.getDate() + 1
                );


                const oldFollowUpWasToday =
                    oldFollowUpDate &&
                    !Number.isNaN(
                        oldFollowUpDate.getTime()
                    ) &&
                    oldFollowUpDate >= startOfToday &&
                    oldFollowUpDate < startOfTomorrow;


                const newFollowUpIsToday =
                    followUpDate >= startOfToday &&
                    followUpDate < startOfTomorrow;


                // ------------------------------------------------
// TODAY -> FUTURE DATE
//
// The old today's occurrence becomes COMPLETED.
//
// IMPORTANT:
//
// A lead may already have
// followUpCompleted=true because an OLDER
// follow-up was completed.
//
// Therefore we must check the DATE of the
// previous completion instead of checking only
// the boolean value.
// ------------------------------------------------

if (
    oldFollowUpWasToday &&
    !newFollowUpIsToday
) {

    const existingCompletedAt =
        lead.followUpCompletedAt
            ? new Date(
                lead.followUpCompletedAt
            )
            : null;


    const existingCompletionIsToday =
        existingCompletedAt &&
        !Number.isNaN(
            existingCompletedAt.getTime()
        ) &&
        existingCompletedAt >= startOfToday &&
        existingCompletedAt < startOfTomorrow;


    automaticFollowUpCompletion =
        true;


    lead.followUpCompleted =
        true;


    // ---------------------------------------------
    // If today's occurrence was already completed
    // today, keep the existing completion time.
    //
    // Otherwise create a new completion NOW.
    // ---------------------------------------------

    if (
        !existingCompletionIsToday
    ) {

        lead.followUpCompletedAt =
            now;


        if (
            userId &&
            mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            lead.followUpCompletedBy =
                userId;
        }

    } else {

        lead.followUpCompletedAt =
            existingCompletedAt;
    }
}

                // ------------------------------------------------
                // FUTURE / TODAY -> TODAY
                //
                // If the follow-up is moved back to today,
                // it becomes a new active occurrence.
                //
                // Therefore clear the old completion state.
                //
                // Its time will then determine:
                //
                // future time -> TODAY
                // past time   -> MISSED
                // ------------------------------------------------

                else if (
                    newFollowUpIsToday &&
                    lead.followUpCompleted === true
                ) {

                    lead.followUpCompleted =
                        false;

                    lead.followUpCompletedAt =
                        null;

                    lead.followUpCompletedBy =
                        null;
                }


                // ------------------------------------------------
                // NEW FOLLOW-UP DATE
                // ------------------------------------------------

                lead.followUpAt =
                    followUpDate;
            }
        }


        // ====================================================
        // COMPLETION STATUS
        // ====================================================

        if (
            followUpCompleted !== undefined
        ) {

            if (
                typeof followUpCompleted !==
                "boolean"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid follow-up completion status."

                });

            }


            // ------------------------------------------------
            // AUTOMATIC COMPLETION
            //
            // Never allow frontend to undo it in the same
            // request.
            // ------------------------------------------------

            if (
                automaticFollowUpCompletion
            ) {

                // Do nothing.

            }


            // ------------------------------------------------
            // MANUAL COMPLETE
            // ------------------------------------------------

            else if (
                followUpCompleted === true
            ) {

                if (
                    lead.latestRemark === "ENROLLED" ||
                    lead.latestRemark === "NOT_INTERESTED"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This lead has a final outcome and cannot have a completed follow-up task."

                    });

                }


                if (!lead.followUpAt) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This lead does not have an active follow-up."

                    });

                }


                lead.followUpCompleted =
                    true;

                lead.followUpCompletedAt =
                    new Date();


                if (
                    userId &&
                    mongoose.Types.ObjectId.isValid(
                        userId
                    )
                ) {

                    lead.followUpCompletedBy =
                        userId;
                }
            }


            // ------------------------------------------------
            // REOPEN
            // ------------------------------------------------

            else {

                if (
                    lead.latestRemark === "ENROLLED" ||
                    lead.latestRemark === "NOT_INTERESTED"
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This lead has a final outcome and cannot have an active follow-up task."

                    });

                }


                if (!lead.followUpAt) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "This lead does not have an active follow-up."

                    });

                }


                lead.followUpCompleted =
                    false;

                lead.followUpCompletedAt =
                    null;

                lead.followUpCompletedBy =
                    null;
            }
        }


        // ====================================================
        // EXPLICIT COMPLETION TIME
        // ====================================================

        if (
            followUpCompletedAt !== undefined &&
            !automaticFollowUpCompletion
        ) {

            if (
                followUpCompletedAt === null ||
                String(followUpCompletedAt).trim() === ""
            ) {

                lead.followUpCompletedAt =
                    null;

            } else {

                const completedDate =
                    parseDate(
                        followUpCompletedAt
                    );


                if (!completedDate) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid follow-up completion date."

                    });

                }


                lead.followUpCompletedAt =
                    completedDate;
            }
        }


        // ====================================================
        // EXPLICIT COMPLETED BY
        // ====================================================

        if (
            followUpCompletedBy !== undefined &&
            !automaticFollowUpCompletion
        ) {

            if (
                followUpCompletedBy === null ||
                String(followUpCompletedBy).trim() === ""
            ) {

                lead.followUpCompletedBy =
                    null;

            } else {

                if (
                    !mongoose.Types.ObjectId.isValid(
                        followUpCompletedBy
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid follow-up completed user."

                    });

                }


                lead.followUpCompletedBy =
                    followUpCompletedBy;
            }
        }


        // ====================================================
        // NEW VALUES
        // ====================================================

        const newFollowUpAt =
            dateToString(
                lead.followUpAt
            );

        const newFollowUpCompleted =
            Boolean(
                lead.followUpCompleted
            );

        const newFollowUpCompletedAt =
            dateToString(
                lead.followUpCompletedAt
            );

        const newFollowUpCompletedBy =
            lead.followUpCompletedBy
                ? String(
                    lead.followUpCompletedBy
                )
                : null;


        // ====================================================
        // SAVE FIRST
        // ====================================================

        await lead.save({
            validateModifiedOnly: true
        });


        // ====================================================
        // HISTORY
        // ====================================================

        if (
            oldFollowUpAt !==
            newFollowUpAt
        ) {

            await createLeadHistory({

                leadId:
                    lead._id,

                action:
                    "FOLLOW_UP_CHANGED",

                changedBy:
                    userId,

                field:
                    "followUpAt",

                oldValue:
                    oldFollowUpAt,

                newValue:
                    newFollowUpAt

            });
        }


        if (
            oldFollowUpCompleted !==
            newFollowUpCompleted
        ) {

            await createLeadHistory({

                leadId:
                    lead._id,

                action:
                    newFollowUpCompleted
                        ? "FOLLOW_UP_COMPLETED"
                        : "FOLLOW_UP_REOPENED",

                changedBy:
                    userId,

                field:
                    "followUpCompleted",

                oldValue:
                    String(
                        oldFollowUpCompleted
                    ),

                newValue:
                    String(
                        newFollowUpCompleted
                    )

            });
        }


        if (
            oldFollowUpCompletedAt !==
            newFollowUpCompletedAt
        ) {

            await createLeadHistory({

                leadId:
                    lead._id,

                action:
                    "FOLLOW_UP_COMPLETION_TIME_CHANGED",

                changedBy:
                    userId,

                field:
                    "followUpCompletedAt",

                oldValue:
                    oldFollowUpCompletedAt,

                newValue:
                    newFollowUpCompletedAt

            });
        }


        if (
            oldFollowUpCompletedBy !==
            newFollowUpCompletedBy
        ) {

            await createLeadHistory({

                leadId:
                    lead._id,

                action:
                    "FOLLOW_UP_COMPLETED_BY_CHANGED",

                changedBy:
                    userId,

                field:
                    "followUpCompletedBy",

                oldValue:
                    oldFollowUpCompletedBy,

                newValue:
                    newFollowUpCompletedBy

            });
        }


        // ====================================================
        // POPULATE
        // ====================================================

        await lead.populate({
            path: "leadOwner",
            select: "name email role status"
        });


        if (
            lead.followUpCompletedBy
        ) {

            await lead.populate({
                path: "followUpCompletedBy",
                select: "name email role status"
            });
        }


        // ====================================================
        // STATUS
        // ====================================================

        const status =
            getFollowUpStatus(
                lead
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            message:
                "Follow-up updated successfully.",

            lead: {

                ...lead.toObject(),

                ...status

            }

        });

    } catch (error) {

        console.error(
            "Update follow-up error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while updating follow-up."

        });
    }
};
// ============================================================
// GET FOLLOW-UPS
//
// GET /api/follow-ups
//
// Returns ALL follow-ups visible to the logged-in user.
//
// MANAGER:
// - Own leads
// - Leads belonging to executives in active team
//
// EXECUTIVE:
// - Own leads
//
// SUPER ADMIN:
// - All leads
// ============================================================

const getFollowUps = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);


        // ====================================================
        // ALLOWED USERS
        // ====================================================

        const allowedUsers = [
            "SUPER_ADMIN",
            "MANAGER",
            "EXECUTIVE",
            "USER_MANAGER",
            "USER_EXECUTIVE"
        ];


        if (
            !allowedUsers.includes(userType)
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not authorized to view follow-ups."

            });

        }


        // ====================================================
        // TODAY START
        // ====================================================

        const todayStart =
            new Date();

        todayStart.setHours(
            0,
            0,
            0,
            0
        );


        // ====================================================
        // BASE QUERY
        // ====================================================

        const query = {

            followUpAt: {
                $ne: null
            },

            latestRemark: {
                $nin: [
                    "ENROLLED",
                    "NOT_INTERESTED"
                ]
            },

            $or: [

                // ==================================================
                // 1. NOT COMPLETED
                // ==================================================

                {
                    followUpCompleted: false
                },


                // ==================================================
                // 2. COMPLETED + NEW FOLLOW-UP
                //
                // A completed occurrence has been replaced by
                // another active follow-up.
                // ==================================================

                {
                    $and: [

                        {
                            followUpCompleted: true
                        },

                        {
                            $expr: {

                                $gt: [
                                    "$followUpAt",
                                    "$followUpCompletedAt"
                                ]

                            }
                        }

                    ]
                },


                // ==================================================
                // 3. COMPLETED TODAY
                //
                // Keep the completed occurrence visible during
                // the current day.
                //
                // This is important when today's follow-up was
                // moved to another date.
                // ==================================================

                {
                    $and: [

                        {
                            followUpCompleted: true
                        },

                        {
                            followUpCompletedAt: {
                                $gte: todayStart
                            }
                        }

                    ]
                }

            ]

        };


        // ====================================================
        // OWNERSHIP
        // ====================================================

        if (
            userType !== "SUPER_ADMIN"
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
                        "Unable to identify logged-in user."

                });

            }


            // ==================================================
            // MANAGER
            //
            // Manager sees:
            // - Own leads
            // - Leads belonging to executives
            //   in their active team
            // ==================================================

            if (
                isManager(userType)
            ) {

                const team =
                    await Team.findOne({

                        manager:
                            userId,

                        status:
                            "ACTIVE"

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


            // ==================================================
            // EXECUTIVE
            // ==================================================

            else if (
                isExecutive(userType)
            ) {

                query.leadOwner =
                    userId;

            }


            // ==================================================
            // OTHER USER
            // ==================================================

            else {

                query.leadOwner =
                    userId;

            }

        }


        // ====================================================
        // FETCH ALL FOLLOW-UPS
        //
        // IMPORTANT:
        // No .skip()
        // No .limit()
        // No countDocuments()
        //
        // Frontend will handle display pagination.
        // ====================================================

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

                    followUpAt: 1

                });


        // ====================================================
        // FORMAT LEADS
        // ====================================================

        const formattedLeads =
            leads.map(
                lead => {

                    const leadObject =
                        lead.toObject();


                    const status =
                        getFollowUpStatus(
                            lead
                        );


                    return {

                        ...leadObject,


                        leadId:
                            String(
                                lead._id
                            ),


                        leadName:
                            lead.name || "",


                        leadContact:
                            lead.contact || "",


                        leadEmail:
                            lead.email || "",


                        owner:
                            lead.leadOwner || null,


                        followUpStatus:
                            status.followUpStatus,


                        displayFollowUpAt:
                            status.displayFollowUpAt,


                        completedToday:
                            status.completedToday,


                        hasNewFollowUp:
                            status.hasNewFollowUp,


                        followUpAt:
                            lead.followUpAt,


                        followUpCompleted:
                            lead.followUpCompleted,


                        followUpCompletedAt:
                            lead.followUpCompletedAt,


                        followUpCompletedBy:
                            lead.followUpCompletedBy ||
                            null

                    };

                }
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            count:
                formattedLeads.length,

            leads:
                formattedLeads

        });

    }

    catch (error) {

        console.error(
            "GET FOLLOW-UPS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch follow-ups.",

            error:
                error.message

        });

    }

};

// ============================================================
// COMPLETE FOLLOW-UP
//
// PUT /api/leads/:id/complete-follow-up
// ============================================================

const completeFollowUp = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);

        const id =
            req.params.id ||
            req.params.leadId;


        // ====================================================
        // VALIDATE ID
        // ====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid lead ID."

            });

        }


        // ====================================================
        // FIND LEAD
        // ====================================================

        const lead =
            await Lead.findById(id);


        if (!lead) {

            return res.status(404).json({

                success: false,

                message:
                    "Lead not found."

            });

        }


        // ====================================================
        // PERMISSION
        // ====================================================

        if (
            userType !== "SUPER_ADMIN"
        ) {

            let allowed = false;


            // ------------------------------------------------
            // EXECUTIVE
            // ------------------------------------------------

            if (
                isExecutive(userType)
            ) {

                allowed =
                    String(lead.leadOwner) ===
                    String(userId);

            }


            // ------------------------------------------------
            // MANAGER
            // ------------------------------------------------

            else if (
                isManager(userType)
            ) {

                if (
                    String(lead.leadOwner) ===
                    String(userId)
                ) {

                    allowed = true;

                } else {

                    const team =
                        await Team.findOne({

                            manager: userId,

                            status: "ACTIVE"

                        }).select(
                            "_id manager executives status"
                        );


                    const executiveIds =
                        team?.executives || [];


                    allowed =
                        executiveIds.some(
                            executiveId =>
                                String(executiveId) ===
                                String(lead.leadOwner)
                        );

                }

            }


            // ------------------------------------------------
            // OTHER USER
            // ------------------------------------------------

            else {

                allowed =
                    String(lead.leadOwner) ===
                    String(userId);

            }


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have permission to complete this follow-up."

                });

            }

        }


        // ====================================================
        // CHECK ACTIVE FOLLOW-UP
        // ====================================================

        if (!lead.followUpAt) {

            return res.status(400).json({

                success: false,

                message:
                    "This lead does not have an active follow-up."

            });

        }


        // ====================================================
        // CHECK NEW FOLLOW-UP
        // ====================================================

        const currentFollowUpAt =
            lead.followUpAt
                ? new Date(
                    lead.followUpAt
                )
                : null;


        const completedAt =
            lead.followUpCompletedAt
                ? new Date(
                    lead.followUpCompletedAt
                )
                : null;


        const validCurrentFollowUp =
            currentFollowUpAt &&
            !Number.isNaN(
                currentFollowUpAt.getTime()
            );


        const validCompletedAt =
            completedAt &&
            !Number.isNaN(
                completedAt.getTime()
            );


        const hasNewFollowUp =
            lead.followUpCompleted === true &&
            validCurrentFollowUp &&
            validCompletedAt &&
            currentFollowUpAt > completedAt;


        // ====================================================
        // ALREADY COMPLETED
        // ====================================================

        if (
            lead.followUpCompleted === true &&
            !hasNewFollowUp
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This follow-up is already completed."

            });

        }


        // ====================================================
        // FINAL OUTCOME
        // ====================================================

        if (
            lead.latestRemark === "ENROLLED" ||
            lead.latestRemark === "NOT_INTERESTED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This lead has a final outcome and cannot have a completed follow-up task."

            });

        }


        // ====================================================
        // OLD VALUES
        // ====================================================

        const oldCompleted =
            Boolean(
                lead.followUpCompleted
            );


        const oldCompletedAt =
            dateToString(
                lead.followUpCompletedAt
            );


        const oldCompletedBy =
            lead.followUpCompletedBy
                ? String(
                    lead.followUpCompletedBy
                )
                : null;


        // ====================================================
        // COMPLETE
        // ====================================================

        lead.followUpCompleted =
            true;

        lead.followUpCompletedAt =
            new Date();


        if (
            userId &&
            mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            lead.followUpCompletedBy =
                userId;

        }


        // ====================================================
        // NEW VALUES
        // ====================================================

        const newCompleted =
            Boolean(
                lead.followUpCompleted
            );


        const newCompletedAt =
            dateToString(
                lead.followUpCompletedAt
            );


        const newCompletedBy =
            lead.followUpCompletedBy
                ? String(
                    lead.followUpCompletedBy
                )
                : null;


        // ====================================================
        // SAVE
        // ====================================================

        await lead.save({
            validateModifiedOnly: true
        });


        // ====================================================
        // HISTORY
        // ====================================================

        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_COMPLETED",

            changedBy:
                userId,

            field:
                "followUpCompleted",

            oldValue:
                String(
                    oldCompleted
                ),

            newValue:
                String(
                    newCompleted
                )

        });


        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_COMPLETION_TIME_CHANGED",

            changedBy:
                userId,

            field:
                "followUpCompletedAt",

            oldValue:
                oldCompletedAt,

            newValue:
                newCompletedAt

        });


        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_COMPLETED_BY_CHANGED",

            changedBy:
                userId,

            field:
                "followUpCompletedBy",

            oldValue:
                oldCompletedBy,

            newValue:
                newCompletedBy

        });


        // ====================================================
        // POPULATE
        // ====================================================

        await lead.populate(
            "leadOwner",
            "name email role status"
        );


        if (
            lead.followUpCompletedBy
        ) {

            await lead.populate(
                "followUpCompletedBy",
                "name email role status"
            );

        }


        // ====================================================
        // STATUS
        // ====================================================

        const status =
            getFollowUpStatus(
                lead
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            message:
                "Follow-up completed successfully.",

            lead: {

                ...lead.toObject(),

                ...status

            }

        });

    } catch (error) {

        console.error(
            "Complete follow-up error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while completing follow-up."

        });

    }

};
// ============================================================
// REOPEN FOLLOW-UP
//
// PUT /api/leads/:id/reopen-follow-up
// PUT /api/manager/leads/:leadId/reopen-follow-up
// ============================================================

const reopenFollowUp = async (
    req,
    res
) => {

    try {

        const userType =
            getUserType(req);

        const userId =
            getLoggedInUserId(req);

        const id =
            req.params.id ||
            req.params.leadId;


        // ====================================================
        // VALIDATE ID
        // ====================================================

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid lead ID."

            });

        }


        // ====================================================
        // FIND LEAD
        // ====================================================

        const lead =
            await Lead.findById(id);


        if (!lead) {

            return res.status(404).json({

                success: false,

                message:
                    "Lead not found."

            });

        }


        // ====================================================
        // PERMISSION
        // ====================================================

        if (
            userType !== "SUPER_ADMIN"
        ) {

            let allowed = false;


            // ------------------------------------------------
            // EXECUTIVE
            // ------------------------------------------------

            if (
                isExecutive(userType)
            ) {

                allowed =
                    String(lead.leadOwner) ===
                    String(userId);

            }


            // ------------------------------------------------
            // MANAGER
            // ------------------------------------------------

            else if (
                isManager(userType)
            ) {

                if (
                    String(lead.leadOwner) ===
                    String(userId)
                ) {

                    allowed = true;

                } else {

                    const team =
                        await Team.findOne({

                            manager: userId,

                            status: "ACTIVE"

                        }).select(
                            "_id manager executives status"
                        );


                    const executiveIds =
                        team?.executives || [];


                    allowed =
                        executiveIds.some(
                            executiveId =>
                                String(executiveId) ===
                                String(lead.leadOwner)
                        );

                }

            }


            // ------------------------------------------------
            // OTHER USER
            // ------------------------------------------------

            else {

                allowed =
                    String(lead.leadOwner) ===
                    String(userId);

            }


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have permission to reopen this follow-up."

                });

            }

        }


        // ====================================================
        // FINAL OUTCOME
        // ====================================================

        if (
            lead.latestRemark === "ENROLLED" ||
            lead.latestRemark === "NOT_INTERESTED"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This lead has a final outcome and cannot have an active follow-up task."

            });

        }


        // ====================================================
        // CHECK ACTIVE FOLLOW-UP
        // ====================================================

        if (!lead.followUpAt) {

            return res.status(400).json({

                success: false,

                message:
                    "This lead does not have an active follow-up."

            });

        }


        // ====================================================
        // OLD VALUES
        // ====================================================

        const oldCompleted =
            Boolean(
                lead.followUpCompleted
            );


        const oldCompletedAt =
            dateToString(
                lead.followUpCompletedAt
            );


        const oldCompletedBy =
            lead.followUpCompletedBy
                ? String(
                    lead.followUpCompletedBy
                )
                : null;


        // ====================================================
        // REOPEN
        // ====================================================

        lead.followUpCompleted =
            false;

        lead.followUpCompletedAt =
            null;

        lead.followUpCompletedBy =
            null;


        // ====================================================
        // SAVE
        // ====================================================

        await lead.save({
            validateModifiedOnly: true
        });


        // ====================================================
        // HISTORY
        // ====================================================

        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_REOPENED",

            changedBy:
                userId,

            field:
                "followUpCompleted",

            oldValue:
                String(
                    oldCompleted
                ),

            newValue:
                "false"

        });


        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_COMPLETION_TIME_CHANGED",

            changedBy:
                userId,

            field:
                "followUpCompletedAt",

            oldValue:
                oldCompletedAt,

            newValue:
                null

        });


        await createLeadHistory({

            leadId:
                lead._id,

            action:
                "FOLLOW_UP_COMPLETED_BY_CHANGED",

            changedBy:
                userId,

            field:
                "followUpCompletedBy",

            oldValue:
                oldCompletedBy,

            newValue:
                null

        });


        // ====================================================
        // POPULATE
        // ====================================================

        await lead.populate(
            "leadOwner",
            "name email role status"
        );


        // ====================================================
        // STATUS
        // ====================================================

        const status =
            getFollowUpStatus(
                lead
            );


        // ====================================================
        // RESPONSE
        // ====================================================

        return res.json({

            success: true,

            message:
                "Follow-up reopened successfully.",

            lead: {

                ...lead.toObject(),

                ...status

            }

        });

    } catch (error) {

        console.error(
            "Reopen follow-up error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error while reopening follow-up."

        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getFollowUps,

    updateFollowUp,

    completeFollowUp,

    reopenFollowUp,

    getFollowUpStatus

};