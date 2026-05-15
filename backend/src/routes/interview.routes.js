const express = require("express");

const {
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
} = require("../controllers/interview.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/:applicationId", addInterviewRound);
router.put("/:id", updateInterviewRound);
router.delete("/:id", deleteInterviewRound);

module.exports = router;