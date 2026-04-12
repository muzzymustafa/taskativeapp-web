"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { TaskList } from "@/components/app/TaskList";
import { CreateTaskForm } from "@/components/app/CreateTaskForm";
import { UserMenu } from "@/components/app/UserMenu";
import type { UserProfile } from "@/lib/adapters/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user").then((r) => r.ok ? r.json() : null).then(setProfile);
    }
  }, [status]);

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

  return (
    <div className="min-h-screen bg-bg">
      {/* Header — Google-style minimal */}
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-sm font-medium text-primary"
            >
              Tasks
            </a>
            <a
              href="/groups"
              className="text-sm text-text-muted hover:text-text transition-colors"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              Groups
            </a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      {/* Main content — narrow, focused */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Greeting + stats */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-text mb-1">
            {greeting}
          </h1>
          {profile && (
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span>
                {profile.usedTasksThisMonth} / {profile.taskLimitPerMonth === 999999 ? "∞" : profile.taskLimitPerMonth} tasks this month
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-surface-2 font-medium capitalize">
                {profile.membershipLevel}
              </span>
            </div>
          )}
        </div>

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
