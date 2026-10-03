"use client";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Mail,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type {
  AdminWorkspaceData,
  WorkspaceRow,
} from "@/components/workspace-types";

const formatDate = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(String(value)))
    : "—";
export function PeopleAdmin({
  data,
  mutate,
  create,
}: {
  data: AdminWorkspaceData;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
  create: (
    url: string,
    body: Record<string, unknown>,
  ) => Promise<WorkspaceRow | null>;
}) {
  const [invite, setInvite] = useState({
    name: "",
    email: "",
    role: "operations",
  });
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  async function send(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const result = await create("/api/admin/users/invite", invite);
    if (result) {
      setMessage(
        result.delivered
          ? "Invitation sent by email."
          : "Invitation is ready. Share the secure setup link with the new staff member.",
      );
      setLink(String(result.actionLink ?? ""));
      setInvite({ ...invite, name: "", email: "" });
    }
  }
  const users = [...data.customers, ...data.staff];
  return (
    <>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>
            Invite a staff member <ShieldCheck size={16} />
          </h2>
          <span className="table-muted">
            Super admin only · roles follow the access matrix
          </span>
        </div>
        {data.user.role === "super_admin" ? (
          <form className="staff-invite" onSubmit={send}>
            <input
              required
              value={invite.name}
              onChange={(e) => setInvite({ ...invite, name: e.target.value })}
              placeholder="Full name"
            />
            <input
              required
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
              placeholder="Work email"
            />
            <select
              value={invite.role}
              onChange={(e) => setInvite({ ...invite, role: e.target.value })}
            >
              <option value="operations">Operations</option>
              <option value="support">Support</option>
            </select>
            <button className="button button-orange">
              <UserPlus size={14} /> Invite staff
            </button>
          </form>
        ) : (
          <p className="table-muted">
            Only a super admin can invite staff or change access roles.
          </p>
        )}
        {message && (
          <p className="form-note form-success" role="status">
            {message}{" "}
            {link && (
              <a href={link} target="_blank" rel="noreferrer">
                Open setup link
              </a>
            )}
          </p>
        )}
      </div>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Customers and staff</h2>
          <span className="pill">{users.length} accounts</span>
        </div>
        {users.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>ACCOUNT</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id}>
                    <td className="table-strong">{String(row.name ?? "—")}</td>
                    <td>{String(row.email ?? "—")}</td>
                    <td>
                      {data.user.role === "super_admin" &&
                      row.role !== "super_admin" ? (
                        <select
                          aria-label={`Role for ${String(row.name ?? row.email)}`}
                          value={String(row.role ?? "customer")}
                          onChange={(e) =>
                            void mutate("/api/admin/users", {
                              uid: row.id,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="customer">Customer</option>
                          <option value="operations">Operations</option>
                          <option value="support">Support</option>
                        </select>
                      ) : (
                        String(row.role ?? "customer").replaceAll("_", " ")
                      )}
                    </td>
                    <td>{row.suspended === true ? "Suspended" : "Active"}</td>
                    <td>
                      {data.user.role === "super_admin" &&
                        row.role !== "super_admin" && (
                          <button
                            className="text-link"
                            style={{
                              border: 0,
                              background: "none",
                              fontSize: 9,
                            }}
                            onClick={() =>
                              void mutate("/api/admin/users", {
                                uid: row.id,
                                suspended: row.suspended !== true,
                              })
                            }
                          >
                            {row.suspended === true ? "Restore" : "Suspend"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No customer or staff accounts yet.</p>
          </div>
        )}
      </div>
    </>
  );
}

export function SupportAdmin({
  data,
  mutate,
}: {
  data: AdminWorkspaceData;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [active, setActive] = useState("");
  const threads = data.supportThreads;
  return (
    <>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Support conversations</h2>
          <span className="pill">
            {threads.filter((t) => t.status !== "closed").length} open
          </span>
        </div>
        {threads.length ? (
          threads.map((row) => (
            <div className="admin-row support-admin-row" key={row.id}>
              <div>
                <strong>
                  {String(row.subject ?? "Support conversation")} ·{" "}
                  {String(row.userName ?? row.email ?? "Customer")}
                </strong>
                <small>
                  {String(row.email ?? "")} · updated{" "}
                  {formatDate(row.updatedAt ?? row.createdAt)}
                </small>
                <div className="support-thread-preview">
                  {Array.isArray(row.messages)
                    ? (row.messages as WorkspaceRow[]).map((m, i) => (
                        <p key={i}>
                          <b>{m.from === "staff" ? "Team" : "Customer"}:</b>{" "}
                          {String(m.text ?? "")}{" "}
                          <time>{formatDate(m.timestamp)}</time>
                        </p>
                      ))
                    : null}
                </div>
                <div style={{ marginTop: 5 }}>
                  <span className="pill">{String(row.status ?? "open")}</span>
                  <span className="table-muted" style={{ marginLeft: 9 }}>
                    {Number(row.unreadByStaff ?? 0)} unread
                  </span>
                </div>
              </div>
              {row.status !== "closed" && (
                <div style={{ display: "grid", gap: 5 }}>
                  <button
                    className="button button-outline"
                    style={{ minHeight: 30, padding: "0 9px", fontSize: 9 }}
                    onClick={() => setActive(active === row.id ? "" : row.id)}
                  >
                    <MessageSquare size={12} /> Reply
                  </button>
                  <button
                    className="text-link"
                    style={{ border: 0, background: "none", fontSize: 9 }}
                    onClick={() =>
                      void mutate("/api/admin/support", {
                        id: row.id,
                        close: true,
                      })
                    }
                  >
                    Close
                  </button>
                </div>
              )}
              {active === row.id && (
                <SupportReply id={row.id} mutate={mutate} />
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <MessageSquare />
            <h3>No conversations yet</h3>
            <p>Customer support requests will appear here.</p>
          </div>
        )}
      </div>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Contact form inquiries</h2>
        </div>
        {data.contactMessages.length ? (
          data.contactMessages.map((r) => (
            <details className="admin-row" key={r.id}>
              <summary>
                <strong>
                  {String(r.name)} · {String(r.subject)}
                </strong>
                <small>
                  {String(r.email)} · {formatDate(r.createdAt)}
                </small>
              </summary>
              <p className="contact-message">{String(r.message)}</p>
            </details>
          ))
        ) : (
          <div className="empty-state">
            <p>No contact messages to review.</p>
          </div>
        )}
      </div>
    </>
  );
}
function SupportReply({
  id,
  mutate,
}: {
  id: string;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  return (
    <form
      className="support-reply"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        void mutate("/api/admin/support", { id, message: form.get("message") });
        e.currentTarget.reset();
      }}
    >
      <textarea
        required
        name="message"
        rows={3}
        placeholder="Write a reply to the customer"
      />
      <button className="button button-dark">
        Send reply <ArrowRight size={13} />
      </button>
    </form>
  );
}

export function InvoiceAdmin({
  data,
  create,
  mutate,
}: {
  data: AdminWorkspaceData;
  create: (
    url: string,
    body: Record<string, unknown>,
  ) => Promise<WorkspaceRow | null>;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [customerId, setCustomerId] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [dueDate, setDueDate] = useState("");
  const [terms, setTerms] = useState("");
  const [payment, setPayment] = useState<Record<string, string>>({});
  async function issue(e: FormEvent) {
    e.preventDefault();
    if (!customerId || !description.trim()) {
      return;
    }
    const result = await create("/api/admin/invoices", {
      customerId,
      customerName: data.customers.find((c) => c.id === customerId)?.name ?? "",
      shipmentId,
      items: [
        {
          description,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        },
      ],
      taxRate: Number(taxRate),
      discountAmount: Number(discount),
      currency,
      dueDate,
      terms,
    });
    if (result) {
      setDescription("");
      setUnitPrice("");
      setTerms("");
    }
  }
  return (
    <>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Create an invoice</h2>
          <span className="table-muted">
            Totals are calculated from the line items entered.
          </span>
        </div>
        <form className="invoice-create" onSubmit={issue}>
          <label>
            Customer
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select account</option>
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {String(c.name ?? c.email)} · {c.id.slice(0, 7)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Linked shipment (optional)
            <select
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
            >
              <option value="">No linked shipment</option>
              {data.shipments.map((r) => (
                <option key={r.id} value={r.id}>
                  {String(r.trackingNumber)} · {String(r.customerName ?? "")}
                </option>
              ))}
            </select>
          </label>
          <label className="invoice-wide">
            Line item description
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Freight service, handling, etc."
            />
          </label>
          <label>
            Quantity
            <input
              required
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label>
            Unit price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </label>
          <label>
            Tax rate (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </label>
          <label>
            Discount amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </label>
          <label>
            Currency
            <input
              required
              maxLength={3}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
          <label className="invoice-wide">
            Terms
            <textarea
              rows={2}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms or notes"
            />
          </label>
          <button className="button button-orange">
            Create invoice <Plus size={14} />
          </button>
        </form>
      </div>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Invoices and confirmed payments</h2>
        </div>
        {data.invoices.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>INVOICE</th>
                  <th>CUSTOMER</th>
                  <th>ISSUED</th>
                  <th>TOTAL</th>
                  <th>PAID</th>
                  <th>BALANCE</th>
                  <th>STATUS</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((row) => (
                  <tr key={row.id}>
                    <td className="table-strong">
                      {String(row.number ?? row.id)}
                    </td>
                    <td>{String(row.customerName ?? row.customerId)}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>
                      {money(
                        Number(row.totalCents ?? 0),
                        String(row.currency ?? "USD"),
                      )}
                    </td>
                    <td>
                      {money(
                        Number(row.paidCents ?? 0),
                        String(row.currency ?? "USD"),
                      )}
                    </td>
                    <td>
                      {money(
                        Number(row.balanceDueCents ?? 0),
                        String(row.currency ?? "USD"),
                      )}
                    </td>
                    <td>
                      <span className="pill">{String(row.status)}</span>
                    </td>
                    <td>
                      <a href={`/api/invoices/${row.id}`}>
                        <ArrowDownToLine size={14} />
                      </a>
                    </td>
                    <td>
                      {Number(row.balanceDueCents ?? 0) > 0 && (
                        <form
                          className="payment-form"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void mutate("/api/admin/invoices", {
                              id: row.id,
                              amount: payment[row.id],
                            });
                          }}
                        >
                          <input
                            aria-label="Payment amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={payment[row.id] ?? ""}
                            onChange={(e) =>
                              setPayment({
                                ...payment,
                                [row.id]: e.target.value,
                              })
                            }
                            placeholder="Payment"
                          />
                          <button className="button button-dark">
                            Record payment
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No invoices have been created.</p>
          </div>
        )}
      </div>
    </>
  );
}
type EditableService = {
  slug: string;
  title: string;
  tag: string;
  intro: string;
  details: string[];
  goodFor: string[];
  active?: boolean;
};
export function ContentAdmin() {
  const [services, setServices] = useState<EditableService[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      const r = await fetch("/api/admin/content", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setServices(j.services);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load service content.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(item: EditableService) {
    setNotice("");
    const r = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const j = await r.json();
    if (!r.ok) {
      setNotice(j.error ?? "Unable to save service content.");
      return;
    }
    setNotice(
      `${item.title} saved. Public service content will update on the next page request.`,
    );
    await load();
  }
  function update(index: number, patch: Partial<EditableService>) {
    setServices((old) =>
      old.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }
  if (loading)
    return <div className="portal-card">Loading public service content…</div>;
  if (error)
    return (
      <div className="portal-card">
        <p className="form-note form-error">{error}</p>
      </div>
    );
  return (
    <>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Edit public service pages</h2>
          <span className="table-muted">
            Changes appear on the corresponding service page.
          </span>
        </div>
        {notice && (
          <p className="form-note form-success" role="status">
            {notice}
          </p>
        )}
      </div>
      {services.map((item, index) => (
        <div className="portal-card" key={item.slug}>
          <div className="portal-card-head">
            <h2>{item.title}</h2>
            <a
              className="text-link"
              href={`/services/${item.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              Preview <ArrowRight size={13} />
            </a>
          </div>
          <form
            className="content-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save(item);
            }}
          >
            <label>
              Page title
              <input
                value={item.title}
                onChange={(e) => update(index, { title: e.target.value })}
              />
            </label>
            <label>
              Short label
              <input
                value={item.tag}
                onChange={(e) => update(index, { tag: e.target.value })}
              />
            </label>
            <label className="content-wide">
              Introduction
              <textarea
                rows={3}
                value={item.intro}
                onChange={(e) => update(index, { intro: e.target.value })}
              />
            </label>
            <label>
              What the service includes
              <textarea
                rows={5}
                value={item.details.join("\n")}
                onChange={(e) =>
                  update(index, {
                    details: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
              <small>One item per line</small>
            </label>
            <label>
              Good fit for
              <textarea
                rows={5}
                value={item.goodFor.join("\n")}
                onChange={(e) =>
                  update(index, {
                    goodFor: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
              <small>One item per line</small>
            </label>
            <label className="content-active">
              <input
                type="checkbox"
                checked={item.active !== false}
                onChange={(e) => update(index, { active: e.target.checked })}
              />{" "}
              Visible on the public website
            </label>
            <button className="button button-dark">Save {item.title}</button>
          </form>
        </div>
      ))}
    </>
  );
}
function money(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
