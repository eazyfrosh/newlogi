import { randomUUID } from "node:crypto";
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
    const form = await request.formData();
    const shipmentId = String(form.get("shipmentId") ?? "");
    const file = form.get("file");
    if (!shipmentId || !(file instanceof File))
      return jsonError("Choose a shipment and a document.");
    if (file.size > 10 * 1024 * 1024)
      return jsonError("Documents must be 10 MB or smaller.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      return jsonError("Upload a PDF, JPEG, or PNG file.");
    const ref = db.collection("shipments").doc(shipmentId);
    const snap = await ref.get();
    if (!snap.exists) return jsonError("Shipment not found.", 404);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    const path = `newlogi/shipments/${shipmentId}/${randomUUID()}-${safeName}`;
    await storage
      .bucket()
      .file(path)
      .save(Buffer.from(await file.arrayBuffer()), {
        metadata: {
          contentType: file.type,
          metadata: { uploadedBy: user.uid },
        },
      });
    const document = {
      path,
      name: safeName,
      contentType: file.type,
      size: file.size,
      visibleToCustomer: form.get("visibleToCustomer") === "true",
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.uid,
    };
    await ref.update({
      documents: [
        ...(Array.isArray(snap.data()?.documents)
          ? snap.data()!.documents
          : []),
        document,
      ],
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, document }, { status: 201 });
  } catch {
    return jsonError("Unable to upload document.", 500);
  }
}
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !db || !storage)
    return jsonError("Please sign in to download this document.", 401);
  const path = request.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("newlogi/shipments/"))
    return jsonError("Document not found.", 404);
  try {
    const shipmentId = path.split("/")[2];
    const snap = await db.collection("shipments").doc(shipmentId).get();
    if (!snap.exists) return jsonError("Document not found.", 404);
    const shipment = snap.data()!;
    const owned = shipment.customerId === user.uid;
    const staff = can(user, "shipments.read");
    const document = (shipment.documents ?? []).find(
      (d: Record<string, unknown>) => d.path === path,
    );
    if (
      !document ||
      (!owned && !staff) ||
      (owned && document.visibleToCustomer !== true && !staff)
    )
      return jsonError("You don't have access to this document.", 403);
    const [url] = await storage
      .bucket()
      .file(path)
      .getSignedUrl({ action: "read", expires: Date.now() + 10 * 60 * 1000 });
    return NextResponse.redirect(url);
  } catch {
    return jsonError("Unable to create a secure download link.", 500);
  }
}
