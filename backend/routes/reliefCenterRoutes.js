const express = require("express");
const { body } = require("express-validator");
const {
  registerCenter,
  requestResources,
  getCenters,
  getMyCenter,
  updateMyCenter
} = require("../controllers/reliefCenterController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, getCenters);
router.get("/me", protect, getMyCenter);

router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("location.address").trim().notEmpty().withMessage("location.address is required"),
    body("location.lat").isFloat({ min: -90, max: 90 }).withMessage("location.lat must be valid"),
    body("location.lng").isFloat({ min: -180, max: 180 }).withMessage("location.lng must be valid"),
    body("capacity").isInt({ min: 0 }).withMessage("capacity must be >= 0"),
    validateRequest
  ],
  registerCenter
);

router.patch(
  "/me",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
    body("location.address").optional().trim().notEmpty().withMessage("location.address cannot be empty"),
    body("location.lat").optional().isFloat({ min: -90, max: 90 }).withMessage("location.lat must be valid"),
    body("location.lng").optional().isFloat({ min: -180, max: 180 }).withMessage("location.lng must be valid"),
    body("capacity").optional().isInt({ min: 0 }).withMessage("capacity must be >= 0"),
    body("currentOccupancy").optional().isInt({ min: 0 }).withMessage("currentOccupancy must be >= 0"),
    body("status").optional().isIn(["active", "inactive", "overwhelmed"]).withMessage("invalid status"),
    validateRequest
  ],
  updateMyCenter
);

router.post(
  "/request",
  protect,
  [
    body("centerId").isMongoId().withMessage("centerId must be a valid id"),
    body("resourcesNeeded").isArray().withMessage("resourcesNeeded must be an array"),
    validateRequest
  ],
  requestResources
);

module.exports = router;
