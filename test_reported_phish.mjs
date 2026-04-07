import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.reportedPhish.count();
    console.log("ReportedPhish count:", count);
  } catch (error) {
    console.error("Error accessing ReportedPhish:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
