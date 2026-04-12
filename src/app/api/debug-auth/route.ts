import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    // Test 1: Check env vars
    const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
    const privateKeyLength = (process.env.FIREBASE_PRIVATE_KEY || "").length;
    const privateKeyStart = (process.env.FIREBASE_PRIVATE_KEY || "").substring(0, 30);

    // Test 2: Try to initialize and verify
    let verifyResult = "not attempted";
    try {
      const { auth } = await import("@/lib/firebase/admin");
      const decoded = await auth.verifyIdToken(idToken);
      verifyResult = `success: ${decoded.uid} / ${decoded.email}`;
    } catch (err: any) {
      verifyResult = `error: ${err.message}`;
    }

    return NextResponse.json({
      envCheck: { hasProjectId, hasClientEmail, hasPrivateKey, privateKeyLength, privateKeyStart },
      verifyResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
