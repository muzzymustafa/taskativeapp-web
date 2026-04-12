"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
import { TaskDetail } from "@/components/app/TaskDetail";
import type { Task, GroupMember } from "@/lib/adapters/types";

interface GroupDetail {
  id: string;
  groupName: string;
  memberIds: string[];
  members: GroupMember[];
  tasks: Task[];
  createdAt: string;
}

export default function GroupDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [newTask, setNewTask] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  function fetchGroup() {
    if (status === "authenticated" && groupId) {
      fetch(`/api/groups/${groupId}`)
        .then(async (r) => {
          if (r.ok) return r.json();
          throw new Error((await r.json()).error || "Failed to load group");
        })
        .then(setGroup)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }

  useEffect(() => { fetchGroup(); }, [status, groupId]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim(), groupId }),
      });
      setNewTask("");
      fetchGroup();
    } catch { /* */ }
    setCreating(false);
  }

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

  const tasks = group?.tasks || [];
  const now = new Date();
  const pending = tasks.filter((t) => t.status === "pending");
  const done = tasks.filter((t) => t.status === "done");
  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < now);
  const completionRate = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "done") return t.status === "done";
    return t.status !== "cancelled";
  });

  const colors = ["bg-primary", "bg-warmth", "bg-success", "bg-info", "bg-danger"];
  const colorIdx = group ? group.groupName.charCodeAt(0) % colors.length : 0;

  // Member workload distribution
  const memberStats = group ? group.members.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignedEmails?.includes(m.email) && t.status !== "cancelled");
    const memberDone = memberTasks.filter((t) => t.status === "done").length;
    return { email: m.email, total: memberTasks.length, done: memberDone };
  }).sort((a, b) => b.total - a.total) : [];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors">Tasks</a>
            <a href="/calendar" className="text-sm text-text-muted hover:text-text transition-colors">Calendar</a>
            <a href="/timeline" className="text-sm text-text-muted hover:text-text transition-colors">Timeline</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors">Groups</a>
            <a href="/reports" className="text-sm text-text-muted hover:text-text transition-colors">Reports</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            <div className="h-20 rounded-2xl bg-surface-2 animate-pulse" />
            <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-20 rounded-2xl bg-surface-2 animate-pulse" />)}</div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-danger text-base mb-2">{error}</p>
            <a href="/groups" className="text-sm text-primary hover:underline">Back to groups</a>
          </div>
        ) : group ? (
          <>
            {/* Group hero */}
            <div className="p-6 rounded-2xl bg-surface-1 border border-outline mb-6" style={{ boxShadow: "var(--shadow-1)" }}>
              <div className="flex items-center gap-4 mb-4">
                <a href="/groups" className="p-1.5 rounded-lg hover:bg-surface-2 text-text-dim hover:text-text transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </a>
                <div className={`w-12 h-12 rounded-xl ${colors[colorIdx]} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{group.groupName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text">{group.groupName}</h1>
                  <p className="text-sm text-text-muted">
                    Created {new Date(group.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-2 flex-wrap">
                {group.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary text-[10px] font-bold">{m.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-text-2">{m.email}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-text tracking-tight">{tasks.filter(t=>t.status!=='cancelled').length}</p>
                <p className="text-xs text-text-dim mt-0.5">Total</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-primary tracking-tight">{pending.length}</p>
                <p className="text-xs text-text-dim mt-0.5">Active</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
                <p className="text-2xl font-bold text-success tracking-tight">{completionRate}%</p>
                <p className="text-xs text-text-dim mt-0.5">Completed</p>
              </div>
              <div className={`p-4 rounded-2xl border ${overdue.length > 0 ? "bg-danger-light border-danger/20" : "bg-surface-1 border-outline"}`} style={{ boxShadow: "var(--shadow-1)" }}>
                <p className={`text-2xl font-bold tracking-tight ${overdue.length > 0 ? "text-danger" : "text-text-dim"}`}>{overdue.length}</p>
                <p className={`text-xs mt-0.5 ${overdue.length > 0 ? "text-danger/70" : "text-text-dim"}`}>Overdue</p>
              </div>
            </div>

            {/* Member workload */}
            {memberStats.length > 0 && memberStats.some((m) => m.total > 0) && (
              <div className="p-5 rounded-2xl bg-surface-1 border border-outline mb-6" style={{ boxShadow: "var(--shadow-1)" }}>
                <h2 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-4">Workload Distribution</h2>
                <div className="space-y-3">
                  {memberStats.map((m) => {
                    const progress = m.total > 0 ? (m.done / m.total) * 100 : 0;
                    return (
                      <div key={m.email}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                              <span className="text-primary text-[10px] font-bold">{m.email.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm text-text truncate">{m.email.split("@")[0]}</span>
                          </div>
                          <span className="text-xs text-text-dim shrink-0 ml-2">
                            {m.done}/{m.total} done
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%`, transitionDuration: "var(--dur-2)" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create task in group */}
            <form onSubmit={handleCreateTask} className="mb-6">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-outline bg-surface-1 focus-within:border-primary transition-colors" style={{ transitionDuration: "var(--dur-1)" }}>
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder={`Add a task to ${group.groupName}...`}
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-text-dim focus:outline-none"
                />
                {newTask.trim() && (
                  <button
                    type="submit"
                    disabled={creating}
                    className="text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-40 transition-colors"
                  >
                    {creating ? "..." : "Add"}
                  </button>
                )}
              </div>
            </form>

            {/* Filter chips */}
            <div className="flex gap-2 mb-4">
              {([
                { key: "all" as const, label: "All", count: tasks.filter(t=>t.status!=='cancelled').length },
                { key: "pending" as const, label: "Active", count: pending.length },
                { key: "done" as const, label: "Done", count: done.length },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.key ? "bg-primary/10 text-primary border border-primary/30" : "text-text-muted hover:bg-surface-2 border border-transparent"
                  }`}
                >
                  {f.label} <span className="ml-1 text-xs opacity-70">{f.count}</span>
                </button>
              ))}
            </div>

            {/* Tasks */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-text-muted">No tasks here</p>
                <p className="text-sm text-text-dim mt-1">Add one above to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((task) => {
                  const isOverdue = task.status === "pending" && task.dueDate && new Date(task.dueDate) < now;
                  const borderColor = task.status === "done" ? "border-l-success" : isOverdue ? "border-l-danger" : "border-l-warmth";
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className={`text-left p-4 rounded-2xl bg-surface-1 border border-outline border-l-[3px] ${borderColor} hover:border-outline-strong hover:shadow-md transition-all`}
                      style={{ boxShadow: "var(--shadow-1)", transitionDuration: "var(--dur-2)" }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          task.status === "done" ? "bg-primary border-primary" : "border-outline-strong"
                        }`}>
                          {task.status === "done" && (
                            <svg className="w-3 h-3 text-on-primary" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <p className={`flex-1 text-sm font-medium line-clamp-2 ${task.status === "done" ? "line-through text-text-dim" : "text-text"}`}>
                          {task.title}
                        </p>
                      </div>
                      {task.description && (
                        <p className="text-xs text-text-dim line-clamp-1 pl-8 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 pl-8 flex-wrap">
                        {task.assignedEmails && task.assignedEmails.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-2 text-[11px] text-text-dim">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                            </svg>
                            {task.assignedEmails[0].split("@")[0]}
                            {task.assignedEmails.length > 1 && ` +${task.assignedEmails.length - 1}`}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${isOverdue ? "bg-danger-light text-danger" : "bg-surface-2 text-text-dim"}`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </span>
                        )}
                        <span className={`ml-auto px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          task.status === "done" ? "bg-success-light text-success" : isOverdue ? "bg-danger-light text-danger" : "bg-warmth-soft text-warmth-deep"
                        }`}>
                          {task.status === "done" ? "Done" : isOverdue ? "Overdue" : "Pending"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        {/* Task detail modal */}
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updated) => {
              setGroup((prev) => prev ? { ...prev, tasks: prev.tasks.map((t) => t.id === updated.id ? updated : t) } : prev);
              setSelectedTask(updated);
            }}
          />
        )}
      </main>
    </div>
  );
}
