const express = require("express");

const {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
} = require("../controllers/resume.controller");

const { protect } = require("../middleware/auth.middleware");
const { uploadResume: uploadResumeMiddleware } = require("../middleware/upload.middleware");

const router = express.Router();

router.use(protect);

router.post("/upload", uploadResumeMiddleware.single("resume"), uploadResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);

module.exports = router;