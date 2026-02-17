const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const resumes = await prisma.resume.findMany();
    console.log("Resumes found:", resumes);
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
