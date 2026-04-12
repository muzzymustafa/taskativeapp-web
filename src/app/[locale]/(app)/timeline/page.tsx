"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
import { TaskDetail } from "@/components/app/TaskDetail";
import type { Task } from "@/lib/adapters/types";

type Scale = "week" | "month";

export default function TimelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState<Scale>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tasks").then((r) => (r.ok ? r.json() : [])).then(setTasks).finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  // Determine timeline range
  const rangeDays = scale === "week" ? 7 : 30;
  const startOfRange = new Date(anchor);
  startOfRange.setHours(0, 0, 0, 0);
  if (scale === "week") {
    const dow = startOfRange.getDay() === 0 ? 6 : startOfRange.getDay() - 1;
    startOfRange.setDate(startOfRange.getDate() - dow);
  } else {
    startOfRange.setDate(1);
  }
  const endOfRange = new Date(startOfRange);
  endOfRange.setDate(startOfRange.getDate() + rangeDays);

  // Filter tasks that intersect range
  const visibleTasks = tasks
    .filter((t) => t.status !== "cancelled")
    .filter((t) => {
      const taskStart = t.startDate ? new Date(t.startDate) : t.dueDate ? new Date(t.dueDate) : null;
      const taskEnd = t.dueDate ? new Date(t.dueDate) : taskStart;
      if (!taskStart || !taskEnd) return false;
      return taskEnd >= startOfRange && taskStart <= endOfRange;
    })
    .sort((a, b) => {
      const aDate = a.startDate || a.dueDate || "";
      const bDate = b.startDate || b.dueDate || "";
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

  // Build day headers
  const days: Date[] = [];
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(startOfRange);
    d.setDate(startOfRange.getDate() + i);
    days.push(d);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rangeMs = rangeDays * 24 * 60 * 60 * 1000;

  function taskPosition(t: Task): { left: number; width: number } {
    const tStart = new Date(t.startDate || t.dueDate || today);
    const tEnd = new Date(t.dueDate || t.startDate || today);
    const startOffset = Math.max(0, tStart.getTime() - startOfRange.getTime());
    const endOffset = Math.min(rangeMs, tEnd.getTime() - startOfRange.getTime());
    const left = (startOffset / rangeMs) * 100;
    const width = Math.max(2, ((endOffset - startOffset) / rangeMs) * 100);
    return { left, width };
  }

  function shiftRange(dir: -1 | 1) {
    const d = new Date(anchor);
    if (scale === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setAnchor(d);
  }

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  const rangeLabel = scale === "week"
    ? `${startOfRange.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${new Date(endOfRange.getTime() - 1).toLocaleDateString("en", { month: "short", day: "numeric" })}`
    : anchor.toLocaleDateString("en", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors">Tasks</a>
            <a href="/calendar" className="text-sm text-text-muted hover:text-text transition-colors">Calendar</a>
            <a href="/timeline" className="text-sm font-medium text-primary">Timeline</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors">Groups</a>
            <a href="/reports" className="text-sm text-text-muted hover:text-text transition-colors">Reports</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text">Timeline</h1>
            <p className="text-sm text-text-dim mt-0.5">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 mr-1">
              <a href="/calendar" className="px-3 py-1 rounded text-xs font-medium text-text-muted hover:text-text transition-colors">
                Calendar
              </a>
              <button className="px-3 py-1 rounded text-xs font-medium bg-surface-1 text-primary shadow-sm">
                Timeline
              </button>
            </div>
            {/* Scale toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2">
              <button
                onClick={() => setScale("week")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${scale === "week" ? "bg-surface-1 text-primary shadow-sm" : "text-text-muted"}`}
              >
                Week
              </button>
              <button
                onClick={() => setScale("month")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${scale === "month" ? "bg-surface-1 text-primary shadow-sm" : "text-text-muted"}`}
              >
                Month
              </button>
            </div>
            {/* Nav */}
            <div className="flex items-center gap-1">
              <button onClick={() => shiftRange(-1)} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button onClick={() => setAnchor(new Date())} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
                Today
              </button>
              <button onClick={() => shiftRange(1)} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-96 rounded-2xl bg-surface-2 animate-pulse" />
        ) : (
          <div className="rounded-2xl bg-surface-1 border border-outline overflow-hidden" style={{ boxShadow: "var(--shadow-1)" }}>
            {/* Day headers */}
            <div className="flex border-b border-outline bg-surface-2/50">
              <div className="w-48 shrink-0 px-4 py-2 border-r border-outline">
                <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Task</span>
              </div>
              <div className="flex-1 flex relative">
                {days.map((d, i) => {
                  const isToday = isSameDay(d, today);
                  return (
                    <div
                      key={i}
                      className={`flex-1 min-w-0 border-r border-outline/30 text-center py-2 ${isToday ? "bg-primary/5" : ""}`}
                    >
                      <div className="text-[9px] text-text-dim uppercase">{d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2)}</div>
                      <div className={`text-[11px] font-semibold ${isToday ? "text-primary" : "text-text"}`}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task rows */}
            {visibleTasks.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-text-muted">No tasks in this range</p>
                <p className="text-sm text-text-dim mt-1">Try a different period</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {visibleTasks.map((task) => {
                  const { left, width } = taskPosition(task);
                  const isOverdue = task.status === "pending" && task.dueDate && new Date(task.dueDate) < today;
                  const barColor =
                    task.status === "done"
                      ? "bg-success"
                      : isOverdue
                      ? "bg-danger"
                      : "bg-primary";
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="flex w-full border-b border-outline/30 hover:bg-surface-2/50 transition-colors text-left"
                      style={{ transitionDuration: "var(--dur-1)" }}
                    >
                      {/* Task label */}
                      <div className="w-48 shrink-0 px-4 py-2.5 border-r border-outline flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${
                          task.status === "done" ? "bg-primary" : isOverdue ? "bg-danger" : "bg-warmth"
                        }`} />
                        <span className={`text-xs truncate ${task.status === "done" ? "line-through text-text-dim" : "text-text"}`}>
                          {task.title}
                        </span>
                      </div>
                      {/* Timeline bar area */}
                      <div className="flex-1 relative min-h-[36px] py-2.5">
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-md ${barColor} opacity-90 hover:opacity-100 transition-opacity px-2 flex items-center overflow-hidden`}
                          style={{ left: `${left}%`, width: `${width}%`, minWidth: "20px" }}
                        >
                          <span className="text-[10px] font-medium text-on-primary truncate">
                            {task.title}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-text-dim">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary" /> Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-success" /> Done</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-danger" /> Overdue</span>
        </div>

        {/* Task detail */}
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updated) => {
              setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              setSelectedTask(updated);
            }}
          />
        )}
      </main>
    </div>
  );
}
