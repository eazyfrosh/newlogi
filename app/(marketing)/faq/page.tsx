import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata: Metadata = { title: "Frequently asked questions" };
const questions = [
  [
    "How do I request a shipping quote?",
    "Use our quote form to tell us about the shipment, route, and service you have in mind. The team reviews each request and follows up with a tailored quote. We don’t display an instant price without a configured rate that can calculate it.",
  ],
  [
    "How can I track my shipment?",
    "Enter the tracking number shared by your NewLogi contact on the Track page. Shipment updates are added by authorized staff when a milestone is confirmed.",
  ],
  [
    "Why has my tracking status not changed?",
    "Not every part of a journey produces an immediate event. Tracking reflects updates posted by the operations team. Contact us with your tracking number if you need more information.",
  ],
  [
    "Are estimated delivery dates guaranteed?",
    "No. An estimated delivery date is a planning estimate and may change as the shipment progresses. Confirmed tracking events are shown separately in the timeline.",
  ],
  [
    "What information should I include in a quote request?",
    "Include origin, destination, package count, weight, dimensions, shipment type, preferred service, and any handling or timing requirements you know.",
  ],
  [
    "Can I make a pickup or booking request online?",
    "Yes. Registered customers can submit booking and pickup requests from their dashboard. Requests remain pending until an administrator confirms them.",
  ],
  [
    "How do customs requirements work?",
    "Requirements depend on the route and contents. We can help coordinate documentation and clearance steps, and will let you know what information is needed for your shipment.",
  ],
  [
    "How do I get help with an existing shipment?",
    "Contact the team through the Contact page with your tracking number or sign in to your dashboard to view your shipments and submit a support request.",
  ],
];
export default function FaqPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> FAQs
          </div>
          <h1>
            A few answers,
            <br />
            before you ask.
          </h1>
          <p>
            Some of the common questions we hear about quotes, tracking, and
            getting a shipment on its way.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="content-narrow">
          {questions.map(([q, a]) => (
            <article className="faq-item" key={q}>
              <h2>{q}</h2>
              <p>{a}</p>
            </article>
          ))}
          <div className="info-callout">
            Didn’t find what you need?{" "}
            <Link href="/contact">Send us a message</Link> and we’ll point you
            in the right direction.
          </div>
        </div>
      </section>
    </>
  );
}
