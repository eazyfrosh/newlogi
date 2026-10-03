import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db, storage } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError(
      "You don't have permission to upload shipment documents.",
      403,
    );
  if (!db || !storage)
    return jsonError("Firebase Storage is not configured.", 503);
  try {
    const body = await request.json();
    const path = String(body.path ?? "");
    const shipmentId = String(body.shipmentId ?? "");
    if (!path.startsWith(`newlogi/shipments/${shipmentId}/`) || !shipmentId)
      return jsonError("Invalid upload.");
    const shipmentRef = db.collection("shipments").doc(shipmentId);
    const shipment = await shipmentRef.get();
    if (!shipment.exists) return jsonError("Shipment not found.", 404);
    const file = storage.bucket().file(path);
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size ?? 0);
    const contentType = String(metadata.contentType ?? "");
    if (
      size <= 0 ||
      size > 10 * 1024 * 1024 ||
      !["application/pdf", "image/jpeg", "image/png"].includes(contentType)
    )
      return jsonError("The uploaded file is invalid.", 400);
    const doc = {
      path,
      name: String(body.name ?? "").slice(0, 100),
      contentType,
      size,
      visibleToCustomer: body.visibleToCustomer === true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.uid,
    };
    await shipmentRef.update({
      documents: [
        ...(Array.isArray(shipment.data()?.documents)
          ? shipment.data()!.documents
          : []),
        doc,
      ],
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, document: doc }, { status: 201 });
  } catch {
    return jsonError(
      "Unable to attach the uploaded file to this shipment.",
      500,
    );
  }
}
