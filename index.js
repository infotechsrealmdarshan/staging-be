import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import stragingRoutes from "./src/routes/stragingRoutes.js";
import redisClient from "./src/config/redis.js";
import connectDB from "./src/config/db.js";
import { swaggerDocs } from "./src/swagger/swagger.js";
import { globalErrorHandler } from "./src/utils/errorHandler.js";

// dotenv.config(); // Loaded via import "dotenv/config"

// Create Express app
const app = express();

// Database Middleware (Ensures DB is connected before processing request)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Connect Redis
redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "cdnjs.cloudflare.com", "'unsafe-inline'", "'unsafe-eval'"],
        "script-src-elem": ["'self'", "cdnjs.cloudflare.com", "'unsafe-inline'"],
        "style-src": ["'self'", "cdnjs.cloudflare.com", "'unsafe-inline'", "fonts.googleapis.com"],
        "img-src": ["'self'", "data:", "res.cloudinary.com", "blob:", "validator.swagger.io"],
        "connect-src": ["'self'"],
      },
    },
  })
);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));


// API Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/straging", stragingRoutes);

// Swagger Docs
swaggerDocs(app, process.env.PORT || 5000);

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// Global Error Handler (must be last)
app.use(globalErrorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test" && !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
