import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-slate-800/50 border-r border-slate-700/50">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Logged in as{" "}
                  <span className="text-purple-400 font-medium">
                    {session?.user?.name ?? session?.user?.email}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/20 border border-purple-500/20 text-purple-300 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
