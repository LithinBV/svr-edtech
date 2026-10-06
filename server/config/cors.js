const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://svr-edtech.vercel.app",
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {

        // Allow requests without an Origin header
        // Example: Postman, server-to-server requests
        if (!origin) {
            return callback(null, true);
        }

        // Allow known frontend origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Do NOT throw an error here.
        // Simply reject the CORS origin.
        console.log("CORS blocked:", origin);

        return callback(null, false);
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
};

module.exports = corsOptions;