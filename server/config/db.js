const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        // Already connected
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }

        // Connection already being established
        if (mongoose.connection.readyState === 2) {
            return mongoose.connection.asPromise();
        }

        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not configured");
        }

        await mongoose.connect(mongoURI);

        console.log("MongoDB connected successfully");

        return mongoose.connection;

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        // IMPORTANT:
        // Do not use process.exit(1) on Vercel.
        throw error;
    }
};

module.exports = connectDB;