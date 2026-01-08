import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGODB_URI is not defined in environment variables");
      return;
    }

    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 50000, // Timeout after 5s instead of 30s
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ New MongoDB connection established");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
