import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    skills: [String],
    experience: [
      {
        role: String,
        company: String,
        duration: String,
      },
    ],
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
