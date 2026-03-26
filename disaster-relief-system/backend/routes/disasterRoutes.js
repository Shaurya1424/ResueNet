const express = require("express");
const { createDisaster, getDisasters } = require("../controllers/disasterController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createDisaster);
router.get("/", protect, getDisasters);

module.exports = router;
