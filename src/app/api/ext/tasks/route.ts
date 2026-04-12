import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/admin";
import { taskRepo } from "@/lib/adapters/firebase";

// CORS headers — extension calls from chrome-extension:// origin
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/ext/tasks
// Headers: Authorization: Bearer <Firebase ID token>
// Body: { title, description?, dueDate?, groupId? }
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401, headers: CORS });
    }

    let decoded;
    try {
      decoded = await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401, headers: CORS });
    }

    const body = await req.json();
    const { title, description, dueDate } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400, headers: CORS });
    }

    const task = await taskRepo.createTask(
      decoded.uid,
      {
        title: title.trim().substring(0, 500),
        description: description?.trim() || "",
        dueDate: dueDate || null,
        groupId: null,
      },
      decoded.email || ""
    );

    return NextResponse.json({ success: true, taskId: task.id }, { status: 201, headers: CORS });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500, headers: CORS });
  }
}
