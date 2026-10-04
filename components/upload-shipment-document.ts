"use client";

import { upload } from "@vercel/blob/client";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export async function uploadShipmentDocument(
  file: File,
  shipmentId: string,
  visibleToCustomer: boolean,
) {
  if (!shipmentId) throw new Error("Choose a shipment first.");
  if (file.size <= 0 || file.size > MAX_SIZE)
    throw new Error("Documents must be 10 MB or smaller.");
  if (!ALLOWED_TYPES.includes(file.type))
    throw new Error("Upload a PDF, JPEG, or PNG file.");

  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const pathname = `newlogi/shipments/${shipmentId}/${crypto.randomUUID()}-${name}`;

  const blob = await upload(pathname, file, {
    access: "private",
    contentType: file.type,
    handleUploadUrl: "/api/admin/documents/upload-url",
    clientPayload: JSON.stringify({ shipmentId, name }),
  });

  const response = await fetch("/api/admin/documents/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shipmentId,
      path: blob.pathname,
      name,
      visibleToCustomer,
    }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? "Unable to attach the uploaded file.");
  return blob;
}
