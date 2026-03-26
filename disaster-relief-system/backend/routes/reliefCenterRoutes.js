const express = require("express");
const { registerCenter, requestResources } = require("../controllers/reliefCenterController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, registerCenter);
router.post("/request", protect, requestResources);

module.exports = router;
