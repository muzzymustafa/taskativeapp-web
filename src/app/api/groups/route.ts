import { NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { groupRepo } from "@/lib/adapters/firebase";

// GET /api/groups — list user's groups
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const groups = await groupRepo.getUserGroups(userId);
  return NextResponse.json(groups);
}
