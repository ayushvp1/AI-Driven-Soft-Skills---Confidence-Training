"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChallengeFormData {
  title: string;
  category: string;
  objective: string;
  instructions: string;
  expected_outcome: string;
  difficulty: string;
}

export default function ChallengeForm({
  initialData,
  challengeId,
}: {
  initialData?: ChallengeFormData;
  challengeId?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ChallengeFormData>(
    initialData || {
      title: "",
      category: "Communication",
      objective: "",
      instructions: "",
      expected_outcome: "",
      difficulty: "Beginner",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = challengeId
        ? `/api/admin/content/challenges/${challengeId}`
        : "/api/admin/content/challenges";
      const method = challengeId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save challenge");
      
      router.push("/admin/content/challenges");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {challengeId ? "Edit Challenge" : "Add New Challenge"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Carefully edit the training parameters for AI assessment.
          </p>
        </div>
        <Link
          href="/admin/content/challenges"
          className="text-slate-400 hover:text-white text-sm font-medium flex items-center gap-1"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="Communication">Communication</option>
              <option value="Leadership">Leadership</option>
              <option value="Time Management">Time Management</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Objective
          </label>
          <input
            type="text"
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            required
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            required
            rows={4}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Expected Outcome
          </label>
          <textarea
            value={formData.expected_outcome}
            onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
            required
            rows={3}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
          />
        </div>

        {error && <p className="text-red-400 text-sm italic">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
        >
          {loading ? "Saving Progress..." : challengeId ? "Update Challenge" : "Create Challenge"}
        </button>
      </form>
    </div>
  );
}
