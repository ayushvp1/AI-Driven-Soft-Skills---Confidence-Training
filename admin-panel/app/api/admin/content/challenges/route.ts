import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    console.log("Creating challenge with data:", data);
    const challenge = await prisma.challenge.create({ data });
    return NextResponse.json(challenge);
  } catch (error: any) {
    console.error("Error creating challenge:", error);
    return NextResponse.json({ error: error.message || "Failed to create challenge" }, { status: 500 });
  }
}

export async function GET() {
  const challenges = await prisma.challenge.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(challenges);
}
