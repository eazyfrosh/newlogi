import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminAuth, db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest) {
  const actor = await getSession();
  if (!actor || actor.role !== "super_admin")
    return jsonError(
      "Only a super admin can change account roles or suspension status.",
      403,
    );
  if (!db || !adminAuth)
    return jsonError("Firebase Admin is not configured.", 503);
  try {
    const body = await request.json();
    const uid = String(body.uid ?? "");
    if (!uid || uid === actor.uid) return jsonError("Choose another account.");
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Account not found.", 404);
    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof body.suspended === "boolean") {
      patch.suspended = body.suspended;
      await adminAuth.updateUser(uid, { disabled: body.suspended });
    }
    if (
      typeof body.role === "string" &&
      ["super_admin", "operations", "support", "customer"].includes(body.role)
    ) {
      if (snap.data()?.role === "super_admin" && body.role !== "super_admin")
        return jsonError(
          "Privileged super admin roles require direct account owner review.",
          403,
        );
      patch.role = body.role;
    }
    await ref.update(patch);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to update account.", 500);
  }
}
