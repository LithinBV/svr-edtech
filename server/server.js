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
   HEALTH CHECK (Runs without DB wait)
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
app.options("*", cors(corsOptions));

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
   DATABASE CONNECTION MIDDLEWARE (SERVERLESS SAFE)
   Ensures DB is 100% connected before any route queries MongoDB
========================================================= */

app.use(async (req, res, next) => {
    // Skip OPTIONS preflight requests
    if (req.method === "OPTIONS") return next();

    // Skip static page requests
    if (!req.originalUrl.startsWith("/api/")) return next();

    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection middleware failed:", error.message);
        return res.status(503).json({
            success: false,
            message: "Database connection failed. Please try again shortly.",
        });
    }
});

/* =========================================================
   MANAGER LEADS ROUTES
========================================================= */

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
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/finished-leads", finishedLeadRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/whatsapp-templates", whatsappTemplateRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/email-templates", emailTemplateRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/lead-notes", leadNoteRoutes);
app.use("/api/lead-history", leadHistoryRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/profile", profileRoutes);

/* =========================================================
   PAGE DIRECTORY & STATIC FILES
========================================================= */

const pagesDirectory = path.join(
    __dirname,
    "../public/pages"
);

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);

/* =========================================================
   HTML URL REDIRECTS
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
        if (req.originalUrl.startsWith("/api/")) {
            return res.status(404).json({
                success: false,
                message: "API route not found.",
                path: req.originalUrl,
            });
        }

        return res.status(404).send("Page not found.");
    }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (err, req, res, next) => {
        console.error("❌ SERVER ERROR:", err);

        if (err.message === "Not allowed by CORS") {
            return res.status(403).json({
                success: false,
                message: "CORS origin not allowed.",
            });
        }

        if (req.originalUrl.startsWith("/api/")) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Internal server error",
            });
        }

        return res.status(err.status || 500).send(
            err.message || "Internal server error"
        );
    }
);

/* =========================================================
   SERVER START (LOCAL ONLY)
========================================================= */

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, async () => {
        try {
            await connectDB();
            console.log(`Server running on http://localhost:${PORT}`);
        } catch (e) {
            console.error("Local DB connection failed:", e.message);
        }
    });
}

/* =========================================================
   EXPORT FOR VERCEL
========================================================= */

module.exports = app;