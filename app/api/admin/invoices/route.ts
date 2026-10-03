import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "invoices.write"))
    return jsonError("You don't have permission to create invoices.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    if (!body.customerId || !Array.isArray(body.items) || !body.items.length)
      return jsonError(
        "A customer and at least one invoice item are required.",
      );
    const items = body.items
      .slice(0, 30)
      .map((item: Record<string, unknown>) => ({
        description: String(item.description ?? "").slice(0, 200),
        quantity: Math.max(1, Math.min(10000, Number(item.quantity) || 1)),
        unitPriceCents: Math.max(0, Math.round(Number(item.unitPrice) * 100)),
      }));
    if (items.some((item: { description: string }) => !item.description))
      return jsonError("Every line item needs a description.");
    const subtotalCents = items.reduce(
      (sum: number, item: { quantity: number; unitPriceCents: number }) =>
        sum + item.quantity * item.unitPriceCents,
      0,
    );
    const taxRate = Math.max(0, Math.min(100, Number(body.taxRate) || 0));
    const discountCents = Math.max(
      0,
      Math.round(Number(body.discountAmount || 0) * 100),
    );
    const taxCents = Math.round((subtotalCents * taxRate) / 100);
    const totalCents = Math.max(0, subtotalCents + taxCents - discountCents);
    const now = new Date().toISOString();
    const number = `NL-${new Date().getUTCFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const customerId = String(body.customerId).slice(0, 120);
    const ref = await db.collection("invoices").add({
      number,
      customerId,
      customerName: String(body.customerName ?? "").slice(0, 100),
      shipmentId: String(body.shipmentId ?? "").slice(0, 120),
      items,
      subtotalCents,
      taxRate,
      taxCents,
      discountCents,
      totalCents,
      paidCents: 0,
      balanceDueCents: totalCents,
      currency: String(body.currency ?? "USD")
        .slice(0, 3)
        .toUpperCase(),
      dueDate: String(body.dueDate ?? "").slice(0, 20),
      terms: String(body.terms ?? "").slice(0, 1000),
      status: "unpaid",
      payments: [],
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
    });
    await db
      .collection("notifications")
      .add({
        userId: customerId,
        message: `Invoice ${number} is ready in your NewLogi account.`,
        kind: "invoice",
        createdAt: now,
        read: false,
      });
    return NextResponse.json({ ok: true, id: ref.id, number }, { status: 201 });
  } catch {
    return jsonError("Unable to create invoice.", 500);
  }
}
export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "invoices.write"))
    return jsonError("You don't have permission to record payments.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    const amountCents = Math.round(Number(body.amount) * 100);
    if (!id || !Number.isFinite(amountCents) || amountCents <= 0)
      return jsonError("Provide an invoice and a positive payment amount.");
    const ref = db.collection("invoices").doc(id);
    let customerId = "";
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("Invoice not found.");
      const invoice = snap.data()!;
      const balanceCents = Number(invoice.balanceDueCents ?? 0);
      if (amountCents > balanceCents) throw new Error("overpayment");
      customerId = String(invoice.customerId);
      const paidCents = Number(invoice.paidCents ?? 0) + amountCents;
      const totalCents = Number(invoice.totalCents ?? 0);
      const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
      tx.update(ref, {
        paidCents,
        balanceDueCents: Math.max(totalCents - paidCents, 0),
        status:
          paidCents >= totalCents
            ? "paid"
            : paidCents > 0
              ? "partially_paid"
              : "unpaid",
        payments: [
          ...payments,
          {
            amountCents,
            reference: String(body.reference ?? "").slice(0, 120),
            method: String(body.method ?? "manual").slice(0, 40),
            recordedBy: user.uid,
            recordedAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      });
    });
    await db
      .collection("notifications")
      .add({
        userId: customerId,
        message: "A payment was recorded against one of your NewLogi invoices.",
        kind: "invoice",
        createdAt: new Date().toISOString(),
        read: false,
      });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return jsonError(
      message === "Invoice not found."
        ? message
        : message === "overpayment"
          ? "Payment is greater than the remaining balance."
          : "Unable to record payment.",
      message === "Invoice not found." ? 404 : 400,
    );
  }
}
