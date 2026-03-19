import { prisma } from "@/lib/prisma";
import Link from "next/link";

const EXERCISE_IMAGES: Record<string, string> = {
  "Self-Affirmation": "🧘",
  "Journaling": "✍️",
  "Public Speaking": "🎤",
  "Body Language": "🚶",
  "Exposure Therapy": "🪜",
  "Mindfulness": "🧠",
};

export default async function ExercisesContentPage() {
  const exercises = await prisma.exercise.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Exercises</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build courage and confidence with step-by-step training modules.
          </p>
        </div>
        <Link
          href="/admin/content/exercises/new"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          + Add Exercise
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all flex flex-col group"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/20 flex items-center justify-center text-xl shadow-lg shadow-orange-500/10">
                  {EXERCISE_IMAGES[exercise.category] || "🏋️"}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-[10px] font-bold text-slate-400 tracking-wider">
                    {exercise.duration}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider border ${
                    exercise.difficulty === "Advanced" ? "bg-red-600/10 border-red-500/20 text-red-400" :
                    exercise.difficulty === "Intermediate" ? "bg-yellow-600/10 border-yellow-500/20 text-yellow-400" :
                    "bg-green-600/10 border-green-500/20 text-green-400"
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors">
                {exercise.title}
              </h3>
              
              <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed italic">
                "{exercise.purpose}"
              </p>

              <div className="mt-auto pt-4 border-t border-slate-700/30 flex items-center justify-between">
                 <span className="text-slate-500 text-xs font-mono">#{exercise.id}</span>
                 <Link
                   href={`/admin/content/exercises/${exercise.id}`}
                   className="px-3 py-1.5 rounded-lg bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white text-xs font-bold transition-all border border-orange-500/20"
                 >
                   Edit Module
                 </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
