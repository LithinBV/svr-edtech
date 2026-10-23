require("dotenv").config();
const mongoose = require("mongoose");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const qrcode = require("qrcode-terminal");

// Models (paths relative to /server)
const WhatsAppMessage = require("../models/WhatsAppMessage");
const Lead = require("../models/Lead");

async function startSync() {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error("❌ Error: MONGODB_URI is not defined in your .env file!");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ Worker connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }

  // Multi-file auth session storage folder
  const { state, saveCreds } = await useMultiFileAuthState("./whatsapp_auth_session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\n⚡ SCAN THIS QR CODE WITH YOUR WHATSAPP APP:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Connection closed (status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        startSync();
      }
    } else if (connection === "open") {
      console.log("🟢 SVR-EDTECH WhatsApp Web Bridge Connected & Listening 24/7!");
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // Intercept all sent & received messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.remoteJid === "status@broadcast") continue;

      const remoteJid = msg.key.remoteJid || "";
      const rawPhone = remoteJid.split("@")[0];
      const isFromMe = Boolean(msg.key.fromMe);

      // Extract text content
      const body =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        "";

      if (!body) continue;

      try {
        // Match lead using the last 10 digits
        const cleanDigits = rawPhone.slice(-10);
        const lead = await Lead.findOne({
          phoneNumber: { $regex: cleanDigits },
        });

        // Determine owner from assignedTo
        const assignedAgentId = lead ? lead.assignedTo : null;

        await WhatsAppMessage.findOneAndUpdate(
          { whatsappMessageId: msg.key.id },
          {
            leadId: lead ? lead._id : null,
            agentId: assignedAgentId, // Maps message strictly to the assigned executive
            phoneNumber: rawPhone,
            message: body,
            whatsappMessageId: msg.key.id,
            direction: isFromMe ? "OUTBOUND" : "INBOUND",
            status: isFromMe ? "SENT" : "RECEIVED",
            createdAt: new Date((msg.messageTimestamp || Math.floor(Date.now() / 1000)) * 1000),
          },
          { upsert: true, new: true }
        );

        console.log(
          `[Synced] ${isFromMe ? "OUTBOUND ->" : "INBOUND <-"} ${rawPhone} | Lead: ${lead ? lead.name : "Unmatched"} | Agent: ${assignedAgentId || "Unassigned"}`
        );
      } catch (err) {
        console.error("❌ Message sync error:", err.message);
      }
    }
  });
}

startSync();