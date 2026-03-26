const express = require("express");
const {
  registerVolunteer,
  assignVolunteerTask,
  getVolunteers
} = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, registerVolunteer);
router.put("/:id", protect, assignVolunteerTask);
router.get("/", protect, getVolunteers);

module.exports = router;
