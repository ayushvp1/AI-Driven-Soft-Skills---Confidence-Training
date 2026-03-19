import { prisma } from "@/lib/prisma";

export default async function SubmissionsPage() {
  const submissions = await prisma.challengeSubmission.findMany({
    orderBy: { timestamp: "desc" },
    include: { user: { select: { username: true, email: true } } },
  });

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-slate-400";
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return "bg-slate-600/20 border-slate-500/20";
    if (score >= 7) return "bg-green-600/20 border-green-500/20";
    if (score >= 4) return "bg-yellow-600/20 border-yellow-500/20";
    return "bg-red-600/20 border-red-500/20";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Challenge Submissions</h1>
        <p className="text-slate-400 text-sm mt-1">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/80">
                <th className="text-left text-slate-400 font-medium px-4 py-3">#ID</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">User</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Challenge</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Score</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Feedback</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-500">#{sub.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{sub.user.username}</p>
                    <p className="text-slate-400 text-xs">{sub.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">Challenge #{sub.challenge_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreBg(sub.score)} ${getScoreColor(sub.score)}`}>
                      {sub.score !== null ? `${sub.score}/10` : "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs">
                    <p className="truncate text-xs">{sub.feedback ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(sub.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">No submissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
