import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    // 1. Check Database Environment
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL is missing from environment variables.");
      return NextResponse.json(
        { error: "Configuration Error: Database connection string is missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // 2. Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;

    // 3. Database operations
    console.log(`Attempting to register user: ${username} (${email})`);

    // Check if user already exists
    let existingUser;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { username },
          ],
        },
      });
    } catch (dbError: any) {
      console.error("❌ Database Connection Error during lookup:", dbError);
      return NextResponse.json(
        { error: "Database Connection Error. Please ensure the database is accessible." },
        { status: 500 }
      );
    }

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          name: username, 
        },
      });
      console.log(`✅ User created successfully: ${user.id}`);
    } catch (createError: any) {
      console.error("❌ Database Error during user creation:", createError);
      return NextResponse.json(
        { error: `Database Error: ${createError.message || "Failed to create user record."}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("❌ Critical Registration Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || "Unknown error occurred."}` },
      { status: 500 }
    );
  }
}
