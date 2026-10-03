import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "quotes.write"))
    return jsonError(
      "You don't have permission to manage booking requests.",
      403,
    );
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const collection =
      body.kind === "pickup" ? "pickupRequests" : "bookingRequests";
    const id = String(body.id ?? "");
    const status = [
      "pending_review",
      "approved",
      "rejected",
      "rescheduled",
    ].includes(body.status)
      ? body.status
      : null;
    if (!id || !status) return jsonError("Request and status are required.");
    const ref = db.collection(collection).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Request not found.", 404);
    const item = snap.data()!;
    const patch: Record<string, unknown> = {
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.uid,
    };
    if (body.preferredDate)
      patch.preferredDate = String(body.preferredDate).slice(0, 10);
    await ref.update(patch);
    await db
      .collection("notifications")
      .add({
        userId: item.customerId,
        message: `Your ${body.kind === "pickup" ? "pickup" : "booking"} request is ${status.replace("_", " ")}${body.preferredDate ? ` for ${String(body.preferredDate)}` : ""}.`,
        kind: "request",
        createdAt: new Date().toISOString(),
        read: false,
      });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to update request.", 500);
  }
}
