const express = require("express");
const { body, param } = require("express-validator");
const {
  createResource,
  getResources,
  dispatchResource,
  getResourceSummary
} = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, getResources);
router.get("/summary", protect, getResourceSummary);
router.post(
  "/",
  protect,
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("type").isIn(["food", "water", "medicine"]).withMessage("invalid resource type"),
    body("quantity").isInt({ min: 0 }).withMessage("quantity must be >= 0"),
    body("unit").trim().notEmpty().withMessage("unit is required"),
    body("disasterId").isMongoId().withMessage("disasterId must be a valid id"),
    validateRequest
  ],
  createResource
);
router.patch(
  "/:id/dispatch",
  protect,
  [
    param("id").isMongoId().withMessage("invalid resource id"),
    body("reliefCenterId").isMongoId().withMessage("reliefCenterId must be a valid id"),
    validateRequest
  ],
  dispatchResource
);

module.exports = router;
