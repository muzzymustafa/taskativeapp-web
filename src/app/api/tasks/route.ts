import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { taskRepo } from "@/lib/adapters/firebase";

// GET /api/tasks — list user's tasks
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const tasks = await taskRepo.getUserTasks(userId);
  return NextResponse.json(tasks);
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { title, description, dueDate, groupId } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await taskRepo.createTask(userId, {
    title: title.trim(),
    description: description?.trim() || "",
    dueDate: dueDate || null,
    groupId: groupId || null,
  });

  return NextResponse.json(task, { status: 201 });
}
