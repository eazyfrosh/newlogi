import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  MessageCircle,
  NotebookPen,
} from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
export const metadata: Metadata = { title: "Request a quote" };
export default function QuotePage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Request a quote
          </div>
          <h1>
            Let’s talk about
            <br />
            your next shipment.
          </h1>
          <p>
            Share a few details and our team will review the right options for
            your cargo, route, and timing.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap quote-page">
          <aside className="quote-aside">
            <span className="eyebrow eyebrow-orange">
              A GOOD PLAN STARTS HERE
            </span>
            <h2>
              Useful details in.
              <br />A clearer quote out.
            </h2>
            <p>
              Tell us what you’re moving and where it needs to go. A member of
              our team will look at your request and follow up to discuss the
              best fit.
            </p>
            <ul>
              <li>
                <Check />
                No obligation to book
              </li>
              <li>
                <Clock3 />
                We’ll follow up after review
              </li>
              <li>
                <MessageCircle />
                Ask us about special handling
              </li>
              <li>
                <NotebookPen />
                No instant, unverified prices
              </li>
            </ul>
            <p>
              Already have an account?{" "}
              <Link href="/login">Sign in to your dashboard</Link>.
            </p>
          </aside>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}
