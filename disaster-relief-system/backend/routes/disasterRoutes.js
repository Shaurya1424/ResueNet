const express = require("express");
const { body, param } = require("express-validator");
const {
  createDisaster,
  getDisasters,
  updateDisasterStatus,
  getDisasterStats
} = require("../controllers/disasterController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, getDisasters);
router.get("/stats", protect, getDisasterStats);
router.post(
  "/",
  protect,
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("type").isIn(["flood", "earthquake", "cyclone"]).withMessage("invalid disaster type"),
    body("location.address").trim().notEmpty().withMessage("location.address is required"),
    body("location.lat").isFloat({ min: -90, max: 90 }).withMessage("location.lat must be a valid latitude"),
    body("location.lng").isFloat({ min: -180, max: 180 }).withMessage("location.lng must be a valid longitude"),
    body("severity").isIn(["low", "medium", "high", "critical"]).withMessage("invalid severity"),
    body("description").trim().notEmpty().withMessage("description is required"),
    body("affectedPeople").optional().isInt({ min: 0 }).withMessage("affectedPeople must be >= 0"),
    validateRequest
  ],
  createDisaster
);
router.patch(
  "/:id/status",
  protect,
  [
    param("id").isMongoId().withMessage("invalid disaster id"),
    body("status")
      .isIn(["reported", "assessed", "active", "contained", "closed"])
      .withMessage("invalid disaster status"),
    validateRequest
  ],
  updateDisasterStatus
);

module.exports = router;
