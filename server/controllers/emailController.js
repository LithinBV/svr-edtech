const {
  sendEmail,
  getLeadEmailHistory,
  updateEmailStatus,
} = require("../services/email/emailService");

/**
 * =====================================================
 * SEND EMAIL
 * POST /api/email/send
 * =====================================================
 */
const send = async (req, res) => {
  try {
    const {
      leadId,
      to,
      cc = null,
      bcc = null,
      subject = "",
      message = "",
      htmlMessage = null,
      templateName = null,
      templateId = null,
    } = req.body;

    console.log("=================================");
    console.log("EMAIL CONTROLLER - SEND");
    console.log("Lead ID:", leadId);
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("=================================");

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required",
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required",
      });
    }

    if (!message && !htmlMessage) {
      return res.status(400).json({
        success: false,
        message: "Email message is required",
      });
    }

    // -----------------------------
    // GET LOGGED-IN USER
    // -----------------------------

    const agentId = req.user?.userId;

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // -----------------------------
    // SEND EMAIL
    // -----------------------------

    const result = await sendEmail({
      leadId,
      agentId,
      to,
      cc,
      bcc,
      subject,
      message,
      htmlMessage,
      templateName,
      templateId,
    });

    console.log("=================================");
    console.log("EMAIL CONTROLLER - SUCCESS");
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("=================================");
    console.error("EMAIL CONTROLLER - ERROR");
    console.error(error);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};

/**
 * =====================================================
 * GET EMAIL HISTORY
 * GET /api/email/lead/:leadId
 * =====================================================
 */
const getHistory = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required",
      });
    }

    const emails =
      await getLeadEmailHistory(leadId);

    return res.status(200).json({
      success: true,
      data: emails,
    });
  } catch (error) {
    console.error(
      "Get email history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch email history",
    });
  }
};

/**
 * =====================================================
 * UPDATE EMAIL STATUS
 * PUT /api/email/status
 * =====================================================
 */
const updateStatus = async (req, res) => {
  try {
    const {
      providerMessageId,
      status,
      metadata = {},
    } = req.body;

    if (!providerMessageId) {
      return res.status(400).json({
        success: false,
        message: "providerMessageId is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required",
      });
    }

    const result = await updateEmailStatus({
      providerMessageId,
      status,
      metadata,
    });

    return res.status(200).json({
      success: true,
      message: "Email status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Update email status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update email status",
    });
  }
};

module.exports = {
  send,
  getHistory,
  updateStatus,
};