"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
import type { Task } from "@/lib/adapters/types";

interface WeekData {
  label: string;
  completed: number;
  created: number;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tasks")
        .then((r) => (r.ok ? r.json() : []))
        .then(setTasks)
        .finally(() => setLoading(false));
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

  const now = new Date();
  const thisMonth = tasks.filter((t) => {
    const d = new Date(t.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const completedThisMonth = thisMonth.filter((t) => t.status === "done").length;
  const pendingAll = tasks.filter((t) => t.status === "pending").length;
  const overdueAll = tasks.filter((t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) < now).length;
  const completionRate = thisMonth.length > 0 ? Math.round((completedThisMonth / thisMonth.length) * 100) : 0;

  // Weekly data (last 4 weeks)
  const weeks: WeekData[] = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const label = weekStart.toLocaleDateString("en", { month: "short", day: "numeric" });
    const completed = tasks.filter((t) => {
      if (t.status !== "done" || !t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      return d >= weekStart && d < weekEnd;
    }).length;
    const created = tasks.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= weekStart && d < weekEnd;
    }).length;

    weeks.push({ label, completed, created });
  }

  const maxBar = Math.max(...weeks.map((w) => Math.max(w.completed, w.created)), 1);

  // Streak — consecutive days with at least 1 completed task
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dayEnd = new Date(day);
    dayEnd.setDate(day.getDate() + 1);
    const hasCompleted = tasks.some((t) => {
      if (t.status !== "done" || !t.updatedAt) return false;
      const d = new Date(t.updatedAt);
      return d >= day && d < dayEnd;
    });
    if (hasCompleted) streak++;
    else if (i > 0) break; // allow today to be incomplete
  }

  // Most productive day
  const dayCounts: Record<string, number> = {};
  tasks.filter((t) => t.status === "done" && t.updatedAt).forEach((t) => {
    const day = new Date(t.updatedAt!).toLocaleDateString("en", { weekday: "long" });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors">Tasks</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors">Groups</a>
            <a href="/reports" className="text-sm font-medium text-primary">Reports</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-text mb-6">Reports</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-2 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-primary tracking-tight">{completedThisMonth}</p>
                <p className="text-xs text-text-dim mt-0.5">Completed this month</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-warmth tracking-tight">{completionRate}%</p>
                <p className="text-xs text-text-dim mt-0.5">Completion rate</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-success tracking-tight">{streak}</p>
                <p className="text-xs text-text-dim mt-0.5">Day streak</p>
              </div>
              <div className={`p-4 rounded-2xl border ${overdueAll > 0 ? "bg-danger-light border-danger/20" : "bg-surface-1 border-outline"}`} style={{ boxShadow: "var(--shadow-1)" }}>
                <p className={`text-2xl font-bold tracking-tight ${overdueAll > 0 ? "text-danger" : "text-text-dim"}`}>{overdueAll}</p>
                <p className={`text-xs mt-0.5 ${overdueAll > 0 ? "text-danger/70" : "text-text-dim"}`}>Overdue</p>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-outline mb-8" style={{ boxShadow: "var(--shadow-1)" }}>
              <h2 className="text-sm font-semibold text-text mb-4">Last 4 Weeks</h2>
              <div className="flex items-end gap-4 h-40">
                {weeks.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 items-end h-28">
                      {/* Created bar */}
                      <div className="flex-1 flex flex-col justify-end">
                        <div
                          className="w-full bg-outline rounded-t-md transition-all"
                          style={{ height: `${(w.created / maxBar) * 100}%`, minHeight: w.created > 0 ? "4px" : "0" }}
                        />
                      </div>
                      {/* Completed bar */}
                      <div className="flex-1 flex flex-col justify-end">
                        <div
                          className="w-full bg-primary rounded-t-md transition-all"
                          style={{ height: `${(w.completed / maxBar) * 100}%`, minHeight: w.completed > 0 ? "4px" : "0" }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-text-dim mt-1">{w.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-text-dim">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-outline" /> Created</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary" /> Completed</span>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-5 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-warmth" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Most Productive Day</h3>
                </div>
                <p className="text-lg font-bold text-warmth">{topDay ? topDay[0] : "—"}</p>
                <p className="text-xs text-text-dim">{topDay ? `${topDay[1]} tasks completed` : "No data yet"}</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                  <h3 className="text-sm font-semibold text-text">Total Overview</h3>
                </div>
                <p className="text-lg font-bold text-primary">{tasks.length}</p>
                <p className="text-xs text-text-dim">
                  {tasks.filter((t) => t.status === "done").length} done · {pendingAll} active · {tasks.filter((t) => t.status === "cancelled").length} cancelled
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
