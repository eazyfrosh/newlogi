"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "We couldn't send your message.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div className="success-panel">
        <span className="success-icon">
          <CheckCircle2 />
        </span>
        <h2>Message received.</h2>
        <p>
          Thanks for getting in touch. Our team will review your message and
          follow up.
        </p>
      </div>
    );
  return (
    <form className="quote-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Your name
          <input required name="name" maxLength={120} placeholder="Your name" />
        </label>
        <label>
          Email address
          <input
            required
            type="email"
            name="email"
            maxLength={200}
            placeholder="you@company.com"
          />
        </label>
        <label className="form-wide">
          What’s this about?
          <select name="subject">
            <option>General inquiry</option>
            <option>Existing shipment</option>
            <option>Services</option>
            <option>Support</option>
            <option>Other</option>
          </select>
        </label>
        <label className="form-wide">
          Your message
          <textarea
            required
            name="message"
            maxLength={2000}
            rows={5}
            placeholder="How can we help?"
          />
        </label>
      </div>
      {error && (
        <p className="form-note form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-submit">
        <p>
          We’ll use your details to respond to your inquiry. See our{" "}
          <a href="/privacy">privacy policy</a>.
        </p>
        <button className="button button-orange" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
