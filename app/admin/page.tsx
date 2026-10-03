import type { Metadata } from "next";
import { AdminPortal } from "@/components/portal";
export const metadata: Metadata = { title: "Admin portal" };
export default function AdminPage() {
  return <AdminPortal />;
}
