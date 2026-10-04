import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const PATH_PREFIX = "newlogi/shipments/";

export async function POST(request: NextRequest) {
  const database = db;
  if (!database) return jsonError("Database is not configured.", 503);

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return jsonError("Invalid Blob upload request.");
  }

  const isTokenRequest = body.type === "blob.generate-client-token";
  const user = isTokenRequest ? await getSession() : null;
  if (isTokenRequest && (!user || !can(user, "shipments.write")))
    return jsonError("You don't have permission to upload shipment documents.", 403);

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!user) throw new Error("Please sign in to upload this document.");
        if (!clientPayload || clientPayload.length > 1024)
          throw new Error("Invalid upload details.");

        const client = JSON.parse(clientPayload) as {
          shipmentId?: unknown;
          name?: unknown;
        };
        const shipmentId = String(client.shipmentId ?? "");
        const name = String(client.name ?? "")
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .slice(0, 100);
        const prefix = `${PATH_PREFIX}${shipmentId}/`;
        const basename = pathname.startsWith(prefix)
          ? pathname.slice(prefix.length)
          : "";

        if (
          !shipmentId ||
          !name ||
          !basename.endsWith(`-${name}`) ||
          !/^[\w-]{36}-/.test(basename) ||
          basename.includes("..")
        )
          throw new Error("Invalid upload path.");

        const shipment = await database
          .collection("shipments")
          .doc(shipmentId)
          .get();
        if (!shipment.exists) throw new Error("Shipment not found.");

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: false,
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to process Blob upload.",
      400,
    );
  }
}
