const express = require("express");

const router = express.Router();

const getWhatsAppProvider = require(
  "../services/whatsapp/whatsappProviderFactory"
);

const {
  updateWhatsAppStatus,
} = require("../services/whatsapp/whatsappService");


/*
 * =====================================================
 * META WEBHOOK VERIFICATION
 *
 * GET /api/whatsapp/webhook
 *
 * Meta uses this when configuring/verifying
 * the WhatsApp webhook.
 * =====================================================
 */
router.get(
  "/webhook",
  (req, res) => {
    try {
      const mode =
        req.query["hub.mode"];

      const token =
        req.query["hub.verify_token"];

      const challenge =
        req.query["hub.challenge"];

      const verifyToken =
        process.env.WHATSAPP_VERIFY_TOKEN;

      /*
       * Make sure the request is actually
       * asking for webhook verification.
       */
      if (
        mode === "subscribe" &&
        token &&
        token === verifyToken
      ) {
        console.log(
          "WhatsApp webhook verified successfully"
        );

        return res
          .status(200)
          .send(challenge);
      }

      console.error(
        "WhatsApp webhook verification failed"
      );

      return res
        .status(403)
        .send("Forbidden");
    } catch (error) {
      console.error(
        "WHATSAPP WEBHOOK VERIFICATION ERROR:",
        error
      );

      return res
        .status(500)
        .send("Webhook verification failed");
    }
  }
);


/*
 * =====================================================
 * META WEBHOOK EVENTS
 *
 * POST /api/whatsapp/webhook
 *
 * Meta will send events here when:
 *
 * SENT
 * DELIVERED
 * READ
 * FAILED
 *
 * We will process those events and update
 * our database.
 * =====================================================
 */
router.post(
  "/webhook",
  async (req, res) => {
    try {
      const payload = req.body;

      console.log(
        "WhatsApp webhook received"
      );

      /*
       * Always acknowledge the webhook quickly.
       *
       * We process the payload after validating
       * the request structure.
       */
      if (!payload) {
        return res
          .status(200)
          .json({
            success: true,
          });
      }

      /*
       * Only process WhatsApp business events.
       */
      if (
        payload.object !==
        "whatsapp_business_account"
      ) {
        return res
          .status(200)
          .json({
            success: true,
            message:
              "Event ignored",
          });
      }

      /*
       * Meta can send multiple entries
       * and changes in one webhook request.
       */
      const entries =
        payload.entry || [];

      for (
        const entry of entries
      ) {
        const changes =
          entry.changes || [];

        for (
          const change of changes
        ) {
          const value =
            change.value || {};

          /*
           * Message status updates
           */
          const statuses =
            value.statuses || [];

          for (
            const statusItem of statuses
          ) {
            const providerMessageId =
              statusItem.id;

            if (
              !providerMessageId
            ) {
              continue;
            }

            /*
             * Meta status values:
             *
             * sent
             * delivered
             * read
             * failed
             */
            let status;

            switch (
              statusItem.status
            ) {
              case "sent":
                status = "SENT";
                break;

              case "delivered":
                status =
                  "DELIVERED";
                break;

              case "read":
                status = "READ";
                break;

              case "failed":
                status = "FAILED";
                break;

              default:
                continue;
            }

            /*
             * Extract error information
             * when Meta reports FAILED.
             */
            let errorCode = null;
            let errorMessage = null;

            if (
              status === "FAILED"
            ) {
              const errors =
                statusItem.errors ||
                [];

              const firstError =
                errors[0];

              if (firstError) {
                errorCode =
                  firstError.code
                    ? String(
                        firstError.code
                      )
                    : null;

                errorMessage =
                  firstError.title ||
                  firstError.message ||
                  null;
              }
            }

            /*
             * Update our database.
             *
             * This updates both:
             *
             * WhatsAppMessage
             * Communication
             */
            try {
              await updateWhatsAppStatus({
                providerMessageId,
                status,

                metadata: {
                  conversation:
                    statusItem.conversation ||
                    null,

                  pricing:
                    statusItem.pricing ||
                    null,

                  recipientId:
                    statusItem.recipient_id ||
                    null,

                  timestamp:
                    statusItem.timestamp ||
                    null,
                },

                errorCode,
                errorMessage,
              });

              console.log(
                `WhatsApp status updated: ${providerMessageId} → ${status}`
              );
            } catch (statusError) {
              /*
               * Do not crash the entire webhook
               * if one message cannot be found.
               */
              console.error(
                "WHATSAPP STATUS UPDATE ERROR:",
                statusError.message
              );
            }
          }
        }
      }

      /*
       * Meta expects a successful response.
       */
      return res
        .status(200)
        .json({
          success: true,
        });
    } catch (error) {
      console.error(
        "WHATSAPP WEBHOOK ERROR:",
        error
      );

      /*
       * Return 200 after receiving the webhook
       * so the provider does not repeatedly retry
       * a malformed/unexpected event forever.
       *
       * We still log the error for debugging.
       */
      return res
        .status(200)
        .json({
          success: false,
        });
    }
  }
);


module.exports = router;