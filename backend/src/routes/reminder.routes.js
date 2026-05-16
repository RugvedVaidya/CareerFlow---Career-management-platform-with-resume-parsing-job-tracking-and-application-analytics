const express = require("express");

const {
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
} = require("../controllers/reminder.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

// Filter routes should come before /:id
router.get("/filter/upcoming", getUpcomingReminders);
router.get("/filter/overdue", getOverdueReminders);
router.get("/filter/completed", getCompletedReminders);

// Base routes
router.post("/", createReminder);
router.get("/", getReminders);

// Single reminder routes
router.get("/:id", getReminderById);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

// Status update routes
router.patch("/:id/complete", completeReminder);
router.patch("/:id/pending", markReminderPending);

module.exports = router;