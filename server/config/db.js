const mongoose = require("mongoose");

// Cache connection across serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1. If already fully connected, reuse immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If no connection promise is in-flight, create one
  if (!cached.promise) {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not configured");
    }

    const opts = {
      bufferCommands: false, // Prevents 10000ms Mongoose buffering timeout
      serverSelectionTimeoutMS: 5000, // Fails fast if network/IP is blocked
      connectTimeoutMS: 10000,
      maxPoolSize: 10, // Recommended for serverless lambdas
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log("MongoDB connected successfully");
      return mongooseInstance;
    });
  }

  // 3. Await the shared promise so all concurrent requests wait on the SAME connection
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise so next request can retry cleanly
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;