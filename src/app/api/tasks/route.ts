import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, getAuthUser, unauthorized } from "@/lib/api-auth";
import { taskRepo } from "@/lib/adapters/firebase";

// GET /api/tasks — list user's tasks
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  try {
    const tasks = await taskRepo.getUserTasks(userId);
    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("[API /tasks GET]", err);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { title, description, dueDate, startDate, groupId, recurrence, checklist } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 500) {
      return NextResponse.json({ error: "Title too long" }, { status: 400 });
    }
    if (description && typeof description === "string" && description.length > 5000) {
      return NextResponse.json({ error: "Description too long" }, { status: 400 });
    }

    // Validate checklist shape
    let validatedChecklist: { text: string; done: boolean }[] | undefined;
    if (Array.isArray(checklist)) {
      if (checklist.length > 50) {
        return NextResponse.json({ error: "Too many checklist items" }, { status: 400 });
      }
      validatedChecklist = checklist
        .filter((item: any) => item && typeof item.text === "string")
        .map((item: any) => ({
          text: String(item.text).substring(0, 200),
          done: !!item.done,
        }));
    }

    try {
      const task = await taskRepo.createTask(
        user.uid,
        {
          title: title.trim(),
          description: description?.trim() || "",
          dueDate: dueDate || null,
          startDate: startDate || null,
          groupId: groupId || null,
          recurrence: recurrence || undefined,
          checklist: validatedChecklist,
        },
        user.email
      );

      return NextResponse.json(task, { status: 201 });
    } catch (err: any) {
      if (err.code === "QUOTA_EXCEEDED") {
        return NextResponse.json(
          { error: "Monthly task limit reached", used: err.used, limit: err.limit },
          { status: 429 }
        );
      }
      if (err.code === "DAILY_LIMIT") {
        return NextResponse.json(
          { error: "Daily task limit reached", limit: err.limit, retryAfterSec: err.retryAfterSec },
          { status: 429, headers: { "Retry-After": String(err.retryAfterSec) } }
        );
      }
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
      throw err;
    }
  } catch (err: any) {
    console.error("[API /tasks POST]", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
