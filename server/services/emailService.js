import Resend from "resend";

const client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM || "no-reply@jobpilot.app";

export const sendFollowUpReminder = async (toEmail, company, role, jobId) => {
  if (!toEmail) {
    console.warn("No recipient email provided for reminder", jobId);
    return { success: false, reason: "no-recipient" };
  }

  const subject = `Follow-up reminder: ${company} — ${role}`;
  const html = `<p>Hi there,</p>
    <p>This is a reminder to follow up on your application for <strong>${role}</strong> at <strong>${company}</strong>.</p>
    <p>If you've already followed up, you can ignore this message.</p>
    <p>— JobPilot</p>`;

  if (client) {
    try {
      await client.emails.send({ from: fromEmail, to: toEmail, subject, html });
      return { success: true };
    } catch (err) {
      console.error("Resend send error:", err.message);
      return { success: false, error: err.message };
    }
  }

  // Fallback / mock when no API key configured
  console.log(`MOCK EMAIL -> to:${toEmail} subject:${subject}\n${html}`);
  return { success: true, mock: true };
};

export default { sendFollowUpReminder };
