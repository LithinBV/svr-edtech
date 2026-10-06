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

/*
   IMPORTANT

   Frontend:
   https://svr-edtech.vercel.app

   Backend:
   https://svr-edtech-server.vercel.app

   We allow:
   - Local Vite development
   - Production Vercel frontend
*/

const allowedOrigins = [
    "http://localhost:5173",
    "https://svr-edtech.vercel.app",
];


/*
   CORS middleware
*/

app.use(
    cors({
        origin: function (origin, callback) {

            /*
               Requests such as Postman/server-to-server
               may not contain an Origin header.
            */

            if (!origin) {
                return callback(null, true);
            }


            /*
               Allow known frontend origins
            */

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }


            /*
               Block unknown origins
            */

            console.error(
                "================================="
            );

            console.error(
                "❌ CORS BLOCKED"
            );

            console.error(
                "Origin:",
                origin
            );

            console.error(
                "================================="
            );

            return callback(
                new Error(
                    `CORS blocked origin: ${origin}`
                )
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

        credentials: true,

        optionsSuccessStatus: 204,
    })
);


/*
   Explicit OPTIONS / preflight handling
*/

app.options(
    "*",
    cors({
        origin: function (origin, callback) {

            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.error(
                "CORS preflight blocked:",
                origin
            );

            return callback(
                new Error(
                    `CORS blocked origin: ${origin}`
                )
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],

        credentials: true,

        optionsSuccessStatus: 204,
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


/* =========================
   AUTH
========================= */

app.use(
    "/api/auth",
    authRoutes
);


/* =========================
   ADMIN
========================= */

app.use(
    "/api/admin",
    adminRoutes
);


/* =========================
   INSTITUTIONS
========================= */

app.use(
    "/api/institutions",
    institutionRoutes
);


/* =========================
   USERS
========================= */

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

   Returns leads where:

   latestRemark = ENROLLED

   OR

   latestRemark = NOT_INTERESTED
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
            "ORIGIN:",
            req.headers.origin || "No Origin"
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

        console.error(
            err
        );

        console.error(
            "================================="
        );


        /*
           Handle CORS errors
        */

        if (
            err &&
            err.message &&
            err.message.toLowerCase().includes("cors")
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "CORS error: Origin is not allowed.",

                origin:
                    req.headers.origin || null,

            });
        }


        /*
           API error
        */

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


        /*
           Normal error
        */

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
            `Server running on port ${PORT}`
        );

        console.log(
            "Allowed CORS origins:"
        );

        allowedOrigins.forEach(
            (origin) => {
                console.log(
                    "  ✅",
                    origin
                );
            }
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