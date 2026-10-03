import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Plane,
  Ship,
  Truck,
  PackageCheck,
  Warehouse,
  FileCheck2,
} from "lucide-react";
import { getServicesContent } from "@/lib/service-content";
export const metadata: Metadata = { title: "Services" };
const icons = {
  "air-freight": Plane,
  "sea-freight": Ship,
  "road-freight": Truck,
  "express-delivery": PackageCheck,
  warehousing: Warehouse,
  "customs-clearance": FileCheck2,
};
export const dynamic = "force-dynamic";
export default async function ServicesPage() {
  const items = await getServicesContent();
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href="/">Home</Link>
            <ArrowRight /> Services
          </div>
          <h1>
            Good options.
            <br />
            Clear next steps.
          </h1>
          <p>
            From urgent deliveries to complex freight, find the right way to
            move your shipment with a team that stays close to the details.
          </p>
        </div>
      </section>
      <section className="content-section">
        <div className="wrap">
          <div className="service-grid">
            {items.map((service, i) => {
              const Icon = icons[service.slug as keyof typeof icons];
              return (
                <Link
                  className="service-card"
                  href={`/services/${service.slug}`}
                  key={service.slug}
                >
                  <div className="service-card-top">
                    <span className="service-number">0{i + 1}</span>
                    <span className="service-icon">
                      <Icon size={22} />
                    </span>
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.intro}</p>
                  <span className="service-arrow">
                    <ArrowRight size={18} />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="info-callout">
            Need help deciding? Share what you’re moving, where it needs to go,
            and when it needs to arrive. We’ll review the details and suggest an
            appropriate service — no instant estimate unless we have the
            information to price it responsibly.
          </div>
        </div>
      </section>
    </>
  );
}
