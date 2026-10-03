import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminConfigured, db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
const expiresIn = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!adminConfigured || !adminAuth || !db)
    return jsonError(
      "Authentication is not configured yet. Add Firebase Admin credentials.",
      503,
    );
  try {
    const { idToken, name } = await request.json();
    if (typeof idToken !== "string")
      return jsonError("A Firebase ID token is required.");
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();
    if (userSnap.exists && userSnap.data()?.suspended)
      return jsonError(
        "This account has been suspended. Contact the NewLogi team.",
        403,
      );
    const email = String(decoded.email ?? "").toLowerCase();
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    const role = userSnap.exists
      ? (userSnap.data()?.role ?? "customer")
      : email && superAdminEmail && email === superAdminEmail
        ? "super_admin"
        : "customer";
    await userRef.set(
      {
        uid: decoded.uid,
        email,
        name:
          typeof name === "string" && name.trim()
            ? name.trim().slice(0, 100)
            : (decoded.name ?? "Customer"),
        role,
        ...(userSnap.exists ? {} : { suspended: false }),
        updatedAt: new Date().toISOString(),
        ...(userSnap.exists ? {} : { createdAt: new Date().toISOString() }),
      },
      { merge: true },
    );
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    const response = NextResponse.json({ ok: true, role });
    response.cookies.set("newlogi_session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn / 1000,
    });
    return response;
  } catch {
    return jsonError("Unable to start a session. Please sign in again.", 401);
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("newlogi_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return response;
}
