const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const totalApplications = await prisma.jobApplication.count({
    where: { userId },
  });

  const totalResumes = await prisma.resume.count({
    where: { userId },
  });

  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    select: {
      id: true,
      companyName: true,
      jobRole: true,
      status: true,
      matchScore: true,
      appliedDate: true,
      appliedFrom: true,
      createdAt: true,
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const scoredApplications = applications.filter(
    (app) => app.matchScore !== null && app.matchScore !== undefined
  );

  const averageMatchScore =
    scoredApplications.length === 0
      ? 0
      : Math.round(
          scoredApplications.reduce((sum, app) => sum + app.matchScore, 0) /
            scoredApplications.length
        );

  const recentApplications = applications.slice(0, 5);

  const topMatches = [...scoredApplications]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const monthlyMap = {};

  applications.forEach((app) => {
    const date = new Date(app.appliedDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
  });

  const monthlyApplications = Object.entries(monthlyMap)
    .map(([month, count]) => ({
      month,
      count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const latestAnalyses = await prisma.analysisResult.findMany({
    where: {
      application: {
        userId,
      },
    },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          jobRole: true,
          status: true,
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  res.status(200).json({
    success: true,
    stats: {
      totalApplications,
      totalResumes,
      averageMatchScore,
      statusCounts,
      recentApplications,
      topMatches,
      monthlyApplications,
      latestAnalyses,
    },
  });
});

module.exports = {
  getDashboardStats,
};