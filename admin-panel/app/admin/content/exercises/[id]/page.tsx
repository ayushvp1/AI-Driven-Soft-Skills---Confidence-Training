import { prisma } from "@/lib/prisma";
import ExerciseForm from "@/components/ExerciseForm";
import { notFound } from "next/navigation";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exerciseId = parseInt(id);

  if (isNaN(exerciseId)) notFound();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) notFound();

  return (
    <div className="container mx-auto">
      <ExerciseForm initialData={exercise} exerciseId={exerciseId} />
    </div>
  );
}
