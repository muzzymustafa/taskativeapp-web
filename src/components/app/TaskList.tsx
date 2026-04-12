"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/adapters/types";
import { TaskDetail } from "./TaskDetail";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function toggleDone(e: React.MouseEvent, task: Task) {
    e.stopPropagation();
    const newStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function updateTaskInList(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending" || t.status === "late";
    if (filter === "done") return t.status === "done";
    return t.status !== "cancelled";
  });

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "late").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Filter chips — Google style */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "all" as const, label: "All", count: tasks.filter((t) => t.status !== "cancelled").length },
          { key: "pending" as const, label: "Pending", count: pendingCount },
          { key: "done" as const, label: "Done", count: doneCount },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-text-muted hover:bg-surface-2 border border-transparent"
            }`}
            style={{ transitionDuration: "var(--dur-1)" }}
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-dim" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-muted text-base mb-1">No tasks here</p>
          <p className="text-text-dim text-sm">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-2 transition-colors text-left group"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              {/* Checkbox */}
              <div
                onClick={(e) => toggleDone(e, task)}
                className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  task.status === "done"
                    ? "bg-primary border-primary"
                    : "border-outline-strong hover:border-primary"
                }`}
              >
                {task.status === "done" && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-5 truncate ${
                  task.status === "done" ? "line-through text-text-dim" : "text-text"
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.description && (
                    <span className="text-xs text-text-dim truncate max-w-[200px]">{task.description}</span>
                  )}
                  {task.checklist && task.checklist.length > 0 && (
                    <span className="text-xs text-text-dim flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Right side — date + indicators */}
              <div className="flex items-center gap-2 shrink-0">
                {task.reminderEnabled && (
                  <svg className="w-3.5 h-3.5 text-text-dim" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                )}
                {task.dueDate && (
                  <span className={`text-xs ${
                    task.status !== "done" && new Date(task.dueDate) < new Date()
                      ? "text-danger font-medium"
                      : "text-text-dim"
                  }`}>
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTaskInList}
        />
      )}
    </>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days < 7) return d.toLocaleDateString("en", { weekday: "short" });

  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}
