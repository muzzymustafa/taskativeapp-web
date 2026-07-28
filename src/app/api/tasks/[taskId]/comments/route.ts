import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/api-auth";
import { commentRepo } from "@/lib/adapters/firebase";

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
  if (err.code === "DAILY_LIMIT") {
    return NextResponse.json(
      { error: "Daily write limit reached", retryAfterSec: err.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(err.retryAfterSec) } }
    );
  }
  if (err.code === "EMPTY_COMMENT") {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (err.code === "COMMENT_TOO_LONG") {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }
  // Personal task, or a group task the caller isn't a member of — same answer
  // for both so task ids can't be probed for existence.
  if (err.code === "TASK_NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

// GET /api/tasks/:taskId/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { taskId } = await params;
    // Hint only — membership is still verified server-side against the caller's
    // own group list, so a forged value can't reach another group's comments.
    const groupIdHint = req.nextUrl.searchParams.get("groupId") || undefined;
    const comments = await commentRepo.listComments(user.uid, taskId, groupIdHint);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

// POST /api/tasks/:taskId/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  try {
    const { taskId } = await params;
    const body = await req.json();
    const text = typeof body?.commentText === "string" ? body.commentText : "";
    const groupIdHint = typeof body?.groupId === "string" ? body.groupId : undefined;

    try {
      const comment = await commentRepo.addComment(user.uid, taskId, text, { email: user.email }, groupIdHint);
      return NextResponse.json(comment, { status: 201 });
    } catch (err: any) {
      const r = errorResponse(err);
      if (r) return r;
      throw err;
    }
  } catch {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
