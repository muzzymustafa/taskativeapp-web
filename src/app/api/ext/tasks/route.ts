import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { taskRepo } from "@/lib/adapters/firebase";
import { checkRateLimit } from "@/lib/rate-limit";

// NOTE: We intentionally do NOT set Access-Control-Allow-Origin here.
// Chrome/Firefox extensions with host_permissions declared in manifest.json
// bypass CORS by design — their fetch() calls don't require CORS headers
// (the browser recognises the extension origin as privileged).
//
// Not setting CORS also prevents arbitrary web pages from calling this
// endpoint cross-origin. If a website attempts to fetch it, the browser
// will reject the response (no Access-Control-Allow-Origin).

// POST /api/ext/tasks
// Headers: Authorization: Bearer <Firebase ID token>
// Body: { title, description?, dueDate?, groupId? }
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Rate limit: 60 requests per minute per user
    const rl = checkRateLimit(`ext:${decoded.uid}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 5000) {
      return NextResponse.json({ error: "Description too long" }, { status: 400 });
    }

    try {
      const task = await taskRepo.createTask(
        decoded.uid,
        {
          title: title.trim().substring(0, 500),
          description: description?.trim().substring(0, 5000) || "",
          dueDate: null,
          groupId: null,
        },
        decoded.email || ""
      );
      return NextResponse.json({ success: true, taskId: task.id }, { status: 201 });
    } catch (err: any) {
      if (err.code === "QUOTA_EXCEEDED") {
        return NextResponse.json(
          { error: "Monthly task limit reached", used: err.used, limit: err.limit },
          { status: 429 }
        );
      }
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
