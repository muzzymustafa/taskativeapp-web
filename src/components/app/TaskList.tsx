"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/adapters/types";

const statusColors: Record<string, string> = {
  pending: "bg-warmth-soft text-warmth-deep",
  done: "bg-success-light text-success",
  cancelled: "bg-surface-3 text-text-dim",
  late: "bg-danger-light text-danger",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  done: "Done",
  cancelled: "Cancelled",
  late: "Late",
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(task: Task) {
    const newStatus = task.status === "done" ? "pending" : "done";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
  }

  async function cancelTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "cancelled" as const } : t))
    );
  }

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending" || t.status === "late";
    if (filter === "done") return t.status === "done";
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-surface-2 text-text-muted hover:text-text"
            }`}
            style={{ transitionDuration: "var(--dur-1)" }}
          >
            {f === "all" ? "All" : f === "pending" ? "Pending" : "Done"}
            {f === "all" && ` (${tasks.length})`}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg mb-2">No tasks yet</p>
          <p className="text-text-dim text-sm">Create one above to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-surface-1 border border-outline hover:border-primary/30 transition-all group"
              style={{ boxShadow: "var(--shadow-1)", transitionDuration: "var(--dur-2)" }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task)}
                disabled={task.status === "cancelled"}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  task.status === "done"
                    ? "bg-success border-success"
                    : task.status === "cancelled"
                    ? "bg-surface-3 border-outline cursor-not-allowed"
                    : "border-outline hover:border-primary"
                }`}
              >
                {task.status === "done" && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.status === "done" ? "line-through text-text-dim" : "text-text"
                }`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-text-dim truncate mt-0.5">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Due date */}
              {task.dueDate && (
                <span className="text-xs text-text-dim hidden sm:block">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}

              {/* Status badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status] || ""}`}>
                {statusLabels[task.status] || task.status}
              </span>

              {/* Cancel button */}
              {task.status === "pending" && (
                <button
                  onClick={() => cancelTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-all"
                  style={{ transitionDuration: "var(--dur-1)" }}
                  title="Cancel task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
