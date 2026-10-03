import { NextResponse } from "next/server";
import { AggregateField } from "firebase-admin/firestore";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export async function GET() {
  const user = await getSession();
  if (!user || !can(user, "dashboard.read"))
    return jsonError("Administrator access is required.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  const [
    shipments,
    quotes,
    bookings,
    pickups,
    invoices,
    support,
    users,
    contacts,
  ] = await Promise.all([
    db.collection("shipments").limit(500).get(),
    db.collection("quotes").limit(500).get(),
    db.collection("bookingRequests").limit(500).get(),
    db.collection("pickupRequests").limit(500).get(),
    can(user, "invoices.read")
      ? db.collection("invoices").limit(500).get()
      : Promise.resolve(null),
    can(user, "support.read")
      ? db.collection("supportThreads").limit(500).get()
      : Promise.resolve(null),
    user.role === "super_admin" || can(user, "customers.read")
      ? db.collection("users").limit(500).get()
      : Promise.resolve(null),
    user.role === "super_admin" || can(user, "support.read")
      ? db.collection("contactMessages").limit(200).get()
      : Promise.resolve(null),
  ]);
  const shipmentRows = (
    shipments.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseFirestore.DocumentData[]
  ).filter((row) => !row.archived);
  const userRows = (users?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) ??
    []) as FirebaseFirestore.DocumentData[];
  const activeShipments = db
    .collection("shipments")
    .where("archived", "==", false)
    .where("status", "not-in", ["Delivered", "Cancelled", "Returned"]);
  const count = async (query: FirebaseFirestore.Query) =>
    (await query.count().get()).data().count;
  const [
    shipmentCount,
    activeCount,
    deliveredCount,
    bookingCount,
    pickupCount,
    quoteCount,
    invoiceCount,
    balanceResult,
    unreadResult,
    customerCount,
  ] = await Promise.all([
    count(db.collection("shipments").where("archived", "==", false)),
    count(activeShipments),
    count(
      db
        .collection("shipments")
        .where("archived", "==", false)
        .where("status", "==", "Delivered"),
    ),
    count(
      db.collection("bookingRequests").where("status", "==", "pending_review"),
    ),
    count(
      db.collection("pickupRequests").where("status", "==", "pending_review"),
    ),
    count(
      db
        .collection("quotes")
        .where("status", "in", [
          "new",
          "pending_review",
          "awaiting_action",
          "quoted",
        ]),
    ),
    can(user, "invoices.read")
      ? count(
          db
            .collection("invoices")
            .where("status", "in", ["unpaid", "partially_paid"]),
        )
      : Promise.resolve(null),
    can(user, "invoices.read")
      ? db
          .collection("invoices")
          .where("status", "in", ["unpaid", "partially_paid"])
          .aggregate({ balanceCents: AggregateField.sum("balanceDueCents") })
          .get()
      : Promise.resolve(null),
    can(user, "support.read")
      ? db
          .collection("supportThreads")
          .aggregate({ unreadCount: AggregateField.sum("unreadByStaff") })
          .get()
      : Promise.resolve(null),
    can(user, "customers.read")
      ? count(db.collection("users").where("role", "==", "customer"))
      : Promise.resolve(null),
  ]);
  return NextResponse.json({
    user: {
      uid: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    metrics: {
      shipments: shipmentCount,
      active: activeCount,
      delivered: deliveredCount,
      pendingRequests: bookingCount + pickupCount,
      quotesAwaitingAction: quoteCount,
      outstandingInvoices: invoiceCount,
      invoicedAmount: balanceResult
        ? Number(balanceResult.data().balanceCents ?? 0) / 100
        : can(user, "invoices.read")
          ? 0
          : null,
      unreadSupportMessages: unreadResult
        ? Number(unreadResult.data().unreadCount ?? 0)
        : can(user, "support.read")
          ? 0
          : null,
      customers: customerCount,
    },
    recentShipments: shipmentRows
      .sort((a, b) =>
        String(b.updatedAt ?? b.createdAt).localeCompare(
          String(a.updatedAt ?? a.createdAt),
        ),
      )
      .slice(0, 8),
    shipments: shipmentRows,
    invoices:
      invoices?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) ?? [],
    quotes: (
      quotes.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseFirestore.DocumentData[]
    ).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    requests: (
      [
        ...bookings.docs.map((doc) => ({
          id: doc.id,
          kind: "booking",
          ...doc.data(),
        })),
        ...pickups.docs.map((doc) => ({
          id: doc.id,
          kind: "pickup",
          ...doc.data(),
        })),
      ] as FirebaseFirestore.DocumentData[]
    ).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    customers: userRows.filter((row) => row.role === "customer").slice(0, 100),
    staff:
      user.role === "super_admin"
        ? userRows
            .filter((row) => row.role && row.role !== "customer")
            .slice(0, 100)
        : [],
    supportThreads:
      support?.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .slice(0, 100) ?? [],
    contactMessages:
      contacts?.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .slice(0, 100) ?? [],
  });
}
