import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
export const metadata: Metadata = { title: "Contact us" };
export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Contact
          </div>
          <h1>
            We’re here to
            <br />
            make things clearer.
          </h1>
          <p>
            Tell us what you need help with. A member of our team will read your
            message and get back to you.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap contact-grid">
          <aside>
            <span className="eyebrow eyebrow-orange">GET IN TOUCH</span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 27,
                letterSpacing: "-1px",
              }}
            >
              Start a conversation.
            </h2>
            <p style={{ fontSize: 12, color: "#75818e" }}>
              For shipment updates, include your tracking number. For a new
              move, our quote form collects the details we need to explore
              options with you.
            </p>
            <div className="contact-detail">
              <small>GENERAL ENQUIRIES</small>
              <strong>Use the enquiry form on this page</strong>
            </div>
            <div className="contact-detail">
              <small>QUOTE REQUESTS</small>
              <strong>
                <Link href="/quote">
                  Tell us about your shipment <ArrowRight size={14} />
                </Link>
              </strong>
            </div>
            <div className="contact-detail">
              <small>EXISTING SHIPMENT</small>
              <strong>
                <Link href="/track">
                  Track shipment <ArrowRight size={14} />
                </Link>
              </strong>
            </div>
            <p style={{ fontSize: 9, color: "#8a959e" }}>
              Email shown is a placeholder. Configure your public contact
              address before launch.
            </p>
          </aside>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
