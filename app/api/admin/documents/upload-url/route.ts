import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { storage } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user || !can(user, "shipments.write"))
    return jsonError(
      "You don't have permission to upload shipment documents.",
      403,
    );
  if (!storage) return jsonError("Firebase Storage is not configured.", 503);
  try {
    const body = await request.json();
    const shipmentId = String(body.shipmentId ?? "");
    const name = String(body.name ?? "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 100);
    const contentType = String(body.contentType ?? "");
    const size = Number(body.size);
    if (!shipmentId || !name)
      return jsonError("Choose a shipment and a filename.");
    if (!Number.isFinite(size) || size <= 0 || size > 10 * 1024 * 1024)
      return jsonError("Documents must be 10 MB or smaller.");
    if (!["application/pdf", "image/jpeg", "image/png"].includes(contentType))
      return jsonError("Upload a PDF, JPEG, or PNG file.");
    const path = `newlogi/shipments/${shipmentId}/${randomUUID()}-${name}`;
    const [uploadUrl] = await storage
      .bucket()
      .file(path)
      .getSignedUrl({
        action: "write",
        expires: Date.now() + 10 * 60 * 1000,
        contentType,
      });
    return NextResponse.json({ uploadUrl, path, name, contentType, size });
  } catch {
    return jsonError("Unable to prepare a secure upload.", 500);
  }
}
