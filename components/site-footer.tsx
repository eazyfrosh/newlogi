import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark">N</span>
            <span>
              newlogi<span className="brand-dot">.</span>
            </span>
          </Link>
          <p>Thoughtful logistics for a world that keeps moving.</p>
        </div>
        <div className="footer-col">
          <h3>Explore</h3>
          <Link href="/about">About us</Link>
          <Link href="/services">Our services</Link>
          <Link href="/faq">FAQs</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <h3>Move with us</h3>
          <Link href="/track">Track a shipment</Link>
          <Link href="/quote">Request a quote</Link>
          <Link href="/login">Customer login</Link>
          <Link href="/admin">Team portal</Link>
        </div>
        <div className="footer-callout">
          <span className="eyebrow eyebrow-orange">A better way to move</span>
          <p>Let’s get your next shipment moving.</p>
          <Link href="/quote">
            Start a conversation <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} NewLogi Logistics. All rights reserved.
        </span>
        <div>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <span>Built to move you forward.</span>
        </div>
      </div>
    </footer>
  );
}
