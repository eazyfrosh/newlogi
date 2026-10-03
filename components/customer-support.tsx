"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
type Thread = {
  id: string;
  subject?: string;
  status?: string;
  messages?: { text: string; from: string; timestamp: string }[];
  createdAt?: string;
};
export function CustomerSupport({
  threads,
  action,
}: {
  threads: Thread[];
  action: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [active, setActive] = useState("");
  return (
    <div className="support-customer-grid">
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Start a support conversation</h2>
        </div>
        <form
          className="request-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void action({
              kind: "support",
              subject: f.get("subject"),
              message: f.get("message"),
            });
            e.currentTarget.reset();
          }}
        >
          <label>
            Topic
            <input name="subject" required placeholder="How can we help?" />
          </label>
          <label>
            Message
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Include your tracking number if this is about a shipment."
            />
          </label>
          <button className="button button-orange">
            Send message <ArrowRight size={14} />
          </button>
        </form>
      </div>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Your conversations</h2>
        </div>
        {threads.length ? (
          threads.map((thread) => (
            <article className="customer-thread" key={thread.id}>
              <div className="customer-thread-head">
                <strong>{thread.subject ?? "Support request"}</strong>
                <span className="pill">{thread.status ?? "open"}</span>
              </div>
              {(thread.messages ?? []).map((m, i) => (
                <div
                  key={i}
                  className={`thread-message ${m.from === "staff" ? "thread-staff" : ""}`}
                >
                  <small>{m.from === "staff" ? "NewLogi team" : "You"}</small>
                  <p>{m.text}</p>
                  <time>
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                      timeZoneName: "short",
                    }).format(new Date(m.timestamp))}
                  </time>
                </div>
              ))}
              {thread.status !== "closed" && (
                <>
                  {active === thread.id ? (
                    <form
                      className="support-reply"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        void action({
                          kind: "support-reply",
                          id: thread.id,
                          message: f.get("message"),
                        });
                        e.currentTarget.reset();
                        setActive("");
                      }}
                    >
                      <textarea
                        name="message"
                        required
                        rows={2}
                        placeholder="Write a reply"
                      />
                      <button className="button button-dark">
                        Reply <ArrowRight size={13} />
                      </button>
                    </form>
                  ) : (
                    <button
                      className="text-link"
                      style={{ border: 0, background: "none" }}
                      onClick={() => setActive(thread.id)}
                    >
                      <MessageSquare size={14} /> Reply
                    </button>
                  )}
                </>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state">
            <MessageSquare />
            <h3>No conversations yet</h3>
            <p>Send a note and the NewLogi team will reply here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
