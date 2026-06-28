import cron from "node-cron";
import Job from "../models/Job.js";
import emailService from "../services/emailService.js";

const findAndSendReminders = async () => {
  const now = new Date();

  const jobs = await Job.find({
    followUpDate: { $lte: now },
    status: { $nin: ["Rejected", "Offer"] },
  }).populate("userId");

  let sent = 0;
  for (const job of jobs) {
    const user = job.userId;
    if (!user || !user.email) continue;
    try {
      await emailService.sendFollowUpReminder(user.email, job.company, job.role, job._id);
      sent++;
    } catch (err) {
      console.error("Failed to send reminder for job", job._id, err.message);
    }
  }

  return { sent, total: jobs.length };
};

export const initCron = () => {
  if (process.env.DISABLE_CRON === "true") {
    console.log("Cron disabled via DISABLE_CRON=true");
    return;
  }

  // Runs daily at 08:00
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        const result = await findAndSendReminders();
        console.log(`Cron: Sent ${result.sent}/${result.total} reminders`);
      } catch (err) {
        console.error("Cron failed:", err.message);
      }
    },
    { timezone: process.env.CRON_TZ || "UTC" }
  );

  console.log("Cron scheduled (daily at 08:00) UTC by default");
};

export const triggerNow = async () => findAndSendReminders();

export default { initCron, triggerNow };
