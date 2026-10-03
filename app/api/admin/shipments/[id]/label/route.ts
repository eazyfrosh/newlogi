import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user || !can(user, "shipments.read"))
    return jsonError("Administrator access is required.", 403);
  if (!db) return jsonError("Database is not configured.", 503);
  const { id } = await context.params;
  const snap = await db.collection("shipments").doc(id).get();
  if (!snap.exists) return jsonError("Shipment not found.", 404);
  const s = snap.data()!;
  const origin = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const trackUrl = `${origin}/track?number=${encodeURIComponent(String(s.trackingNumber))}`;
  const qr = await QRCode.toString(trackUrl, {
    type: "svg",
    width: 136,
    margin: 1,
  });
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Shipping label ${esc(s.trackingNumber)}</title><style>@page{size:4in 6in;margin:0}*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#10243f;margin:0;padding:25px}.label{border:2px solid #10243f;height:100%;padding:22px;display:flex;flex-direction:column}.brand{font-size:20px;font-weight:700}.brand b{background:#f47737;color:white;padding:6px 10px;border-radius:4px;margin-right:8px}.meta{border-top:1px solid #ccd3d9;border-bottom:1px solid #ccd3d9;margin:18px 0;padding:12px 0}.route{font-size:21px;font-weight:bold;margin:9px 0}.route span{color:#f47737}.qr{display:flex;justify-content:center;margin:auto}.tracking{font-size:20px;font-weight:bold;letter-spacing:2px;text-align:center}.small{color:#687887;font-size:10px;letter-spacing:1px}.print{position:fixed;bottom:10px;right:10px}@media print{.print{display:none}}</style></head><body><article class="label"><div class="brand"><b>N</b>newlogi<span style="color:#f47737">.</span></div><div class="meta"><div class="small">SHIP TO</div><div class="route">${esc(s.destinationCity ?? s.destination)}</div><div>${esc(s.customerName)}</div></div><div class="small">ORIGIN</div><div>${esc(s.originCity ?? s.origin)}</div><div class="meta"><div class="small">SERVICE · PACKAGES · WEIGHT</div><div style="margin-top:8px">${esc(s.service)} · ${esc(s.packageCount ?? "—")} · ${esc(s.weight ?? "—")}</div></div><div class="qr">${qr}</div><div class="tracking">${esc(s.trackingNumber)}</div><div class="small" style="text-align:center;margin-top:8px">Scan to view shipment updates</div></article><button class="print" onclick="window.print()">Print label</button></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
