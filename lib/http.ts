import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function publicShipment(data: FirebaseFirestore.DocumentData) {
  const events = Array.isArray(data.events) ? data.events : [];
  return {
    trackingNumber: data.trackingNumber,
    service: data.service,
    origin: data.publicOrigin ?? data.originCity ?? null,
    destination: data.publicDestination ?? data.destinationCity ?? null,
    status: data.status,
    currentLocation: data.publicCurrentLocation ?? data.currentLocation ?? null,
    estimatedDelivery: data.estimatedDelivery ?? null,
    createdAt: data.createdAt ?? null,
    events: events
      .filter((event: Record<string, unknown>) => event.public !== false)
      .map((event: Record<string, unknown>) => ({
        status: event.status,
        location: event.publicLocation ?? event.location ?? null,
        description:
          event.publicDescription ?? event.description ?? "Shipment update",
        timestamp: event.timestamp,
      }))
      .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp))),
  };
}

export const shipmentStatuses = [
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
] as const;
