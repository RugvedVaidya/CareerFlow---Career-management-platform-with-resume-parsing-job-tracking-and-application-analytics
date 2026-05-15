const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create job application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const {
    companyName,
    jobRole,
    location,
    jobDescription,
    status,
    appliedDate,
    resumeId,
  } = req.body;

  if (!companyName || !jobRole || !jobDescription) {
    res.status(400);
    throw new Error("Company name, job role, and job description are required");
  }

  let selectedResumeId = null;

  if (resumeId) {
    const resume = await prisma.resume.findFirst({
      where: {
        id: Number(resumeId),
        userId: req.user.id,
      },
    });

    if (!resume) {
      res.status(404);
      throw new Error("Selected resume not found");
    }

    selectedResumeId = resume.id;
  }

  const application = await prisma.jobApplication.create({
    data: {
      companyName,
      jobRole,
      location,
      jobDescription,
      status: status || "APPLIED",
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      userId: req.user.id,
      resumeId: selectedResumeId,
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

// @desc    Get all job applications
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

// @desc    Get single job application
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
      analyses: {
        orderBy: {
          createdAt: "desc",
        },
      },
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

// @desc    Update job application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = asyncHandler(async (req, res) => {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: Number(req.params.id),
      userId: req.user.id,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  const {
    companyName,
    jobRole,
    location,
    jobDescription,
    status,
    appliedDate,
    resumeId,
  } = req.body;

  let selectedResumeId = application.resumeId;

  if (resumeId !== undefined) {
    if (resumeId === null || resumeId === "") {
      selectedResumeId = null;
    } else {
      const resume = await prisma.resume.findFirst({
        where: {
          id: Number(resumeId),
          userId: req.user.id,
        },
      });

      if (!resume) {
        res.status(404);
        throw new Error("Selected resume not found");
      }

      selectedResumeId = resume.id;
    }
  }

  const updatedApplication = await prisma.jobApplication.update({
    where: {
      id: application.id,
    },
    data: {
      companyName: companyName ?? application.companyName,
      jobRole: jobRole ?? application.jobRole,
      location: location ?? application.location,
      jobDescription: jobDescription ?? application.jobDescription,
      status: status ?? application.status,
      appliedDate:
        appliedDate !== undefined
          ? appliedDate
            ? new Date(appliedDate)
            : null
          : application.appliedDate,
      resumeId: selectedResumeId,
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

// @desc    Delete job application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: Number(req.params.id),
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