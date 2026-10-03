import "server-only";
import { db } from "@/lib/firebase-admin";
export type ServiceContent = {
  slug: string;
  title: string;
  tag: string;
  intro: string;
  details: string[];
  goodFor: string[];
};
export const defaultServices: ServiceContent[] = [
  {
    slug: "air-freight",
    title: "Air freight",
    tag: "WHEN TIMING MATTERS",
    intro:
      "When a shipment needs to cross distance quickly, a thoughtful air freight plan can make all the difference. We coordinate the moving parts, keep communication close, and help make each handover clear.",
    details: [
      "Options matched to the shipment’s urgency and handling needs.",
      "Coordination from collection through to destination handover.",
      "Clear updates as milestones are confirmed by the team.",
    ],
    goodFor: [
      "Time-sensitive cargo",
      "High-value or specialist goods",
      "Smaller consignments with a tight schedule",
    ],
  },
  {
    slug: "sea-freight",
    title: "Sea freight",
    tag: "ROOM TO MOVE",
    intro:
      "For larger volumes and carefully planned schedules, sea freight can be a practical way to move goods across borders. We’ll help consider container and consolidation options around your cargo.",
    details: [
      "Full-container and shared-space options, subject to route and availability.",
      "Coordination of key documentation and handovers.",
      "A plan that balances timing, cargo requirements, and cost considerations.",
    ],
    goodFor: [
      "Large or heavy shipments",
      "Planned replenishment",
      "Cargo that benefits from consolidated transport",
    ],
  },
  {
    slug: "road-freight",
    title: "Road freight",
    tag: "CONNECTED BY ROAD",
    intro:
      "Road transport links suppliers, facilities, and customers. We plan the movement around your shipment requirements, while the operations team keeps you informed as the cargo progresses.",
    details: [
      "Transport options suited to shipment size and handling needs.",
      "Collection and delivery coordination.",
      "Updates provided as confirmed by the team.",
    ],
    goodFor: [
      "Regional transport",
      "Facility-to-facility movements",
      "First and final mile coordination",
    ],
  },
  {
    slug: "express-delivery",
    title: "Express delivery",
    tag: "PRIORITY HANDLING",
    intro:
      "Some shipments need extra focus. Express delivery gives urgent consignments a clearly managed path, with practical planning and communication at the moments that matter.",
    details: [
      "Priority planning based on actual service availability.",
      "Clear expectations before a shipment is confirmed.",
      "Direct communication when circumstances change.",
    ],
    goodFor: [
      "Urgent documents or parcels",
      "Time-sensitive business materials",
      "Shipments with a defined deadline",
    ],
  },
  {
    slug: "warehousing",
    title: "Warehousing",
    tag: "FLEXIBLE SPACE",
    intro:
      "Storage and fulfilment can be an important part of a supply chain. We can discuss the space, handling, and inventory support that may fit your operation.",
    details: [
      "Storage requirements discussed around your goods.",
      "Support with inbound and outbound handovers.",
      "Options explored based on location and availability.",
    ],
    goodFor: [
      "Seasonal inventory",
      "Flexible storage needs",
      "Staging goods before onward distribution",
    ],
  },
  {
    slug: "customs-clearance",
    title: "Customs clearance assistance",
    tag: "READY FOR THE DETAILS",
    intro:
      "Cross-border shipments often depend on accurate documentation and coordinated clearance steps. Our team can help you understand the information needed and coordinate the process with the right parties.",
    details: [
      "Guidance on common shipment documentation requirements.",
      "Coordination with the parties involved in clearance.",
      "Updates when clearance information or action is needed.",
    ],
    goodFor: [
      "International shipments",
      "First-time importers and exporters",
      "Shipments needing document coordination",
    ],
  },
];
export async function getServiceContent(slug: string) {
  const fallback = defaultServices.find((item) => item.slug === slug);
  if (!fallback) return null;
  if (!db) return fallback;
  try {
    const snap = await db.collection("services").doc(slug).get();
    if (!snap.exists) return fallback;
    const data = snap.data()!;
    if (data.active === false) return null;
    return { ...fallback, ...data, slug } as ServiceContent;
  } catch {
    return fallback;
  }
}
export async function getServicesContent() {
  return (
    await Promise.all(
      defaultServices.map((item) => getServiceContent(item.slug)),
    )
  ).filter((item): item is ServiceContent => item !== null);
}
