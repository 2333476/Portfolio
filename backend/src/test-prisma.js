require("dotenv").config();
console.log("DATABASE_URL (debug):", process.env.DATABASE_URL);

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Essaie de lire une table existante (adapte le nom si besoin)
  const result = await prisma.skill.findMany({ take: 1 });
  console.log("Query result:", result);
}

main()
  .catch((e) => {
    console.error("Prisma error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
