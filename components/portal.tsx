"use client";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bell,
  Box,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  X,
} from "lucide-react";
import { AdminShipmentPanel } from "@/components/admin-shipment-panel";
import type { AdminWorkspaceData } from "@/components/workspace-types";
import {
  InvoiceAdmin,
  PeopleAdmin,
  SupportAdmin,
} from "@/components/admin-sections";
import { CustomerSupport } from "@/components/customer-support";

type Row = Record<string, any> & { id: string };
type PortalData = {
  user: { uid: string; name: string; email: string; role: string };
  shipments: Row[];
  quotes: Row[];
  invoices: Row[];
  bookings: Row[];
  pickups: Row[];
  notifications: Row[];
  supportThreads?: Row[];
};
type AdminData = AdminWorkspaceData;
const date = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(String(value)))
    : "—";
function PortalFrame({
  user,
  children,
  admin = false,
  tab,
  setTab,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
  admin?: boolean;
  tab: string;
  setTab: (s: string) => void;
}) {
  const [menu, setMenu] = useState(false);
  const router = useRouter();
  const links = admin
    ? ([
        ["Overview", LayoutDashboard, "overview"],
        ["Shipments", Box, "shipments"],
        ["Quotes & requests", FileText, "quotes"],
        ["Customers & staff", Users, "people"],
        ["Support", MessageSquare, "support"],
        ["Invoices", FileText, "invoices"],
      ] as const)
    : ([
        ["Overview", LayoutDashboard, "overview"],
        ["My shipments", Box, "shipments"],
        ["My quotes", FileText, "quotes"],
        ["Bookings & pickups", Truck, "requests"],
        ["Invoices & payments", FileText, "invoices"],
        ["Support", MessageSquare, "support"],
        ["My profile", Settings, "profile"],
      ] as const);
  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="portal">
      <header className="portal-top">
        <div className="portal-brand-wrap">
          <button
            aria-label="Toggle navigation"
            className="portal-menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <Link className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>
              newlogi<span className="brand-dot">.</span>
            </span>
          </Link>
        </div>
        <div className="portal-top-actions">
          <span>{admin ? "Operations portal" : "Customer workspace"}</span>
          <span className="avatar" aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <button className="portal-logout" onClick={logout}>
            <LogOut size={14} /> <span>Sign out</span>
          </button>
        </div>
      </header>
      <div className="portal-body">
        <aside className={`portal-side ${menu ? "portal-side-open" : ""}`}>
          <p className="portal-label">{admin ? "WORKSPACE" : "YOUR ACCOUNT"}</p>
          {links
            .filter(
              ([, , id]) =>
                !admin ||
                user.role !== "support" ||
                !["people", "invoices"].includes(id),
            )
            .map(([label, Icon, id]) => (
            <button
              key={id}
              className={`portal-link ${tab === id ? "portal-link-active" : ""}`}
              onClick={() => {
                setTab(id);
                setMenu(false);
              }}
            >
              <Icon size={16} />
              {label}
            </button>
            ))}
          <p className="portal-label" style={{ marginTop: 30 }}>
            HELPFUL LINKS
          </p>
          <Link className="portal-link" href="/track">
            <Activity size={16} /> Track a shipment
          </Link>
          <Link className="portal-link" href="/faq">
            <CircleHelp size={16} /> Help centre
          </Link>
          {admin && user.role === "super_admin" && (
            <Link className="portal-link" href="/admin/content">
              <FileText size={16} /> Service page content
            </Link>
          )}
          {admin && (
            <p className="portal-label" style={{ marginTop: 24 }}>
              SIGNED IN AS
              <br />
              <span
                style={{
                  display: "block",
                  letterSpacing: 0,
                  color: "#697887",
                  marginTop: 6,
                }}
              >
                {user.role.replace("_", " ")}
              </span>
            </p>
          )}
        </aside>
        <main className="portal-main">{children}</main>
      </div>
    </div>
  );
}
function Heading({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="portal-heading">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}
function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
function Empty({
  icon: Icon = Box,
  title,
  text,
  action,
}: {
  icon?: typeof Box;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Icon />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <div style={{ marginTop: 15 }}>{action}</div>}
    </div>
  );
}
function Pill({ status }: { status: unknown }) {
  const s = String(status ?? "pending");
  const kind = ["paid", "accepted", "Delivered", "approved"].includes(s)
    ? "pill-green"
    : [
          "new",
          "pending_review",
          "quoted",
          "awaiting_action",
          "In Transit",
        ].includes(s)
      ? "pill-orange"
      : "";
  return <span className={`pill ${kind}`}>{s.replaceAll("_", " ")}</span>;
}
export function CustomerPortal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    kind: "booking",
    origin: "",
    destination: "",
    service: "Air freight",
    preferredDate: "",
    details: "",
  });
  const router = useRouter();
  async function load() {
    try {
      const r = await fetch("/api/customer", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load your account.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setNotice(
        "Request submitted. It will remain pending until our team confirms it.",
      );
      setForm({ ...form, details: "", preferredDate: "" });
      await load();
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Request could not be submitted.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function action(body: Record<string, unknown>) {
    setNotice("");
    const r = await fetch("/api/customer/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      setNotice(j.error ?? "Unable to complete the request.");
      return;
    }
    setNotice("Your response was saved.");
    await load();
  }
  if (error)
    return (
      <div className="portal">
        <header className="portal-top">
          <Link className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>
              newlogi<span className="brand-dot">.</span>
            </span>
          </Link>
        </header>
        <main className="content-narrow" style={{ paddingTop: 100 }}>
          <Empty
            icon={ShieldCheck}
            title="Sign in to continue"
            text={error}
            action={
              <button
                className="button button-dark"
                onClick={() => router.push("/login")}
              >
                Go to sign in <ArrowRight size={15} />
              </button>
            }
          />
        </main>
      </div>
    );
  if (!data)
    return (
      <div className="portal">
        <div className="portal-main">Loading your workspace…</div>
      </div>
    );
  const visibleShipments = data.shipments.filter(
    (row) =>
      !filter ||
      `${row.trackingNumber} ${row.status} ${row.originCity} ${row.destinationCity}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
  );
  return (
    <PortalFrame user={data.user} tab={tab} setTab={setTab}>
      <Heading
        title={
          tab === "overview"
            ? `Welcome, ${data.user.name.split(" ")[0]}`
            : tabLabel(tab)
        }
        sub={
          tab === "overview"
            ? "Here’s what’s happening across your shipments."
            : "Your account information and shipment activity."
        }
        action={
          tab === "overview" && (
            <button
              className="button button-orange"
              onClick={() => setTab("requests")}
            >
              <Plus size={15} /> New request
            </button>
          )
        }
      />
      {notice && (
        <p className="form-note form-success" role="status">
          {notice}
        </p>
      )}
      {tab === "overview" && (
        <>
          <div className="metric-grid">
            <Metric
              label="Active shipments"
              value={
                data.shipments.filter(
                  (r) =>
                    !["Delivered", "Cancelled", "Returned"].includes(
                      String(r.status),
                    ),
                ).length
              }
              note="Currently in progress"
            />
            <Metric
              label="Delivered"
              value={
                data.shipments.filter((r) => r.status === "Delivered").length
              }
              note="Completed shipments"
            />
            <Metric
              label="Pending requests"
              value={
                data.bookings
                  .concat(data.pickups)
                  .filter((r) => r.status === "pending_review").length
              }
              note="Awaiting team review"
            />
            <Metric
              label="Quotes to review"
              value={data.quotes.filter((r) => r.status === "quoted").length}
              note="Ready for your response"
            />
          </div>
          <div className="portal-card">
            <div className="portal-card-head">
              <h2>Recent shipments</h2>
              <button
                className="portal-link"
                style={{ padding: 0, border: 0, background: "none" }}
                onClick={() => setTab("shipments")}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>
            <ShipmentTable rows={data.shipments.slice(0, 5)} />
          </div>
          <div className="admin-split">
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Quotes awaiting your response</h2>
              </div>
              <QuoteList
                rows={data.quotes
                  .filter((r) => r.status === "quoted")
                  .slice(0, 3)}
                action={action}
              />
            </div>
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Recent notifications</h2>
              </div>
              {data.notifications.length ? (
                data.notifications.slice(0, 4).map((r) => (
                  <div className="admin-row" key={r.id}>
                    <span>{String(r.message ?? "Account update")}</span>
                    <small>{date(r.createdAt)}</small>
                  </div>
                ))
              ) : (
                <Empty
                  icon={Bell}
                  title="You're up to date"
                  text="New shipment events will show here."
                />
              )}
            </div>
          </div>
        </>
      )}
      {tab === "shipments" && (
        <div className="portal-card">
          <div className="portal-card-head">
            <h2>All shipments</h2>
            <label className="search-box">
              <Search />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search shipments"
              />
            </label>
          </div>
          <ShipmentTable rows={visibleShipments} />
        </div>
      )}
      {tab === "quotes" && (
        <div className="portal-card">
          <div className="portal-card-head">
            <h2>Your quotes</h2>
          </div>
          <QuoteList rows={data.quotes} action={action} />
        </div>
      )}
      {tab === "requests" && (
        <>
          <div className="admin-split">
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Request a {form.kind}</h2>
              </div>
              <form className="request-form" onSubmit={submit}>
                <label>
                  Request type
                  <select
                    value={form.kind}
                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  >
                    <option value="booking">Shipment booking</option>
                    <option value="pickup">Pickup request</option>
                  </select>
                </label>
                <div className="request-grid">
                  <label>
                    Origin
                    <input
                      required
                      value={form.origin}
                      onChange={(e) =>
                        setForm({ ...form, origin: e.target.value })
                      }
                      placeholder="City or location"
                    />
                  </label>
                  <label>
                    Destination
                    <input
                      required
                      value={form.destination}
                      onChange={(e) =>
                        setForm({ ...form, destination: e.target.value })
                      }
                      placeholder="City or location"
                    />
                  </label>
                </div>
                {form.kind === "pickup" && (
                  <label>
                    Preferred pickup date
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={form.preferredDate}
                      onChange={(e) =>
                        setForm({ ...form, preferredDate: e.target.value })
                      }
                    />
                  </label>
                )}
                <label>
                  Service
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                  >
                    {[
                      "Air freight",
                      "Sea freight",
                      "Road freight",
                      "Express delivery",
                      "Warehousing",
                      "Customs clearance assistance",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Shipment details
                  <textarea
                    required
                    rows={3}
                    value={form.details}
                    onChange={(e) =>
                      setForm({ ...form, details: e.target.value })
                    }
                    placeholder="What are you moving? Include package count, approximate weight, and timing."
                  />
                </label>
                <button className="button button-orange" disabled={busy}>
                  {busy ? "Submitting…" : "Submit request"}
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Request status</h2>
              </div>
              <RequestList rows={data.bookings.concat(data.pickups)} />
            </div>
          </div>
        </>
      )}
      {tab === "support" && (
        <CustomerSupport threads={data.supportThreads ?? []} action={action} />
      )}
      {tab === "profile" && (
        <div className="portal-card">
          <div className="portal-card-head">
            <h2>Profile details</h2>
          </div>
          <ProfileForm user={data.user} action={action} />
        </div>
      )}
      {tab === "invoices" && (
        <div className="portal-card">
          <div className="portal-card-head">
            <h2>Invoices and payments</h2>
          </div>
          <InvoiceTable rows={data.invoices} />
        </div>
      )}
    </PortalFrame>
  );
}
function tabLabel(tab: string) {
  return (
    (
      {
        shipments: "My shipments",
        quotes: "My quotes",
        requests: "Bookings & pickups",
        support: "Support",
        profile: "My profile",
        invoices: "Invoices & payments",
      } as Record<string, string>
    )[tab] ?? "Your workspace"
  );
}
function ShipmentTable({ rows }: { rows: Row[] }) {
  return rows.length ? (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>TRACKING NUMBER</th>
            <th>ROUTE</th>
            <th>SERVICE</th>
            <th>STATUS</th>
            <th>UPDATED · UTC</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="table-strong">
                {r.trackingNumber ? (
                  <Link href={`/track?number=${encodeURIComponent(String(r.trackingNumber))}`}>
                    {String(r.trackingNumber)}
                  </Link>
                ) : (
                  "Pending"
                )}
                {Array.isArray(r.documents) &&
                  r.documents.map((doc: Row) => (
                    <small className="customer-doc-link" key={String(doc.path)}>
                      <a
                        href={`/api/admin/documents?path=${encodeURIComponent(String(doc.path))}`}
                      >
                        {String(doc.name)}
                      </a>
                    </small>
                  ))}
              </td>
              <td>
                {String(r.originCity ?? r.origin ?? "—")} →{" "}
                {String(r.destinationCity ?? r.destination ?? "—")}
              </td>
              <td>{String(r.service ?? "—")}</td>
              <td>
                <Pill status={r.status} />
              </td>
              <td>{date(r.updatedAt ?? r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No shipments yet"
      text="Your confirmed shipments will appear here."
    />
  );
}
function QuoteList({
  rows,
  action,
}: {
  rows: Row[];
  action: (b: Record<string, unknown>) => Promise<void>;
}) {
  return rows.length ? (
    <div>
      {rows.map((r) => (
        <div className="admin-row" key={r.id}>
          <div>
            <strong>
              {String(r.origin ?? "Shipment request")} →{" "}
              {String(r.destination ?? "")}
            </strong>
            <small>
              {String(r.service ?? r.shipmentType ?? "Quote")} ·{" "}
              {date(r.createdAt)}
            </small>
            {r.amount !== undefined && (
              <small>
                Quoted total: {String(r.currency ?? "")} {String(r.amount)}
              </small>
            )}
            <div style={{ marginTop: 5 }}>
              <Pill status={r.status} />
            </div>
            {Boolean(r.terms) && <small>{String(r.terms)}</small>}
          </div>
          {r.status === "quoted" && (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="button button-dark"
                style={{ minHeight: 31, padding: "0 9px", fontSize: 9 }}
                onClick={() =>
                  void action({
                    kind: "quote-response",
                    id: r.id,
                    status: "accepted",
                  })
                }
              >
                Accept
              </button>
              <button
                className="button button-outline"
                style={{ minHeight: 31, padding: "0 9px", fontSize: 9 }}
                onClick={() =>
                  void action({
                    kind: "quote-response",
                    id: r.id,
                    status: "declined",
                  })
                }
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <Empty
      icon={FileText}
      title="No quotes yet"
      text="Quotes prepared for you will appear here."
    />
  );
}
function RequestList({ rows }: { rows: Row[] }) {
  return rows.length ? (
    <>
      {rows.map((r) => (
        <div className="admin-row" key={r.id}>
          <div>
            <strong>{String(r.kind ?? "request").replaceAll("_", " ")}</strong>
            <small>
              {String(r.origin ?? "")} → {String(r.destination ?? "")} ·{" "}
              {date(r.createdAt)}
            </small>
            {r.preferredDate && (
              <small>Preferred pickup: {date(r.preferredDate)}</small>
            )}
          </div>
          <Pill status={r.status} />
        </div>
      ))}
    </>
  ) : (
    <Empty
      icon={CalendarDays}
      title="No requests yet"
      text="Your booking and pickup requests will show here."
    />
  );
}
function InvoiceTable({ rows }: { rows: Row[] }) {
  return rows.length ? (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>ISSUED</th>
            <th>DUE</th>
            <th>TOTAL</th>
            <th>PAID</th>
            <th>BALANCE</th>
            <th>STATUS</th>
            <th>DOWNLOAD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="table-strong">{String(r.number ?? r.id)}</td>
              <td>{date(r.createdAt)}</td>
              <td>{date(r.dueDate)}</td>
              <td>
                {String(r.currency ?? "")}{" "}
                {(Number(r.totalCents ?? 0) / 100).toFixed(2)}
              </td>
              <td>
                {String(r.currency ?? "")}{" "}
                {(Number(r.paidCents ?? 0) / 100).toFixed(2)}
              </td>
              <td>
                {String(r.currency ?? "")}{" "}
                {(Number(r.balanceDueCents ?? 0) / 100).toFixed(2)}
              </td>
              <td>
                <Pill status={r.status} />
              </td>
              <td>
                <a
                  href={`/api/invoices/${r.id}`}
                  aria-label={`Download invoice ${String(r.number ?? r.id)}`}
                >
                  <Download size={14} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      icon={FileText}
      title="No invoices"
      text="Invoices linked to your shipments will appear here."
    />
  );
}
function SupportForm({
  action,
}: {
  action: (b: Record<string, unknown>) => Promise<void>;
}) {
  return (
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
          rows={5}
          placeholder="Include your tracking number if this is about a shipment."
        />
      </label>
      <button className="button button-orange">
        Send message <ArrowRight size={14} />
      </button>
    </form>
  );
}
function ProfileForm({
  user,
  action,
}: {
  user: PortalData["user"];
  action: (b: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <form
      className="request-form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        void action({ kind: "profile", name: f.get("name") });
      }}
    >
      <label>
        Full name
        <input name="name" required defaultValue={user.name} />
      </label>
      <label>
        Email address
        <input disabled value={user.email} />
      </label>
      <button className="button button-dark">Save profile</button>
    </form>
  );
}

export function AdminPortal() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      const r = await fetch("/api/admin/overview", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setData(j);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load the admin workspace.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function mutate(url: string, body: Record<string, unknown>) {
    setNotice("");
    const r = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      setNotice(j.error ?? "Unable to save changes.");
      return false;
    }
    setNotice("Changes saved.");
    await load();
    return true;
  }
  async function create(url: string, body: Record<string, unknown>) {
    setNotice("");
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) {
      setNotice(j.error ?? "Unable to save changes.");
      return null;
    }
    setNotice("Saved successfully.");
    await load();
    return j;
  }
  if (loading)
    return (
      <div className="portal">
        <main className="portal-main">Opening the admin workspace…</main>
      </div>
    );
  if (error)
    return (
      <div className="portal">
        <header className="portal-top">
          <Link className="brand" href="/">
            <span className="brand-mark">N</span>
            <span>
              newlogi<span className="brand-dot">.</span>
            </span>
          </Link>
        </header>
        <main className="content-narrow" style={{ paddingTop: 100 }}>
          <Empty
            icon={ShieldCheck}
            title="Admin access required"
            text={error}
            action={
              <Link className="button button-dark" href="/login">
                Sign in <ArrowRight size={15} />
              </Link>
            }
          />
        </main>
      </div>
    );
  if (!data) return null;
  return (
    <PortalFrame user={data.user} admin tab={tab} setTab={setTab}>
      <Heading
        title={tab === "overview" ? "Operations overview" : tabLabel(tab)}
        sub={
          tab === "overview"
            ? "Live shipment, service, and customer activity."
            : "Review and manage NewLogi operations."
        }
        action={
          tab === "overview" &&
          canSee(data.user.role, "shipments.write") && (
            <button
              className="button button-orange"
              onClick={() => setTab("shipments")}
            >
              <Plus size={15} /> Create shipment
            </button>
          )
        }
      />
      {notice && (
        <p className="form-note form-success" role="status">
          {notice}
        </p>
      )}
      {tab === "overview" && (
        <>
          <div className="metric-grid">
            <Metric
              label="Total shipments"
              value={data.metrics.shipments ?? 0}
              note="Current records"
            />
            <Metric
              label="Active shipments"
              value={data.metrics.active ?? 0}
              note="Not delivered, returned, or cancelled"
            />
            <Metric
              label="Delivered"
              value={data.metrics.delivered ?? 0}
              note="Confirmed as delivered"
            />
            <Metric
              label="Pending requests"
              value={data.metrics.pendingRequests ?? 0}
              note="Bookings and pickups awaiting review"
            />
            <Metric
              label="Quotes awaiting action"
              value={data.metrics.quotesAwaitingAction ?? 0}
              note="New or awaiting customer response"
            />
            {canSee(data.user.role, "invoices.read") && (
              <>
                <Metric
                  label="Outstanding invoices"
                  value={data.metrics.outstandingInvoices ?? 0}
                  note="Unpaid or partially paid"
                />
                <Metric
                  label="Balance due"
                  value={
                    data.metrics.invoicedAmount === null
                      ? "—"
                      : formatMoney(data.metrics.invoicedAmount ?? 0)
                  }
                  note="Invoiced balance, not confirmed revenue"
                />
              </>
            )}
            <Metric
              label="Unread support"
              value={data.metrics.unreadSupportMessages ?? 0}
              note="Messages awaiting staff response"
            />
          </div>
          <div className="admin-split">
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Recent shipment activity</h2>
                <button
                  className="portal-link"
                  style={{ padding: 0, border: 0, background: "none" }}
                  onClick={() => setTab("shipments")}
                >
                  Manage shipments <ArrowRight size={13} />
                </button>
              </div>
              <ShipmentTable rows={data.recentShipments} />
            </div>
            <div className="portal-card">
              <div className="portal-card-head">
                <h2>Requests to review</h2>
                <button
                  className="portal-link"
                  style={{ padding: 0, border: 0, background: "none" }}
                  onClick={() => setTab("quotes")}
                >
                  Open queue <ArrowRight size={13} />
                </button>
              </div>
              <AdminRequestList
                rows={data.requests.slice(0, 7)}
                mutate={mutate}
                allowWrite={canSee(data.user.role, "shipments.write")}
              />
            </div>
          </div>
          <div className="portal-card">
            <div className="portal-card-head">
              <h2>Latest quote inquiries</h2>
              <button
                className="portal-link"
                style={{ padding: 0, border: 0, background: "none" }}
                onClick={() => setTab("quotes")}
              >
                Review quotes <ArrowRight size={13} />
              </button>
            </div>
            <AdminQuoteList
              rows={data.quotes.slice(0, 5)}
              mutate={mutate}
              allowWrite={canSee(data.user.role, "shipments.write")}
            />
          </div>
        </>
      )}
      {tab === "shipments" && (
        <AdminShipmentPanel
          data={data}
          create={create}
          mutate={mutate}
          refresh={load}
        />
      )}
      {tab === "quotes" && (
        <>
          <div className="portal-card">
            <div className="portal-card-head">
              <h2>Quote requests</h2>
              <span className="pill">{data.quotes.length} records</span>
            </div>
            <AdminQuoteList
              rows={data.quotes}
              mutate={mutate}
              allowWrite={canSee(data.user.role, "shipments.write")}
            />
          </div>
          <div className="portal-card">
            <div className="portal-card-head">
              <h2>Booking and pickup requests</h2>
            </div>
            <AdminRequestList
              rows={data.requests}
              mutate={mutate}
              allowWrite={canSee(data.user.role, "shipments.write")}
            />
          </div>
        </>
      )}
      {tab === "people" && canSee(data.user.role, "customers.read") && (
        <PeopleAdmin data={data} mutate={mutate} create={create} />
      )}
      {tab === "support" && <SupportAdmin data={data} mutate={mutate} />}
      {tab === "invoices" && canSee(data.user.role, "invoices.read") && (
        <InvoiceAdmin data={data} create={create} mutate={mutate} />
      )}
    </PortalFrame>
  );
}
function canSee(role: string, permission: string) {
  if (permission === "shipments.write")
    return ["super_admin", "operations"].includes(role);
  if (permission === "invoices.read")
    return ["super_admin", "operations"].includes(role);
  return role === "super_admin";
}
function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}
function AdminQuoteList({
  rows,
  mutate,
  allowWrite,
}: {
  rows: Row[];
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
  allowWrite: boolean;
}) {
  return rows.length ? (
    <div>
      {rows.map((r) => (
        <div className="admin-row" key={r.id}>
          <div style={{ minWidth: 170 }}>
            <strong>
              {String(r.name ?? "Quote inquiry")} · {String(r.origin ?? "—")} →{" "}
              {String(r.destination ?? "—")}
            </strong>
            <small>
              {String(r.email ?? "")} ·{" "}
              {String(r.service ?? r.shipmentType ?? "")} · {date(r.createdAt)}
            </small>
            <small>
              {String(r.packageCount ?? "")} packages · {String(r.weight ?? "")}
            </small>
            <div style={{ marginTop: 5 }}>
              <Pill status={r.status} />
            </div>
          </div>
          {allowWrite ? (
            <QuoteEditor row={r} mutate={mutate} />
          ) : (
            <div style={{ minWidth: 120, textAlign: "right" }}>
              <strong>
                {r.amount ? formatMoney(Number(r.amount)) : "Unpriced"}
              </strong>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <Empty
      icon={FileText}
      title="No quote requests"
      text="New customer quote requests will be collected here."
    />
  );
}
function QuoteEditor({
  row,
  mutate,
}: {
  row: Row;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  const existing = Array.isArray(row.items)
    ? (row.items[0] as Record<string, unknown> | undefined)
    : undefined;
  const [description, setDescription] = useState(
    String(existing?.description ?? "Freight service"),
  );
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1));
  const [unitAmount, setUnitAmount] = useState(
    String(existing?.unitAmount ?? row.amount ?? ""),
  );
  const [currency, setCurrency] = useState(String(row.currency ?? "USD"));
  const [expiryDate, setExpiry] = useState(String(row.expiryDate ?? ""));
  const [terms, setTerms] = useState(String(row.terms ?? ""));
  const [customerId, setCustomerId] = useState(String(row.customerId ?? ""));
  const [status, setStatus] = useState(String(row.status ?? "reviewing"));
  const [converted, setConverted] = useState("");
  const amount = Number(quantity) * Number(unitAmount);
  async function convert() {
    const response = await fetch("/api/admin/quotes/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    const result = await response.json();
    setConverted(
      response.ok ? `Shipment created: ${result.trackingNumber}` : result.error,
    );
  }
  return (
    <>
      <form
        className="quote-edit"
        onSubmit={(e) => {
          e.preventDefault();
          void mutate("/api/admin/quotes", {
            id: row.id,
            status,
            amount,
            currency,
            expiryDate,
            terms,
            customerId,
            items: [
              {
                description,
                quantity: Number(quantity),
                unitAmount: Number(unitAmount),
              },
            ],
          });
        }}
      >
        <input
          aria-label="Quote item description"
          style={{ gridColumn: "1 / -1" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Line item description"
        />
        <input
          aria-label="Line item quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
        />
        <input
          aria-label="Line item unit amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={unitAmount}
          onChange={(e) => setUnitAmount(e.target.value)}
          placeholder="Unit price"
        />
        <input
          aria-label="Currency"
          maxLength={3}
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          placeholder="USD"
        />
        <input
          aria-label="Expiry date"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiry(e.target.value)}
        />
        <input
          aria-label="Customer account ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Customer account ID"
        />
        <input
          aria-label="Quote terms"
          style={{ gridColumn: "1 / -1" }}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          placeholder="Terms / included services"
        />
        <select
          aria-label="Quote status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="reviewing">Reviewing</option>
          <option value="quoted">Send quote</option>
          <option value="declined">Declined</option>
        </select>
        <span className="quote-total">
          Total: {currency}{" "}
          {Number.isFinite(amount) ? amount.toFixed(2) : "0.00"}
        </span>
        <button className="button button-dark">Save quote</button>
      </form>
      {row.status === "accepted" && !row.convertedShipmentId && (
        <button
          className="button button-orange"
          style={{ marginTop: 8, minHeight: 34, fontSize: 9 }}
          onClick={() => void convert()}
        >
          Convert accepted quote to shipment <ArrowRight size={13} />
        </button>
      )}
      {converted && (
        <p className="form-note form-success" role="status">
          {converted}
        </p>
      )}
    </>
  );
}
function AdminRequestList({
  rows,
  mutate,
  allowWrite,
}: {
  rows: Row[];
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
  allowWrite: boolean;
}) {
  return rows.length ? (
    <div>
      {rows.map((r) => (
        <div className="admin-row" key={r.id}>
          <div>
            <strong>
              {String(r.customerName ?? r.name ?? "Customer")} ·{" "}
              {String(r.kind ?? "booking")}
            </strong>
            <small>
              {String(r.origin ?? "—")} → {String(r.destination ?? "—")} ·{" "}
              {String(r.service ?? "")}
            </small>
            <small>
              {String(r.details ?? r.description ?? "")} · {date(r.createdAt)}
            </small>
            <div style={{ marginTop: 5 }}>
              <Pill status={r.status} />
              {r.preferredDate && (
                <small style={{ marginLeft: 8 }}>
                  Preferred {date(r.preferredDate)}
                </small>
              )}
            </div>
          </div>
          {allowWrite && r.status === "pending_review" && (
            <AdminRequestActions row={r} mutate={mutate} />
          )}
        </div>
      ))}
    </div>
  ) : (
    <Empty
      icon={CalendarDays}
      title="Nothing waiting for review"
      text="New booking and pickup requests will appear here."
    />
  );
}

function AdminRequestActions({
  row,
  mutate,
}: {
  row: Row;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [reschedule, setReschedule] = useState(false);
  const [preferredDate, setPreferredDate] = useState(
    String(row.preferredDate ?? "").slice(0, 10),
  );
  return (
    <div className="request-actions">
      <button
        className="button button-dark"
        onClick={() =>
          void mutate("/api/admin/requests", {
            id: row.id,
            kind: row.kind,
            status: "approved",
          })
        }
      >
        Approve
      </button>
      <button
        className="button button-outline"
        onClick={() =>
          void mutate("/api/admin/requests", {
            id: row.id,
            kind: row.kind,
            status: "rejected",
          })
        }
      >
        Reject
      </button>
      {row.kind === "pickup" &&
        (reschedule ? (
          <form
            className="request-reschedule"
            onSubmit={(event) => {
              event.preventDefault();
              void mutate("/api/admin/requests", {
                id: row.id,
                kind: row.kind,
                status: "rescheduled",
                preferredDate,
              });
            }}
          >
            <input
              type="date"
              aria-label="New preferred pickup date"
              min={new Date().toISOString().slice(0, 10)}
              required
              value={preferredDate}
              onChange={(event) => setPreferredDate(event.target.value)}
            />
            <button className="button button-outline">Save date</button>
          </form>
        ) : (
          <button
            className="button button-outline"
            onClick={() => setReschedule(true)}
          >
            Reschedule
          </button>
        ))}
    </div>
  );
}
function ShipmentAdmin({
  data,
  create,
  mutate,
}: {
  data: AdminData;
  create: (url: string, body: Record<string, unknown>) => Promise<Row | null>;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("Shipment Created");
  const [location, setLocation] = useState("");
  const [eventDescription, setDescription] = useState("");
  const [upload, setUpload] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const rows = data.recentShipments.filter(
    (r) =>
      !filter ||
      `${r.trackingNumber} ${r.status} ${r.originCity} ${r.destinationCity}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
  );
  const selectedRow = data.recentShipments.find((r) => r.id === selected);
  return (
    <>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Create shipment record</h2>
        </div>
        <form
          className="ship-create"
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const out = await create(
              "/api/admin/shipments",
              Object.fromEntries(f.entries()),
            );
            if (out)
              setResult(
                `Created ${String(out.trackingNumber)}. Share this number with the customer.`,
              );
          }}
        >
          <input required name="customerId" placeholder="Customer account ID" />
          <input name="customerName" placeholder="Customer name" />
          <input required name="origin" placeholder="Origin city" />
          <input required name="destination" placeholder="Destination city" />
          <select name="service">
            {[
              "Air freight",
              "Sea freight",
              "Road freight",
              "Express delivery",
              "Warehousing",
              "Customs clearance assistance",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select name="status">
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input name="packageCount" placeholder="Package count" />
          <input name="weight" placeholder="Weight" />
          <input name="dimensions" placeholder="Dimensions" />
          <input
            name="estimatedDelivery"
            type="date"
            aria-label="Estimated delivery date"
          />
          <input name="currentLocation" placeholder="Current location" />
          <input name="description" placeholder="Public shipment description" />
          <button className="button button-orange">
            Create shipment <Plus size={14} />
          </button>
        </form>
        {result && (
          <p className="form-note form-success" role="status">
            {result}
          </p>
        )}
      </div>
      <div className="portal-card">
        <div className="portal-card-head">
          <h2>Shipment records</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label className="search-box">
              <Search />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search records"
              />
            </label>
            <button
              className="button button-outline"
              style={{ minHeight: 36, padding: "0 10px", fontSize: 9 }}
              onClick={() => exportCsv(rows)}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>TRACKING</th>
                <th>ROUTE</th>
                <th>SERVICE</th>
                <th>STATUS</th>
                <th>UPDATED (UTC)</th>
                <th>TOOLS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="table-strong">{String(r.trackingNumber)}</td>
                  <td>
                    {String(r.originCity ?? "—")} →{" "}
                    {String(r.destinationCity ?? "—")}
                  </td>
                  <td>{String(r.service ?? "—")}</td>
                  <td>
                    <Pill status={r.status} />
                  </td>
                  <td>{date(r.updatedAt ?? r.createdAt)}</td>
                  <td>
                    <button
                      className="text-link"
                      style={{ border: 0, background: "none", fontSize: 9 }}
                      onClick={() => {
                        setSelected(r.id);
                        setStatus(String(r.status));
                        setLocation(String(r.currentLocation ?? ""));
                        setDescription("");
                      }}
                    >
                      Update
                    </button>{" "}
                    ·{" "}
                    <a
                      className="text-link"
                      style={{ fontSize: 9 }}
                      target="_blank"
                      rel="noreferrer"
                      href={`/api/admin/shipments/${r.id}/label`}
                    >
                      Label
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <Empty
            title="No matching shipments"
            text="Try another search or create a shipment record."
          />
        )}
      </div>
      {selected && selectedRow && (
        <div className="portal-card">
          <div className="portal-card-head">
            <h2>Update {String(selectedRow.trackingNumber)}</h2>
            <button className="portal-logout" onClick={() => setSelected("")}>
              Close
            </button>
          </div>
          <form
            className="admin-status"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await mutate("/api/admin/shipments", {
                id: selected,
                status,
                location,
                description: eventDescription,
                internalNote: (
                  e.currentTarget.elements.namedItem(
                    "internalNote",
                  ) as HTMLInputElement
                ).value,
              });
              if (ok) setSelected("");
            }}
          >
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {SHIPMENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current location"
            />
            <input
              type="date"
              aria-label="Estimated delivery"
              defaultValue={String(selectedRow.estimatedDelivery ?? "").slice(
                0,
                10,
              )}
              onChange={(e) => {
                (
                  document.getElementById(
                    "shipment-update-date",
                  ) as HTMLInputElement
                ).value = e.target.value;
              }}
            />
            <textarea
              value={eventDescription}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Public event description"
              rows={2}
            />
            <input
              name="internalNote"
              placeholder="Optional internal note (private)"
            />
            <label
              style={{ gridColumn: "1/-1", fontSize: 9, color: "#70808d" }}
            >
              <input
                type="checkbox"
                id="shipment-update-date"
                name="estimatedDelivery"
                defaultValue={String(selectedRow.estimatedDelivery ?? "").slice(
                  0,
                  10,
                )}
                style={{ display: "none" }}
              />
              Events are timestamped in UTC when saved. Estimated dates remain
              planning estimates.
            </label>
            <button className="button button-dark">Save shipment update</button>
          </form>
          <form
            className="request-form"
            style={{ marginTop: 17 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!upload) return;
              const fd = new FormData();
              fd.set("shipmentId", selected);
              fd.set("file", upload);
              const response = await fetch("/api/admin/documents", {
                method: "POST",
                body: fd,
              });
              const j = await response.json();
              setResult(response.ok ? "Document uploaded securely." : j.error);
              setUpload(null);
              await loadAgain();
            }}
          >
            <label>
              Upload private shipment document (PDF, JPG, PNG · 10 MB max)
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setUpload(e.target.files?.[0] ?? null)}
              />
            </label>
            <button className="button button-outline" disabled={!upload}>
              Upload document
            </button>
          </form>
          {Array.isArray(selectedRow.documents) &&
            selectedRow.documents.map((doc: Row) => (
              <p key={String(doc.path)} className="form-note">
                <a
                  href={`/api/admin/documents?path=${encodeURIComponent(String(doc.path))}`}
                >
                  Download {String(doc.name)}
                </a>
              </p>
            ))}
        </div>
      )}
    </>
  );
  async function loadAgain() {
    await mutate("/api/admin/shipments", {
      id: selected,
      addEvent: false,
      description: "",
    });
  }
}
const SHIPMENT_STATUSES = [
  "Shipment Created",
  "Awaiting Pickup",
  "Picked Up",
  "At Origin Facility",
  "In Transit",
  "At Destination Facility",
  "Customs Processing",
  "Out for Delivery",
  "Delivered",
  "Delivery Attempted",
  "On Hold",
  "Returned",
  "Cancelled",
];
function exportCsv(rows: Row[]) {
  const cols = [
    "trackingNumber",
    "customerName",
    "originCity",
    "destinationCity",
    "service",
    "status",
    "currentLocation",
    "estimatedDelivery",
    "createdAt",
    "updatedAt",
  ];
  const quote = (s: unknown) => `"${String(s ?? "").replaceAll('"', '""')}"`;
  const csv = [
    cols.join(","),
    ...rows.map((r) => cols.map((c) => quote(r[c])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "newlogi-shipments.csv";
  a.click();
  URL.revokeObjectURL(url);
}
