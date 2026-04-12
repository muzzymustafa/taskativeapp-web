import { NextResponse } from "next/server";
import { getAuthUserId, unauthorized } from "@/lib/api-auth";
import { userRepo } from "@/lib/adapters/firebase";

// GET /api/user — get current user profile
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const profile = await userRepo.getProfile(userId);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(profile);
}
