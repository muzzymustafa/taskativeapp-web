"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
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
  }, [status, groupId]);

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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors">Tasks</a>
            <a href="/groups" className="text-sm text-text-muted hover:text-text transition-colors">Groups</a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-48 rounded-lg bg-surface-2 animate-pulse" />
            <div className="h-4 w-32 rounded bg-surface-2 animate-pulse" />
            <div className="mt-8 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-surface-2 animate-pulse" />)}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-danger text-base mb-2">{error}</p>
            <a href="/groups" className="text-sm text-primary hover:underline">Back to groups</a>
          </div>
        ) : group ? (
          <>
            {/* Group header */}
            <div className="mb-8">
              <a href="/groups" className="text-sm text-text-muted hover:text-primary transition-colors mb-3 inline-flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Groups
              </a>
              <h1 className="text-xl font-semibold text-text">{group.groupName}</h1>
              <p className="text-sm text-text-muted mt-1">
                {group.members.length} member{group.members.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Members */}
            <div className="mb-8">
              <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">Members</h2>
              <div className="flex flex-wrap gap-2">
                {group.members.map((m) => (
                  <span key={m.id} className="px-3 py-1.5 rounded-lg bg-surface-2 text-sm text-text-2">
                    {m.email}
                  </span>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div>
              <h2 className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">
                Tasks ({group.tasks.length})
              </h2>
              {group.tasks.length === 0 ? (
                <p className="text-sm text-text-dim py-8 text-center">No tasks in this group</p>
              ) : (
                <div className="space-y-1">
                  {group.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-2 transition-colors"
                      style={{ transitionDuration: "var(--dur-1)" }}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                        task.status === "done" ? "bg-primary border-primary" : "border-outline-strong"
                      }`}>
                        {task.status === "done" && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${task.status === "done" ? "line-through text-text-dim" : "text-text"}`}>
                          {task.title}
                        </p>
                        {task.assignedEmails && task.assignedEmails.length > 0 && (
                          <p className="text-xs text-text-dim truncate mt-0.5">
                            {task.assignedEmails.join(", ")}
                          </p>
                        )}
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-text-dim">
                          {new Date(task.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
