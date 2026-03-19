import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const scenario = await prisma.simulationScenario.create({ data });
  return NextResponse.json(scenario);
}

export async function GET() {
  const scenarios = await prisma.simulationScenario.findMany({ orderBy: { id: "desc" } });
  return NextResponse.json(scenarios);
}
