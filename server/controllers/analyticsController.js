const Lead = require("../models/lead");

// ============================================================
// HELPERS
// ============================================================

const getUserType = (req) => {
  return (
    req.user?.userType ||
    req.user?.role ||
    req.user?.type ||
    ""
  ).toUpperCase();
};

const isSuperAdmin = (req) => {
  const userType = getUserType(req);

  return (
    userType === "SUPER_ADMIN" ||
    userType === "SUPERADMIN" ||
    userType === "ADMIN"
  );
};

const getLoggedInUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.user?.user_id
  );
};

// ============================================================
// BASE VISIBILITY QUERY
// ============================================================

const getBaseQuery = (req) => {
  if (isSuperAdmin(req)) {
    return {};
  }

  const userId = getLoggedInUserId(req);

  if (!userId) {
    return null;
  }

  return {
    leadOwner: userId,
  };
};

// ============================================================
// DATE RANGE HELPER
// ============================================================

const getDateRange = (range) => {
  const now = new Date();

  let startDate;
  let endDate;

  switch ((range || "7days").toLowerCase()) {

    // --------------------------------------------------------
    // TODAY
    // --------------------------------------------------------
    case "today": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      break;
    }

    // --------------------------------------------------------
    // YESTERDAY
    // --------------------------------------------------------
    case "yesterday": {
      endDate = new Date(now);
      endDate.setHours(0, 0, 0, 0);

      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 1);

      break;
    }

    // --------------------------------------------------------
    // LAST 7 DAYS
    // --------------------------------------------------------
    case "7days": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 6);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST 15 DAYS
    // --------------------------------------------------------
    case "15days": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 14);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST 30 DAYS
    // --------------------------------------------------------
    case "30days": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 29);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST 7 WEEKS = 49 DAYS
    // --------------------------------------------------------
    case "7weeks": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 48);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST 3 MONTHS
    // --------------------------------------------------------
    case "3months": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setMonth(startDate.getMonth() - 3);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST 6 MONTHS
    // --------------------------------------------------------
    case "6months": {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setMonth(startDate.getMonth() - 6);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // THIS MONTH
    // --------------------------------------------------------
    case "month": {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // THIS YEAR
    // --------------------------------------------------------
    case "year": {
      startDate = new Date(
        now.getFullYear(),
        0,
        1
      );

      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }

    // --------------------------------------------------------
    // LAST YEAR
    // --------------------------------------------------------
    case "lastyear": {
      startDate = new Date(
        now.getFullYear() - 1,
        0,
        1
      );

      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(
        now.getFullYear(),
        0,
        1
      );

      endDate.setHours(0, 0, 0, 0);

      break;
    }

    // --------------------------------------------------------
    // CUSTOM
    // --------------------------------------------------------
    case "custom": {
      throw new Error(
        "Custom date range requires startDate and endDate"
      );
    }

    // --------------------------------------------------------
    // DEFAULT = LAST 7 DAYS
    // --------------------------------------------------------
    default: {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 6);

      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);

      break;
    }
  }

  return {
    startDate,
    endDate,
  };
};

// ============================================================
// BUILD DATE QUERY
// ============================================================

const getDateQuery = (req) => {
  const range = (req.query.range || "7days").toLowerCase();

  // Custom range
  if (range === "custom") {
    if (!req.query.startDate || !req.query.endDate) {
      throw new Error(
        "startDate and endDate are required for custom range"
      );
    }

    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      throw new Error(
        "Invalid startDate or endDate"
      );
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate,
      endDate,
    };
  }

  return getDateRange(range);
};

// ============================================================
// 1. ANALYTICS OVERVIEW
// ============================================================

const getAnalyticsOverview = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const { startDate, endDate } =
      getDateQuery(req);

    const range =
      (req.query.range || "7days").toLowerCase();

    const dateQuery = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const filteredQuery = {
      ...baseQuery,
      ...dateQuery,
    };

    const now = new Date();

    const [
      totalLeads,
      newLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      followUps,
      completedFollowUps,
      overdueFollowUps,
      interestedLeads,
      walkingInLeads,
      enrolledLeads,
      notInterestedLeads,
      rnrLeads,
    ] = await Promise.all([

      // Total leads in selected range
      Lead.countDocuments(filteredQuery),

      // NEW
      Lead.countDocuments({
        ...filteredQuery,
        status: "NEW",
      }),

      // HOT
      Lead.countDocuments({
        ...filteredQuery,
        status: "HOT",
      }),

      // WARM
      Lead.countDocuments({
        ...filteredQuery,
        status: "WARM",
      }),

      // COLD
      Lead.countDocuments({
        ...filteredQuery,
        status: "COLD",
      }),

      // Follow-ups in selected range
      Lead.countDocuments({
        ...filteredQuery,
        followUpAt: {
          $ne: null,
        },
      }),

      // Completed follow-ups
      Lead.countDocuments({
        ...filteredQuery,
        followUpCompleted: true,
      }),

      // Overdue follow-ups
      Lead.countDocuments({
        ...filteredQuery,
        followUpAt: {
          $ne: null,
          $lt: now,
        },
        followUpCompleted: {
          $ne: true,
        },
      }),

      // INTERESTED
      Lead.countDocuments({
        ...filteredQuery,
        latestRemark: "INTERESTED",
      }),

      // WALKING IN
      Lead.countDocuments({
        ...filteredQuery,
        latestRemark: "WALKING_IN",
      }),

      // ENROLLED
      Lead.countDocuments({
        ...filteredQuery,
        latestRemark: "ENROLLED",
      }),

      // NOT INTERESTED
      Lead.countDocuments({
        ...filteredQuery,
        latestRemark: "NOT_INTERESTED",
      }),

      // RNR
      Lead.countDocuments({
        ...filteredQuery,
        latestRemark: "RNR",
      }),
    ]);

    return res.status(200).json({
      success: true,

      range,

      startDate,
      endDate,

      data: {
        totalLeads,

        status: {
          new: newLeads,
          hot: hotLeads,
          warm: warmLeads,
          cold: coldLeads,
        },

        followUps: {
          total: followUps,
          completed: completedFollowUps,
          overdue: overdueFollowUps,
        },

        date: {
          startDate,
          endDate,
        },

        conversion: {
          interested: interestedLeads,
          walkingIn: walkingInLeads,
          enrolled: enrolledLeads,
          notInterested: notInterestedLeads,
          rnr: rnrLeads,
        },
      },
    });
  } catch (error) {
    console.error(
      "Analytics overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch analytics overview",
      error: error.message,
    });
  }
};

// ============================================================
// 2. DATE-WISE ANALYTICS
// ============================================================

const getDateWiseAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const range =
      (req.query.range || "7days").toLowerCase();

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        date: item._id,
        count: item.count,
      })
    );

    return res.status(200).json({
      success: true,

      range,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "Date-wise analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch date-wise analytics",
      error: error.message,
    });
  }
};

// ============================================================
// 3. SOURCE-WISE ANALYTICS
// ============================================================

const getSourceWiseAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $ifNull: [
              "$leadSource",
              "Unknown",
            ],
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        source: item._id,
        count: item.count,
      })
    );

    return res.status(200).json({
      success: true,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "Source-wise analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch source-wise analytics",
      error: error.message,
    });
  }
};

// ============================================================
// 4. CONVERSION / REMARK ANALYTICS
// ============================================================

const getConversionAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $ifNull: [
              "$latestRemark",
              "NO_REMARK",
            ],
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        remark: item._id,
        count: item.count,
      })
    );

    return res.status(200).json({
      success: true,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "Conversion analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch conversion analytics",
      error: error.message,
    });
  }
};

// ============================================================
// 5. LEAD TYPE ANALYTICS
// ============================================================

const getLeadTypeAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $ifNull: [
              "$leadType",
              "Unknown",
            ],
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        leadType: item._id,
        count: item.count,
      })
    );

    return res.status(200).json({
      success: true,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "Lead type analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch lead type analytics",
      error: error.message,
    });
  }
};

// ============================================================
// 6. PROGRAM-WISE ANALYTICS
// ============================================================

const getProgramWiseAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const range =
      (req.query.range || "7days").toLowerCase();

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            program: {
              $ifNull: [
                "$programInterest",
                "Unknown",
              ],
            },

            leadType: {
              $ifNull: [
                "$leadType",
                "Unknown",
              ],
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        program: item._id.program,
        count: item.count,
        leadType: item._id.leadType,
      })
    );

    return res.status(200).json({
      success: true,

      range,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "Program-wise analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch program-wise analytics",
      error: error.message,
    });
  }
};

// ============================================================
// 7. USER / LEAD OWNER ANALYTICS
// ============================================================

const getUserWiseAnalytics = async (req, res) => {
  try {
    const baseQuery = getBaseQuery(req);

    if (baseQuery === null) {
      return res.status(401).json({
        success: false,
        message:
          "User authentication information not found",
      });
    }

    const {
      startDate,
      endDate,
    } = getDateQuery(req);

    const results = await Lead.aggregate([
      {
        $match: {
          ...baseQuery,

          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $lookup: {
          from: "users",

          localField: "leadOwner",

          foreignField: "_id",

          as: "owner",
        },
      },

      {
        $unwind: {
          path: "$owner",

          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$leadOwner",

          ownerName: {
            $first: {
              $ifNull: [
                "$owner.name",
                "Unassigned",
              ],
            },
          },

          ownerEmail: {
            $first: {
              $ifNull: [
                "$owner.email",
                "",
              ],
            },
          },

          totalLeads: {
            $sum: 1,
          },

          newLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "NEW",
                  ],
                },
                1,
                0,
              ],
            },
          },

          hotLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "HOT",
                  ],
                },
                1,
                0,
              ],
            },
          },

          warmLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "WARM",
                  ],
                },
                1,
                0,
              ],
            },
          },

          coldLeads: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "COLD",
                  ],
                },
                1,
                0,
              ],
            },
          },

          interested: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$latestRemark",
                    "INTERESTED",
                  ],
                },
                1,
                0,
              ],
            },
          },

          walkingIn: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$latestRemark",
                    "WALKING_IN",
                  ],
                },
                1,
                0,
              ],
            },
          },

          enrolled: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$latestRemark",
                    "ENROLLED",
                  ],
                },
                1,
                0,
              ],
            },
          },

          followUps: {
            $sum: {
              $cond: [
                {
                  $ne: [
                    "$followUpAt",
                    null,
                  ],
                },
                1,
                0,
              ],
            },
          },

          completedFollowUps: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$followUpCompleted",
                    true,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          totalLeads: -1,
        },
      },
    ]);

    const data = results.map(
      (item) => ({
        ownerId: item._id,

        ownerName:
          item.ownerName,

        ownerEmail:
          item.ownerEmail,

        totalLeads:
          item.totalLeads,

        status: {
          new:
            item.newLeads,

          hot:
            item.hotLeads,

          warm:
            item.warmLeads,

          cold:
            item.coldLeads,
        },

        interested:
          item.interested,

        walkingIn:
          item.walkingIn,

        enrolled:
          item.enrolled,

        followUps: {
          total:
            item.followUps,

          completed:
            item.completedFollowUps,
        },
      })
    );

    return res.status(200).json({
      success: true,

      startDate,
      endDate,

      data,
    });
  } catch (error) {
    console.error(
      "User-wise analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user-wise analytics",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getAnalyticsOverview,
  getDateWiseAnalytics,
  getSourceWiseAnalytics,
  getConversionAnalytics,
  getLeadTypeAnalytics,
  getProgramWiseAnalytics,
  getUserWiseAnalytics,
};