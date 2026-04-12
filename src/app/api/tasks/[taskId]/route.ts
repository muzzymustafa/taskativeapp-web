import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { taskRepo } from "@/lib/adapters/firebase";

// GET /api/tasks/:taskId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { taskId } = await params;
  const task = await taskRepo.getTask(userId, taskId);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(task);
}

// PATCH /api/tasks/:taskId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { taskId } = await params;
  const body = await req.json();

  await taskRepo.updateTask(userId, taskId, body);
  return NextResponse.json({ success: true });
}

// DELETE /api/tasks/:taskId — marks as cancelled
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { taskId } = await params;
  await taskRepo.deleteTask(userId, taskId);
  return NextResponse.json({ success: true });
}
