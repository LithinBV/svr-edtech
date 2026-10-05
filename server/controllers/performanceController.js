const User = require("../models/user");
const Lead = require("../models/lead");

const {
    getFollowUps
} = require("./followUpController");

// ============================================================
// PERFORMANCE OVERVIEW
// GET /api/performance/overview
// ============================================================

const getPerformanceOverview = async (req, res) => {
    try {

        // ========================================================
        // ONLY SUPER ADMIN
        // ========================================================

        const userType = String(
            req.user?.userType ||
            req.user?.role ||
            ""
        )
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_");

        if (userType !== "SUPER_ADMIN") {
            return res.status(403).json({
                success: false,
                message:
                    "Only Super Admin can view performance data."
            });
        }

        // ========================================================
        // USER PERFORMANCE
        // ========================================================

        const [
            totalUsers,
            totalManagers,
            totalExecutives,
            activeUsers,
            inactiveUsers
        ] = await Promise.all([

            // Total Managers + Executives
            User.countDocuments({
                role: {
                    $in: [
                        "MANAGER",
                        "EXECUTIVE"
                    ]
                }
            }),

            // Managers
            User.countDocuments({
                role: "MANAGER"
            }),

            // Executives
            User.countDocuments({
                role: "EXECUTIVE"
            }),

            // Active
            User.countDocuments({
                role: {
                    $in: [
                        "MANAGER",
                        "EXECUTIVE"
                    ]
                },
                status: "ACTIVE"
            }),

            // Inactive
            User.countDocuments({
                role: {
                    $in: [
                        "MANAGER",
                        "EXECUTIVE"
                    ]
                },
                status: "INACTIVE"
            })
        ]);

        // ========================================================
        // LEAD PERFORMANCE
        // ========================================================

        const [
            totalLeads,
            newLeads,
            hotLeads,
            warmLeads,
            coldLeads,
            enrolledLeads
        ] = await Promise.all([

            // All leads
            Lead.countDocuments({}),

            // NEW
            Lead.countDocuments({
                status: "NEW"
            }),

            // HOT
            Lead.countDocuments({
                status: "HOT"
            }),

            // WARM
            Lead.countDocuments({
                status: "WARM"
            }),

            // COLD
            Lead.countDocuments({
                status: "COLD"
            }),

            // ENROLLED
            Lead.countDocuments({
                latestRemark: "ENROLLED"
            })
        ]);

        // ========================================================
        // FOLLOW-UP DATA
        // ========================================================
        //
        // IMPORTANT:
        //
        // We use the EXISTING FOLLOW-UP CONTROLLER.
        //
        // We do NOT create another follow-up query here.
        //
        // Therefore Performance follows exactly the same
        // follow-up rules as:
        //
        // /api/leads/follow-ups
        //
        // including:
        //
        // - normal active follow-ups
        // - completed + new follow-up
        // - completed today
        // - TODAY
        // - MISSED
        // - UPCOMING
        // - COMPLETED
        //
        // ========================================================

        const followUpData =
            await getFollowUpDataFromController(req);

        // ========================================================
        // RETURN RESPONSE
        // ========================================================

        return res.json({

            success: true,

            // ====================================================
            // USERS
            // ====================================================

            users: {

                total:
                    totalUsers,

                managers:
                    totalManagers,

                executives:
                    totalExecutives,

                active:
                    activeUsers,

                inactive:
                    inactiveUsers

            },

            // ====================================================
            // LEADS
            // ====================================================

            leads: {

                total:
                    totalLeads,

                new:
                    newLeads,

                hot:
                    hotLeads,

                warm:
                    warmLeads,

                cold:
                    coldLeads,

                enrolled:
                    enrolledLeads

            },

            // ====================================================
            // FOLLOW-UPS
            // ====================================================

            followUps: followUpData

        });

    } catch (error) {

        console.error(
            "Performance overview error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Server error while fetching performance data."

        });

    }
};


// ============================================================
// GET FOLLOW-UP DATA FROM EXISTING CONTROLLER
// ============================================================
//
// getFollowUps() is an Express controller.
//
// It normally does:
//
//     res.json({
//         success: true,
//         count,
//         leads
//     });
//
// We temporarily capture that response so Performance can
// use exactly the same data.
//
// ============================================================

const getFollowUpDataFromController = async (
    req
) => {

    return new Promise(
        async (resolve, reject) => {

            try {

                let resolved = false;

                // ------------------------------------------------
                // CREATE A TEMPORARY RESPONSE OBJECT
                // ------------------------------------------------

                const tempRes = {

                    statusCode: 200,

                    status(code) {

                        this.statusCode =
                            code;

                        return this;
                    },

                    json(data) {

                        if (resolved) {
                            return;
                        }

                        resolved = true;

                        resolve(
                            buildFollowUpStatistics(
                                data
                            )
                        );

                        return this;
                    },

                    send(data) {

                        if (resolved) {
                            return;
                        }

                        resolved = true;

                        resolve(
                            buildFollowUpStatistics(
                                data
                            )
                        );

                        return this;
                    }

                };

                // ------------------------------------------------
                // CALL EXISTING FOLLOW-UP CONTROLLER
                // ------------------------------------------------

                await getFollowUps(
                    req,
                    tempRes
                );

                // ------------------------------------------------
                // SAFETY
                // ------------------------------------------------

                if (!resolved) {

                    resolved = true;

                    resolve({
                        total: 0,
                        completed: 0,
                        pending: 0,
                        missed: 0,
                        today: 0,
                        upcoming: 0
                    });

                }

            } catch (error) {

                reject(error);

            }

        }
    );
};


// ============================================================
// BUILD FOLLOW-UP STATISTICS
// ============================================================
//
// IMPORTANT:
//
// This function uses:
//
//     lead.followUpStatus
//
// which was already calculated by your EXISTING
// followUpController.
//
// We do NOT calculate dates again here.
//
// ============================================================

const buildFollowUpStatistics = (
    response
) => {

    const leads =
        Array.isArray(
            response?.leads
        )
            ? response.leads
            : [];

    // ========================================================
    // COUNTERS
    // ========================================================

    let completed = 0;

    let today = 0;

    let missed = 0;

    let upcoming = 0;

    // ========================================================
    // CLASSIFY USING BACKEND STATUS
    // ========================================================

    leads.forEach(
        (lead) => {

            const status =
                String(
                    lead?.followUpStatus ||
                    ""
                )
                    .trim()
                    .toUpperCase();

            switch (status) {

                case "COMPLETED":

                    completed++;

                    break;

                case "TODAY":

                    today++;

                    break;

                case "MISSED":

                    missed++;

                    break;

                case "UPCOMING":

                    upcoming++;

                    break;

                default:

                    break;
            }

        }
    );

    // ========================================================
    // PENDING
    // ========================================================
    //
    // Pending means active work still requiring action:
    //
    // TODAY
    // MISSED
    // UPCOMING
    //
    // ========================================================

    const pending =
        today +
        missed +
        upcoming;

    // ========================================================
    // TOTAL
    // ========================================================
    //
    // Every lead returned by getFollowUps() is a follow-up
    // record according to the existing controller.
    //
    // Therefore use the controller's count.
    //
    // ========================================================

    const total =
        Number.isFinite(
            Number(response?.count)
        )
            ? Number(response.count)
            : leads.length;

    // ========================================================
    // RETURN
    // ========================================================

    return {

        total,

        completed,

        pending,

        missed,

        today,

        upcoming

    };
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getPerformanceOverview

};