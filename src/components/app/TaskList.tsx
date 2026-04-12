"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/adapters/types";
import { TaskDetail } from "./TaskDetail";

const statusConfig: Record<string, { border: string; badge: string; badgeText: string; label: string }> = {
  pending: { border: "border-l-warmth", badge: "bg-warmth-soft text-warmth-deep", badgeText: "Pending", label: "Pending" },
  done: { border: "border-l-success", badge: "bg-success-light text-success", badgeText: "Done", label: "Done" },
  cancelled: { border: "border-l-outline", badge: "bg-surface-3 text-text-dim", badgeText: "Cancelled", label: "Cancelled" },
  late: { border: "border-l-danger", badge: "bg-danger-light text-danger", badgeText: "Overdue", label: "Overdue" },
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done" | "cancelled">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "dueDate">("newest");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setTasks(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }

  async function toggleDone(e: React.MouseEvent, task: Task) {
    e.stopPropagation();
    const newStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function updateTaskInList(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  // Determine effective status (overdue check)
  function effectiveStatus(task: Task): string {
    if (task.status === "pending" && task.dueDate && new Date(task.dueDate) < new Date()) return "late";
    return task.status;
  }

  const filtered = tasks.filter((t) => {
    // Status filter
    if (filter === "pending" && t.status !== "pending" && t.status !== "late") return false;
    if (filter === "done" && t.status !== "done") return false;
    if (filter === "cancelled" && t.status !== "cancelled") return false;
    if (filter === "all" && t.status === "cancelled") return false;
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "dueDate") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "late").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const cancelledCount = tasks.filter((t) => t.status === "cancelled").length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-surface-2 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Search + Sort */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-1 border border-outline mb-4" style={{ boxShadow: "var(--shadow-1)" }}>
        <svg className="w-4 h-4 text-text-dim shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-text-dim hover:text-text">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="w-px h-5 bg-outline shrink-0" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="bg-transparent text-xs text-text-dim font-medium focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="dueDate">Due date</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5">
        {([
          { key: "all" as const, label: "All", count: tasks.filter((t) => t.status !== "cancelled").length },
          { key: "pending" as const, label: "Active", count: pendingCount },
          { key: "done" as const, label: "Done", count: doneCount },
          ...(cancelledCount > 0 ? [{ key: "cancelled" as const, label: "Cancelled", count: cancelledCount }] : []),
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

      {/* Empty state */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((task) => {
            const es = effectiveStatus(task);
            const cfg = statusConfig[es] || statusConfig.pending;
            const checkDone = task.checklist?.filter((c) => c.done).length || 0;
            const checkTotal = task.checklist?.length || 0;

            return (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`relative text-left p-4 rounded-2xl bg-surface-1 border border-outline border-l-[3px] ${cfg.border} hover:border-outline-strong hover:shadow-md transition-all group`}
                style={{ boxShadow: "var(--shadow-1)", transitionDuration: "var(--dur-2)", transitionTimingFunction: "var(--ease)" }}
              >
                {/* Top row: checkbox + title + badge */}
                <div className="flex items-start gap-3 mb-2">
                  <div
                    onClick={(e) => toggleDone(e, task)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                      task.status === "done" ? "bg-primary border-primary" : "border-outline-strong hover:border-primary"
                    }`}
                  >
                    {task.status === "done" && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <p className={`flex-1 text-sm font-medium leading-snug line-clamp-2 ${
                    task.status === "done" ? "line-through text-text-dim" : "text-text"
                  }`}>
                    {task.title}
                  </p>
                </div>

                {/* Description preview */}
                {task.description && (
                  <p className="text-xs text-text-dim line-clamp-1 mb-2 pl-8">
                    {task.description}
                  </p>
                )}

                {/* Checklist progress */}
                {checkTotal > 0 && (
                  <div className="pl-8 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(checkDone / checkTotal) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-text-dim font-medium">{checkDone}/{checkTotal}</span>
                    </div>
                  </div>
                )}

                {/* Bottom row: meta chips */}
                <div className="flex items-center gap-2 pl-8 flex-wrap">
                  {/* Due date chip */}
                  {task.dueDate && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                      es === "late" ? "bg-danger-light text-danger" : "bg-surface-2 text-text-dim"
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  {/* Reminder chip — only show future reminders */}
                  {task.reminderEnabled && task.reminderTime && new Date(task.reminderTime) > new Date() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-[11px] text-text-dim font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                      {new Date(task.reminderTime).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}

                  {/* Group chip */}
                  {task.taskType !== "personal" && task.groupId && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/8 text-[11px] text-primary font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772" />
                      </svg>
                      Group
                    </span>
                  )}

                  {/* Status badge — right aligned */}
                  <span className={`ml-auto px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.badge}`}>
                    {cfg.badgeText}
                  </span>
                </div>
              </button>
            );
          })}
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
  if (days < 0 && days > -7) return `${-days}d ago`;

  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}
