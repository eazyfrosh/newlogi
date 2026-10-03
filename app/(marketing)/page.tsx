import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  ChevronRight,
  CircleHelp,
  Compass,
  Globe2,
  PackageCheck,
  Plane,
  Route,
  Ship,
  Sparkles,
  Warehouse,
  Truck,
} from "lucide-react";
import { TrackingForm } from "@/components/tracking-form";

const services = [
  {
    icon: Plane,
    title: "Air freight",
    tag: "WHEN EVERY HOUR COUNTS",
    text: "Time-sensitive cargo, carefully coordinated from pickup to handover.",
    href: "/services/air-freight",
  },
  {
    icon: Ship,
    title: "Sea freight",
    tag: "ROOM TO MOVE",
    text: "Flexible container and consolidation options for larger shipments.",
    href: "/services/sea-freight",
  },
  {
    icon: Truck,
    title: "Road freight",
    tag: "THE LAST MILE & BEYOND",
    text: "Reliable road transport, with the right vehicle for the job.",
    href: "/services/road-freight",
  },
];
export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              LOGISTICS, WITH A HUMAN TOUCH
            </div>
            <h1>
              Moving business
              <br />
              forward<span className="orange-period">.</span>
            </h1>
            <p className="hero-lede">
              From the first mile to the final handover, we make complex
              logistics feel clear, connected, and considered.
            </p>
            <div className="hero-actions">
              <Link className="button button-orange" href="/quote">
                Plan a shipment <ArrowUpRight size={17} />
              </Link>
              <Link className="hero-link" href="/services">
                Explore what we do <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-note">
              <span className="note-avatars">
                <i>N</i>
                <i>+</i>
              </span>
              <span>A dedicated team, at every step</span>
            </div>
          </div>
          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="hero-card-top">
                <span className="hero-card-mark">
                  <PackageCheck size={18} />
                </span>
                <span className="live-label">
                  <i /> TRACK WITH CONFIDENCE
                </span>
              </div>
              <p className="hero-card-title">
                Your shipment,
                <br />
                <em>in focus.</em>
              </p>
              <p className="hero-card-desc">
                Get a clear view of the latest updates from our team.
              </p>
              <TrackingForm compact />
              <Link className="hero-card-foot" href="/track">
                How shipment tracking works <ArrowRight size={14} />
              </Link>
            </div>
            <div className="hero-stamp">
              <span>
                BUILT AROUND
                <br />
                YOUR BUSINESS
              </span>
              <span className="stamp-star">✳</span>
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#approach">
          <ArrowDown size={15} /> SCROLL TO DISCOVER
        </a>
      </section>
      <section className="trust-strip">
        <div className="wrap trust-inner">
          <span>
            ONE PARTNER.
            <br />
            <strong>THE WHOLE JOURNEY.</strong>
          </span>
          <div>
            <Globe2 />
            <span>
              Global freight
              <br />
              coordination
            </span>
          </div>
          <div>
            <Route />
            <span>
              End-to-end
              <br />
              visibility
            </span>
          </div>
          <div>
            <Sparkles />
            <span>
              Service shaped
              <br />
              around you
            </span>
          </div>
          <span className="trust-quote">
            Logistics should make things simpler.
            <br />
            <strong>That’s where we start.</strong>
          </span>
        </div>
      </section>
      <section className="section approach-section" id="approach">
        <div className="wrap approach-grid">
          <div className="section-intro">
            <span className="eyebrow eyebrow-orange">
              A CLEARER WAY TO MOVE
            </span>
            <h2>
              Good logistics
              <br />
              is a <em>business advantage.</em>
            </h2>
            <p>
              It’s more than getting a shipment from A to B. It’s about the
              planning, the people, and the small details that help your
              business keep its promises.
            </p>
            <Link className="text-link" href="/about">
              Get to know us <ArrowRight size={15} />
            </Link>
          </div>
          <div className="approach-photo">
            <div className="photo-caption">
              <span>01 / 03</span>
              <span>Built on good communication</span>
            </div>
          </div>
          <div className="approach-aside">
            <span className="aside-number">01</span>
            <h3>
              One team.
              <br />
              The whole way.
            </h3>
            <p>
              Your point of contact stays close, coordinating the moving parts
              and keeping you informed.
            </p>
            <Link href="/about" aria-label="Read about our approach">
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="section services-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="eyebrow eyebrow-orange">WHAT WE CAN MOVE</span>
              <h2>
                Practical solutions.
                <br />
                <em>Thoughtful delivery.</em>
              </h2>
            </div>
            <Link className="button button-outline" href="/services">
              All services <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="service-grid">
            {services.map(({ icon: Icon, title, tag, text, href }, i) => (
              <Link className="service-card" key={title} href={href}>
                <div className="service-card-top">
                  <span className="service-number">0{i + 1}</span>
                  <span className="service-icon">
                    <Icon size={22} />
                  </span>
                </div>
                <span className="eyebrow eyebrow-muted">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="service-arrow">
                  <ArrowUpRight size={19} />
                </span>
              </Link>
            ))}
          </div>
          <div className="service-extras">
            <span>AND THERE’S MORE</span>
            <Link href="/services/express-delivery">
              Express delivery <ChevronRight />
            </Link>
            <Link href="/services/warehousing">
              Warehousing <ChevronRight />
            </Link>
            <Link href="/services/customs-clearance">
              Customs clearance <ChevronRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="feature-band">
        <div className="feature-map" />
        <div className="wrap feature-grid">
          <div className="feature-copy">
            <span className="eyebrow eyebrow-orange">
              MADE FOR YOUR NEXT CHAPTER
            </span>
            <h2>
              Room to grow.
              <br />
              <em>Space to think.</em>
            </h2>
            <p>
              Scaling up, entering a new market, or finding a better way to do
              what you already do? We help build a logistics plan that fits
              where you’re going.
            </p>
            <Link className="button button-orange" href="/quote">
              Let’s plan your next move <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="feature-list">
            <div>
              <span>
                <Boxes />
              </span>
              <div>
                <h3>Built to fit</h3>
                <p>Services shaped around your cargo, schedule, and goals.</p>
              </div>
              <b>01</b>
            </div>
            <div>
              <span>
                <Compass />
              </span>
              <div>
                <h3>Clarity at every stage</h3>
                <p>Direct updates from people who know your shipment.</p>
              </div>
              <b>02</b>
            </div>
            <div>
              <span>
                <Warehouse />
              </span>
              <div>
                <h3>Ready for what’s next</h3>
                <p>Support that can adapt as your business changes.</p>
              </div>
              <b>03</b>
            </div>
          </div>
        </div>
      </section>
      <section className="section faq-preview">
        <div className="wrap faq-preview-grid">
          <div>
            <span className="eyebrow eyebrow-orange">A FEW GOOD QUESTIONS</span>
            <h2>
              Before you
              <br />
              <em>get moving.</em>
            </h2>
            <Link className="text-link" href="/faq">
              Visit the help centre <ArrowRight size={16} />
            </Link>
          </div>
          <div className="faq-teasers">
            <Link href="/faq">
              <span>How do I get a shipping quote?</span>
              <CircleHelp />
              <ChevronRight />
            </Link>
            <Link href="/faq">
              <span>How can I follow my shipment?</span>
              <CircleHelp />
              <ChevronRight />
            </Link>
            <Link href="/faq">
              <span>When will my shipment arrive?</span>
              <CircleHelp />
              <ChevronRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="wrap closing-inner">
          <div>
            <span className="eyebrow eyebrow-orange">
              YOUR NEXT MOVE STARTS HERE
            </span>
            <h2>
              Let’s move something
              <br />
              <em>good forward.</em>
            </h2>
          </div>
          <Link className="button button-orange" href="/quote">
            Talk to our team <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
