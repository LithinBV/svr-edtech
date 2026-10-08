const mongoose = require("mongoose");
require("dotenv").config();

const WhatsAppTemplate = require("../models/WhatsAppTemplate");

const templates = [
  {
    name: "NEW LEAD / FIRST CONTACT",
    description: "First contact message for a new lead.",
    category: "WELCOME",
    message: `Hi {{name}}, this is {{counsellor}} from SVR EdTech. 👋

We received your enquiry regarding {{course}}.

I tried reaching you to understand your career goals and share the right program details.

Let me know a convenient time to connect.`,
  },

  {
    name: "RNR — DID NOT ANSWER",
    description: "Message when the lead does not answer the first call.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, we tried reaching you regarding your enquiry for {{course}}.

No worries if you're currently unavailable. 😊

Reply CALL whenever you're free and we'll connect with you.

– {{counsellor}}, SVR EdTech`,
  },

  {
    name: "RNR — SECOND ATTEMPT",
    description: "Second attempt after the lead did not answer.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, just following up on your {{course}} enquiry.

We couldn't connect with you earlier.

Would you prefer a call today or tomorrow?

Reply with a suitable time and we'll connect.`,
  },

  {
    name: "FOLLOW-UP 1",
    description: "First follow-up message.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, just checking in regarding your interest in {{course}}.

Have you had a chance to consider the program?

If you have any questions about fees, duration, curriculum or career opportunities, I'm happy to help.`,
  },

  {
    name: "FOLLOW-UP 2",
    description: "Second follow-up message.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, following up once again regarding {{course}}.

I don't want you to miss the upcoming opportunity/batch.

Would you like me to reserve a counselling slot for you?

Reply YES and I'll assist you.`,
  },

  {
    name: "FOLLOW-UP 3 / FINAL FOLLOW-UP",
    description: "Final follow-up message.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, this will be my final follow-up regarding your {{course}} enquiry.

If you're still interested, simply reply INTERESTED and we'll continue from there.

If your plans have changed, that's completely fine too. 👍`,
  },

  {
    name: "INTERESTED",
    description: "Message for an interested lead.",
    category: "FOLLOW_UP",
    message: `Great, {{name}}! 👍

Based on our conversation, {{course}} could be a good fit for your career goal.

I'll share the relevant details here:

📚 Program: {{course}}
📅 Batch: {{date}}
💰 Fee: {{amount}}

Would you like to proceed with the next step?`,
  },

  {
    name: "HIGHLY INTERESTED / READY TO ENROL",
    description: "Message for a highly interested lead ready to enroll.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}! 👋

Great speaking with you.

As discussed, you're interested in joining {{course}}.

I can help you complete the enrollment process and share the required details.

Reply ENROLL and I'll guide you through the next step.`,
  },

  {
    name: "CALLBACK REQUESTED",
    description: "Callback confirmation message.",
    category: "REMINDER",
    message: `Hi {{name}}, as requested, we'll connect with you regarding {{course}} at {{time}}.

If you need to change the timing, just reply CHANGE.

– {{counsellor}}, SVR EdTech`,
  },

  {
    name: "CALL BACK LATER",
    description: "Confirmation for a later callback.",
    category: "REMINDER",
    message: `Hi {{name}}, sure. 👍

We'll reconnect regarding {{course}} at your preferred time.

📅 {{date}}
⏰ {{time}}

Looking forward to speaking with you.`,
  },

  {
    name: "BUSY",
    description: "Message when the lead is currently busy.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, understood. 👍

We won't disturb you now.

We'll reconnect regarding your {{course}} enquiry at a convenient time.

– SVR EdTech`,
  },

  {
    name: "SWITCHED OFF",
    description: "Message when the lead's phone is switched off.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, we tried reaching you regarding your {{course}} enquiry but couldn't connect.

Whenever you're available, reply CALL and we'll get back to you.`,
  },

  {
    name: "NOT INTERESTED",
    description: "Message when the lead is not interested.",
    category: "GENERAL",
    message: `Thanks for letting us know, {{name}}.

We'll close your current enquiry for {{course}}.

If your plans change in the future, you're always welcome to reach out to SVR EdTech.

Wishing you the best! 👍`,
  },

  {
    name: "NOT INTERESTED — PRICE",
    description: "Message for a price-related concern.",
    category: "PAYMENT",
    message: `Hi {{name}}, completely understand.

If budget is the concern, we can discuss the available program options/payment plans depending on your requirement.

Would you like us to share the available options?`,
  },

  {
    name: "NOT INTERESTED — COURSE NOT RELEVANT",
    description: "Message when the course is not relevant.",
    category: "GENERAL",
    message: `Understood, {{name}}. 👍

If you're exploring a different career path, let us know what you're looking for.

We may be able to suggest a more suitable program.`,
  },

  {
    name: "THINKING ABOUT IT",
    description: "Message for a lead who needs more time.",
    category: "FOLLOW_UP",
    message: `Absolutely, {{name}}. Take your time.

I'll keep your enquiry for {{course}} open for now.

If you have any questions before making a decision, feel free to message me here.`,
  },

  {
    name: "WILL DISCUSS WITH PARENTS / FAMILY",
    description: "Message for a lead discussing with family.",
    category: "FOLLOW_UP",
    message: `Sure, {{name}}. 👍

Please discuss it with your family.

If you or your parents have any questions regarding the program, fees, career path or training, we're happy to explain.

You can message us anytime.`,
  },

  {
    name: "WAITING FOR SALARY / MONEY",
    description: "Message for a lead waiting for funds.",
    category: "PAYMENT",
    message: `Hi {{name}}, understood.

Once you're ready to proceed with {{course}}, just message us here.

We'll help you with the next steps.`,
  },

  {
    name: "JOINING NEXT BATCH",
    description: "Message for a lead planning to join the next batch.",
    category: "COURSE",
    message: `Hi {{name}}, we'll keep your requirement noted for the upcoming {{course}} batch.

📅 Expected batch: {{date}}

We'll reconnect with you closer to the batch start date.`,
  },

  {
    name: "ENROLLED 🎉",
    description: "Enrollment confirmation message.",
    category: "COURSE",
    message: `Congratulations, {{name}}! 🎉

Your enrollment for {{course}} with SVR EdTech is confirmed.

📅 Batch: {{date}}
⏰ Time: {{time}}
💻 Mode: {{mode}}

We'll share the joining instructions and further details with you shortly.

Welcome to SVR EdTech! 🚀`,
  },

  {
    name: "PAYMENT RECEIVED",
    description: "Payment confirmation message.",
    category: "PAYMENT",
    message: `Hi {{name}}, your payment of ₹{{amount}} towards {{course}} has been received successfully. ✅

Your enrollment process is now underway.

We'll share the next steps shortly.

Thank you for choosing SVR EdTech.`,
  },

  {
    name: "PAYMENT PENDING",
    description: "Payment pending message.",
    category: "PAYMENT",
    message: `Hi {{name}}, as discussed, your enrollment for {{course}} is currently pending payment.

If you need the payment details again, reply PAYMENT and we'll share them.`,
  },

  {
    name: "DOCUMENTS PENDING",
    description: "Message for pending enrollment documents.",
    category: "GENERAL",
    message: `Hi {{name}}, your enrollment process for {{course}} is almost complete. 👍

We still require the following:

📄 {{document}}

Please share it when convenient so we can complete your enrollment.`,
  },

  {
    name: "DEMO / COUNSELLING COMPLETED",
    description: "Message after demo or counselling completion.",
    category: "DEMO",
    message: `Hi {{name}}, it was great connecting with you today. 😊

As discussed, here's the information regarding {{course}}:

{{link}}

If you have any questions, feel free to message me here.`,
  },

  {
    name: "SENT DETAILS — AWAITING RESPONSE",
    description: "Message after sending course details.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, I've shared the details of {{course}} as discussed.

Please have a look and let me know if you'd like to discuss anything.

I'm available if you need any clarification.`,
  },

  {
    name: "LEAD GOING COLD",
    description: "Final message for an inactive lead.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, just checking in one last time regarding your {{course}} enquiry.

Are you still planning to explore this opportunity?

Reply:

YES – Continue
LATER – Follow up later
NO – Close enquiry`,
  },

  {
    name: "BE IN TOUCH",
    description: "Message for keeping in touch with a lead.",
    category: "GENERAL",
    message: `Hi {{name}}, we'll stay connected. 👍

Whenever you're ready to explore {{course}} or another career program, just message us.

Wishing you the best with your career journey!`,
  },

  {
    name: "REACTIVATION — OLD LEAD",
    description: "Reactivation message for an old lead.",
    category: "FOLLOW_UP",
    message: `Hi {{name}}, this is {{counsellor}} from SVR EdTech.

You had previously enquired about {{course}}.

We're checking in to see if you're still exploring opportunities in this area.

Reply YES and I'll share the latest details.`,
  },

  {
    name: "NEW BATCH ANNOUNCEMENT",
    description: "Announcement for a new course batch.",
    category: "COURSE",
    message: `Hi {{name}}! 👋

Our new {{course}} batch is starting on {{date}}.

Since you had previously shown interest, I wanted to let you know before the batch begins.

Would you like the updated program details?`,
  },

  {
    name: "LIMITED SEATS / DEADLINE",
    description: "Upcoming batch reminder.",
    category: "REMINDER",
    message: `Hi {{name}}, quick update regarding {{course}}.

The upcoming batch is scheduled to begin on {{date}}.

If you're planning to join this batch, let me know and I'll help you with the enrollment process.`,
  },
];

// =====================================================
// DATABASE CONNECTION
// =====================================================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

// =====================================================
// SEED TEMPLATES
// =====================================================

const seedTemplates = async () => {
  try {
    await connectDB();

    console.log(
      `Found ${templates.length} WhatsApp templates to process.`
    );

    let inserted = 0;
    let updated = 0;

    for (const template of templates) {
      const existing =
        await WhatsAppTemplate.findOne({
          name: template.name,
        });

      if (existing) {
        existing.description =
          template.description;

        existing.message =
          template.message;

        existing.category =
          template.category;

        existing.isActive = true;

        await existing.save();

        updated++;

        console.log(
          `Updated: ${template.name}`
        );
      } else {
        await WhatsAppTemplate.create({
          ...template,
          isActive: true,
        });

        inserted++;

        console.log(
          `Inserted: ${template.name}`
        );
      }
    }

    console.log("");
    console.log("================================");
    console.log("WhatsApp template seed completed");
    console.log("================================");
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated:  ${updated}`);
    console.log(`Total:    ${templates.length}`);
    console.log("================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Template seeding failed:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

// =====================================================
// RUN
// =====================================================

seedTemplates();