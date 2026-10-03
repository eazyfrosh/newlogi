import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { getServiceContent, defaultServices } from "@/lib/service-content";
export const dynamic = "force-dynamic";
export function generateStaticParams() {
  return defaultServices.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceContent(slug);
  return { title: service?.title ?? "Service" };
}
export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getServiceContent(slug);
  if (!item) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight />
            <Link href="/services">Services</Link>
            <ArrowRight />
            {item.title}
          </div>
          <span className="eyebrow eyebrow-orange" style={{ marginTop: 33 }}>
            {item.tag}
          </span>
          <h1>{item.title}.</h1>
          <p>{item.intro}</p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap service-detail-grid">
          <div>
            <span className="eyebrow eyebrow-orange">
              A THOUGHTFUL APPROACH
            </span>
            <h2>
              Know what to expect
              <br />
              at every handover.
            </h2>
            <p>
              Every shipment is different. We start with the details that shape
              the right plan, then keep communication clear as the service is
              arranged.
            </p>
            <ul>
              {item.details.map((text) => (
                <li
                  key={text}
                  style={{ display: "flex", alignItems: "start", gap: 9 }}
                >
                  <Check
                    size={16}
                    color="#f47737"
                    style={{ flexShrink: 0, marginTop: 4 }}
                  />
                  {text}
                </li>
              ))}
            </ul>
            <Link className="button button-orange" href="/quote">
              Request a tailored quote <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="service-detail-card">
            <span className="eyebrow eyebrow-orange">A GOOD FIT FOR</span>
            <h3>Could this work for you?</h3>
            {item.goodFor.map((text) => (
              <p
                key={text}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #e5e6e3",
                  color: "#586674",
                }}
              >
                <Check
                  size={15}
                  color="#f47737"
                  style={{ verticalAlign: "middle", marginRight: 9 }}
                />
                {text}
              </p>
            ))}
            <p style={{ fontSize: 10, marginTop: 20 }}>
              Availability, transit times, and service options depend on the
              route and shipment details. We’ll confirm these before your
              shipment is booked.
            </p>
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="wrap closing-inner">
          <div>
            <span className="eyebrow eyebrow-orange">
              NEED A HAND WITH THE DETAILS?
            </span>
            <h2>
              Let’s work out
              <br />
              <em>the right plan.</em>
            </h2>
          </div>
          <Link className="button button-orange" href="/quote">
            Tell us about your shipment <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
