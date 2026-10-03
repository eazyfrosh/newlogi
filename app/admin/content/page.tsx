import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentAdmin } from "@/components/admin-sections";
export default function AdminContentPage() {
  return (
    <div className="portal">
      <header className="portal-top">
        <Link className="brand" href="/">
          <span className="brand-mark">N</span>
          <span>
            newlogi<span className="brand-dot">.</span>
          </span>
        </Link>
        <Link className="text-link" href="/admin">
          <ArrowLeft size={14} /> Back to operations
        </Link>
      </header>
      <main className="portal-main">
        <ContentAdmin />
      </main>
    </div>
  );
}
