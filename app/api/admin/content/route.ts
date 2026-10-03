import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { defaultServices } from "@/lib/service-content";
import { jsonError } from "@/lib/http";
export const runtime = "nodejs";
export async function GET() {
  const user = await getSession();
  if (!user || user.role !== "super_admin")
    return jsonError(
      "Only a super admin can edit public service content.",
      403,
    );
  const rows = await Promise.all(
    defaultServices.map(async (base) => {
      const snap = await db?.collection("services").doc(base.slug).get();
      return snap?.exists ? { ...base, ...snap.data(), slug: base.slug } : base;
    }),
  );
  return NextResponse.json({ services: rows });
}
export async function PUT(request: NextRequest) {
  const user = await getSession();
  if (!user || user.role !== "super_admin")
    return jsonError(
      "Only a super admin can edit public service content.",
      403,
    );
  if (!db) return jsonError("Database is not configured.", 503);
  try {
    const body = await request.json();
    const base = defaultServices.find((item) => item.slug === body.slug);
    if (!base) return jsonError("Unknown service page.");
    const title = String(body.title ?? "")
      .trim()
      .slice(0, 100);
    const tag = String(body.tag ?? "")
      .trim()
      .slice(0, 100);
    const intro = String(body.intro ?? "")
      .trim()
      .slice(0, 1500);
    if (!title || !tag || !intro)
      return jsonError("Title, label, and description are required.");
    const details = Array.isArray(body.details)
      ? body.details.slice(0, 8).map((s: unknown) => String(s).slice(0, 300))
      : base.details;
    const goodFor = Array.isArray(body.goodFor)
      ? body.goodFor.slice(0, 8).map((s: unknown) => String(s).slice(0, 150))
      : base.goodFor;
    await db
      .collection("services")
      .doc(base.slug)
      .set(
        {
          slug: base.slug,
          title,
          tag,
          intro,
          details,
          goodFor,
          active: body.active !== false,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unable to save service content.", 500);
  }
}
