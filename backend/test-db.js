import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const run = async () => {
  const users = await prisma.user.findMany();
  console.log(users);
};

run().finally(() => prisma.$disconnect());
