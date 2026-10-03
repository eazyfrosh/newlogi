import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { TrackingForm } from "@/components/tracking-form";
export const metadata: Metadata = { title: "Track a shipment" };
export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number = "" } = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Track a shipment
          </div>
          <h1>Know where things stand.</h1>
          <p>
            Enter your tracking number to view confirmed shipment updates posted
            by our team.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap track-layout">
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 23,
                letterSpacing: "-.8px",
                marginTop: 0,
              }}
            >
              Track your shipment
            </h2>
            <p style={{ fontSize: 12, color: "#75818e", marginBottom: 19 }}>
              Your tracking number is in the shipment confirmation shared by
              your NewLogi contact.
            </p>
            <TrackingForm initialNumber={number} />
            <div className="info-callout">
              <strong>Updates come from our operations team.</strong> Events
              show when we confirm a shipment milestone. Estimated delivery
              dates are planning estimates and are not confirmed events.
            </div>
          </div>
          <div className="service-detail-card">
            <ShieldCheck size={25} color="#f47737" />
            <h3>Your information stays private.</h3>
            <p>
              Public tracking shows shipment progress, service, and the route at
              a city level. It never displays contact details, full addresses,
              private documents, or internal notes.
            </p>
            <p>
              Need help? <Link href="/contact">Contact our team</Link> with your
              tracking number.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
