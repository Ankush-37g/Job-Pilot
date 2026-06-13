import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import { analyzeJobFit } from "../services/aiAnalyzer.js";
import { scrapeJD } from "../services/scraper.js";

// Create Job with AI Analysis
export const createJob = async (req, res) => {
  try {
    const { jdUrl, jdText, company, role } = req.body;

    // Validation: Either URL or text must be provided
    if (!jdUrl && !jdText) {
      return res.status(400).json({
        success: false,
        message: "Please provide either job description URL or text",
      });
    }

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required",
      });
    }

    // Get JD text from URL or use provided text
    let jdContent = jdText;

    if (jdUrl) {
      try {
        jdContent = await scrapeJD(jdUrl);
      } catch (scrapeError) {
        // Return error message suggesting manual paste
        return res.status(400).json({
          success: false,
          message: scrapeError.message,
          suggestion: "Please paste the job description manually instead",
        });
      }
    }

    // Fetch user's default resume
    const resume = await Resume.findOne({
      userId: req.userId,
      isDefault: true,
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "No resume found. Please upload your resume first.",
      });
    }

    // Call AI to analyze job fit
    const aiAnalysis = await analyzeJobFit(jdContent, resume.rawText);

    // Create job document
    const job = new Job({
      userId: req.userId,
      company: aiAnalysis.company || company,
      role: aiAnalysis.role || role,
      jdText: jdContent,
      jdUrl: jdUrl || null,
      requiredSkills: aiAnalysis.requiredSkills || [],
      matchScore: aiAnalysis.matchScore || 0,
      matchedSkills: aiAnalysis.matchedSkills || [],
      missingSkills: aiAnalysis.missingSkills || [],
      improvementTips: aiAnalysis.improvementTips || [],
      status: "Saved",
      resumeId: resume._id,
    });

    await job.save();

    return res.status(201).json({
      success: true,
      message: "Job added successfully with AI analysis",
      job: {
        id: job._id,
        company: job.company,
        role: job.role,
        matchScore: job.matchScore,
        status: job.status,
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Create job error:", error);

    // Handle AI analysis errors
    if (error.message.includes("AI analysis failed")) {
      return res.status(500).json({
        success: false,
        message: "AI analysis failed. Please try again.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

// Get All Jobs for User
export const getAllJobs = async (req, res) => {
  try {
    const { status, sort } = req.query;

    // Build filter
    const filter = { userId: req.userId };
    if (status) {
      filter.status = status;
    }

    // Build sort
    let sortBy = { createdAt: -1 }; // Default: newest first
    if (sort === "matchScore") {
      sortBy = { matchScore: -1 };
    } else if (sort === "company") {
      sortBy = { company: 1 };
    }

    const jobs = await Job.find(filter)
      .sort(sortBy)
      .select("-jdText"); // Exclude full JD text for list view

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get all jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
      error: error.message,
    });
  }
};

// Get Single Job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({
      _id: id,
      userId: req.userId, // Ensure user owns this job
    }).populate("resumeId", "filename");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get job by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job",
      error: error.message,
    });
  }
};

// Update Job Status
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Saved", "Applied", "OA", "Interview", "Offer", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job status updated",
      job,
    });
  } catch (error) {
    console.error("Update job status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job status",
      error: error.message,
    });
  }
};

// Update Full Job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, followUpDate, appliedDate } = req.body;

    // Only allow updating these fields
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;
    if (appliedDate !== undefined) updateData.appliedDate = appliedDate;

    const job = await Job.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated",
      job,
    });
  } catch (error) {
    console.error("Update job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job",
      error: error.message,
    });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete job error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};
