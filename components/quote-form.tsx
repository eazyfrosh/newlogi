"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const initial = {
  name: "",
  email: "",
  phone: "",
  origin: "",
  destination: "",
  shipmentType: "Commercial goods",
  packageCount: "1",
  weight: "",
  dimensions: "",
  service: "Air freight",
  description: "",
  notes: "",
};
export function QuoteForm() {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const update = (key: keyof typeof initial, value: string) =>
    setValues((old) => ({ ...old, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "We couldn't send your request.");
      setSent(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your request.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div className="success-panel" role="status">
        <span className="success-icon">
          <CheckCircle2 size={24} />
        </span>
        <h2>Request received.</h2>
        <p>
          Our team has your shipment details and will follow up with a tailored
          quote. No price is shown until a team member reviews your request.
        </p>
        <button
          className="button button-dark"
          onClick={() => {
            setValues(initial);
            setSent(false);
          }}
        >
          Send another request
        </button>
      </div>
    );
  return (
    <form className="quote-form" onSubmit={submit}>
      <div className="form-section">
        <div>
          <span className="form-step">01</span>
          <h2>How can we reach you?</h2>
        </div>
        <div className="form-grid">
          <label>
            Full name{" "}
            <input
              required
              maxLength={120}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label>
            Email address{" "}
            <input
              required
              type="email"
              maxLength={200}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label>
            Phone number{" "}
            <input
              required
              type="tel"
              maxLength={40}
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </label>
          <label>
            Preferred service{" "}
            <select
              value={values.service}
              onChange={(e) => update("service", e.target.value)}
            >
              {[
                "Air freight",
                "Sea freight",
                "Road freight",
                "Express delivery",
                "Warehousing",
                "Customs clearance assistance",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="form-section">
        <div>
          <span className="form-step">02</span>
          <h2>Tell us about your shipment</h2>
        </div>
        <div className="form-grid">
          <label>
            Origin{" "}
            <input
              required
              maxLength={160}
              value={values.origin}
              onChange={(e) => update("origin", e.target.value)}
              placeholder="City, country"
            />
          </label>
          <label>
            Destination{" "}
            <input
              required
              maxLength={160}
              value={values.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="City, country"
            />
          </label>
          <label>
            Shipment type{" "}
            <select
              value={values.shipmentType}
              onChange={(e) => update("shipmentType", e.target.value)}
            >
              {[
                "Commercial goods",
                "Documents",
                "Personal effects",
                "Palletized freight",
                "Temperature-sensitive goods",
                "Other",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Number of packages{" "}
            <input
              required
              inputMode="numeric"
              value={values.packageCount}
              onChange={(e) => update("packageCount", e.target.value)}
              placeholder="1"
            />
          </label>
          <label>
            Total weight{" "}
            <input
              required
              value={values.weight}
              onChange={(e) => update("weight", e.target.value)}
              placeholder="e.g. 120 kg"
            />
          </label>
          <label>
            Dimensions{" "}
            <input
              value={values.dimensions}
              onChange={(e) => update("dimensions", e.target.value)}
              placeholder="L × W × H (cm)"
            />
          </label>
          <label className="form-wide">
            What are you shipping?{" "}
            <textarea
              required
              rows={3}
              maxLength={1500}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="A brief description of the goods"
            />
          </label>
          <label className="form-wide">
            Anything else we should know?{" "}
            <textarea
              rows={3}
              maxLength={1500}
              value={values.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Timing, handling needs, or special instructions"
            />
          </label>
        </div>
      </div>
      {message && (
        <p className="form-note form-error" role="alert">
          {message}
        </p>
      )}
      <div className="form-submit">
        <p>
          By submitting, you agree to our <a href="/privacy">privacy policy</a>.
          Your information is shared only with our team to prepare your request.
        </p>
        <button className="button button-orange" disabled={busy}>
          {busy ? "Sending request…" : "Request a quote"}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
