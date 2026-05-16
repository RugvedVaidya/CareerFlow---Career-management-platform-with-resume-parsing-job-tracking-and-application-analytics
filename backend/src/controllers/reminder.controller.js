const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

/*
  Reminder Model expected in schema.prisma:

  model Reminder {
    id            Int             @id @default(autoincrement())
    title         String
    message       String?
    dueDate       DateTime
    isCompleted   Boolean         @default(false)
    createdAt     DateTime        @default(now())
    updatedAt     DateTime        @updatedAt

    userId        Int
    user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

    applicationId Int?
    application   JobApplication? @relation(fields: [applicationId], references: [id], onDelete: SetNull)
  }
*/

// Helper: validate date
const isValidDate = (dateValue) => {
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime());
};

// Helper: common include
const reminderInclude = {
  application: {
    select: {
      id: true,
      companyName: true,
      jobRole: true,
      status: true,
      source: true,
      appliedDate: true,
      matchScore: true,
      resume: {
        select: {
          id: true,
          fileName: true,
        },
      },
    },
  },
};

// Helper: check application ownership
const getLinkedApplicationId = async (applicationId, userId) => {
  if (applicationId === undefined || applicationId === null || applicationId === "") {
    return null;
  }

  const application = await prisma.jobApplication.findFirst({
    where: {
      id: Number(applicationId),
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }

  return application.id;
};

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = asyncHandler(async (req, res) => {
  const { title, message, dueDate, applicationId } = req.body;

  if (!title || !String(title).trim()) {
    res.status(400);
    throw new Error("Reminder title is required");
  }

  if (!dueDate) {
    res.status(400);
    throw new Error("Due date is required");
  }

  if (!isValidDate(dueDate)) {
    res.status(400);
    throw new Error("Invalid due date");
  }

  const linkedApplicationId = await getLinkedApplicationId(
    applicationId,
    req.user.id
  );

  const reminder = await prisma.reminder.create({
    data: {
      title: String(title).trim(),
      message: message ? String(message).trim() : null,
      dueDate: new Date(dueDate),
      userId: req.user.id,
      applicationId: linkedApplicationId,
    },
    include: reminderInclude,
  });

  res.status(201).json({
    success: true,
    message: "Reminder created successfully",
    reminder,
  });
});

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res) => {
  const { status, applicationId, search } = req.query;

  const where = {
    userId: req.user.id,
  };

  if (applicationId) {
    where.applicationId = Number(applicationId);
  }

  if (status === "completed") {
    where.isCompleted = true;
  }

  if (status === "pending") {
    where.isCompleted = false;
  }

  if (search && String(search).trim()) {
    where.OR = [
      {
        title: {
          contains: String(search).trim(),
          mode: "insensitive",
        },
      },
      {
        message: {
          contains: String(search).trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  const reminders = await prisma.reminder.findMany({
    where,
    include: reminderInclude,
    orderBy: [
      {
        isCompleted: "asc",
      },
      {
        dueDate: "asc",
      },
    ],
  });

  const now = new Date();

  const overdue = reminders.filter(
    (reminder) => !reminder.isCompleted && new Date(reminder.dueDate) < now
  );

  const upcoming = reminders.filter(
    (reminder) => !reminder.isCompleted && new Date(reminder.dueDate) >= now
  );

  const completed = reminders.filter((reminder) => reminder.isCompleted);

  res.status(200).json({
    success: true,
    count: reminders.length,
    reminders,
    summary: {
      overdue: overdue.length,
      upcoming: upcoming.length,
      completed: completed.length,
    },
  });
});

// @desc    Get single reminder
// @route   GET /api/reminders/:id
// @access  Private
const getReminderById = asyncHandler(async (req, res) => {
  const reminderId = Number(req.params.id);

  if (!reminderId) {
    res.status(400);
    throw new Error("Invalid reminder id");
  }

  const reminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId: req.user.id,
    },
    include: reminderInclude,
  });

  if (!reminder) {
    res.status(404);
    throw new Error("Reminder not found");
  }

  res.status(200).json({
    success: true,
    reminder,
  });
});

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = asyncHandler(async (req, res) => {
  const reminderId = Number(req.params.id);

  if (!reminderId) {
    res.status(400);
    throw new Error("Invalid reminder id");
  }

  const { title, message, dueDate, isCompleted, applicationId } = req.body;

  const existingReminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId: req.user.id,
    },
  });

  if (!existingReminder) {
    res.status(404);
    throw new Error("Reminder not found");
  }

  let linkedApplicationId = existingReminder.applicationId;

  if (applicationId !== undefined) {
    linkedApplicationId = await getLinkedApplicationId(
      applicationId,
      req.user.id
    );
  }

  const updateData = {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      res.status(400);
      throw new Error("Reminder title cannot be empty");
    }

    updateData.title = String(title).trim();
  }

  if (message !== undefined) {
    updateData.message = message ? String(message).trim() : null;
  }

  if (dueDate !== undefined) {
    if (!dueDate) {
      res.status(400);
      throw new Error("Due date cannot be empty");
    }

    if (!isValidDate(dueDate)) {
      res.status(400);
      throw new Error("Invalid due date");
    }

    updateData.dueDate = new Date(dueDate);
  }

  if (isCompleted !== undefined) {
    updateData.isCompleted = Boolean(isCompleted);
  }

  if (applicationId !== undefined) {
    updateData.applicationId = linkedApplicationId;
  }

  const updatedReminder = await prisma.reminder.update({
    where: {
      id: existingReminder.id,
    },
    data: updateData,
    include: reminderInclude,
  });

  res.status(200).json({
    success: true,
    message: "Reminder updated successfully",
    reminder: updatedReminder,
  });
});

// @desc    Mark reminder as completed
// @route   PATCH /api/reminders/:id/complete
// @access  Private
const completeReminder = asyncHandler(async (req, res) => {
  const reminderId = Number(req.params.id);

  if (!reminderId) {
    res.status(400);
    throw new Error("Invalid reminder id");
  }

  const existingReminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId: req.user.id,
    },
  });

  if (!existingReminder) {
    res.status(404);
    throw new Error("Reminder not found");
  }

  const updatedReminder = await prisma.reminder.update({
    where: {
      id: existingReminder.id,
    },
    data: {
      isCompleted: true,
    },
    include: reminderInclude,
  });

  res.status(200).json({
    success: true,
    message: "Reminder marked as completed",
    reminder: updatedReminder,
  });
});

// @desc    Mark reminder as pending
// @route   PATCH /api/reminders/:id/pending
// @access  Private
const markReminderPending = asyncHandler(async (req, res) => {
  const reminderId = Number(req.params.id);

  if (!reminderId) {
    res.status(400);
    throw new Error("Invalid reminder id");
  }

  const existingReminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId: req.user.id,
    },
  });

  if (!existingReminder) {
    res.status(404);
    throw new Error("Reminder not found");
  }

  const updatedReminder = await prisma.reminder.update({
    where: {
      id: existingReminder.id,
    },
    data: {
      isCompleted: false,
    },
    include: reminderInclude,
  });

  res.status(200).json({
    success: true,
    message: "Reminder marked as pending",
    reminder: updatedReminder,
  });
});

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = asyncHandler(async (req, res) => {
  const reminderId = Number(req.params.id);

  if (!reminderId) {
    res.status(400);
    throw new Error("Invalid reminder id");
  }

  const reminder = await prisma.reminder.findFirst({
    where: {
      id: reminderId,
      userId: req.user.id,
    },
  });

  if (!reminder) {
    res.status(404);
    throw new Error("Reminder not found");
  }

  await prisma.reminder.delete({
    where: {
      id: reminder.id,
    },
  });

  res.status(200).json({
    success: true,
    message: "Reminder deleted successfully",
  });
});

// @desc    Get upcoming reminders
// @route   GET /api/reminders/filter/upcoming
// @access  Private
const getUpcomingReminders = asyncHandler(async (req, res) => {
  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: req.user.id,
      isCompleted: false,
      dueDate: {
        gte: now,
      },
    },
    include: reminderInclude,
    orderBy: {
      dueDate: "asc",
    },
  });

  res.status(200).json({
    success: true,
    count: reminders.length,
    reminders,
  });
});

// @desc    Get overdue reminders
// @route   GET /api/reminders/filter/overdue
// @access  Private
const getOverdueReminders = asyncHandler(async (req, res) => {
  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: req.user.id,
      isCompleted: false,
      dueDate: {
        lt: now,
      },
    },
    include: reminderInclude,
    orderBy: {
      dueDate: "asc",
    },
  });

  res.status(200).json({
    success: true,
    count: reminders.length,
    reminders,
  });
});

// @desc    Get completed reminders
// @route   GET /api/reminders/filter/completed
// @access  Private
const getCompletedReminders = asyncHandler(async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    where: {
      userId: req.user.id,
      isCompleted: true,
    },
    include: reminderInclude,
    orderBy: {
      dueDate: "desc",
    },
  });

  res.status(200).json({
    success: true,
    count: reminders.length,
    reminders,
  });
});

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  completeReminder,
  markReminderPending,
  deleteReminder,
  getUpcomingReminders,
  getOverdueReminders,
  getCompletedReminders,
};