const express = require("express");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/application.controller");

const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.route("/").post(createApplication).get(getApplications);

router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

module.exports = router;