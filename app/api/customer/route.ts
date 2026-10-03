import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError, publicShipment } from "@/lib/http";

export const runtime = "nodejs";
export async function GET() {
  const user = await getSession();
  if (!user) return jsonError("Please sign in to view your account.", 401);
  if (!db) return jsonError("Database is not configured.", 503);
  const [
    shipments,
    quotes,
    invoices,
    bookings,
    pickups,
    notifications,
    supportThreads,
  ] = await Promise.all([
    db
      .collection("shipments")
      .where("customerId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("quotes")
      .where("customerId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("invoices")
      .where("customerId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("bookingRequests")
      .where("customerId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("pickupRequests")
      .where("customerId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("notifications")
      .where("userId", "==", user.uid)
      .limit(100)
      .get(),
    db
      .collection("supportThreads")
      .where("userId", "==", user.uid)
      .limit(100)
      .get(),
  ]);
  const docs = (snap: FirebaseFirestore.QuerySnapshot) =>
    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const customerShipments = shipments.docs.map((doc) => {
    const data = doc.data();
    return {
      ...publicShipment(data),
      id: doc.id,
      customerReference: data.customerReference ?? null,
      packageCount: data.packageCount ?? null,
      weight: data.weight ?? null,
      dimensions: data.dimensions ?? null,
      description: data.description ?? null,
      documents: (Array.isArray(data.documents) ? data.documents : [])
        .filter(
          (item: Record<string, unknown>) => item.visibleToCustomer === true,
        )
        .map((item: Record<string, unknown>) => ({
          name: item.name,
          path: item.path,
          contentType: item.contentType,
          uploadedAt: item.uploadedAt,
        })),
    };
  });
  const customerSupport = supportThreads.docs.map((doc) => {
    const item = doc.data();
    return {
      id: doc.id,
      subject: item.subject,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      messages: (Array.isArray(item.messages) ? item.messages : []).map(
        (message: Record<string, unknown>) => ({
          text: message.text,
          from: message.from,
          timestamp: message.timestamp,
        }),
      ),
    };
  });
  const customerUser = {
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return NextResponse.json({
    user: customerUser,
    shipments: customerShipments,
    quotes: docs(quotes),
    invoices: docs(invoices),
    bookings: docs(bookings),
    pickups: docs(pickups),
    notifications: docs(notifications),
    supportThreads: customerSupport,
  });
}
