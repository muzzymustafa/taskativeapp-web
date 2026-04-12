"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/marketing/Logo";
import { UserMenu } from "@/components/app/UserMenu";
import type { Group } from "@/lib/adapters/types";

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/groups")
        .then((r) => (r.ok ? r.json() : []))
        .then(setGroups)
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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 bg-surface-1/85 backdrop-blur-xl backdrop-saturate-150 border-b border-outline">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 h-14">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-text-muted hover:text-text transition-colors" style={{ transitionDuration: "var(--dur-1)" }}>
              Tasks
            </a>
            <a href="/groups" className="text-sm font-medium text-primary">
              Groups
            </a>
            <div className="w-px h-5 bg-outline mx-1" />
            <UserMenu email={session.user?.email || ""} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-text mb-6">Groups</h1>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-dim" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-text-muted text-base mb-1">No groups yet</p>
            <p className="text-text-dim text-sm">Create a group from the mobile app to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <a
                key={group.id}
                href={`/groups/${group.id}`}
                className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-2 transition-colors group"
                style={{ transitionDuration: "var(--dur-1)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {group.groupName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">{group.groupName}</p>
                  <p className="text-xs text-text-dim">
                    {group.memberIds.length} member{group.memberIds.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <svg className="w-4 h-4 text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
