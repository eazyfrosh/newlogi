import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError("You don't have permission to create shipments.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const { id } = await request.json();
    const quoteRef = db.collection("quotes").doc(String(id ?? ""));
    const shipRef = db.collection("shipments").doc();
    let output: Record<string, unknown> = {};
    await db.runTransaction(async (tx) => {
      const quote = await tx.get(quoteRef);
      if (!quote.exists) throw new Error("not-found");
      const q = quote.data()!;
      if (q.status !== "accepted") throw new Error("not-accepted");
      if (!q.customerId) throw new Error("customer-required");
      if (q.convertedShipmentId) throw new Error("already-converted");
      const now = new Date().toISOString();
      const trackingNumber = `NL-${randomBytes(6).toString("hex").toUpperCase()}`;
      const origin = String(q.origin ?? "").slice(0, 120);
      const destination = String(q.destination ?? "").slice(0, 120);
      const service = String(q.service ?? q.shipmentType ?? "Freight").slice(
        0,
        80,
      );
      output = { id: shipRef.id, trackingNumber };
      tx.create(shipRef, {
        trackingNumber,
        customerId: String(q.customerId),
        customerName: String(q.name ?? ""),
        originCity: origin,
        publicOrigin: origin,
        destinationCity: destination,
        publicDestination: destination,
        service,
        status: "Shipment Created",
        currentLocation: origin,
        publicCurrentLocation: origin,
        packageCount: String(q.packageCount ?? ""),
        weight: String(q.weight ?? ""),
        dimensions: String(q.dimensions ?? ""),
        description: String(q.description ?? "").slice(0, 1000),
        events: [
          {
            status: "Shipment Created",
            location: origin,
            description: "Shipment created from an accepted quote.",
            public: true,
            timestamp: now,
          },
        ],
        internalNotes: [],
        documents: [],
        archived: false,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        quoteId: quoteRef.id,
      });
      tx.update(quoteRef, {
        status: "converted",
        convertedShipmentId: shipRef.id,
        convertedAt: now,
        updatedAt: now,
      });
    });
    return NextResponse.json({ ok: true, ...output }, { status: 201 });
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    return jsonError(
      code === "not-found"
        ? "Quote not found."
        : code === "not-accepted"
          ? "Only accepted quotes can be converted."
          : code === "customer-required"
            ? "Assign the quote to a customer account first."
            : code === "already-converted"
              ? "This quote has already been converted."
              : "Unable to convert quote.",
      code === "not-found" ? 404 : 400,
    );
  }
}
