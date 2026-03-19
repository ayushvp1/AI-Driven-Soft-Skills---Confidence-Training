import { prisma } from "@/lib/prisma";

const EXERCISE_NAMES: Record<number, string> = {
  1: "Mirror Talk",
  2: "Power Posing",
  3: "Tongue Twisters",
  4: "Eye Contact Practice",
  5: "Breathing Exercise",
};

export default async function ExercisesPage() {
  const logs = await prisma.exerciseLog.findMany({
    orderBy: { timestamp: "desc" },
    include: { user: { select: { username: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Exercise Logs</h1>
        <p className="text-slate-400 text-sm mt-1">{logs.length} total exercise completions</p>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/80">
                <th className="text-left text-slate-400 font-medium px-4 py-3">#ID</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">User</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Exercise</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Completed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-500">#{log.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{log.user.username}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-600/20 border border-orange-500/20 text-orange-300 text-xs font-medium">
                      {EXERCISE_NAMES[log.exercise_id] ?? `Exercise #${log.exercise_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-slate-500">No exercise logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
