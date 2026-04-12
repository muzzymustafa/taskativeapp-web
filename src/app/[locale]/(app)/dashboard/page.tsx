"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { TaskList } from "@/components/app/TaskList";
import { CreateTaskForm } from "@/components/app/CreateTaskForm";
import { UserMenu } from "@/components/app/UserMenu";
import type { UserProfile, Task } from "@/lib/adapters/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<{ pending: number; done: number; overdue: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user").then((r) => r.ok ? r.json() : null).then(setProfile);
      fetch("/api/tasks").then((r) => r.ok ? r.json() : []).then((tasks: Task[]) => {
        const now = new Date();
        setStats({
          pending: tasks.filter((t) => t.status === "pending").length,
          done: tasks.filter((t) => t.status === "done").length,
          overdue: tasks.filter((t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) < now).length,
        });
      });
    }
  }, [status, refreshKey]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!session) return null;

  const greeting = getGreeting();
  const planLabel = profile?.membershipLevel === "lifetime" ? "Lifetime Pro" : profile?.membershipLevel || "";

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm font-medium text-primary">Tasks</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors" style={{ transitionDuration: "var(--dur-1)" }}>Groups</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text">{greeting}</h1>
          {profile && (
            <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
              <span>{profile.usedTasksThisMonth} tasks this month</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                planLabel.includes("Lifetime") || planLabel === "pro"
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-2 text-text-dim"
              }`}>
                {planLabel}
              </span>
            </div>
          )}
        </div>

        {/* Stats row — 3 cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
              <p className="text-2xl font-bold text-primary tracking-tight">{stats.pending}</p>
              <p className="text-xs text-text-dim mt-0.5 font-medium">Active</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
              <p className="text-2xl font-bold text-success tracking-tight">{stats.done}</p>
              <p className="text-xs text-text-dim mt-0.5 font-medium">Completed</p>
            </div>
            <div className={`p-4 rounded-2xl border ${stats.overdue > 0 ? "bg-danger-light border-danger/20" : "bg-surface-1 border-outline"}`} style={{ boxShadow: "var(--shadow-1)" }}>
              <p className={`text-2xl font-bold tracking-tight ${stats.overdue > 0 ? "text-danger" : "text-text-dim"}`}>{stats.overdue}</p>
              <p className={`text-xs mt-0.5 font-medium ${stats.overdue > 0 ? "text-danger/70" : "text-text-dim"}`}>Overdue</p>
            </div>
          </div>
        )}

        {/* Create task */}
        <CreateTaskForm onCreated={() => setRefreshKey((k) => k + 1)} />

        {/* Task list */}
        <TaskList key={refreshKey} />
      </main>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
