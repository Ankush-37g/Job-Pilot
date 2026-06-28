import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import jobRoutes from "./routes/job.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import cronRoutes from "./routes/cron.routes.js";
import { initCron } from "./jobs/cronJobs.js";

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);
// Stats & cron routes
app.use("/api/jobs", statsRoutes);
app.use("/api/jobs/cron", cronRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large (max 5MB)",
    });
  }

  if (err.code === "FILE_TYPE_INVALID" || err.message === "Only PDF files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only PDF files are allowed",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   JobPilot Backend Server Running      ║
║   Server: http://localhost:${PORT}       ║
║   Env: ${process.env.NODE_ENV || "development"}         ║
╚════════════════════════════════════════╝
  `);
  // Initialize scheduled cron jobs (if enabled)
  try {
    initCron();
  } catch (err) {
    console.error("Failed to initialize cron jobs:", err.message);
  }
});
