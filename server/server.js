require("dotenv").config();

const express = require("express");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const institutionRoutes = require("./routes/institutionRoutes");

const app = express();


// ===============================
// CONNECT TO MONGODB
// ===============================

connectDB();


// ===============================
// MIDDLEWARE
// ===============================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ===============================
// SERVE PUBLIC FOLDER
// ===============================

app.use(
    express.static(
        path.join(__dirname, "../public")
    )
);


// ===============================
// API ROUTES
// ===============================

// Login + OTP
app.use(
    "/api/auth",
    authRoutes
);

// Protected admin routes
app.use(
    "/api/admin",
    adminRoutes
);

// Institution routes
app.use(
    "/api/institutions",
    institutionRoutes
);


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {

    res.redirect("/pages/login.html");

});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});