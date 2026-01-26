const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/skills", async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err?.message ?? "Error" });
  }
});


module.exports = app;
