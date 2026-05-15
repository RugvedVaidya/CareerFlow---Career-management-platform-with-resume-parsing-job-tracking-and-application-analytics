const express = require("express");

const {
  analyzeResume,
  getAnalysisByApplication,
} = require("../controllers/analyzer.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.post("/", analyzeResume);
router.get("/:applicationId", getAnalysisByApplication);

module.exports = router;