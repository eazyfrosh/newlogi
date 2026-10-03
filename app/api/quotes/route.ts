import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!adminConfigured || !db)
    return jsonError(
      "Quote requests are temporarily unavailable. Please try again later.",
      503,
    );
  try {
    const payload = await request.json();
    const required = [
      "name",
      "email",
      "phone",
      "origin",
      "destination",
      "shipmentType",
      "packageCount",
      "weight",
      "service",
    ];
    if (required.some((key) => !String(payload[key] ?? "").trim()))
      return jsonError("Please complete all required fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      return jsonError("Enter a valid email address.");
    const item = {
      name: String(payload.name).trim().slice(0, 120),
      email: String(payload.email).trim().slice(0, 200),
      phone: String(payload.phone).trim().slice(0, 40),
      origin: String(payload.origin).trim().slice(0, 160),
      destination: String(payload.destination).trim().slice(0, 160),
      shipmentType: String(payload.shipmentType).slice(0, 80),
      packageCount: String(payload.packageCount).slice(0, 20),
      weight: String(payload.weight).slice(0, 40),
      dimensions: String(payload.dimensions ?? "").slice(0, 100),
      service: String(payload.service).slice(0, 80),
      description: String(payload.description ?? "").slice(0, 1500),
      notes: String(payload.notes ?? "").slice(0, 1500),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("quotes").add(item);
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: item.email,
          subject: "We received your quote request",
          text: `Hi ${item.name},\n\nYour quote request (${ref.id}) has been received. Our team will review the details and follow up.\n\nNewLogi`,
        }),
      }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true, reference: ref.id }, { status: 201 });
  } catch {
    return jsonError("We couldn't save your request. Please try again.", 500);
  }
}
