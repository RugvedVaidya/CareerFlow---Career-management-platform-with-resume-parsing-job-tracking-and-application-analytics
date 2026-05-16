const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Get dashboard stats
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

  const applicationsWithScores = await prisma.jobApplication.findMany({
    where: {
      userId,
      matchScore: {
        not: null,
      },
    },
    select: {
      matchScore: true,
    },
  });

  let averageMatchScore = 0;

  if (applicationsWithScores.length > 0) {
    const totalScore = applicationsWithScores.reduce(
      (sum, app) => sum + app.matchScore,
      0
    );

    averageMatchScore = Math.round(totalScore / applicationsWithScores.length);
  }

  const applications = await prisma.jobApplication.findMany({
    where: { userId },
    select: {
      status: true,
    },
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const recentApplications = await prisma.jobApplication.findMany({
    where: { userId },
    include: {
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

  const topMatches = await prisma.jobApplication.findMany({
    where: {
      userId,
      matchScore: {
        not: null,
      },
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
    orderBy: {
      matchScore: "desc",
    },
    take: 5,
  });

  const latestAnalysesRaw = await prisma.analysisResult.findMany({
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

  const latestAnalyses = latestAnalysesRaw.map((analysis) => ({
    id: analysis.id,
    score: analysis.score,
    matchedSkills: analysis.matchedSkills,
    missingSkills: analysis.missingSkills,
    suggestions: analysis.suggestions,
    resumeId: analysis.resumeId,
    applicationId: analysis.applicationId,
    createdAt: analysis.createdAt,
    application: analysis.application,
    resume: analysis.resume,
  }));

  const monthlyApplicationsRaw = await prisma.jobApplication.findMany({
    where: { userId },
    select: {
      createdAt: true,
    },
  });

  const monthlyMap = {};

  monthlyApplicationsRaw.forEach((app) => {
    const date = new Date(app.createdAt);
    const month = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    monthlyMap[month] = (monthlyMap[month] || 0) + 1;
  });

  const monthlyApplications = Object.keys(monthlyMap)
    .sort()
    .map((month) => ({
      month,
      count: monthlyMap[month],
    }));

  const now = new Date();

  const upcomingReminders = await prisma.reminder.findMany({
    where: {
      userId,
      isCompleted: false,
      dueDate: {
        gte: now,
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
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
  });

  const overdueReminders = await prisma.reminder.findMany({
    where: {
      userId,
      isCompleted: false,
      dueDate: {
        lt: now,
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
    },
    orderBy: {
      dueDate: "asc",
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
      upcomingReminders,
      overdueReminders,
    },
  });
});

module.exports = {
  getDashboardStats,
};