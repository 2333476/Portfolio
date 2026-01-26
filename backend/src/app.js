
const express = require("express");
const app = express();
const prisma = require("./lib/prisma");

app.get("/api/db-check", async (req, res) => {
  try {
    await prisma.skill.count(); // ou un model qui existe
    res.json({ db: "ok" });
  } catch (err) {
    res.status(500).json({ db: "error", message: err?.message ?? "Unknown error" });
  }
});

module.exports = app;
