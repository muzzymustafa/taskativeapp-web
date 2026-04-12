"use client";

import { useState } from "react";

export function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  function buildISO(date: string, time: string): string | null {
    if (!date) return null;
    const t = time || "23:59";
    return new Date(`${date}T${t}:00`).toISOString();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: buildISO(startDate, startTime),
          dueDate: buildISO(endDate, endTime),
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setExpanded(false);
        onCreated();
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline bg-surface-1 focus-within:border-primary transition-colors" style={{ transitionDuration: "var(--dur-1)" }}>
        <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task"
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
        />
        {title.trim() && (
          <button
            type="submit"
            disabled={loading}
            className="text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-40 transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          >
            {loading ? "..." : "Save"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 px-1">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-transparent text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-outline transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-text-dim uppercase tracking-wider mb-1">Start</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-2 border border-transparent text-xs text-text focus:outline-none focus:border-outline transition-colors"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-2 py-2 rounded-lg bg-surface-2 border border-transparent text-xs text-text focus:outline-none focus:border-outline transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-text-dim uppercase tracking-wider mb-1">Due</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-surface-2 border border-transparent text-xs text-text focus:outline-none focus:border-outline transition-colors"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-2 py-2 rounded-lg bg-surface-2 border border-transparent text-xs text-text focus:outline-none focus:border-outline transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
