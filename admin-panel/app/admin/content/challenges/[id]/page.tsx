import { prisma } from "@/lib/prisma";
import ChallengeForm from "@/components/ChallengeForm";
import { notFound } from "next/navigation";

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const challengeId = parseInt(id);

  if (isNaN(challengeId)) notFound();

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) notFound();

  return (
    <div className="container mx-auto">
      <ChallengeForm initialData={challenge} challengeId={challengeId} />
    </div>
  );
}
