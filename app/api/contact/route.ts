import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!adminConfigured || !db)
    return jsonError("Contact messages are temporarily unavailable.", 503);
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.message)
      return jsonError("Please complete your name, email, and message.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
      return jsonError("Enter a valid email address.");
    const ref = await db
      .collection("contactMessages")
      .add({
        name: String(body.name).slice(0, 120),
        email: String(body.email).slice(0, 200),
        subject: String(body.subject ?? "General inquiry").slice(0, 120),
        message: String(body.message).slice(0, 2000),
        status: "new",
        createdAt: new Date().toISOString(),
      });
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch {
    return jsonError("We couldn't save your message. Please try again.", 500);
  }
}
