const express = require("express");
const { param } = require("express-validator");
const { getOverview, getDisasterAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/overview", protect, getOverview);
router.get(
  "/disaster/:id",
  protect,
  [param("id").isMongoId().withMessage("invalid disaster id"), validateRequest],
  getDisasterAnalytics
);

module.exports = router;
