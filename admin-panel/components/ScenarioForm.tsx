"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Participant {
  name: string;
  persona: string;
  trait: string;
  model: string;
}

interface ScenarioFormData {
  topic: string;
  objective: string;
  participants: Participant[];
}

export default function ScenarioForm({
  initialData,
  scenarioId,
}: {
  initialData?: ScenarioFormData;
  scenarioId?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ScenarioFormData>(
    initialData || {
      topic: "",
      objective: "",
      participants: [
        { name: "Sarah", persona: "", trait: "Collaborative", model: "gpt-oss-20b-free" },
        { name: "David", persona: "", trait: "Critical", model: "gpt-oss-20b-free" },
        { name: "Priya", persona: "", trait: "Analytical", model: "gpt-oss-20b-free" },
      ],
    }
  );

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...formData.participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    setFormData({ ...formData, participants: newParticipants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = scenarioId
        ? `/api/admin/content/scenarios/${scenarioId}`
        : "/api/admin/content/scenarios";
      const method = scenarioId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save scenario");
      
      router.push("/admin/content/scenarios");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {scenarioId ? "Edit GD Scenario" : "Create New Scenario"}
        </h1>
        <Link href="/admin/content/scenarios" className="text-slate-500 hover:text-white text-sm">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="space-y-4">
           <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">Discussion Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">Objective</label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              required
              rows={2}
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">AI Participants & Personas</label>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {formData.participants.map((p, index) => (
              <div key={index} className="bg-slate-800/80 border border-slate-700/50 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                    {p.name[0]}
                  </div>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                    className="flex-1 bg-transparent border-none text-white font-bold text-sm focus:ring-0"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-500 font-bold">Trait</label>
                   <input
                    type="text"
                    value={p.trait}
                    onChange={(e) => handleParticipantChange(index, "trait", e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-slate-500 font-bold">Persona Profile</label>
                  <textarea
                    value={p.persona}
                    onChange={(e) => handleParticipantChange(index, "persona", e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700/30 rounded-lg px-3 py-1.5 text-xs text-white resize-none"
                    placeholder="Describe agent behavior..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm italic">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-2xl shadow-emerald-900/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? "Synching To Cloud..." : scenarioId ? "Update Simulation" : "Launch New Scenario"}
        </button>
      </form>
    </div>
  );
}
