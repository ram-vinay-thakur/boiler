import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Cached connection for reuse
let cachedConnection = global.mongo || { conn: null, promise: null };

async function connectToDB(url) {
  try {
    // Return cached connection if available
    if (cachedConnection.conn) {
      console.log("Using cached MongoDB connection.");
      return cachedConnection.conn;
    }

    // Establish a new connection if none exists
    if (!cachedConnection.promise) {
      console.log("Establishing new MongoDB connection...");
      cachedConnection.promise = mongoose.connect(url, {
        maxPoolSize: 10,           
        minPoolSize: 2,             
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,   
        connectTimeoutMS: 10000,   
        waitQueueTimeoutMS: 5000, 
      }).catch((error) => {
        console.error("Error establishing MongoDB connection:", error.message);
        throw new ApiError(500, "Database connection failed: " + error.message);
      });
    }

    // Await connection and cache it
    cachedConnection.conn = await cachedConnection.promise;
    console.log(`MongoDB connected: ${cachedConnection.conn.connection.host}`);

    // Return the connection
    return cachedConnection.conn;

  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw new ApiError(500, "Database connection failed: " + error.message);
  }
}

// Graceful shutdown for multiple signals
const shutdownGracefully = async () => {
  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

export { connectToDB, shutdownGracefully };
