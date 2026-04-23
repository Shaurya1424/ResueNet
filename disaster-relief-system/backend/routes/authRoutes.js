const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
    body("role").isIn(["admin", "volunteer", "relief_center"]).withMessage("invalid role"),
    validateRequest
  ],
  register
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("valid email is required"),
    body("password").notEmpty().withMessage("password is required"),
    validateRequest
  ],
  login
);

module.exports = router;
