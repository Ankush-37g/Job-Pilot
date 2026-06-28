import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

// GET /api/jobs/stats
router.get("/stats", authMiddleware, getStats);

export default router;
