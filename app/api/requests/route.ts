import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Please sign in to submit a request.", 401);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const kind = body.kind === "pickup" ? "pickupRequests" : "bookingRequests";
    const entry = {
      customerId: user.uid,
      customerName: user.name,
      customerEmail: user.email,
      details: String(body.details ?? "")
        .trim()
        .slice(0, 1200),
      preferredDate: String(body.preferredDate ?? "").slice(0, 10),
      origin: String(body.origin ?? "").slice(0, 160),
      destination: String(body.destination ?? "").slice(0, 160),
      service: String(body.service ?? "").slice(0, 80),
      status: "pending_review",
      createdAt: new Date().toISOString(),
    };
    if (!entry.details && kind === "bookingRequests")
      return jsonError("Add a short description of the shipment.");
    const ref = await db.collection(kind).add(entry);
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return jsonError("The request could not be saved.", 500);
  }
}
