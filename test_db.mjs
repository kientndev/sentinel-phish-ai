import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import fs from "fs";

async function testConnection() {
  console.log("Starting DB Connection Test...");
  
  // Manually load .env if it's missing from process.env
  if (!process.env.DATABASE_URL && fs.existsSync(".env")) {
    console.log("Reading .env manually...");
    const envFile = fs.readFileSync(".env", "utf8");
    const match = envFile.match(/DATABASE_URL=["']?(.+?)["']?(\s|$)/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }

  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL is NULL or undefined. Please ensure you have a .env file with DATABASE_URL set.");
    process.exit(1);
  }

  console.log(`Checking protocol for: ${dbUrl.split('://')[0]}://...`);
  
  if (!dbUrl.startsWith("postgresql://")) {
    console.warn("⚠️ Warning: Connection string does NOT start with postgresql://. It might be postgres:// or something else.");
  }

  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log("✅ Success: Prisma connected successfully!");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Success: Found ${userCount} users in database.`);
  } catch (error) {
    console.error("❌ Database Connection Failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testConnection();
