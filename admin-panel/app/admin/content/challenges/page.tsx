import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ChallengesContentPage() {
  const challenges = await prisma.challenge.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Challenges</h1>
          <p className="text-slate-400 text-sm mt-1">
            Edit training content for AI communication and leadership challenges.
          </p>
        </div>
        <Link
          href="/admin/content/challenges/new"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          + Add Challenge
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/30 transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 rounded-md bg-purple-600/20 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                {challenge.category}
              </span>
              <span className="text-slate-500 text-xs">#{challenge.id}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
              {challenge.title}
            </h3>
            <p className="text-slate-400 text-xs line-clamp-2 mb-4 flex-1">
              {challenge.objective}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
              <span className={`text-xs font-medium ${
                challenge.difficulty === "Advanced" ? "text-red-400" : 
                challenge.difficulty === "Intermediate" ? "text-yellow-400" : "text-green-400"
              }`}>
                {challenge.difficulty}
              </span>
              <Link
                href={`/admin/content/challenges/${challenge.id}`}
                className="text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1"
              >
                Edit Content
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
