import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db, storage } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user || !db)
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
    const document = (
      Array.isArray(shipment.documents) ? shipment.documents : []
    ).find((d: Record<string, unknown>) => d.path === path);
    if (
      !document ||
      (!owned && !staff) ||
      (owned && document.visibleToCustomer !== true && !staff)
    )
      return jsonError("You don't have access to this document.", 403);
    if (document.storageProvider === "vercel-blob") {
      const result = await get(path, { access: "private" });
      if (!result || result.statusCode !== 200)
        return jsonError("Document not found.", 404);
      const name = String(document.name ?? "document")
        .replace(/[\r\n"\\]/g, "_")
        .slice(0, 120);
      return new NextResponse(result.stream, {
        headers: {
          "Content-Type": result.blob.contentType,
          "Content-Disposition": `attachment; filename="${name}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Read-only fallback for files uploaded before the switch to Vercel Blob.
    if (!storage)
      return jsonError("This legacy Firebase Storage file needs migration.", 410);
    const [url] = await storage
      .bucket()
      .file(path)
      .getSignedUrl({ action: "read", expires: Date.now() + 10 * 60 * 1000 });
    return NextResponse.redirect(url);
  } catch {
    return jsonError("Unable to create a secure download link.", 500);
  }
}
