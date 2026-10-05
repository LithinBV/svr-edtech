require("dotenv").config();

/* =========================================================
   RESEND ENVIRONMENT TEST
========================================================= */

console.log("=================================");
console.log("ENVIRONMENT TEST");

console.log(
    "RESEND_API_KEY configured:",
    Boolean(process.env.RESEND_API_KEY)
);

console.log(
    "RESEND_FROM_EMAIL:",
    process.env.RESEND_FROM_EMAIL || "NOT SET"
);

console.log("=================================");


/* =========================================================
   IMPORTS
========================================================= */

const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const cors = require("cors");

const connectDB = require("./config/db");


/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");

// FINISHED LEADS
const finishedLeadRoutes = require("./routes/finishedLeadRoutes");

const teamRoutes = require("./routes/teamRoutes");
const leadNoteRoutes = require("./routes/leadNoteRoutes");
const leadHistoryRoutes = require("./routes/leadHistoryRoutes");


/* =========================================================
   COMMUNICATION ROUTES
========================================================= */

const communicationRoutes = require("./routes/communicationRoutes");

const whatsappRoutes = require("./routes/whatsappRoutes");

const emailRoutes = require("./routes/emailRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");


/* =========================================================
   ANALYTICS ROUTES
========================================================= */

const analyticsRoutes = require("./routes/analyticsRoutes");

const managerTeamRoutes = require("./routes/managerTeamRoutes");
const managerLeadRoutes = require("./routes/managerLeadRoutes");


/* =========================================================
   PERFORMANCE ROUTES
========================================================= */

const performanceRoutes = require("./routes/performanceRoutes");


/* =========================================================
   PROFILE ROUTES
========================================================= */

const profileRoutes = require("./routes/profileRoutes");


/* =========================================================
   APP
========================================================= */

const app = express();




/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://svr-edtech.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin
      // (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


/* =========================================================
   DATABASE
========================================================= */

connectDB();


/* =========================================================
   SECURITY
========================================================= */

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);


/* =========================================================
   MANAGER LEADS ROUTES
========================================================= */

/*
    Manager Leads must be registered BEFORE
    the generic /api/manager routes.

    Otherwise:

    /api/manager/:id

    could catch:

    /api/manager/leads
*/

app.use(
    "/api/manager/leads",
    managerLeadRoutes
);


/* =========================================================
   MANAGER TEAM ROUTES
========================================================= */

app.use(
    "/api/manager",
    managerTeamRoutes
);


/* =========================================================
   PAGE DIRECTORIES
========================================================= */

const pagesDirectory = path.join(
    __dirname,
    "../public/pages"
);


/* =========================================================
   OLD .HTML URL REDIRECT
========================================================= */

/*
    Supports:

    /pages/login.html
*/

app.get(
    "/pages/:page.html",
    (req, res, next) => {

        const pageName = req.params.page;

        if (
            !pageName ||
            pageName.includes(".") ||
            pageName.includes("/") ||
            pageName.includes("\\")
        ) {
            return next();
        }

        const htmlFile = path.join(
            pagesDirectory,
            `${pageName}.html`
        );

        if (fs.existsSync(htmlFile)) {

            return res.redirect(
                301,
                `/${pageName}`
            );

        }

        next();
    }
);


/* =========================================================
   ALSO SUPPORT /page.html
========================================================= */

app.get(
    "/:page.html",
    (req, res, next) => {

        const pageName = req.params.page;

        if (
            !pageName ||
            pageName.includes(".") ||
            pageName.includes("/") ||
            pageName.includes("\\")
        ) {
            return next();
        }

        const htmlFile = path.join(
            pagesDirectory,
            `${pageName}.html`
        );

        if (fs.existsSync(htmlFile)) {

            return res.redirect(
                301,
                `/${pageName}`
            );

        }

        next();
    }
);


/* =========================================================
   STATIC FILES
========================================================= */

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);


/* =========================================================
   API ROUTES
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/institutions",
    institutionRoutes
);

app.use(
    "/api/users",
    userRoutes
);


/* =========================================================
   NORMAL LEADS API
========================================================= */

app.use(
    "/api/leads",
    leadRoutes
);


/* =========================================================
   FINISHED LEADS API
========================================================= */

/*
    GET:

    /api/finished-leads

    Returns only leads where:

    latestRemark = ENROLLED

    OR

    latestRemark = NOT_INTERESTED

    These leads are not deleted.
*/

app.use(
    "/api/finished-leads",
    finishedLeadRoutes
);


/* =========================================================
   COMMUNICATION API
========================================================= */

/*
    GET:

    /api/communications/lead/:leadId

    GET:

    /api/communications/lead/:leadId/:type

    Types:

    WHATSAPP
    EMAIL
    CALL
*/

app.use(
    "/api/communications",
    communicationRoutes
);


/* =========================================================
   WHATSAPP API
========================================================= */

/*
    WHATSAPP TEMPLATES

    GET:
    /api/whatsapp/templates

    GET:
    /api/whatsapp/templates/:id

    POST:
    /api/whatsapp/templates

    PUT:
    /api/whatsapp/templates/:id

    DELETE:
    /api/whatsapp/templates/:id


    WHATSAPP ACTIVITY

    POST:
    /api/whatsapp/open


    WHATSAPP HISTORY

    GET:
    /api/whatsapp/lead/:leadId
*/

app.use(
    "/api/whatsapp",
    whatsappRoutes
);


/* =========================================================
   EMAIL API
========================================================= */

/*
    POST:

    /api/email/send

    GET:

    /api/email/lead/:leadId

    PUT:

    /api/email/status
*/

app.use(
    "/api/email",
    emailRoutes
);


/* =========================================================
   EMAIL TEMPLATE API
========================================================= */

/*
    GET:

    /api/email-templates

    GET:

    /api/email-templates/:id

    POST:

    /api/email-templates

    PUT:

    /api/email-templates/:id

    DELETE:

    /api/email-templates/:id
*/

app.use(
    "/api/email-templates",
    emailTemplateRoutes
);


/* =========================================================
   ANALYTICS API
========================================================= */

app.use(
    "/api/analytics",
    analyticsRoutes
);


/* =========================================================
   PERFORMANCE API
========================================================= */

app.use(
    "/api/performance",
    performanceRoutes
);


/* =========================================================
   LEAD NOTES API
========================================================= */

app.use(
    "/api/lead-notes",
    leadNoteRoutes
);


/* =========================================================
   LEAD HISTORY API
========================================================= */

app.use(
    "/api/lead-history",
    leadHistoryRoutes
);


/* =========================================================
   TEAM API
========================================================= */

app.use(
    "/api/teams",
    teamRoutes
);


/* =========================================================
   PROFILE API
========================================================= */

/*
    GET:

    /api/profile

    PUT:

    /api/profile

    DELETE:

    /api/profile/image

    Authentication is handled inside
    profileRoutes.js using protect middleware.
*/

app.use(
    "/api/profile",
    profileRoutes
);


/* =========================================================
   CLEAN PAGE URLS
========================================================= */

app.get(
    "/:page",
    (req, res, next) => {

        const pageName = req.params.page;

        if (
            !pageName ||
            pageName.includes(".") ||
            pageName.includes("/") ||
            pageName.includes("\\")
        ) {
            return next();
        }

        const htmlFile = path.join(
            pagesDirectory,
            `${pageName}.html`
        );

        if (fs.existsSync(htmlFile)) {

            return res.sendFile(
                htmlFile
            );

        }

        next();
    }
);


/* =========================================================
   HOME PAGE
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.redirect("/login");

    }
);


/* =========================================================
   404
========================================================= */

app.use(
    (req, res) => {

        console.log(
            "================================="
        );

        console.log(
            "❌ 404 ROUTE NOT FOUND"
        );

        console.log(
            "METHOD:",
            req.method
        );

        console.log(
            "URL:",
            req.originalUrl
        );

        console.log(
            "================================="
        );


        /*
            Return JSON for API requests
            so frontend response.json()
            does not fail.
        */

        if (
            req.originalUrl.startsWith(
                "/api/"
            )
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "API route not found.",

                path:
                    req.originalUrl,

            });

        }


        /*
            Normal page 404
        */

        return res.status(404).send(
            "Page not found."
        );

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (err, req, res, next) => {

        console.error(
            "================================="
        );

        console.error(
            "❌ SERVER ERROR"
        );

        console.error(err);

        console.error(
            "================================="
        );


        if (
            req.originalUrl.startsWith(
                "/api/"
            )
        ) {

            return res.status(
                err.status || 500
            ).json({

                success: false,

                message:
                    err.message ||
                    "Internal server error",

            });

        }


        return res.status(
            err.status || 500
        ).send(
            err.message ||
            "Internal server error"
        );

    }
);


/* =========================================================
   START SERVER
========================================================= */

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            "================================="
        );

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "Manager Leads API:"
        );

        console.log(
            `http://localhost:${PORT}/api/manager/leads`
        );

        console.log(
            "Finished Leads API:"
        );

        console.log(
            `http://localhost:${PORT}/api/finished-leads`
        );

        console.log(
            "Profile API:"
        );

        console.log(
            `http://localhost:${PORT}/api/profile`
        );

        console.log(
            "Analytics API:"
        );

        console.log(
            `http://localhost:${PORT}/api/analytics`
        );

        console.log(
            "Performance API:"
        );

        console.log(
            `http://localhost:${PORT}/api/performance`
        );

        console.log(
            "Communication API:"
        );

        console.log(
            `http://localhost:${PORT}/api/communications`
        );

        console.log(
            "WhatsApp API:"
        );

        console.log(
            `http://localhost:${PORT}/api/whatsapp`
        );

        console.log(
            "WhatsApp Templates:"
        );

        console.log(
            `http://localhost:${PORT}/api/whatsapp/templates`
        );

        console.log(
            "Email API:"
        );

        console.log(
            `http://localhost:${PORT}/api/email`
        );

        console.log(
            "Email Template API:"
        );

        console.log(
            `http://localhost:${PORT}/api/email-templates`
        );

        console.log(
            "================================="
        );

    }
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = app;