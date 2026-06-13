import pdfParse from "pdf-parse";
import fs from "fs";
import Resume from "../models/Resume.js";

// Upload Resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Parse PDF
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // Extract and clean text
    const rawText = pdfData.text
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 50000); // Limit to 50k chars

    // Delete previous resume
    await Resume.findOneAndDelete({ userId: req.userId, isDefault: true });

    // Create new resume
    const resume = new Resume({
      userId: req.userId,
      filename: req.file.originalname,
      rawText,
      isDefault: true,
    });

    await resume.save();

    // Delete temporary file
    fs.unlinkSync(filePath);

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        id: resume._id,
        filename: resume.filename,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Upload resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error: error.message,
    });
  }
};

// Get Resume
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.userId,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    return res.status(200).json({
      success: true,
      resume: {
        id: resume._id,
        filename: resume.filename,
        uploadedAt: resume.createdAt,
        hasText: !!resume.rawText,
      },
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error: error.message,
    });
  }
};

// Get Resume Full Text (for AI analysis)
export const getResumeText = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      userId: req.userId,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found",
      });
    }

    return res.status(200).json({
      success: true,
      resumeText: resume.rawText,
    });
  } catch (error) {
    console.error("Get resume text error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume text",
      error: error.message,
    });
  }
};
