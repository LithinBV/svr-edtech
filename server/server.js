require("dotenv").config();

/* =========================================================
   IMPORTS
========================================================= */

const express = require("express");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const cors = require("cors");

const connectDB = require("./config/db");
const corsOptions = require("./config/cors");

/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const institutionRoutes = require("./routes/institutionRoutes");
const userRoutes = require("./routes/userRoutes");

const leadRoutes = require("./routes/leadRoutes");
const finishedLeadRoutes = require("./routes/finishedLeadRoutes");

const teamRoutes = require("./routes/teamRoutes");
const leadNoteRoutes = require("./routes/leadNoteRoutes");
const leadHistoryRoutes = require("./routes/leadHistoryRoutes");

const communicationRoutes = require("./routes/communicationRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");

const emailRoutes = require("./routes/emailRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");

const analyticsRoutes = require("./routes/analyticsRoutes");

const managerTeamRoutes = require("./routes/managerTeamRoutes");
const managerLeadRoutes = require("./routes/managerLeadRoutes");

const performanceRoutes = require("./routes/performanceRoutes");

const profileRoutes = require("./routes/profileRoutes");
const whatsappTemplateRoutes = require("./routes/whatsappTemplateRoutes");

/* =========================================================
   APP
========================================================= */

const app = express();

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "SVR-EDTECH server is running",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

/* =========================================================
   CORS
========================================================= */

app.use(cors(corsOptions));

/* =========================================================
   DATABASE
========================================================= */

connectDB().catch((error) => {
    console.error("Database initialization failed:", error.message);
});
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
    IMPORTANT:

    Manager Leads must be registered before
    /api/manager.

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
   PAGE DIRECTORY
========================================================= */

const pagesDirectory = path.join(
    __dirname,
    "../public/pages"
);

/* =========================================================
   OLD HTML URL REDIRECT

   /pages/login.html
   -> /login
========================================================= */

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
   ALSO SUPPORT

   /login.html
   /dashboard.html
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
   AUTH API
========================================================= */

app.use(
    "/api/auth",
    authRoutes
);

/* =========================================================
   ADMIN API
========================================================= */

app.use(
    "/api/admin",
    adminRoutes
);

/* =========================================================
   INSTITUTIONS API
========================================================= */

app.use(
    "/api/institutions",
    institutionRoutes
);

/* =========================================================
   USERS API
========================================================= */

app.use(
    "/api/users",
    userRoutes
);

/* =========================================================
   LEADS API
========================================================= */

app.use(
    "/api/leads",
    leadRoutes
);

/* =========================================================
   FINISHED LEADS API
========================================================= */

app.use(
    "/api/finished-leads",
    finishedLeadRoutes
);

/* =========================================================
   COMMUNICATION API
========================================================= */

app.use(
    "/api/communications",
    communicationRoutes
);

/* =========================================================
   WHATSAPP API
========================================================= */

app.use(
    "/api/whatsapp",
    whatsappRoutes
);

/* =========================================================
   WHATSAPP TEMPLATE API
========================================================= */

app.use(
    "/api/whatsapp-templates",
    whatsappTemplateRoutes
);

/* =========================================================
   EMAIL API
========================================================= */

app.use(
    "/api/email",
    emailRoutes
);

/* =========================================================
   EMAIL TEMPLATE API
========================================================= */

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

app.use(
    "/api/profile",
    profileRoutes
);

/* =========================================================
   CLEAN PAGE URLS

   Example:

   /login
   /dashboard
   /admin-dashboard
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
            return res.sendFile(htmlFile);
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
   404 HANDLER
========================================================= */

app.use(
    (req, res) => {

        console.log("=================================");
        console.log("❌ 404 ROUTE NOT FOUND");
        console.log("METHOD:", req.method);
        console.log("URL:", req.originalUrl);
        console.log("=================================");

        /*
            API request
        */

        if (
            req.originalUrl.startsWith("/api/")
        ) {
            return res.status(404).json({
                success: false,
                message: "API route not found.",
                path: req.originalUrl,
            });
        }

        /*
            Normal page request
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

        console.error("=================================");
        console.error("❌ SERVER ERROR");
        console.error(err);
        console.error("=================================");

        /*
            CORS error
        */

        if (
            err.message === "Not allowed by CORS"
        ) {
            return res.status(403).json({
                success: false,
                message: "CORS origin not allowed.",
            });
        }

        /*
            API error
        */

        if (
            req.originalUrl.startsWith("/api/")
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
            Normal server error
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
   SERVER START
========================================================= */

const PORT =
    process.env.PORT || 3000;

/*
    Local:

        npm start

    -> app.listen()

    Vercel:

        exports app

    -> Vercel handles the server
*/

if (require.main === module) {

    app.listen(
        PORT,
        () => {

            console.log("=================================");
            console.log("🚀 SVR-EDTECH SERVER");
            console.log("=================================");

            console.log(
                `Server running on http://localhost:${PORT}`
            );

            console.log(
                `Auth API: http://localhost:${PORT}/api/auth`
            );

            console.log(
                `Leads API: http://localhost:${PORT}/api/leads`
            );

            console.log(
                `Manager Leads API: http://localhost:${PORT}/api/manager/leads`
            );

            console.log(
                `Finished Leads API: http://localhost:${PORT}/api/finished-leads`
            );

            console.log(
                `Analytics API: http://localhost:${PORT}/api/analytics`
            );

            console.log(
                `Performance API: http://localhost:${PORT}/api/performance`
            );

            console.log(
                `Communication API: http://localhost:${PORT}/api/communications`
            );

            console.log(
                `WhatsApp API: http://localhost:${PORT}/api/whatsapp`
            );

            console.log(
                `Email API: http://localhost:${PORT}/api/email`
            );

            console.log(
                `Email Templates API: http://localhost:${PORT}/api/email-templates`
            );

            console.log(
                `Profile API: http://localhost:${PORT}/api/profile`
            );

            console.log("=================================");
        }
    );
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = app;