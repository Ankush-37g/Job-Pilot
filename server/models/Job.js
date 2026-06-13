import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    jdText: {
      type: String,
      default: "",
    },
    jdUrl: {
      type: String,
      default: "",
    },
    requiredSkills: [String],
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchedSkills: [String],
    missingSkills: [String],
    improvementTips: [String],
    status: {
      type: String,
      enum: ["Saved", "Applied", "OA", "Interview", "Offer", "Rejected"],
      default: "Saved",
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
