const mongoose = require("mongoose");
require("dotenv").config();

const EmailTemplate = require("../models/EmailTemplate");

const templates = [
  // ============================================================
  // 1. NEW LEAD / FIRST CONTACT
  // ============================================================
  {
    name: "NEW LEAD / FIRST CONTACT",
    description: "Initial email for a newly received lead enquiry.",
    category: "WELCOME",
    subject: "Regarding your {{course}} enquiry",
    message: `Hi {{name}}, this is {{counsellor}} from SVR EdTech. 👋

We received your enquiry regarding {{course}}.

I tried reaching you to understand your career goals and share the right program details.

Let me know a convenient time to connect.`,
  },

  // ============================================================
  // 2. RNR - DID NOT ANSWER
  // ============================================================
  {
    name: "RNR — DID NOT ANSWER",
    description: "Follow-up when the lead did not answer the call.",
    category: "FOLLOW_UP",
    subject: "Following up on your {{course}} enquiry",
    message: `Hi {{name}}, we tried reaching you regarding your enquiry for {{course}}.

No worries if you're currently unavailable. 😊

Reply CALL whenever you're free and we'll connect with you.

– {{counsellor}}, SVR EdTech`,
  },

  // ============================================================
  // 3. RNR - SECOND ATTEMPT
  // ============================================================
  {
    name: "RNR — SECOND ATTEMPT",
    description: "Second follow-up attempt for an unanswered lead.",
    category: "FOLLOW_UP",
    subject: "Following up on your {{course}} enquiry",
    message: `Hi {{name}}, just following up on your {{course}} enquiry.

We couldn't connect with you earlier.

Would you prefer a call today or tomorrow?

Reply with a suitable time and we'll connect.`,
  },

  // ============================================================
  // 4. FOLLOW-UP 1
  // ============================================================
  {
    name: "FOLLOW-UP 1",
    description: "First follow-up after initial contact.",
    category: "FOLLOW_UP",
    subject: "Following up regarding {{course}}",
    message: `Hi {{name}}, just checking in regarding your interest in {{course}}.

Have you had a chance to consider the program?

If you have any questions about fees, duration, curriculum or career opportunities, I'm happy to help.`,
  },

  // ============================================================
  // 5. FOLLOW-UP 2
  // ============================================================
  {
    name: "FOLLOW-UP 2",
    description: "Second follow-up for an interested lead.",
    category: "FOLLOW_UP",
    subject: "A quick follow-up regarding {{course}}",
    message: `Hi {{name}}, following up once again regarding {{course}}.

I don't want you to miss the upcoming opportunity/batch.

Would you like me to reserve a counselling slot for you?

Reply YES and I'll assist you.`,
  },

  // ============================================================
  // 6. FOLLOW-UP 3 / FINAL FOLLOW-UP
  // ============================================================
  {
    name: "FOLLOW-UP 3 / FINAL FOLLOW-UP",
    description: "Final follow-up before closing the enquiry.",
    category: "FOLLOW_UP",
    subject: "Final follow-up regarding your {{course}} enquiry",
    message: `Hi {{name}}, this will be my final follow-up regarding your {{course}} enquiry.

If you're still interested, simply reply INTERESTED and we'll continue from there.

If your plans have changed, that's completely fine too. 👍`,
  },

  // ============================================================
  // 7. INTERESTED
  // ============================================================
  {
    name: "INTERESTED",
    description: "Email for a lead who has shown interest.",
    category: "COURSE",
    subject: "Details regarding {{course}}",
    message: `Great, {{name}}! 👍

Based on our conversation, {{course}} could be a good fit for your career goal.

I'll share the relevant details here:

📚 Program: {{course}}
📅 Batch: {{date}}
💰 Fee: {{amount}}

Would you like to proceed with the next step?`,
  },

  // ============================================================
  // 8. HIGHLY INTERESTED / READY TO ENROL
  // ============================================================
  {
    name: "HIGHLY INTERESTED / READY TO ENROL",
    description: "For leads ready to proceed with enrollment.",
    category: "COURSE",
    subject: "Complete your {{course}} enrollment",
    message: `Hi {{name}}! 👋

Great speaking with you.

As discussed, you're interested in joining {{course}}.

I can help you complete the enrollment process and share the required details.

Reply ENROLL and I'll guide you through the next step.`,
  },

  // ============================================================
  // 9. CALLBACK REQUESTED
  // ============================================================
  {
    name: "CALLBACK REQUESTED",
    description: "Confirmation for a requested callback.",
    category: "FOLLOW_UP",
    subject: "Callback regarding {{course}}",
    message: `Hi {{name}}, as requested, we'll connect with you regarding {{course}} at {{time}}.

If you need to change the timing, just reply CHANGE.

– {{counsellor}}, SVR EdTech`,
  },

  // ============================================================
  // 10. CALL BACK LATER
  // ============================================================
  {
    name: "CALL BACK LATER",
    description: "Confirmation for a later callback.",
    category: "FOLLOW_UP",
    subject: "Callback scheduled for your {{course}} enquiry",
    message: `Hi {{name}}, sure. 👍

We'll reconnect regarding {{course}} at your preferred time.

📅 {{date}}
⏰ {{time}}

Looking forward to speaking with you.`,
  },

  // ============================================================
  // 11. BUSY
  // ============================================================
  {
    name: "BUSY",
    description: "Response when the lead is currently busy.",
    category: "FOLLOW_UP",
    subject: "Regarding your {{course}} enquiry",
    message: `Hi {{name}}, understood. 👍

We won't disturb you now.

We'll reconnect regarding your {{course}} enquiry at a convenient time.

– SVR EdTech`,
  },

  // ============================================================
  // 12. SWITCHED OFF
  // ============================================================
  {
    name: "SWITCHED OFF",
    description: "Follow-up when the lead's phone was switched off.",
    category: "FOLLOW_UP",
    subject: "Unable to reach you regarding {{course}}",
    message: `Hi {{name}}, we tried reaching you regarding your {{course}} enquiry but couldn't connect.

Whenever you're available, reply CALL and we'll get back to you.`,
  },

  // ============================================================
  // 13. NOT INTERESTED
  // ============================================================
  {
    name: "NOT INTERESTED",
    description: "Closing an enquiry when the lead is not interested.",
    category: "GENERAL",
    subject: "Regarding your {{course}} enquiry",
    message: `Thanks for letting us know, {{name}}.

We'll close your current enquiry for {{course}}.

If your plans change in the future, you're always welcome to reach out to SVR EdTech.

Wishing you the best! 👍`,
  },

  // ============================================================
  // 14. NOT INTERESTED - PRICE
  // ============================================================
  {
    name: "NOT INTERESTED — PRICE",
    description: "Response when pricing is the reason for not proceeding.",
    category: "PAYMENT",
    subject: "Available options for {{course}}",
    message: `Hi {{name}}, completely understand.

If budget is the concern, we can discuss the available program options/payment plans depending on your requirement.

Would you like us to share the available options?`,
  },

  // ============================================================
  // 15. NOT INTERESTED - COURSE NOT RELEVANT
  // ============================================================
  {
    name: "NOT INTERESTED — COURSE NOT RELEVANT",
    description: "Response when the current course is not relevant.",
    category: "COURSE",
    subject: "Finding the right career program for you",
    message: `Understood, {{name}}. 👍

If you're exploring a different career path, let us know what you're looking for.

We may be able to suggest a more suitable program.`,
  },

  // ============================================================
  // 16. THINKING ABOUT IT
  // ============================================================
  {
    name: "THINKING ABOUT IT",
    description: "Response for leads who need more time to decide.",
    category: "FOLLOW_UP",
    subject: "Regarding your {{course}} enquiry",
    message: `Absolutely, {{name}}. Take your time.

I'll keep your enquiry for {{course}} open for now.

If you have any questions before making a decision, feel free to message me here.`,
  },

  // ============================================================
  // 17. WILL DISCUSS WITH PARENTS / FAMILY
  // ============================================================
  {
    name: "WILL DISCUSS WITH PARENTS / FAMILY",
    description: "Response when the lead wants to discuss the course with family.",
    category: "FOLLOW_UP",
    subject: "Regarding your {{course}} enquiry",
    message: `Sure, {{name}}. 👍

Please discuss it with your family.

If you or your parents have any questions regarding the program, fees, career path or training, we're happy to explain.

You can message us anytime.`,
  },

  // ============================================================
  // 18. WAITING FOR SALARY / MONEY
  // ============================================================
  {
    name: "WAITING FOR SALARY / MONEY",
    description: "Response when the lead is waiting for funds.",
    category: "PAYMENT",
    subject: "Regarding your {{course}} enrollment",
    message: `Hi {{name}}, understood.

Once you're ready to proceed with {{course}}, just message us here.

We'll help you with the next steps.`,
  },

  // ============================================================
  // 19. JOINING NEXT BATCH
  // ============================================================
  {
    name: "JOINING NEXT BATCH",
    description: "For leads planning to join a future batch.",
    category: "COURSE",
    subject: "Upcoming {{course}} batch",
    message: `Hi {{name}}, we'll keep your requirement noted for the upcoming {{course}} batch.

📅 Expected batch: {{date}}

We'll reconnect with you closer to the batch start date.`,
  },

  // ============================================================
  // 20. ENROLLED
  // ============================================================
  {
    name: "ENROLLED 🎉",
    description: "Confirmation email after successful enrollment.",
    category: "WELCOME",
    subject: "Welcome to SVR EdTech — {{course}} Enrollment Confirmed 🎉",
    message: `Congratulations, {{name}}! 🎉

Your enrollment for {{course}} with SVR EdTech is confirmed.

📅 Batch: {{date}}
⏰ Time: {{time}}
💻 Mode: {{mode}}

We'll share the joining instructions and further details with you shortly.

Welcome to SVR EdTech! 🚀`,
  },

  // ============================================================
  // 21. PAYMENT RECEIVED
  // ============================================================
  {
    name: "PAYMENT RECEIVED",
    description: "Confirmation of successful payment.",
    category: "PAYMENT",
    subject: "Payment received for {{course}}",
    message: `Hi {{name}}, your payment of ₹{{amount}} towards {{course}} has been received successfully. ✅

Your enrollment process is now underway.

We'll share the next steps shortly.

Thank you for choosing SVR EdTech.`,
  },

  // ============================================================
  // 22. PAYMENT PENDING
  // ============================================================
  {
    name: "PAYMENT PENDING",
    description: "Reminder for pending enrollment payment.",
    category: "PAYMENT",
    subject: "Payment pending for {{course}} enrollment",
    message: `Hi {{name}}, as discussed, your enrollment for {{course}} is currently pending payment.

If you need the payment details again, reply PAYMENT and we'll share them.`,
  },

  // ============================================================
  // 23. DOCUMENTS PENDING
  // ============================================================
  {
    name: "DOCUMENTS PENDING",
    description: "Reminder for pending enrollment documents.",
    category: "REMINDER",
    subject: "Documents required to complete your {{course}} enrollment",
    message: `Hi {{name}}, your enrollment process for {{course}} is almost complete. 👍

We still require the following:

📄 {{document}}

Please share it when convenient so we can complete your enrollment.`,
  },

  // ============================================================
  // 24. DEMO / COUNSELLING COMPLETED
  // ============================================================
  {
    name: "DEMO / COUNSELLING COMPLETED",
    description: "Follow-up after a completed demo or counselling session.",
    category: "DEMO",
    subject: "Details regarding {{course}}",
    message: `Hi {{name}}, it was great connecting with you today. 😊

As discussed, here's the information regarding {{course}}:

{{link}}

If you have any questions, feel free to message me here.`,
  },

  // ============================================================
  // 25. SENT DETAILS - AWAITING RESPONSE
  // ============================================================
  {
    name: "SENT DETAILS — AWAITING RESPONSE",
    description: "Follow-up after sharing course details.",
    category: "FOLLOW_UP",
    subject: "Following up on the {{course}} details",
    message: `Hi {{name}}, I've shared the details of {{course}} as discussed.

Please have a look and let me know if you'd like to discuss anything.

I'm available if you need any clarification.`,
  },

  // ============================================================
  // 26. LEAD GOING COLD
  // ============================================================
  {
    name: "LEAD GOING COLD",
    description: "Final re-engagement message for an inactive lead.",
    category: "FOLLOW_UP",
    subject: "Are you still interested in {{course}}?",
    message: `Hi {{name}}, just checking in one last time regarding your {{course}} enquiry.

Are you still planning to explore this opportunity?

Reply:

YES – Continue
LATER – Follow up later
NO – Close enquiry`,
  },

  // ============================================================
  // 27. BE IN TOUCH
  // ============================================================
  {
    name: "BE IN TOUCH",
    description: "Keep-in-touch message for future opportunities.",
    category: "GENERAL",
    subject: "Stay connected with SVR EdTech",
    message: `Hi {{name}}, we'll stay connected. 👍

Whenever you're ready to explore {{course}} or another career program, just message us.

Wishing you the best with your career journey!`,
  },

  // ============================================================
  // 28. REACTIVATION - OLD LEAD
  // ============================================================
  {
    name: "REACTIVATION — OLD LEAD",
    description: "Reactivation message for an older lead.",
    category: "FOLLOW_UP",
    subject: "Are you still exploring {{course}}?",
    message: `Hi {{name}}, this is {{counsellor}} from SVR EdTech.

You had previously enquired about {{course}}.

We're checking in to see if you're still exploring opportunities in this area.

Reply YES and I'll share the latest details.`,
  },

  // ============================================================
  // 29. NEW BATCH ANNOUNCEMENT
  // ============================================================
  {
    name: "NEW BATCH ANNOUNCEMENT",
    description: "Announcement for a new upcoming course batch.",
    category: "COURSE",
    subject: "New {{course}} batch starting on {{date}}",
    message: `Hi {{name}}! 👋

Our new {{course}} batch is starting on {{date}}.

Since you had previously shown interest, I wanted to let you know before the batch begins.

Would you like the updated program details?`,
  },

  // ============================================================
  // 30. LIMITED SEATS / DEADLINE
  // ============================================================
  {
    name: "LIMITED SEATS / DEADLINE",
    description: "Upcoming batch enrollment reminder.",
    category: "REMINDER",
    subject: "Upcoming {{course}} batch — Enrollment update",
    message: `Hi {{name}}, quick update regarding {{course}}.

The upcoming batch is scheduled to begin on {{date}}.

If you're planning to join this batch, let me know and I'll help you with the enrollment process.`,
  },
];

// ============================================================
// HTML GENERATOR
// ============================================================

const createHtmlMessage = (message) => {
  if (!message) {
    return "";
  }

  return message
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        return "<br />";
      }

      return `<p style="margin:0 0 12px 0;">${line}</p>`;
    })
    .join("");
};

// ============================================================
// SEED DATABASE
// ============================================================

const seedEmailTemplates = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not configured in your .env file."
      );
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected.");
    console.log(
      `Processing ${templates.length} email templates...\n`
    );

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const template of templates) {
      try {
        const htmlMessage =
          template.htmlMessage ||
          createHtmlMessage(template.message);

        const existingTemplate =
          await EmailTemplate.findOne({
            name: template.name,
          });

        if (existingTemplate) {
          existingTemplate.description =
            template.description || "";

          existingTemplate.category =
            template.category || "GENERAL";

          existingTemplate.subject =
            template.subject;

          existingTemplate.message =
            template.message;

          existingTemplate.htmlMessage =
            htmlMessage;

          existingTemplate.isActive =
            true;

          await existingTemplate.save();

          updated++;

          console.log(
            `✓ Updated: ${template.name}`
          );
        } else {
          await EmailTemplate.create({
            name: template.name,
            description:
              template.description || "",
            category:
              template.category || "GENERAL",
            subject: template.subject,
            message: template.message,
            htmlMessage,
            isActive: true,
          });

          created++;

          console.log(
            `✓ Created: ${template.name}`
          );
        }
      } catch (error) {
        skipped++;

        console.error(
          `✗ Failed: ${template.name}`
        );

        console.error(
          error.message
        );
      }
    }

    console.log("\n=================================");
    console.log("EMAIL TEMPLATE SEED COMPLETED");
    console.log("=================================");
    console.log(
      `Total templates : ${templates.length}`
    );
    console.log(
      `Created         : ${created}`
    );
    console.log(
      `Updated         : ${updated}`
    );
    console.log(
      `Skipped/Failed  : ${skipped}`
    );
    console.log("=================================\n");
  } catch (error) {
    console.error(
      "\nEmail template seed failed:"
    );

    console.error(error);
  } finally {
    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed."
    );
  }
};

// ============================================================
// RUN
// ============================================================

seedEmailTemplates();