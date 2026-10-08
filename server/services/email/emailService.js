const mongoose = require("mongoose");
// Make sure this matches the exact casing of your file (email.js vs Email.js)
const Email = require("../../models/email"); 
const Communication = require("../../models/Communication");

/**
 * =====================================================
 * SEND EMAIL
 * =====================================================
 */
const sendEmail = async ({
  leadId,
  agentId,
  to,
  cc = null,
  bcc = null,
  subject = "",
  message = "",
  htmlMessage = null,
  templateName = null,
  templateId = null,
}) => {
  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------
  if (!leadId) {
    throw new Error("Lead ID is required");
  }

  if (!agentId) {
    throw new Error("Agent ID is required");
  }

  if (!to) {
    throw new Error("Recipient email is required");
  }

  if (!message && !htmlMessage) {
    throw new Error("Email message is required");
  }

  // ---------------------------------------------------
  // CHECK RESEND CONFIGURATION
  // ---------------------------------------------------
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;

  console.log("=================================");
  console.log("EMAIL SERVICE");
  console.log("RESEND KEY CONFIGURED:", Boolean(apiKey));
  console.log("RESEND FROM:", fromEmail || "NOT SET");
  console.log("RECIPIENT:", to);
  console.log("=================================");

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const castLeadId = mongoose.Types.ObjectId.isValid(leadId)
    ? new mongoose.Types.ObjectId(leadId)
    : leadId;

  const castAgentId = mongoose.Types.ObjectId.isValid(agentId)
    ? new mongoose.Types.ObjectId(agentId)
    : agentId;

  // ---------------------------------------------------
  // CREATE EMAIL RECORD
  // ---------------------------------------------------
  const email = await Email.create({
    leadId: castLeadId,
    agentId: castAgentId,
    to,
    cc,
    bcc,
    subject,
    message,
    htmlMessage,
    templateName,
    templateId,
    direction: "OUTBOUND",
    status: "QUEUED",
  });

  // ---------------------------------------------------
  // CREATE COMMUNICATION RECORD
  // ---------------------------------------------------
  let communication = null;
  try {
    communication = await Communication.create({
      leadId: castLeadId,
      agentId: castAgentId,
      type: "EMAIL",
      direction: "OUTBOUND",
      status: "QUEUED",
      message,
      subject,
      email: Array.isArray(to) ? to.join(", ") : to,
      provider: "resend",
    });
  } catch (commError) {
    console.warn("Communication log creation failed:", commError.message);
  }

  try {
    // -------------------------------------------------
    // MARK AS SENDING
    // -------------------------------------------------
    email.status = "SENDING";
    await email.save();

    if (communication) {
      communication.status = "SENDING";
      await communication.save();
    }

    // -------------------------------------------------
    // CREATE RESEND PAYLOAD
    // -------------------------------------------------
    const payload = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject: subject || "(No Subject)",
      text: message || undefined,
      html: htmlMessage || (message ? message.replace(/\n/g, "<br/>") : undefined),
    };

    if (cc) {
      payload.cc = Array.isArray(cc) ? cc : [cc];
    }

    if (bcc) {
      payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    console.log("Sending email directly through Resend...");

    // -------------------------------------------------
    // SEND TO RESEND
    // -------------------------------------------------
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log("RESEND HTTP STATUS:", response.status);
    console.log("RESEND RESPONSE:", data);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Resend API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------
    email.status = "SENT";
    email.provider = "resend";
    email.providerMessageId = data?.id || null;
    email.sentAt = new Date();
    email.metadata = data || {};
    await email.save();

    if (communication) {
      communication.status = "SENT";
      communication.provider = "resend";
      communication.providerMessageId = data?.id || null;
      communication.metadata = data || {};
      await communication.save();
    }

    console.log("=================================");
    console.log("EMAIL SENT AND SAVED SUCCESSFULLY");
    console.log("RESEND MESSAGE ID:", data?.id || "N/A");
    console.log("=================================");

    return {
      email,
      communication,
    };
  } catch (error) {
    // -------------------------------------------------
    // EMAIL FAILED
    // -------------------------------------------------
    console.error("=================================");
    console.error("EMAIL SENDING FAILED");
    console.error(error);
    console.error("=================================");

    email.status = "FAILED";
    email.errorMessage = error.message || "Email sending failed";
    await email.save();

    if (communication) {
      communication.status = "FAILED";
      communication.metadata = {
        ...(communication.metadata || {}),
        errorMessage: error.message || "Email sending failed",
      };
      await communication.save();
    }

    throw error;
  }
};

/**
 * =====================================================
 * GET EMAIL HISTORY
 * =====================================================
 */
const getLeadEmailHistory = async (leadId) => {
  if (!leadId) {
    throw new Error("Lead ID is required");
  }

  const castLeadId = mongoose.Types.ObjectId.isValid(leadId)
    ? new mongoose.Types.ObjectId(leadId)
    : leadId;

  const emails = await Email.find({
    leadId: castLeadId,
  })
    .populate("agentId", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  return emails;
};

/**
 * =====================================================
 * UPDATE EMAIL STATUS
 * =====================================================
 */
const updateEmailStatus = async ({
  providerMessageId,
  status,
  metadata = {},
}) => {
  if (!providerMessageId) {
    throw new Error("providerMessageId is required");
  }

  if (!status) {
    throw new Error("status is required");
  }

  const email = await Email.findOne({ providerMessageId });

  if (email) {
    email.status = status;

    if (metadata && Object.keys(metadata).length > 0) {
      email.metadata = {
        ...(email.metadata || {}),
        ...metadata,
      };
    }

    if (status === "SENT" && !email.sentAt) {
      email.sentAt = new Date();
    }
    if (status === "DELIVERED" && !email.deliveredAt) {
      email.deliveredAt = new Date();
    }
    if (status === "OPENED" && !email.openedAt) {
      email.openedAt = new Date();
    }
    if (status === "CLICKED" && !email.clickedAt) {
      email.clickedAt = new Date();
    }
    if (status === "FAILED" || status === "BOUNCED") {
      email.errorCode = metadata.errorCode || email.errorCode || null;
      email.errorMessage = metadata.errorMessage || email.errorMessage || null;
    }

    await email.save();
  }

  const communication = await Communication.findOne({ providerMessageId });
  if (communication) {
    communication.status = status;
    if (metadata && Object.keys(metadata).length > 0) {
      communication.metadata = {
        ...(communication.metadata || {}),
        ...metadata,
      };
    }
    await communication.save();
  }

  return { email, communication };
};

module.exports = {
  sendEmail,
  getLeadEmailHistory,
  updateEmailStatus,
  getEmailHistory: getLeadEmailHistory,
};