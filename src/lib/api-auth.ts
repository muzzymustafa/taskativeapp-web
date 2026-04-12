import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return (session?.user as any)?.uid || null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
