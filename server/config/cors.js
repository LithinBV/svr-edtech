const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://svr-edtech.vercel.app",
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow Postman, server-to-server requests, etc.
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log("CORS blocked:", origin);

        return callback(new Error("Not allowed by CORS"));
    },

    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],

    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],

    credentials: true
};

module.exports = corsOptions;