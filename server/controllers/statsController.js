import statsService from "../services/statsService.js";

export const getStats = async (req, res) => {
  try {
    const stats = await statsService.getJobStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error("Stats controller error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export default { getStats };
