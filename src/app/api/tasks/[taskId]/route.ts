import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { taskRepo } from "@/lib/adapters/firebase";

const ALLOWED_UPDATE_FIELDS = ["title", "description", "status", "dueDate", "startDate"];
const ALLOWED_STATUSES = ["pending", "done", "cancelled"];

function errorResponse(err: any) {
  if (err.code === "RATE_LIMITED") {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: err.retryAfterSec, violationsRemaining: err.violationsRemaining },
      { status: 429, headers: { "Retry-After": String(err.retryAfterSec) } }
    );
  }
  if (err.code === "BANNED") {
    return NextResponse.json(
      { error: err.reason || "Account temporarily suspended", retryAfterSec: err.retryAfterSec },
      { status: 403, headers: { "Retry-After": String(err.retryAfterSec) } }
    );
  }
  if (err.code === "GLOBAL_LIMITED") {
    return NextResponse.json(
      { error: "System is temporarily overloaded. Please try again shortly.", retryAfterSec: err.retryAfterSec },
      { status: 503, headers: { "Retry-After": String(err.retryAfterSec) } }
    );
  }
  return null;
}

// GET /api/tasks/:taskId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  try {
    const { taskId } = await params;
    const task = await taskRepo.getTask(userId, taskId);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}

// PATCH /api/tasks/:taskId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  try {
    const { taskId } = await params;
    const body = await req.json();

    // Only allow known fields
    const sanitized: Record<string, any> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in body) {
        if (key === "status" && !ALLOWED_STATUSES.includes(body[key])) {
          return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        if (key === "title" && typeof body[key] === "string" && body[key].length > 500) {
          return NextResponse.json({ error: "Title too long" }, { status: 400 });
        }
        if (key === "description" && typeof body[key] === "string" && body[key].length > 5000) {
          return NextResponse.json({ error: "Description too long" }, { status: 400 });
        }
        sanitized[key] = body[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    try {
      await taskRepo.updateTask(userId, taskId, sanitized);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      const r = errorResponse(err);
      if (r) return r;
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/:taskId — marks as cancelled
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  try {
    const { taskId } = await params;
    try {
      await taskRepo.deleteTask(userId, taskId);
      return NextResponse.json({ success: true });
    } catch (err: any) {
      const r = errorResponse(err);
      if (r) return r;
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
