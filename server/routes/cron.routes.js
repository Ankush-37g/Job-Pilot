import express from "express";
import authMiddleware from "../middleware/auth.js";
import { triggerNow } from "../jobs/cronJobs.js";

const router = express.Router();

// POST /api/jobs/cron/trigger - manual trigger for reminders
router.post("/trigger", authMiddleware, async (req, res) => {
  try {
    const result = await triggerNow();
    res.json({ success: true, result });
  } catch (err) {
    console.error("Cron trigger error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
