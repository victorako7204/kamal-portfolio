const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) {
    console.log("🔄 Using cached MongoDB connection pool.");
    return cachedConnection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ CRITICAL: Database connection string environment variable is completely undefined.");
    throw new Error("Missing database connection environment variable.");
  }

  try {
    console.log("📡 Initializing fresh MongoDB connection stream...");
    cachedConnection = await mongoose.connect(uri, {
      bufferCommands: false,
    });
    console.log("✅ MongoDB successfully connected and pooled.");
    return cachedConnection;
  } catch (error) {
    console.error("💥 MongoDB Connection Failure:", error.message);
    throw error;
  }
}

module.exports = connectDB;
