class EmailProvider {
  /**
   * =====================================================
   * SEND EMAIL
   * =====================================================
   */
  async sendEmail() {
    throw new Error(
      "sendEmail() must be implemented by the email provider"
    );
  }

  /**
   * =====================================================
   * HANDLE WEBHOOK
   * =====================================================
   */
  async handleWebhook() {
    throw new Error(
      "handleWebhook() must be implemented by the email provider"
    );
  }
}

module.exports = EmailProvider;