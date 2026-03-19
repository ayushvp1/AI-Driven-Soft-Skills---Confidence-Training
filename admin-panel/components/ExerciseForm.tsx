"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ExerciseFormData {
  title: string;
  duration: string;
  difficulty: string;
  category: string;
  purpose: string;
  psychological_benefit: string;
  steps: string[];
}

export default function ExerciseForm({
  initialData,
  exerciseId,
}: {
  initialData?: ExerciseFormData;
  exerciseId?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ExerciseFormData>(
    initialData || {
      title: "",
      duration: "5 minutes",
      difficulty: "Beginner",
      category: "Self-Affirmation",
      purpose: "",
      psychological_benefit: "",
      steps: [""],
    }
  );

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ""] });
  };

  const removeStep = (index: number) => {
    if (formData.steps.length === 1) return;
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = exerciseId
        ? `/api/admin/content/exercises/${exerciseId}`
        : "/api/admin/content/exercises";
      const method = exerciseId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save exercise");

      router.push("/admin/content/exercises");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {exerciseId ? "Update Exercise" : "Build New Exercise"}
        </h1>
        <Link href="/admin/content/exercises" className="text-slate-500 hover:text-white text-sm">Cancel</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Exercise Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="Self-Affirmation">Self-Affirmation</option>
              <option value="Journaling">Journaling</option>
              <option value="Public Speaking">Public Speaking</option>
              <option value="Body Language">Body Language</option>
              <option value="Exposure Therapy">Exposure Therapy</option>
              <option value="Mindfulness">Mindfulness</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Level</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Purpose & Purpose Statement</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
            rows={2}
            className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Psychological Benefit</label>
          <textarea
            value={formData.psychological_benefit}
            onChange={(e) => setFormData({ ...formData, psychological_benefit: e.target.value })}
            required
            rows={2}
            className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-black text-orange-500 tracking-[0.2em]">Interactive Steps</label>
            <button
              type="button"
              onClick={addStep}
              className="text-[10px] font-black text-orange-500 border border-orange-500/30 px-3 py-1 rounded-full uppercase hover:bg-orange-500/10 transition-all font-mono"
            >
              + Add Step
            </button>
          </div>
          <div className="space-y-3">
            {formData.steps.map((step, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 font-black text-xs flex items-center justify-center mt-1">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  required
                  placeholder={`Actionable step ${index + 1}...`}
                  className="flex-1 bg-slate-800 border-none rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-orange-500/50"
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-slate-500 hover:text-red-400 p-2 transition-colors transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm font-bold uppercase tracking-tight italic">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest disabled:grayscale disabled:scale-100"
        >
          {loading ? "Locking in Data..." : exerciseId ? "Solidify Module" : "Deploy Exercise Content"}
        </button>
      </form>
    </div>
  );
}
