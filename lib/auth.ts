import "server-only";
import { cookies } from "next/headers";
import { adminAuth, db } from "@/lib/firebase-admin";

export type Role = "super_admin" | "operations" | "support" | "customer";
export type SessionUser = {
  uid: string;
  email: string;
  name: string;
  role: Role;
};

export const permissions: Record<Role, string[]> = {
  super_admin: [
    "dashboard.read",
    "shipments.read",
    "shipments.write",
    "quotes.read",
    "quotes.write",
    "customers.read",
    "staff.write",
    "invoices.read",
    "invoices.write",
    "support.read",
    "support.write",
    "content.write",
  ],
  operations: [
    "dashboard.read",
    "shipments.read",
    "shipments.write",
    "quotes.read",
    "quotes.write",
    "customers.read",
    "invoices.read",
    "support.read",
  ],
  support: [
    "dashboard.read",
    "shipments.read",
    "quotes.read",
    "customers.read",
    "support.read",
    "support.write",
  ],
  customer: [],
};

export async function getSession(): Promise<SessionUser | null> {
  if (!adminAuth || !db) return null;
  const cookieStore = await cookies();
  const session = cookieStore.get("newlogi_session")?.value;
  if (!session) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const snap = await db.collection("users").doc(decoded.uid).get();
    if (!snap.exists || snap.data()?.suspended) return null;
    const data = snap.data()!;
    return {
      uid: decoded.uid,
      email: String(decoded.email ?? ""),
      name: String(data.name ?? decoded.name ?? "Customer"),
      role: (data.role ?? "customer") as Role,
    };
  } catch {
    return null;
  }
}

export function can(user: SessionUser, permission: string) {
  return permissions[user.role]?.includes(permission) ?? false;
}
