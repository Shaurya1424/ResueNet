const express = require("express");
const { createResource, getResources } = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createResource);
router.get("/", protect, getResources);

module.exports = router;
