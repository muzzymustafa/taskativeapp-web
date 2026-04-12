"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
import type { Task } from "@/lib/adapters/types";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday-first
  const daysInMonth = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
  while (cells.length % 7 !== 0) cells.push(null);

  function tasksForDay(day: Date) {
    return tasks.filter((t) => {
      if (t.status === "cancelled" || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
    });
  }

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }
  function goToday() { setCurrentDate(new Date()); }

  const selectedTasks = selectedDay ? tasksForDay(selectedDay) : [];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors">Tasks</a>
            <a href="/calendar" className="text-sm font-medium text-primary">Calendar</a>
            <a href="/timeline" className="text-sm text-text-muted hover:text-text transition-colors">Timeline</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors">Groups</a>
            <a href="/reports" className="text-sm text-text-muted hover:text-text transition-colors">Reports</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Month nav + view toggle */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-text">{monthName}</h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-2 mr-2">
              <button className="px-3 py-1 rounded text-xs font-medium bg-surface-1 text-primary shadow-sm">
                Calendar
              </button>
              <a href="/timeline" className="px-3 py-1 rounded text-xs font-medium text-text-muted hover:text-text transition-colors">
                Timeline
              </a>
            </div>
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-96 rounded-2xl bg-surface-2 animate-pulse" />
        ) : (
          <div className="rounded-2xl bg-surface-1 border border-outline overflow-hidden" style={{ boxShadow: "var(--shadow-1)" }}>
            {/* Day labels */}
            <div className="grid grid-cols-7 border-b border-outline bg-surface-2/50">
              {dayLabels.map((d) => (
                <div key={d} className="px-3 py-2 text-center text-[10px] font-semibold text-text-dim uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[90px] border-b border-r border-outline/30 bg-surface-2/30" />;
                const dayTasks = tasksForDay(day);
                const isToday = isSameDay(day, today);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const overdue = dayTasks.some((t) => t.status === "pending" && day < today && !isToday);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[90px] border-b border-r border-outline/30 p-2 text-left transition-colors hover:bg-surface-2 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        isToday ? "w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]" : "text-text"
                      }`}>
                        {day.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className={`text-[10px] font-medium ${overdue ? "text-danger" : "text-text-dim"}`}>
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                            t.status === "done"
                              ? "bg-success-light text-success line-through"
                              : t.status === "pending" && day < today && !isToday
                              ? "bg-danger-light text-danger"
                              : "bg-warmth-soft text-warmth-deep"
                          }`}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[10px] text-text-dim">+{dayTasks.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected day tasks */}
        {selectedDay && selectedTasks.length > 0 && (
          <div className="mt-6 p-5 rounded-2xl bg-surface-1 border border-outline" style={{ boxShadow: "var(--shadow-1)" }}>
            <h2 className="text-sm font-semibold text-text mb-4">
              {selectedDay.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              <span className="ml-2 text-xs text-text-dim font-normal">({selectedTasks.length} tasks)</span>
            </h2>
            <div className="space-y-2">
              {selectedTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-outline/50">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    t.status === "done" ? "bg-primary border-primary" : "border-outline-strong"
                  }`}>
                    {t.status === "done" && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${t.status === "done" ? "line-through text-text-dim" : "text-text"}`}>
                    {t.title}
                  </span>
                  {t.dueDate && (
                    <span className="text-[10px] text-text-dim">
                      {new Date(t.dueDate).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
