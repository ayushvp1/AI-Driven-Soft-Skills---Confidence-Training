import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalUsers, totalSubmissions, totalSimulations, totalExercises, avgScoreResult, recentUsers] =
    await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.challengeSubmission.count(),
      prisma.simulationResult.count(),
      prisma.exerciseLog.count(),
      prisma.challengeSubmission.aggregate({
        _avg: { score: true },
        where: { score: { not: null } },
      }),
      prisma.user.findMany({
        where: { role: "user" },
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, username: true, email: true },
      }),
    ]);

  const avgScore = avgScoreResult._avg.score
    ? Math.round(avgScoreResult._avg.score * 10) / 10
    : 0;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: "👥",
      color: "from-blue-600/20 to-blue-700/10 border-blue-500/20",
      textColor: "text-blue-400",
    },
    {
      label: "Challenge Submissions",
      value: totalSubmissions,
      icon: "🎤",
      color: "from-purple-600/20 to-purple-700/10 border-purple-500/20",
      textColor: "text-purple-400",
    },
    {
      label: "GD Simulations",
      value: totalSimulations,
      icon: "💬",
      color: "from-green-600/20 to-green-700/10 border-green-500/20",
      textColor: "text-green-400",
    },
    {
      label: "Exercise Logs",
      value: totalExercises,
      icon: "🏋️",
      color: "from-orange-600/20 to-orange-700/10 border-orange-500/20",
      textColor: "text-orange-400",
    },
    {
      label: "Avg Challenge Score",
      value: `${avgScore}/10`,
      icon: "⭐",
      color: "from-yellow-600/20 to-yellow-700/10 border-yellow-500/20",
      textColor: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Overview of the AI Soft Skills Training platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border bg-gradient-to-br ${stat.color} p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Recently Joined Users</h2>
          <a href="/admin/users" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="space-y-3">
          {recentUsers.length === 0 ? (
            <p className="text-slate-400 text-sm">No users yet.</p>
          ) : (
            recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-sm flex-shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                </div>
                <span className="ml-auto text-slate-500 text-xs">#{user.id}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
