// Simple in-memory sliding window rate limiter
// For per-user API protection. Good enough for Vercel serverless
// (each warm function instance has its own map, but attackers hit the same uid).
// For distributed rate limiting across regions, use Vercel KV or Upstash.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_PER_WINDOW = 60; // 60 requests per minute per user

// Opportunistic cleanup: on every check, remove expired buckets
function cleanup(now: number) {
  if (buckets.size < 1000) return; // only when map grows
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

/**
 * Check if the user is within rate limit.
 * @returns { allowed: true } or { allowed: false, retryAfterSec: number }
 */
export function checkRateLimit(key: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const now = Date.now();
  cleanup(now);

  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (b.count >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }

  b.count++;
  return { allowed: true };
}
