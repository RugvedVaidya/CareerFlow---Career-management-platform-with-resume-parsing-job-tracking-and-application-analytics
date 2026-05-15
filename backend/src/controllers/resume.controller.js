const fs = require("fs");
const pdfParse = require("pdf-parse");

const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Upload resume PDF
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a PDF resume");
  }

  const filePath = req.file.path;
  const fileBuffer = fs.readFileSync(filePath);

  const pdfData = await pdfParse(fileBuffer);
  const extractedText = pdfData.text || "";

  const resume = await prisma.resume.create({
    data: {
      fileName: req.file.originalname,
      filePath,
      extractedText,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    success: true,
    message: "Resume uploaded and parsed successfully",
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      filePath: resume.filePath,
      extractedTextPreview: resume.extractedText.substring(0, 500),
      createdAt: resume.createdAt,
    },
  });
});

// @desc    Get all resumes of logged-in user
// @route   GET /api/resumes
// @access  Private
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await prisma.resume.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fileName: true,
      filePath: true,
      createdAt: true,
    },
  });

  res.status(200).json({
    success: true,
    count: resumes.length,
    resumes,
  });
});

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  const resumeId = Number(req.params.id);

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: req.user.id,
    },
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  res.status(200).json({
    success: true,
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      filePath: resume.filePath,
      extractedText: resume.extractedText,
      createdAt: resume.createdAt,
    },
  });
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = asyncHandler(async (req, res) => {
  const resumeId = Number(req.params.id);

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: req.user.id,
    },
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  if (fs.existsSync(resume.filePath)) {
    fs.unlinkSync(resume.filePath);
  }

  await prisma.resume.delete({
    where: {
      id: resumeId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Resume deleted successfully",
  });
});

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
};