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
  const scenarioId = parseInt(id);
  if (isNaN(scenarioId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const scenario = await prisma.simulationScenario.update({ 
    where: { id: scenarioId }, 
    data: body 
  });
  return NextResponse.json(scenario);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const scenarioId = parseInt(id);
  if (isNaN(scenarioId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.simulationScenario.delete({ where: { id: scenarioId } });
  return NextResponse.json({ success: true });
}
