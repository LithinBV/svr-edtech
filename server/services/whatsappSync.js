const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const WhatsAppMessage = require("../models/WhatsAppMessage");
const Lead = require("../models/Lead"); // Make sure path matches your Lead model

async function initWhatsAppSync() {
  // Stores session keys locally so you don't scan QR code every restart
  const { state, saveCreds } = await useMultiFileAuthState("./whatsapp_auth_session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }), // Hides noisy network logs
    printQRInTerminal: false,
  });

  // Display QR code in console on first login
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("⚡ Scan this QR Code with the WhatsApp account used by executives:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Connection closed (reason: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        initWhatsAppSync();
      }
    } else if (connection === "open") {
      console.log("✅ SVR-EDTECH WhatsApp Sync Service Connected!");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Catch ALL incoming and outgoing chat updates
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    for (const msg of messages) {
      // Ignore status/broadcast stories
      if (!msg.message || msg.key.remoteJid === "status@broadcast") continue;

      const remoteJid = msg.key.remoteJid || "";
      // Extract clean phone number without @s.whatsapp.net
      const rawPhone = remoteJid.split("@")[0];
      const isFromMe = Boolean(msg.key.fromMe);

      // Extract message body text
      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!body) continue; // Skip non-text/empty updates for now

      try {
        // Format phone to match your Lead phone formatting (last 10 digits regex)
        const lead = await Lead.findOne({
          phoneNumber: { $regex: rawPhone.slice(-10) },
        });

        // Upsert to ensure we don't duplicate records
        await WhatsAppMessage.findOneAndUpdate(
          { whatsappMessageId: msg.key.id },
          {
            leadId: lead ? lead._id : null,
            phoneNumber: rawPhone,
            message: body,
            whatsappMessageId: msg.key.id,
            direction: isFromMe ? "OUTBOUND" : "INBOUND",
            status: isFromMe ? "SENT" : "RECEIVED",
            createdAt: new Date((msg.messageTimestamp || Date.now() / 1000) * 1000),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("Failed to sync message to MongoDB:", err.message);
      }
    }
  });
}

module.exports = { initWhatsAppSync };