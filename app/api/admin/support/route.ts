import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "support.write"))
    return jsonError(
      "You don't have permission to respond to support messages.",
      403,
    );
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const ref = db.collection("supportThreads").doc(String(body.id ?? ""));
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Conversation not found.", 404);
    const thread = snap.data()!;
    const messages = Array.isArray(thread.messages) ? thread.messages : [];
    const now = new Date().toISOString();
    if (body.close === true) {
      await ref.update({ status: "closed", unreadByStaff: 0, updatedAt: now });
    } else if (String(body.message ?? "").trim()) {
      await ref.update({
        messages: [
          ...messages,
          {
            text: String(body.message).slice(0, 2000),
            from: "staff",
            staffId: user.uid,
            timestamp: now,
          },
        ],
        unreadByStaff: 0,
        updatedAt: now,
      });
      await db
        .collection("notifications")
        .add({
          userId: thread.userId,
          message: `New reply from the NewLogi team: ${thread.subject ?? "Support request"}.`,
          kind: "support",
          createdAt: now,
          read: false,
        });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to update conversation.", 500);
  }
}
