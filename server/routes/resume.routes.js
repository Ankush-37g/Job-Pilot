import express from "express";
import {
  uploadResume,
  getResume,
  getResumeText,
} from "../controllers/resumeController.js";
import authMiddleware from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Protected routes
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);
router.get("/", authMiddleware, getResume);
router.get("/text", authMiddleware, getResumeText);

export default router;
