const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { analyzeResumeAgainstJob } = require("../services/analyzer.service");

// @desc    Analyze resume against job application
// @route   POST /api/analyze
// @access  Private
const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeId, applicationId } = req.body;

  if (!resumeId || !applicationId) {
    res.status(400);
    throw new Error("resumeId and applicationId are required");
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: Number(resumeId),
      userId: req.user.id,
    },
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: Number(applicationId),
      userId: req.user.id,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Job application not found");
  }

  const result = analyzeResumeAgainstJob(
    resume.extractedText,
    application.jobDescription
  );

  const analysis = await prisma.analysisResult.create({
    data: {
      score: result.score,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
      resumeId: resume.id,
      applicationId: application.id,
    },
  });

  await prisma.jobApplication.update({
    where: {
      id: application.id,
    },
    data: {
      matchScore: result.score,
    },
  });

  res.status(201).json({
    success: true,
    message: "Resume analyzed successfully",
    analysis: {
      id: analysis.id,
      score: analysis.score,
      resumeSkills: result.resumeSkills,
      jobSkills: result.jobSkills,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
      createdAt: analysis.createdAt,
    },
  });
});

// @desc    Get analysis by application ID
// @route   GET /api/analyze/:applicationId
// @access  Private
const getAnalysisByApplication = asyncHandler(async (req, res) => {
  const applicationId = Number(req.params.applicationId);

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Job application not found");
  }

  const analyses = await prisma.analysisResult.findMany({
    where: {
      applicationId,
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    count: analyses.length,
    analyses,
  });
});

module.exports = {
  analyzeResume,
  getAnalysisByApplication,
};