const EmailProvider = require("../emailProvider");

class ResendEmailProvider extends EmailProvider {
  constructor() {
    super();

    this.apiKey = process.env.RESEND_API_KEY;

    this.fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      null;

    this.apiUrl =
      "https://api.resend.com/emails";

    console.log("=================================");
    console.log("RESEND PROVIDER");
    console.log(
      "API KEY CONFIGURED:",
      Boolean(this.apiKey)
    );
    console.log(
      "FROM EMAIL:",
      this.fromEmail || "NOT SET"
    );
    console.log("=================================");
  }

  /**
   * =====================================================
   * SEND EMAIL
   * =====================================================
   */
  async sendEmail({
    from = null,
    to,
    cc = null,
    bcc = null,
    subject = "",
    message = "",
    htmlMessage = null,
  }) {
    console.log("=================================");
    console.log("RESEND SEND EMAIL");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log("=================================");

    if (!this.apiKey) {
      throw new Error(
        "RESEND_API_KEY is not configured"
      );
    }

    const sender =
      from || this.fromEmail;

    if (!sender) {
      throw new Error(
        "RESEND_FROM_EMAIL is not configured"
      );
    }

    if (!to) {
      throw new Error(
        "Recipient email is required"
      );
    }

    if (!message && !htmlMessage) {
      throw new Error(
        "Email message is required"
      );
    }

    const payload = {
      from: sender,
      to: Array.isArray(to)
        ? to
        : [to],
      subject,
      text: message || undefined,
      html: htmlMessage || undefined,
    };

    if (cc) {
      payload.cc = Array.isArray(cc)
        ? cc
        : [cc];
    }

    if (bcc) {
      payload.bcc = Array.isArray(bcc)
        ? bcc
        : [bcc];
    }

    console.log(
      "Sending request to Resend..."
    );

    const response = await fetch(
      this.apiUrl,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${this.apiKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    console.log(
      "RESEND STATUS:",
      response.status
    );

    console.log(
      "RESEND RESPONSE:",
      data
    );

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        `Resend API request failed with status ${response.status}`;

      throw new Error(errorMessage);
    }

    console.log(
      "EMAIL SENT:",
      data?.id || "NO MESSAGE ID"
    );

    return {
      provider: "resend",

      providerMessageId:
        data?.id || null,

      metadata:
        data || {},
    };
  }

  /**
   * =====================================================
   * WEBHOOK
   * =====================================================
   */
  async handleWebhook(payload) {
    return {
      provider: "resend",
      payload,
    };
  }
}

module.exports = ResendEmailProvider;