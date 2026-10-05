const ResendEmailProvider = require("./providers/resendProvider");

/**
 * =====================================================
 * EMAIL PROVIDER FACTORY
 * =====================================================
 *
 * Currently supported:
 * - Resend
 *
 * The provider is selected using:
 *
 * EMAIL_PROVIDER=resend
 *
 * If EMAIL_PROVIDER is not specified,
 * Resend will be used by default.
 */

const getEmailProvider = () => {
  const providerName = (
    process.env.EMAIL_PROVIDER || "resend"
  ).trim().toLowerCase();

  console.log("=================================");
  console.log("EMAIL PROVIDER FACTORY");
  console.log("PROVIDER:", providerName);
  console.log("=================================");

  switch (providerName) {
    case "resend":
      return new ResendEmailProvider();

    default:
      throw new Error(
        `Unsupported email provider: ${providerName}`
      );
  }
};

module.exports = getEmailProvider;