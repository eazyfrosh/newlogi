import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { adminConfigured, db } from "@/lib/firebase-admin";
import { jsonError, publicShipment } from "@/lib/http";

export const runtime = "nodejs";
const WINDOW_MS = 60_000;
const LIMIT = 12;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ number: string }> },
) {
  if (!adminConfigured || !db)
    return jsonError("Tracking is temporarily unavailable.", 503);
  const { number } = await context.params;
  const trackingNumber = decodeURIComponent(number).trim().toUpperCase();
  if (!/^[A-Z0-9-]{8,32}$/.test(trackingNumber))
    return jsonError("Check the tracking number and try again.", 400);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown";
  const rateRef = db
    .collection("trackingRateLimits")
    .doc(createHash("sha256").update(ip).digest("hex"));
  const now = Date.now();
  try {
    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(rateRef);
      const data = snap.data();
      if (!data || now - Number(data.windowStart) >= WINDOW_MS) {
        tx.set(rateRef, { windowStart: now, count: 1 });
        return true;
      }
      if (Number(data.count) >= LIMIT) return false;
      tx.update(rateRef, { count: Number(data.count) + 1 });
      return true;
    });
    if (!allowed)
      return jsonError(
        "Too many tracking attempts. Please wait a minute and try again.",
        429,
      );
    const snap = await db
      .collection("shipments")
      .where("trackingNumber", "==", trackingNumber)
      .limit(1)
      .get();
    if (snap.empty || snap.docs[0].data().archived)
      return jsonError(
        "We couldn't find a shipment with that tracking number.",
        404,
      );
    return NextResponse.json({ shipment: publicShipment(snap.docs[0].data()) });
  } catch {
    return jsonError(
      "Tracking is temporarily unavailable. Please try again.",
      500,
    );
  }
}
