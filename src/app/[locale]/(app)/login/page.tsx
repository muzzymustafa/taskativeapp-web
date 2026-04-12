"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { Logo } from "@/components/marketing/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
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
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(clientAuth, provider);
      const idToken = await result.user.getIdToken();

      const res = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      if (res?.error) {
        setError("Google login failed.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // user closed popup, ignore
      } else {
        setError(err.message || "Google sign-in failed.");
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

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full border border-outline bg-surface-1 text-text text-sm font-medium hover:bg-surface-2 transition-colors disabled:opacity-50 mb-6"
            style={{ transitionDuration: "var(--dur-1)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-outline" />
            <span className="text-xs text-text-dim">or</span>
            <div className="flex-1 h-px bg-outline" />
          </div>

          {/* Email/Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
