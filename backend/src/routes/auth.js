const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma"); // Assuming this exists
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../middleware/auth");

const authController = require("../controllers/auth.controller");

// Login
router.post("/login", authController.login);

// Setup (create first admin if none exists)
router.post("/setup", authController.setup);

module.exports = router;
