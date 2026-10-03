import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return jsonError("Please sign in to continue.", 401);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    if (body.kind === "quote-response") {
      const ref = db.collection("quotes").doc(String(body.id ?? ""));
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.customerId !== user.uid)
        return jsonError("Quote not found.", 404);
      if (snap.data()?.status !== "quoted")
        return jsonError("This quote is no longer awaiting a response.", 409);
      if (!["accepted", "declined"].includes(body.status))
        return jsonError("Invalid response.");
      await ref.update({
        status: body.status,
        respondedAt: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "support" || body.kind === "support-reply") {
      if (!String(body.message ?? "").trim())
        return jsonError("Write a message before sending.");
      const timestamp = new Date().toISOString();
      if (body.kind === "support") {
        const ref = await db
          .collection("supportThreads")
          .add({
            userId: user.uid,
            userName: user.name,
            email: user.email,
            subject: String(body.subject ?? "Support request").slice(0, 120),
            messages: [
              {
                text: String(body.message).slice(0, 2000),
                from: "customer",
                timestamp,
              },
            ],
            unreadByStaff: 1,
            status: "open",
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
      }
      const ref = db.collection("supportThreads").doc(String(body.id ?? ""));
      const snap = await ref.get();
      if (!snap.exists || snap.data()?.userId !== user.uid)
        return jsonError("Conversation not found.", 404);
      const messages = Array.isArray(snap.data()?.messages)
        ? snap.data()!.messages
        : [];
      await ref.update({
        messages: [
          ...messages,
          {
            text: String(body.message).slice(0, 2000),
            from: "customer",
            timestamp,
          },
        ],
        unreadByStaff: 1,
        status: "open",
        updatedAt: timestamp,
      });
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "profile") {
      const patch = {
        name: String(body.name ?? user.name)
          .trim()
          .slice(0, 100),
        updatedAt: new Date().toISOString(),
      };
      if (!patch.name) return jsonError("Name is required.");
      await db.collection("users").doc(user.uid).update(patch);
      return NextResponse.json({ ok: true, user: { ...user, ...patch } });
    }
    return jsonError("Unsupported action.");
  } catch {
    return jsonError(
      "We couldn't complete that action. Please try again.",
      500,
    );
  }
}
