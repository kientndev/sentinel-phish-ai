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
    // 1. Connection Check: Specific env variable validation
    if (!process.env.DATABASE_URL) {
      console.error("Database Error: DATABASE_URL environment variable is missing.");
      return NextResponse.json(
        { error: "Database environment variable is missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // 2. Input Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;

    // 3. Duplicate Check
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
    } catch (error: any) {
      console.error("Database Error:", error);
      return NextResponse.json(
        { error: "Database connection failed. Please check your connection string." },
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

    // 4. Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. User Creation
    try {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          name: username, 
        },
      });
      console.log("Account created successfully:", user.id);
      
      return NextResponse.json({
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Database Error:", error);
      return NextResponse.json(
        { error: "Could not create user account. Database error occurred." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Critical Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please contact support." },
      { status: 500 }
    );
  }
}
