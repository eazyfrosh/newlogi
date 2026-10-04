import { head } from "@vercel/blob";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError("You don't have permission to upload shipment documents.", 403);
  if (!db) return jsonError("Database is not configured.", 503);

  try {
    const body = await request.json();
    const shipmentId = String(body.shipmentId ?? "");
    const path = String(body.path ?? "");
    const name = String(body.name ?? "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 100);
    const prefix = `newlogi/shipments/${shipmentId}/`;
    const basename = path.startsWith(prefix) ? path.slice(prefix.length) : "";
    if (
      !shipmentId ||
      !name ||
      !basename.endsWith(`-${name}`) ||
      !/^[\w-]{36}-/.test(basename) ||
      basename.includes("..")
    )
      return jsonError("Invalid uploaded document.");

    const shipmentRef = db.collection("shipments").doc(shipmentId);
    const shipment = await shipmentRef.get();
    if (!shipment.exists) return jsonError("Shipment not found.", 404);

    const stored = await head(path);
    if (
      stored.pathname !== path ||
      stored.size <= 0 ||
      stored.size > MAX_SIZE ||
      !ALLOWED_TYPES.includes(stored.contentType)
    )
      return jsonError("The uploaded file did not pass validation.", 400);

    const document = {
      path: stored.pathname,
      storageProvider: "vercel-blob",
      name,
      contentType: stored.contentType,
      size: stored.size,
      visibleToCustomer: body.visibleToCustomer === true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.uid,
    };
    await shipmentRef.update({
      documents: FieldValue.arrayUnion(document),
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, document }, { status: 201 });
  } catch {
    return jsonError("Unable to attach the uploaded file to this shipment.", 500);
  }
}
