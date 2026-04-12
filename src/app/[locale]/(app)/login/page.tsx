"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { Logo } from "@/components/marketing/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const result = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      if (result?.error) {
        setError("Login failed. Please try again.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div
          className="bg-surface-1 border border-outline rounded-2xl p-8"
          style={{ boxShadow: "var(--shadow-2)" }}
        >
          <h1 className="text-xl font-bold text-text mb-1">Sign in</h1>
          <p className="text-sm text-text-muted mb-6">
            Use your Taskative account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-outline text-text text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ transitionDuration: "var(--dur-1)" }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-outline text-text text-sm focus:outline-none focus:border-primary transition-colors"
                style={{ transitionDuration: "var(--dur-1)" }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-danger bg-danger-light px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
              style={{ transitionDuration: "var(--dur-1)" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-text-dim mt-6">
          Don&apos;t have an account? Download Taskative on{" "}
          <a
            href="https://play.google.com/store/apps/details?id=com.taskative"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google Play
          </a>
        </p>
      </div>
    </div>
  );
}
