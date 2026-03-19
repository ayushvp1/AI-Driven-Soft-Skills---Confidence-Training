import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const exerciseId = parseInt(id);
    if (isNaN(exerciseId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    console.log(`Updating exercise ${exerciseId}:`, body);
    const exercise = await prisma.exercise.update({ 
      where: { id: exerciseId }, 
      data: body 
    });
    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error("Error updating exercise:", error);
    return NextResponse.json({ error: error.message || "Failed to update exercise" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const exerciseId = parseInt(id);
  if (isNaN(exerciseId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.exercise.delete({ where: { id: exerciseId } });
  return NextResponse.json({ success: true });
}
