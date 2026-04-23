const express = require("express");
const { body, param } = require("express-validator");
const {
  registerVolunteer,
  assignVolunteerTask,
  getVolunteers,
  getAvailableVolunteers,
  matchVolunteers,
  getMyVolunteerProfile,
  updateMyVolunteerProfile
} = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, getVolunteers);
router.get("/available", protect, getAvailableVolunteers);
router.get("/me", protect, getMyVolunteerProfile);
router.patch(
  "/me",
  protect,
  [
    body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
    body("password").optional().isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
    body("skills").optional().isArray().withMessage("skills must be an array"),
    body("status").optional().isIn(["available", "deployed", "inactive"]).withMessage("invalid volunteer status"),
    validateRequest
  ],
  updateMyVolunteerProfile
);
router.post(
  "/",
  protect,
  [
    body("userId").isMongoId().withMessage("userId must be valid"),
    body("disasterId").optional().isMongoId().withMessage("disasterId must be valid"),
    body("skills").optional().isArray().withMessage("skills must be an array"),
    body("status").optional().isIn(["available", "deployed", "inactive"]).withMessage("invalid volunteer status"),
    validateRequest
  ],
  registerVolunteer
);
router.patch(
  "/:id",
  protect,
  [
    param("id").isMongoId().withMessage("invalid volunteer id"),
    body("disasterId").optional().isMongoId().withMessage("disasterId must be valid"),
    body("status").optional().isIn(["available", "deployed", "inactive"]).withMessage("invalid volunteer status"),
    validateRequest
  ],
  assignVolunteerTask
);
router.put(
  "/:id",
  protect,
  [
    param("id").isMongoId().withMessage("invalid volunteer id"),
    body("disasterId").optional().isMongoId().withMessage("disasterId must be valid"),
    body("status").optional().isIn(["available", "deployed", "inactive"]).withMessage("invalid volunteer status"),
    validateRequest
  ],
  assignVolunteerTask
);
router.post(
  "/match",
  protect,
  [
    body("disasterId").isMongoId().withMessage("disasterId must be valid"),
    body("requiredSkills").isArray({ min: 1 }).withMessage("requiredSkills must be a non-empty array"),
    validateRequest
  ],
  matchVolunteers
);

module.exports = router;
