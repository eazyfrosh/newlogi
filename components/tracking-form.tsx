"use client";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, MapPin, PackageCheck, Search } from "lucide-react";
import Link from "next/link";

type Shipment = {
  trackingNumber: string;
  service: string;
  origin: string | null;
  destination: string | null;
  status: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  events: {
    status: string;
    location: string | null;
    description: string;
    timestamp: string;
  }[];
};
export function TrackingForm({
  initialNumber = "",
  compact = false,
}: {
  initialNumber?: string;
  compact?: boolean;
}) {
  const [number, setNumber] = useState(initialNumber);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const track = async (value: string) => {
    const tracking = value.trim().toUpperCase();
    if (!tracking) {
      setMessage("Enter a tracking number to get started.");
      return;
    }
    setBusy(true);
    setMessage("");
    setShipment(null);
    try {
      const response = await fetch(
        `/api/track/${encodeURIComponent(tracking)}`,
      );
      const data = await response.json();
      if (!response.ok)
        setMessage(data.error ?? "We couldn't find that shipment.");
      else setShipment(data.shipment);
    } catch {
      setMessage("Tracking is temporarily unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    if (initialNumber) void track(initialNumber); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNumber]);
  function submit(event: FormEvent) {
    event.preventDefault();
    void track(number);
  }

  return (
    <div className={`tracking-widget ${compact ? "tracking-compact" : ""}`}>
      <form className="tracking-entry" onSubmit={submit}>
        <label htmlFor={compact ? "hero-tracking-number" : "tracking-number"}>
          <span className="tracking-icon">
            <Search size={18} />
          </span>
          <input
            id={compact ? "hero-tracking-number" : "tracking-number"}
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            placeholder="Enter your tracking number"
            autoComplete="off"
          />
        </label>
        <button className="button button-orange" type="submit" disabled={busy}>
          {busy ? "Looking it up…" : "Track shipment"}
          <ArrowRight size={17} />
        </button>
      </form>
      {message && (
        <p className="form-note form-error" role="status">
          {message}
        </p>
      )}
      {shipment && (
        <div className="tracking-result" aria-live="polite">
          <div className="tracking-result-head">
            <span className="status-pill">
              <span />
              {shipment.status}
            </span>
            <span className="tracking-id">{shipment.trackingNumber}</span>
          </div>
          <div className="tracking-route">
            <div>
              <span className="route-dot" />
              <small>FROM</small>
              <strong>{shipment.origin ?? "Origin pending"}</strong>
            </div>
            <div className="route-line" />
            <div>
              <span className="route-dot route-dot-orange" />
              <small>TO</small>
              <strong>{shipment.destination ?? "Destination pending"}</strong>
            </div>
          </div>
          {shipment.estimatedDelivery && (
            <p className="estimate-note">
              Estimated delivery{" "}
              <strong>
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(shipment.estimatedDelivery))}
              </strong>{" "}
              <span>· Estimate, subject to change</span>
            </p>
          )}
          <div className="timeline">
            {shipment.events.length ? (
              shipment.events.map((event, index) => (
                <div
                  className="timeline-item"
                  key={`${event.timestamp}-${index}`}
                >
                  <span
                    className={`timeline-dot ${index === 0 ? "timeline-active" : ""}`}
                  />
                  <div>
                    <strong>{event.status}</strong>
                    <p>
                      {event.description}
                      {event.location ? ` · ${event.location}` : ""}
                    </p>
                    <time dateTime={event.timestamp}>
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "UTC",
                        timeZoneName: "short",
                      }).format(new Date(event.timestamp))}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <p>No tracking events have been posted yet.</p>
            )}
          </div>
          <Link
            className="text-link"
            href={`/track?number=${encodeURIComponent(shipment.trackingNumber)}`}
          >
            Share tracking details <ArrowRight size={15} />
          </Link>
        </div>
      )}
      {!compact && !message && !shipment && (
        <div className="tracking-hint">
          <PackageCheck size={16} /> Updates are posted by the operations team
          as your shipment moves.
        </div>
      )}
    </div>
  );
}
