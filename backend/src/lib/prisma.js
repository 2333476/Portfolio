
console.log("DATABASE_URL (debug):", process.env.DATABASE_URL);
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

module.exports = prisma;
