const express = require("express");
const { param } = require("express-validator");
const {
  getUnreadNotifications,
  markNotificationAsRead
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/", protect, getUnreadNotifications);
router.patch(
  "/:id/read",
  protect,
  [param("id").isMongoId().withMessage("invalid notification id"), validateRequest],
  markNotificationAsRead
);

module.exports = router;
