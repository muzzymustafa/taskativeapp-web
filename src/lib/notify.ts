const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export type SecurityEvent =
  | "rate_limited"
  | "banned"
  | "global_cap_hit"
  | "daily_cap_hit"
  | "quota_exceeded";

const throttleMs = 5 * 60 * 1000;
const lastSentAt = new Map<string, number>();

export async function notifySecurity(
  event: SecurityEvent,
  ctx: { uid?: string; reason?: string; extras?: Record<string, unknown> } = {}
): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const key = `${event}:${ctx.uid ?? "anon"}`;
  const now = Date.now();
  const last = lastSentAt.get(key);
  if (last && now - last < throttleMs) return;
  lastSentAt.set(key, now);

  const lines = [
    `🚨 Taskative · ${event.toUpperCase()}`,
    ctx.uid ? `uid: \`${ctx.uid}\`` : null,
    ctx.reason ? `reason: ${ctx.reason}` : null,
    ctx.extras ? `extras: \`${JSON.stringify(ctx.extras)}\`` : null,
    `ts: ${new Date(now).toISOString()}`,
  ].filter(Boolean);

  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: lines.join("\n"),
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Notification failure must never break the main flow
  }
}
