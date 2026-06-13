import express from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJobStatus,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All job routes are protected (require JWT)

// Create new job with AI analysis
router.post("/", authMiddleware, createJob);

// Get all jobs for user (with filters and sorting)
router.get("/", authMiddleware, getAllJobs);

// Get single job by ID
router.get("/:id", authMiddleware, getJobById);

// Update job status only
router.patch("/:id/status", authMiddleware, updateJobStatus);

// Update full job (notes, dates)
router.patch("/:id", authMiddleware, updateJob);

// Delete job
router.delete("/:id", authMiddleware, deleteJob);

export default router;
