import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const challenge = await prisma.challenge.update({ 
    where: { id: challengeId }, 
    data: body 
  });
  return NextResponse.json(challenge);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.challenge.delete({ where: { id: challengeId } });
  return NextResponse.json({ success: true });
}
