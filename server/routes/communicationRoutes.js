const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const Communication = require("../models/Communication");

/*
 * =====================================================
 * GET COMMUNICATION HISTORY FOR A LEAD
 *
 * GET /api/communications/lead/:leadId
 *
 * Returns:
 *
 * WhatsApp
 * Email
 * Call
 *
 * together, newest first.
 * =====================================================
 */
router.get(
  "/lead/:leadId",
  protect,
  async (req, res) => {
    try {
      const { leadId } = req.params;

      if (!leadId) {
        return res.status(400).json({
          success: false,
          message: "leadId is required",
        });
      }

      const communications =
        await Communication.find({
          leadId,
        })
          .populate(
            "agentId",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        count: communications.length,
        communications,
      });
    } catch (error) {
      console.error(
        "GET COMMUNICATION HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch communication history",
      });
    }
  }
);


/*
 * =====================================================
 * GET COMMUNICATION HISTORY BY TYPE
 *
 * GET /api/communications/lead/:leadId/:type
 *
 * Examples:
 *
 * /api/communications/lead/123/WHATSAPP
 * /api/communications/lead/123/EMAIL
 * /api/communications/lead/123/CALL
 *
 * This will be useful for the separate
 * WhatsApp / Email / Call history pages.
 * =====================================================
 */
router.get(
  "/lead/:leadId/:type",
  protect,
  async (req, res) => {
    try {
      const {
        leadId,
        type,
      } = req.params;

      const allowedTypes = [
        "WHATSAPP",
        "EMAIL",
        "CALL",
      ];

      const communicationType =
        type.toUpperCase();

      if (
        !allowedTypes.includes(
          communicationType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid communication type",
          allowedTypes,
        });
      }

      const communications =
        await Communication.find({
          leadId,
          type: communicationType,
        })
          .populate(
            "agentId",
            "name email role"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        count: communications.length,
        type: communicationType,
        communications,
      });
    } catch (error) {
      console.error(
        "GET COMMUNICATION TYPE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch communication history",
      });
    }
  }
);


module.exports = router;