"use client";

import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function UserMenu({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <span className="text-sm text-text-muted hidden sm:block">{email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-2 text-text-muted hover:text-text hover:bg-surface-3 transition-colors"
        style={{ transitionDuration: "var(--dur-1)" }}
      >
        Sign out
      </button>
    </div>
  );
}
