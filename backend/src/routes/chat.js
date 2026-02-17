const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../lib/prisma');
const pdf = require('pdf-parse');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatController = require('../controllers/chat.controller');

router.post('/', chatController.handleChat);

module.exports = router;
