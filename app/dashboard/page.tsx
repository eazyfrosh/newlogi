import type { Metadata } from "next";
import { CustomerPortal } from "@/components/portal";
export const metadata: Metadata = { title: "Customer dashboard" };
export default function DashboardPage() {
  return <CustomerPortal />;
}
