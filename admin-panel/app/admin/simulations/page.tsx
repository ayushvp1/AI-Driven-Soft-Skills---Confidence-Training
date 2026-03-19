import { prisma } from "@/lib/prisma";

export default async function SimulationsPage() {
  const simulations = await prisma.simulationResult.findMany({
    orderBy: { timestamp: "desc" },
    include: { user: { select: { username: true } } },
  });

  const getScoreBadge = (score: number | null) => {
    if (!score) return "bg-slate-600/20 border-slate-500/20 text-slate-400";
    if (score >= 7) return "bg-green-600/20 border-green-500/20 text-green-400";
    if (score >= 4) return "bg-yellow-600/20 border-yellow-500/20 text-yellow-400";
    return "bg-red-600/20 border-red-500/20 text-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">GD Simulations</h1>
        <p className="text-slate-400 text-sm mt-1">{simulations.length} group discussion sessions</p>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/80">
                <th className="text-left text-slate-400 font-medium px-4 py-3">#ID</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">User</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Scenario</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Score</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Feedback</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {simulations.map((sim) => (
                <tr key={sim.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-500">#{sim.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{sim.user.username}</td>
                  <td className="px-4 py-3 text-slate-300">Scenario #{sim.scenario_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(sim.score)}`}>
                      {sim.score !== null ? `${sim.score}/10` : "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-xs">
                    <p className="truncate">{sim.feedback ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(sim.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
              {simulations.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500">No simulation results yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
