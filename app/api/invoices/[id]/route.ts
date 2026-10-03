import { NextRequest, NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
function pdfEscape(text: string) {
  return text.replace(/[^\x20-\x7e]/g, "?").replace(/([\\()])/g, "\\$1");
}
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return jsonError("Please sign in to download this invoice.", 401);
  if (!db) return jsonError("Database is not configured.", 503);
  const { id } = await context.params;
  const snap = await db.collection("invoices").doc(id).get();
  if (!snap.exists) return jsonError("Invoice not found.", 404);
  const invoice = snap.data()!;
  if (invoice.customerId !== user.uid && !can(user, "invoices.read"))
    return jsonError("You don't have access to this invoice.", 403);
  const lines = [
    "NEWLOGI LOGISTICS",
    "INVOICE",
    `Invoice: ${invoice.number ?? snap.id}`,
    `Issued: ${String(invoice.createdAt ?? "").slice(0, 10)}`,
    `Due: ${invoice.dueDate ?? "Not specified"}`,
    `Bill to: ${invoice.customerName ?? "Customer"}`,
    "",
    ...(
      (invoice.items ?? []) as {
        description: string;
        quantity: number;
        unitPriceCents: number;
      }[]
    ).map(
      (i) =>
        `${i.quantity} x ${i.description}   ${(i.unitPriceCents / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    ),
    "",
    `Subtotal: ${(Number(invoice.subtotalCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Tax (${invoice.taxRate ?? 0}%): ${(Number(invoice.taxCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Discount: -${(Number(invoice.discountCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Invoice total: ${(Number(invoice.totalCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Paid: ${(Number(invoice.paidCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Balance due: ${(Number(invoice.balanceDueCents ?? invoice.totalCents ?? 0) / 100).toFixed(2)} ${invoice.currency ?? "USD"}`,
    `Status: ${invoice.status ?? "unpaid"}`,
    ...(invoice.terms ? ["", `Terms: ${String(invoice.terms)}`] : []),
  ];
  const commands = lines
    .map(
      (line, i) =>
        `BT /F1 ${i === 0 ? 18 : i === 1 ? 14 : 10} Tf 54 ${748 - i * 27} Td (${pdfEscape(line)}) Tj ET`,
    )
    .join("\n");
  const stream = Buffer.from(commands, "ascii");
  const objects = [
    Buffer.from("<< /Type /Catalog /Pages 2 0 R >>"),
    Buffer.from("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    Buffer.from(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    ),
    Buffer.from("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    Buffer.concat([
      Buffer.from(`<< /Length ${stream.length} >>\nstream\n`),
      stream,
      Buffer.from("\nendstream"),
    ]),
  ];
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n")];
  const offsets = [0];
  let length = chunks[0].length;
  objects.forEach((obj, i) => {
    offsets.push(length);
    const part = Buffer.concat([
      Buffer.from(`${i + 1} 0 obj\n`),
      obj,
      Buffer.from("\nendobj\n"),
    ]);
    chunks.push(part);
    length += part.length;
  });
  const xref = length;
  const table = [
    "0000000000 65535 f ",
    ...offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
  ].join("\n");
  chunks.push(
    Buffer.from(
      `xref\n0 ${objects.length + 1}\n${table}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`,
    ),
  );
  return new NextResponse(Buffer.concat(chunks), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${String(invoice.number ?? id).replace(/[^a-zA-Z0-9-]/g, "")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
