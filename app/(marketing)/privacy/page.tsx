import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata: Metadata = { title: "Privacy policy" };
export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Privacy Policy
          </div>
          <h1>
            Your information
            <br />
            deserves care.
          </h1>
          <p>Last updated 3 October 2026</p>
        </div>
      </section>
      <section className="content-section">
        <article className="content-narrow article-content">
          <p>
            This policy describes how NewLogi uses information submitted through
            this website and its customer tools. We collect only what we need to
            respond to an inquiry, provide or coordinate a logistics service,
            secure accounts, and improve the way our services work.
          </p>
          <h2>Information we collect</h2>
          <p>
            Depending on how you use our services, this may include your name,
            business contact details, account credentials handled by our
            authentication provider, shipment origin and destination, package
            details, shipment references, quote information, support messages,
            and documents you choose to provide.
          </p>
          <h2>How we use information</h2>
          <ul>
            <li>
              To review and respond to quote, contact, booking, and pickup
              requests.
            </li>
            <li>
              To coordinate shipments, communicate confirmed events, and provide
              account features.
            </li>
            <li>
              To maintain security, prevent misuse, and meet applicable
              recordkeeping obligations.
            </li>
            <li>
              To send transactional messages related to a request or service.
            </li>
          </ul>
          <h2>Sharing and service providers</h2>
          <p>
            We share relevant information with the service providers and parties
            needed to review, coordinate, or deliver a requested logistics
            service, and with technology providers that operate authentication,
            database, storage, hosting, and email services on our behalf. We do
            not publish private shipment details on public tracking pages.
          </p>
          <h2>Retention and security</h2>
          <p>
            We retain information for as long as needed for the purpose it was
            collected, to support an active service, or to meet legal and
            operational obligations. We use access controls designed to restrict
            customer and staff information to authorized people. No online
            system can guarantee absolute security.
          </p>
          <h2>Your choices</h2>
          <p>
            You may contact us to ask about the personal information associated
            with your account or inquiry, request a correction, or raise a
            privacy concern. Some information may need to be retained while a
            service or legal obligation remains active.
          </p>
          <h2>Contact</h2>
          <p>
            For privacy questions, please{" "}
            <Link href="/contact">contact our team</Link>. We will route your
            request to the appropriate person.
          </p>
        </article>
      </section>
    </>
  );
}
