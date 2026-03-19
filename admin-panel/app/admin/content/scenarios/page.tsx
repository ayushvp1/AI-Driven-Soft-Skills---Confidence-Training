import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ScenariosContentPage() {
  const scenarios = await prisma.simulationScenario.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage GD Scenarios</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure discussion topics and AI agent personas for group simulations.
          </p>
        </div>
        <Link
          href="/admin/content/scenarios/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          + Add Scenario
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all flex flex-col group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex -space-x-2">
                  {(scenario.participants as any[]).map((p, i) => (
                    <div 
                      key={i} 
                      title={p.name}
                      className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                    >
                      {p.name[0]}
                    </div>
                  ))}
                </div>
                <span className="text-slate-500 text-xs font-mono">#{scenario.id}</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">
                {scenario.topic}
              </h3>
              
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {scenario.objective}
              </p>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active AI Personas</p>
                <div className="grid grid-cols-1 gap-2">
                  {(scenario.participants as any[]).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/30 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">{p.name}:</span>
                      <span className="truncate italic">"{p.persona}"</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-700/30 flex items-center justify-end">
                 <Link
                   href={`/admin/content/scenarios/${scenario.id}`}
                   className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-1"
                 >
                   Edit AI Participants
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                 </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
