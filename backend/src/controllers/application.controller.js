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
  } = req.body;

  if (!companyName || !jobRole || !jobDescription || !appliedDate) {
    res.status(400);
    throw new Error(
      "Company name, job role, job description, and applied date are required"
    );
  }

  const application = await prisma.jobApplication.create({
    data: {
      companyName,
      jobRole,
      location,
      jobDescription,
      status: status || "APPLIED",
      appliedDate: new Date(appliedDate),
      userId: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Job application created successfully",
    application,
  });
});

// @desc    Get all job applications for logged-in user
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filters = {
    userId: req.user.id,
  };

  if (status) {
    filters.status = status;
  }

  if (search) {
    filters.OR = [
      {
        companyName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        jobRole: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const applications = await prisma.jobApplication.findMany({
    where: filters,
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
  const applicationId = Number(req.params.id);

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
    include: {
      interviews: true,
      analyses: true,
      reminders: true,
    },
  });

  if (!application) {
    res.status(404);
    throw new Error("Job application not found");
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
  const applicationId = Number(req.params.id);

  const existingApplication = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!existingApplication) {
    res.status(404);
    throw new Error("Job application not found");
  }

  const {
    companyName,
    jobRole,
    location,
    jobDescription,
    status,
    appliedDate,
    matchScore,
  } = req.body;

  const updatedApplication = await prisma.jobApplication.update({
    where: {
      id: applicationId,
    },
    data: {
      companyName: companyName ?? existingApplication.companyName,
      jobRole: jobRole ?? existingApplication.jobRole,
      location: location ?? existingApplication.location,
      jobDescription: jobDescription ?? existingApplication.jobDescription,
      status: status ?? existingApplication.status,
      appliedDate: appliedDate
        ? new Date(appliedDate)
        : existingApplication.appliedDate,
      matchScore: matchScore ?? existingApplication.matchScore,
    },
  });

  res.status(200).json({
    success: true,
    message: "Job application updated successfully",
    application: updatedApplication,
  });
});

// @desc    Delete job application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const applicationId = Number(req.params.id);

  const existingApplication = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      userId: req.user.id,
    },
  });

  if (!existingApplication) {
    res.status(404);
    throw new Error("Job application not found");
  }

  await prisma.jobApplication.delete({
    where: {
      id: applicationId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Job application deleted successfully",
  });
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};