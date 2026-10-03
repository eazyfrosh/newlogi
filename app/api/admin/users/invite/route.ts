import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminAuth, db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const actor = await getSession();
  if (!actor || actor.role !== "super_admin")
    return jsonError("Only a super admin can invite staff.", 403);
  if (!db || !adminAuth)
    return jsonError("Firebase Admin is not configured.", 503);
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const role = String(body.role ?? "");
    const name = String(body.name ?? "")
      .trim()
      .slice(0, 100);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name)
      return jsonError("Enter a valid email and name.");
    if (!["operations", "support"].includes(role))
      return jsonError(
        "Staff invitations are limited to operations and support roles.",
      );
    if (email === actor.email.toLowerCase())
      return jsonError("You cannot invite yourself as staff.");
    let authUser;
    try {
      authUser = await adminAuth.getUserByEmail(email);
      if (
        (await db.collection("users").doc(authUser.uid).get()).data()?.role ===
        "super_admin"
      )
        return jsonError(
          "A super admin cannot be changed through a staff invitation.",
          403,
        );
      await adminAuth.updateUser(authUser.uid, {
        displayName: name,
        disabled: false,
      });
    } catch {
      authUser = await adminAuth.createUser({
        email,
        displayName: name,
        emailVerified: false,
        disabled: false,
      });
    }
    await db
      .collection("users")
      .doc(authUser.uid)
      .set(
        {
          uid: authUser.uid,
          email,
          name,
          role,
          suspended: false,
          invitedAt: new Date().toISOString(),
          invitedBy: actor.uid,
        },
        { merge: true },
      );
    const link = await adminAuth.generatePasswordResetLink(email);
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Set up your NewLogi staff access",
          text: `Hello ${name},\n\nYou have been invited to NewLogi as ${role}. Set a password using this secure link:\n${link}\n\nNewLogi`,
        }),
      }).catch(() => undefined);
      return NextResponse.json({ ok: true, delivered: true });
    }
    return NextResponse.json({ ok: true, delivered: false, actionLink: link });
  } catch {
    return jsonError(
      "Unable to invite staff. Confirm the email is not already registered with a different role.",
      500,
    );
  }
}
