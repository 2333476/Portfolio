const prisma = require("./lib/prisma");

// DB check (simple)
app.get("/api/db-check", async (req, res) => {
  try {
    // une requête ultra simple
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ db: "ok", result });
  } catch (err) {
    res.status(500).json({
      db: "error",
      message: err?.message ?? "Unknown error",
    });
  }
});
