import mongoose from "mongoose";

// Cache the connection for serverless functions
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return existing connection if available
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  // Return pending connection promise if connecting
  if (cached.promise) {
    console.log("Waiting for existing MongoDB connection");
    cached.conn = await cached.promise;
    return cached.conn;
  }

  try {
    const opts = {
      bufferCommands: false, // Critical for serverless
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      socketTimeoutMS: 45000,
    };

    // Create new connection promise
    cached.promise = mongoose.connect(process.env.MONGODB_URL, opts);
    cached.conn = await cached.promise;
    
    console.log("Connected to MongoDB");
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset on failure
    console.log("Couldn't connect to MongoDB:", error.message);
    throw error; // Throw error so calling function knows it failed
  }
};

export default connectDB;