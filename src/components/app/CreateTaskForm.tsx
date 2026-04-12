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
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-4 rounded-xl bg-surface-1 border border-outline"
      style={{ boxShadow: "var(--shadow-1)" }}
    >
      <div className="flex gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-bg border border-outline text-text text-sm focus:outline-none focus:border-primary transition-colors"
          style={{ transitionDuration: "var(--dur-1)" }}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40"
          style={{ transitionDuration: "var(--dur-1)" }}
        >
          {loading ? "..." : "Add"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 flex gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 px-4 py-2 rounded-xl bg-bg border border-outline text-text text-sm focus:outline-none focus:border-primary transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2 rounded-xl bg-bg border border-outline text-text text-sm focus:outline-none focus:border-primary transition-colors"
            style={{ transitionDuration: "var(--dur-1)" }}
          />
        </div>
      )}
    </form>
  );
}
