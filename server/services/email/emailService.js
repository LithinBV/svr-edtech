const Email = require("../../models/Email");
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
    process.env.RESEND_FROM_EMAIL ||
    process.env.EMAIL_FROM;

  console.log("=================================");
  console.log("EMAIL SERVICE");
  console.log("RESEND KEY CONFIGURED:", Boolean(apiKey));
  console.log("RESEND FROM:", fromEmail || "NOT SET");
  console.log("RECIPIENT:", to);
  console.log("=================================");

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured"
    );
  }

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured"
    );
  }

  // ---------------------------------------------------
  // CREATE EMAIL RECORD
  // ---------------------------------------------------

  const email = await Email.create({
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

    direction: "OUTBOUND",

    status: "QUEUED",
  });

  // ---------------------------------------------------
  // CREATE COMMUNICATION RECORD
  // ---------------------------------------------------

  const communication =
    await Communication.create({
      leadId,
      agentId,

      type: "EMAIL",

      direction: "OUTBOUND",

      status: "QUEUED",

      message,

      subject,

      email: to,

      provider: "resend",
    });

  try {
    // -------------------------------------------------
    // MARK AS SENDING
    // -------------------------------------------------

    email.status = "SENDING";
    await email.save();

    communication.status = "SENDING";
    await communication.save();

    // -------------------------------------------------
    // CREATE RESEND PAYLOAD
    // -------------------------------------------------

    const payload = {
      from: fromEmail,

      to: Array.isArray(to)
        ? to
        : [to],

      subject,

      text: message || undefined,

      html: htmlMessage || undefined,
    };

    // -------------------------------------------------
    // CC
    // -------------------------------------------------

    if (cc) {
      payload.cc = Array.isArray(cc)
        ? cc
        : [cc];
    }

    // -------------------------------------------------
    // BCC
    // -------------------------------------------------

    if (bcc) {
      payload.bcc = Array.isArray(bcc)
        ? bcc
        : [bcc];
    }

    console.log(
      "Sending email directly through Resend..."
    );

    // -------------------------------------------------
    // SEND TO RESEND
    // -------------------------------------------------

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    // -------------------------------------------------
    // READ RESPONSE
    // -------------------------------------------------

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log(
      "RESEND HTTP STATUS:",
      response.status
    );

    console.log(
      "RESEND RESPONSE:",
      data
    );

    // -------------------------------------------------
    // RESEND ERROR
    // -------------------------------------------------

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

    email.providerMessageId =
      data?.id || null;

    email.sentAt = new Date();

    email.metadata =
      data || {};

    await email.save();

    // -------------------------------------------------
    // UPDATE COMMUNICATION
    // -------------------------------------------------

    communication.status = "SENT";

    communication.provider = "resend";

    communication.providerMessageId =
      data?.id || null;

    communication.metadata =
      data || {};

    await communication.save();

    console.log(
      "================================="
    );

    console.log(
      "EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "RESEND MESSAGE ID:",
      data?.id || "N/A"
    );

    console.log(
      "================================="
    );

    return {
      email,
      communication,
    };

  } catch (error) {

    // -------------------------------------------------
    // EMAIL FAILED
    // -------------------------------------------------

    console.error(
      "================================="
    );

    console.error(
      "EMAIL SENDING FAILED"
    );

    console.error(error);

    console.error(
      "================================="
    );

    email.status = "FAILED";

    email.errorMessage =
      error.message ||
      "Email sending failed";

    await email.save();

    communication.status = "FAILED";

    communication.metadata = {
      ...(communication.metadata || {}),

      errorMessage:
        error.message ||
        "Email sending failed",
    };

    await communication.save();

    throw error;
  }
};


/**
 * =====================================================
 * GET EMAIL HISTORY
 * =====================================================
 */
const getLeadEmailHistory =
  async (leadId) => {

    if (!leadId) {
      throw new Error(
        "Lead ID is required"
      );
    }

    const emails =
      await Email.find({
        leadId,
      })
        .populate(
          "agentId",
          "name email role"
        )
        .sort({
          createdAt: -1,
        });

    return emails;
  };


/**
 * =====================================================
 * UPDATE EMAIL STATUS
 * =====================================================
 */
const updateEmailStatus =
  async ({
    providerMessageId,
    status,
    metadata = {},
  }) => {

    if (!providerMessageId) {
      throw new Error(
        "providerMessageId is required"
      );
    }

    if (!status) {
      throw new Error(
        "status is required"
      );
    }

    // -------------------------------------------------
    // UPDATE EMAIL
    // -------------------------------------------------

    const email =
      await Email.findOne({
        providerMessageId,
      });

    if (email) {

      email.status = status;

      if (
        metadata &&
        Object.keys(metadata).length > 0
      ) {
        email.metadata = {
          ...(email.metadata || {}),
          ...metadata,
        };
      }

      if (
        status === "SENT" &&
        !email.sentAt
      ) {
        email.sentAt = new Date();
      }

      if (
        status === "DELIVERED" &&
        !email.deliveredAt
      ) {
        email.deliveredAt = new Date();
      }

      if (
        status === "OPENED" &&
        !email.openedAt
      ) {
        email.openedAt = new Date();
      }

      if (
        status === "CLICKED" &&
        !email.clickedAt
      ) {
        email.clickedAt = new Date();
      }

      if (
        status === "FAILED" ||
        status === "BOUNCED"
      ) {
        email.errorCode =
          metadata.errorCode ||
          email.errorCode ||
          null;

        email.errorMessage =
          metadata.errorMessage ||
          email.errorMessage ||
          null;
      }

      await email.save();
    }

    // -------------------------------------------------
    // UPDATE COMMUNICATION
    // -------------------------------------------------

    const communication =
      await Communication.findOne({
        providerMessageId,
      });

    if (communication) {

      communication.status =
        status;

      if (
        metadata &&
        Object.keys(metadata).length > 0
      ) {
        communication.metadata = {
          ...(communication.metadata || {}),
          ...metadata,
        };
      }

      await communication.save();
    }

    return {
      email,
      communication,
    };
  };


/**
 * =====================================================
 * EXPORTS
 * =====================================================
 */

module.exports = {
  sendEmail,
  getLeadEmailHistory,
  updateEmailStatus,

  // Compatibility alias
  getEmailHistory:
    getLeadEmailHistory,
};