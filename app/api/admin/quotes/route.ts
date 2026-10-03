import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "quotes.write"))
    return jsonError("You don't have permission to manage quotes.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return jsonError("Quote request ID is required.");
    const status = ["reviewing", "quoted", "declined"].includes(body.status)
      ? body.status
      : "reviewing";
    const ref = db.collection("quotes").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Quote request not found.", 404);
    const old = snap.data()!;
    const customerId = String(body.customerId ?? old.customerId ?? "").slice(
      0,
      120,
    );
    const amount =
      body.amount !== undefined ? Number(body.amount) : Number(old.amount ?? 0);
    if (status === "quoted" && (!Number.isFinite(amount) || amount <= 0))
      return jsonError("Enter a valid quote amount before sending.");
    if (status === "quoted" && !customerId)
      return jsonError(
        "Assign the quote to a customer account before sending.",
      );
    const currency = String(body.currency ?? old.currency ?? "USD")
      .slice(0, 3)
      .toUpperCase();
    const expiryDate = String(body.expiryDate ?? old.expiryDate ?? "").slice(
      0,
      20,
    );
    const terms = String(body.terms ?? old.terms ?? "").slice(0, 1000);
    const items = Array.isArray(body.items)
      ? body.items
          .slice(0, 20)
          .map((item: Record<string, unknown>) => ({
            description: String(item.description ?? "").slice(0, 200),
            quantity: Math.max(1, Math.min(10000, Number(item.quantity) || 1)),
            unitAmount: Number(item.unitAmount) || 0,
          }))
      : old.items;
    await ref.update({
      status,
      updatedAt: new Date().toISOString(),
      ...(body.amount !== undefined ? { amount } : {}),
      ...(items ? { items } : {}),
      currency,
      expiryDate,
      terms,
      ...(customerId ? { customerId } : {}),
    });
    if (status === "quoted" && customerId)
      await db
        .collection("notifications")
        .add({
          userId: customerId,
          message: `A quote for ${old.origin ?? "your shipment"} to ${old.destination ?? ""} is ready to review.`,
          kind: "quote",
          createdAt: new Date().toISOString(),
          read: false,
        });
    if (
      status === "quoted" &&
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      old.email
    ) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: old.email,
          subject: "Your NewLogi quote is ready",
          text: `Hi ${old.name ?? "there"},\n\nWe have prepared a quote for your shipment request.\n\nQuote: ${currency} ${amount.toFixed(2)}\nValid until: ${expiryDate || "Please check with our team"}\nTerms: ${terms || "Please contact us for the full service terms."}\n\nSign in to your NewLogi customer dashboard to accept or decline.\n\nNewLogi`,
        }),
      }).catch(() => undefined);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to update quote.", 500);
  }
}
