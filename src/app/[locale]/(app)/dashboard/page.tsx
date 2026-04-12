"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { TaskList } from "@/components/app/TaskList";
import { CreateTaskForm } from "@/components/app/CreateTaskForm";
import { UserMenu } from "@/components/app/UserMenu";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-16">
          <Logo />
          <UserMenu email={session.user?.email || ""} />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-1">My Tasks</h1>
          <p className="text-sm text-text-muted">
            Manage your tasks from the web
          </p>
        </div>

        <CreateTaskForm onCreated={() => setRefreshKey((k) => k + 1)} />
        <TaskList key={refreshKey} />
      </main>
    </div>
  );
}
