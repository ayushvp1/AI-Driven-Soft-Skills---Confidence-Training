import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    console.log("Creating exercise with data:", data);
    const exercise = await prisma.exercise.create({ data });
    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error("Error creating exercise:", error);
    return NextResponse.json({ error: error.message || "Failed to create exercise" }, { status: 500 });
  }
}

export async function GET() {
  const exercises = await prisma.exercise.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(exercises);
}
