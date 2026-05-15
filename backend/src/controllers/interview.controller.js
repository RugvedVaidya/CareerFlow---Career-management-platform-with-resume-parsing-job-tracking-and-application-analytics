const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Add interview round to application
// @route   POST /api/interviews/:applicationId
// @access  Private
const addInterviewRound = asyncHandler(async (req, res) => {
  const applicationId = Number(req.params.applicationId);
  const { roundName, roundDate, notes, result } = req.body;

  if (!roundName) {
    res.status(400);
    throw new Error("Round name is required");
  }

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

  const interviewRound = await prisma.interviewRound.create({
    data: {
      roundName,
      roundDate: roundDate ? new Date(roundDate) : null,
      notes: notes || null,
      result: result || "PENDING",
      applicationId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Interview round added successfully",
    interviewRound,
  });
});

// @desc    Update interview round
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterviewRound = asyncHandler(async (req, res) => {
  const interviewId = Number(req.params.id);
  const { roundName, roundDate, notes, result } = req.body;

  const interviewRound = await prisma.interviewRound.findFirst({
    where: {
      id: interviewId,
      application: {
        userId: req.user.id,
      },
    },
  });

  if (!interviewRound) {
    res.status(404);
    throw new Error("Interview round not found");
  }

  const updatedRound = await prisma.interviewRound.update({
    where: {
      id: interviewRound.id,
    },
    data: {
      roundName: roundName ?? interviewRound.roundName,
      roundDate:
        roundDate !== undefined
          ? roundDate
            ? new Date(roundDate)
            : null
          : interviewRound.roundDate,
      notes: notes !== undefined ? notes || null : interviewRound.notes,
      result: result ?? interviewRound.result,
    },
  });

  res.status(200).json({
    success: true,
    message: "Interview round updated successfully",
    interviewRound: updatedRound,
  });
});

// @desc    Delete interview round
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterviewRound = asyncHandler(async (req, res) => {
  const interviewId = Number(req.params.id);

  const interviewRound = await prisma.interviewRound.findFirst({
    where: {
      id: interviewId,
      application: {
        userId: req.user.id,
      },
    },
  });

  if (!interviewRound) {
    res.status(404);
    throw new Error("Interview round not found");
  }

  await prisma.interviewRound.delete({
    where: {
      id: interviewRound.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Interview round deleted successfully",
  });
});

module.exports = {
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
};