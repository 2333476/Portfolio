const express = require("express");
const cors = require("cors");
const path = require("path");
const prisma = require("./lib/prisma");

const authRoutes = require("./routes/auth");
const contentRoutes = require("./routes/content");
const chatRoutes = require("./routes/chat");
const uploadRoutes = require('./routes/upload');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", contentRoutes);
app.use("/api/chat", chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get("/api/health", async (req, res) => {
  try {
    // Simple DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const { ApiError } = require('./utils/errors/ApiError');

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('🔥 INTERNAL SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
