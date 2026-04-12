"use client";

import { useState } from "react";

export function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

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
          dueDate: dueDate || undefined,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setDueDate("");
        setExpanded(false);
        onCreated();
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
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
        <div className="flex gap-3 mt-2 px-1">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details"
            className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-transparent text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-outline transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface-2 border border-transparent text-sm text-text focus:outline-none focus:border-outline transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />
        </div>
      )}
    </form>
  );
}
