import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError, shipmentStatuses } from "@/lib/http";

export const runtime = "nodejs";
function newTrackingNumber() {
  return `NL-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError("You don't have permission to create shipments.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    for (const key of ["customerId", "origin", "destination", "service"])
      if (!String(body[key] ?? "").trim())
        return jsonError(`Please provide ${key}.`);
    const trackingNumber = newTrackingNumber();
    const status = shipmentStatuses.includes(body.status)
      ? body.status
      : "Shipment Created";
    const now = new Date().toISOString();
    const data = {
      trackingNumber,
      customerId: String(body.customerId).slice(0, 120),
      customerName: String(body.customerName ?? "").slice(0, 100),
      originCity: String(body.origin).slice(0, 120),
      publicOrigin: String(body.origin).slice(0, 120),
      destinationCity: String(body.destination).slice(0, 120),
      publicDestination: String(body.destination).slice(0, 120),
      service: String(body.service).slice(0, 80),
      status,
      currentLocation: String(body.currentLocation ?? body.origin).slice(
        0,
        160,
      ),
      publicCurrentLocation: String(body.currentLocation ?? body.origin).slice(
        0,
        160,
      ),
      packageCount: String(body.packageCount ?? "").slice(0, 20),
      weight: String(body.weight ?? "").slice(0, 30),
      dimensions: String(body.dimensions ?? "").slice(0, 60),
      description: String(body.description ?? "").slice(0, 1000),
      estimatedDelivery: String(body.estimatedDelivery ?? "").slice(0, 30),
      events: [
        {
          status,
          location: String(body.origin).slice(0, 160),
          description: "Shipment record created.",
          public: true,
          timestamp: now,
        },
      ],
      internalNotes: [],
      assignedStaffId: String(body.assignedStaffId ?? "").slice(0, 120),
      archived: false,
      createdAt: now,
      updatedAt: now,
      createdBy: user.uid,
    };
    const ref = await db.collection("shipments").add(data);
    await db
      .collection("notifications")
      .add({
        userId: data.customerId,
        message: `A shipment was created for ${data.originCity} to ${data.destinationCity}. Tracking number ${trackingNumber}.`,
        kind: "shipment",
        createdAt: now,
        read: false,
      });
    return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
  } catch {
    return jsonError("Unable to create shipment.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError("You don't have permission to edit shipments.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    if (typeof body.id !== "string" || !body.id)
      return jsonError("Shipment ID is required.");
    const ref = db.collection("shipments").doc(body.id);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Shipment not found.", 404);
    const old = snap.data()!;
    const allowed = [
      "Shipment Created",
      "Awaiting Pickup",
      "Picked Up",
      "At Origin Facility",
      "In Transit",
      "At Destination Facility",
      "Customs Processing",
      "Out for Delivery",
      "Delivered",
      "Delivery Attempted",
      "On Hold",
      "Returned",
      "Cancelled",
    ];
    const status = allowed.includes(body.status) ? body.status : old.status;
    const location =
      typeof body.location === "string"
        ? body.location.slice(0, 160)
        : old.currentLocation;
    const changed = status !== old.status || location !== old.currentLocation;
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const field of [
      "customerId",
      "customerName",
      "service",
      "packageCount",
      "weight",
      "dimensions",
      "description",
      "estimatedDelivery",
      "assignedStaffId",
    ]) {
      if (typeof body[field] === "string")
        updates[field] = body[field].slice(0, 1000);
    }
    updates.status = status;
    updates.currentLocation = location;
    updates.publicCurrentLocation = location;
    if (body.archived === true) updates.archived = true;
    if (changed && body.addEvent !== false) {
      const event = {
        status,
        location,
        description: String(
          body.description ?? `Shipment status updated to ${status}.`,
        ).slice(0, 500),
        publicDescription: String(
          body.publicDescription ??
            body.description ??
            `Shipment status updated to ${status}.`,
        ).slice(0, 500),
        publicLocation: location,
        public: body.eventPublic !== false,
        timestamp: new Date().toISOString(),
        updatedBy: user.uid,
      };
      updates.events = [
        ...(Array.isArray(old.events) ? old.events : []),
        event,
      ];
    }
    if (body.internalNote)
      updates.internalNotes = [
        ...(Array.isArray(old.internalNotes) ? old.internalNotes : []),
        {
          text: String(body.internalNote).slice(0, 1500),
          authorId: user.uid,
          timestamp: new Date().toISOString(),
        },
      ];
    await ref.update(updates);
    if (changed)
      await db
        .collection("notifications")
        .add({
          userId: old.customerId,
          message: `Shipment ${old.trackingNumber} updated: ${status}${location ? ` · ${location}` : ""}.`,
          kind: "shipment",
          createdAt: new Date().toISOString(),
          read: false,
        });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to update shipment.", 500);
  }
}
