import { prisma } from "@/lib/prisma";
import ScenarioForm from "@/components/ScenarioForm";
import { notFound } from "next/navigation";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scenarioId = parseInt(id);

  if (isNaN(scenarioId)) notFound();

  const scenario = await prisma.simulationScenario.findUnique({
    where: { id: scenarioId },
  });

  if (!scenario) notFound();

  return (
    <div className="container mx-auto">
      <ScenarioForm initialData={scenario as any} scenarioId={scenarioId} />
    </div>
  );
}
