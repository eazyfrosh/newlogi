import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata: Metadata = { title: "Terms and conditions" };
export default function TermsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Terms and Conditions
          </div>
          <h1>Terms and conditions.</h1>
          <p>Last updated 3 October 2026</p>
        </div>
      </section>
      <section className="content-section">
        <article className="content-narrow article-content">
          <p>
            These terms explain the general conditions for using the NewLogi
            website and requesting logistics services. A shipment is subject to
            the service quotation, booking confirmation, and any applicable
            carriage terms provided for that shipment. If those documents differ
            from this summary, the shipment-specific documents govern the
            service.
          </p>
          <h2>Using this website</h2>
          <p>
            You may use this website to learn about services, request a quote,
            track an existing shipment, or access an account. You agree to
            provide accurate information and not misuse the site, attempt
            unauthorized access, or interfere with its operation.
          </p>
          <h2>Quotes and bookings</h2>
          <p>
            A quote request is an inquiry, not a confirmed booking. Prices,
            route availability, transit estimates, and service terms are
            confirmed only in a written quote or booking confirmation. Estimated
            delivery dates are estimates, not guarantees. A booking or pickup
            request submitted in your account remains pending until NewLogi
            confirms it.
          </p>
          <h2>Shipment information</h2>
          <p>
            You are responsible for providing accurate shipment descriptions,
            dimensions, weights, origin and destination details, and any
            relevant handling or documentation requirements. Certain goods may
            be restricted or require special declarations. Do not tender goods
            until the applicable service and requirements have been confirmed.
          </p>
          <h2>Tracking information</h2>
          <p>
            Tracking reflects events recorded by authorized staff or configured
            service integrations. It may not update continuously. Public
            tracking displays only approved shipment information and should not
            be treated as a live location service.
          </p>
          <h2>Accounts and security</h2>
          <p>
            You are responsible for protecting your sign-in credentials and
            notifying us if you believe your account has been accessed without
            permission. We may suspend an account that is compromised, misused,
            or used in breach of these terms.
          </p>
          <h2>Website content and availability</h2>
          <p>
            We work to keep the information on this site current but do not
            warrant that every page is error-free or available at all times.
            Service details are general and do not replace the shipment-specific
            terms provided with a quote or booking.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about these terms or an existing shipment?{" "}
            <Link href="/contact">Contact our team</Link>.
          </p>
        </article>
      </section>
    </>
  );
}
