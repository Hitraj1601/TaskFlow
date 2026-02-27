import dotenv from "dotenv";
import path from "path";
// Load environment variables before other imports that read process.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./config/db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import adminRoutes from "./routes/admin";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Request logging middleware
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API v1 routes (versioned)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);

// Backward-compatible unversioned routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "TaskFlow API is running", version: "1.0.0" });
});
app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, message: "TaskFlow API v1 is running", version: "1.0.0" });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Check the API documentation for available endpoints.",
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await dbConnect();
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
