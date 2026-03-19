import { prisma } from "@/lib/prisma";
import DeleteUserButton from "./DeleteUserButton";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: {
          submissions: true,
          simulation_results: true,
          exercise_logs: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-1">
          {users.length} registered user{users.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/80">
                <th className="text-left text-slate-400 font-medium px-4 py-3">#ID</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Username</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Role</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Challenges</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">GD Sessions</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Exercises</th>
                <th className="text-left text-slate-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-4 py-3 text-slate-500">#{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-semibold text-xs flex-shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-600/20 border border-purple-500/20 text-purple-300"
                          : "bg-slate-600/30 border border-slate-500/20 text-slate-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{user._count.submissions}</td>
                  <td className="px-4 py-3 text-slate-300">{user._count.simulation_results}</td>
                  <td className="px-4 py-3 text-slate-300">{user._count.exercise_logs}</td>
                  <td className="px-4 py-3">
                    <DeleteUserButton userId={user.id} username={user.username} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
