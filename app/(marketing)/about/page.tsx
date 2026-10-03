import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Handshake,
  Lightbulb,
  MoveUpRight,
  PackageCheck,
} from "lucide-react";
export const metadata: Metadata = { title: "About us" };
export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <MoveUpRight /> About
          </div>
          <h1>
            Good logistics starts
            <br />
            with good people.
          </h1>
          <p>
            We bring clear communication and considered planning to the work of
            moving things — so you can focus on moving your business forward.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap approach-grid">
          <div className="section-intro">
            <span className="eyebrow eyebrow-orange">WHY NEWLOGI</span>
            <h2>
              A steady hand
              <br />
              for a <em>moving world.</em>
            </h2>
            <p>
              Supply chains can be complicated. We believe working with your
              logistics partner should feel straightforward. That means asking
              better questions, staying close to every shipment, and being clear
              about what happens next.
            </p>
            <Link className="text-link" href="/services">
              See how we help <ArrowRight size={15} />
            </Link>
          </div>
          <div className="approach-photo" />
          <div className="approach-aside">
            <span className="aside-number">01</span>
            <h3>
              People first.
              <br />
              Always.
            </h3>
            <p>
              Real communication, practical advice, and accountability from a
              team that cares about getting the details right.
            </p>
          </div>
        </div>
      </section>
      <section className="section services-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow eyebrow-orange">HOW WE WORK</span>
              <h2>
                Three things we
                <br />
                <em>keep in motion.</em>
              </h2>
            </div>
          </div>
          <div className="service-grid">
            {[
              [
                Compass,
                "Stay curious",
                "We learn how your business works before recommending how your freight should move.",
              ],
              [
                Handshake,
                "Work as one team",
                "The best outcomes come from clear handovers and a shared view of what matters.",
              ],
              [
                PackageCheck,
                "Follow through",
                "We stay accountable, give timely updates, and help resolve the bumps along the way.",
              ],
              [
                Lightbulb,
                "Keep improving",
                "We look for practical ways to reduce friction as your needs change.",
              ],
            ].map(([Icon, title, body], i) => {
              const I = Icon as typeof Compass;
              return (
                <div className="service-card" key={String(title)}>
                  <div className="service-card-top">
                    <span className="service-number">0{i + 1}</span>
                    <span className="service-icon">
                      <I size={22} />
                    </span>
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="wrap closing-inner">
          <div>
            <span className="eyebrow eyebrow-orange">
              A GOOD PLACE TO START
            </span>
            <h2>
              Tell us where you’re
              <br />
              <em>headed next.</em>
            </h2>
          </div>
          <Link className="button button-orange" href="/quote">
            Talk to our team <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
