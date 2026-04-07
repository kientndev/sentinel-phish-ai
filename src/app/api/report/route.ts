import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { url, score, status } = await req.json();

    if (!url || score === undefined || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.reportedPhish.create({
      data: {
        url,
        score,
        status,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await prisma.reportedPhish.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
