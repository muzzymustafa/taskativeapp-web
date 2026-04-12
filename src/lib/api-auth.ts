import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return (session?.user as any)?.uid || null;
}

export async function getAuthUser(): Promise<{ uid: string; email: string } | null> {
  const session = await getSession();
  const uid = (session?.user as any)?.uid;
  if (!uid) return null;
  return { uid, email: session?.user?.email || "" };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
