import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { groupRepo } from "@/lib/adapters/firebase";

// GET /api/groups/:groupId
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { groupId } = await params;
  const group = await groupRepo.getGroup(groupId);
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check membership
  if (!group.memberIds.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [members, tasks] = await Promise.all([
    groupRepo.getGroupMembers(groupId),
    groupRepo.getGroupTasks(groupId),
  ]);

  return NextResponse.json({ ...group, members, tasks });
}
