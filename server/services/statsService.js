import Job from "../models/Job.js";

export const getJobStats = async (userId) => {
  const match = { userId };

  const totalJobs = await Job.countDocuments(match);

  const avgRes = await Job.aggregate([
    { $match: match },
    { $group: { _id: null, avgMatchScore: { $avg: "$matchScore" } } },
  ]);
  const averageMatchScore = avgRes[0]?.avgMatchScore ?? 0;

  const countByStatusAgg = await Job.aggregate([
    { $match: match },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const countByStatus = {};
  countByStatusAgg.forEach((r) => (countByStatus[r._id] = r.count));

  const topMissingSkillsAgg = await Job.aggregate([
    { $match: match },
    { $unwind: { path: "$missingSkills", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$missingSkills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  const topMissingSkills = topMissingSkillsAgg.map((r) => ({ skill: r._id, count: r.count }));

  return {
    totalJobs,
    averageMatchScore: Math.round(averageMatchScore),
    countByStatus,
    topMissingSkills,
  };
};

export default { getJobStats };
