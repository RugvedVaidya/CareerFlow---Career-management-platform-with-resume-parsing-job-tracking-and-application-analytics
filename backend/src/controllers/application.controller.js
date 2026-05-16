const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const {
    companyName,
    jobRole,
    location,
    status,
    source,
    jobDescription,
    appliedDate,
    resumeId,
  } = req.body;

  if (!companyName || !jobRole) {
    res.status(400);
    throw new Error("Company name and job role are required");
  }

  let linkedResumeId = null;

  if (resumeId) {
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

    linkedResumeId = resume.id;
  }

  const application = await prisma.jobApplication.create({
    data: {
      companyName,
      jobRole,
      location: location || null,
      status: status || "APPLIED",
      source: source || null,
      jobDescription: jobDescription || null,
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      userId: req.user.id,
      resumeId: linkedResumeId,
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Application created successfully",
    application,
  });
});

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const applications = await prisma.jobApplication.findMany({
    where: {
      userId: req.user.id,
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
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user.id,
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
      analysisResults: true,
      interviewRounds: true,
      reminders: true,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  res.status(200).json({
    success: true,
    application,
  });
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = asyncHandler(async (req, res) => {
  const applicationId = Number(req.params.id);

  const {
    companyName,
    jobRole,
    location,
    status,
    source,
    jobDescription,
    appliedDate,
    matchScore,
    resumeId,
  } = req.body;

  const existingApplication = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!existingApplication) {
    res.status(404);
    throw new Error("Application not found");
  }

  let linkedResumeId = existingApplication.resumeId;

  if (resumeId !== undefined) {
    if (resumeId === null || resumeId === "") {
      linkedResumeId = null;
    } else {
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

      linkedResumeId = resume.id;
    }
  }

  const updatedApplication = await prisma.jobApplication.update({
    where: {
      id: existingApplication.id,
    },
    data: {
      companyName: companyName ?? existingApplication.companyName,
      jobRole: jobRole ?? existingApplication.jobRole,
      location: location !== undefined ? location : existingApplication.location,
      status: status ?? existingApplication.status,
      source: source !== undefined ? source : existingApplication.source,
      jobDescription:
        jobDescription !== undefined
          ? jobDescription
          : existingApplication.jobDescription,
      appliedDate:
        appliedDate !== undefined
          ? appliedDate
            ? new Date(appliedDate)
            : null
          : existingApplication.appliedDate,
      matchScore:
        matchScore !== undefined ? Number(matchScore) : existingApplication.matchScore,
      resumeId: linkedResumeId,
    },
    include: {
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    application: updatedApplication,
  });
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const applicationId = Number(req.params.id);

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  await prisma.jobApplication.delete({
    where: {
      id: application.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application deleted successfully",
  });
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};