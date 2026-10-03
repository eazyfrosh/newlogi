"use client";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Download,
  Plus,
  Printer,
  Search,
  Upload,
} from "lucide-react";
import type {
  AdminWorkspaceData,
  WorkspaceRow,
} from "@/components/workspace-types";

const statuses = [
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
const d = (v: unknown) =>
  v
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(String(v)))
    : "—";
export function AdminShipmentPanel({
  data,
  create,
  mutate,
  refresh,
}: {
  data: AdminWorkspaceData;
  create: (
    url: string,
    body: Record<string, unknown>,
  ) => Promise<WorkspaceRow | null>;
  mutate: (url: string, body: Record<string, unknown>) => Promise<boolean>;
  refresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const [location, setLocation] = useState("");
  const [estimate, setEstimate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const rows = data.shipments.filter(
    (r) =>
      !filter ||
      `${r.trackingNumber} ${r.status} ${r.originCity} ${r.destinationCity} ${r.customerName}`
        .toLowerCase()
        .includes(filter.toLowerCase()),
  );
  const visibleRows = rows.slice((page - 1) * 20, page * 20);
  const active = rows.find((r) => r.id === selected);
  async function submitCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const result = await create(
      "/api/admin/shipments",
      Object.fromEntries(f.entries()),
    );
    if (result) {
      setNotice(
        `Created ${String(result.trackingNumber)}. Share this number with the customer.`,
      );
      e.currentTarget.reset();
    }
  }
  async function submitUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await mutate("/api/admin/shipments", {
      id: selected,
      status,
      location,
      description,
      estimatedDelivery: estimate,
      internalNote: String(f.get("internalNote") ?? ""),
    });
    if (ok) {
      setSelected("");
      setNotice("Shipment updated. Event time is recorded in UTC.");
    }
  }
  async function uploadDoc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setNotice("");
    try {
      const prep = await fetch("/api/admin/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: selected,
          name: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const uploadInfo = await prep.json();
      if (!prep.ok) throw new Error(uploadInfo.error);
      const put = await fetch(uploadInfo.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("The file upload failed. Try again.");
      const response = await fetch("/api/admin/documents/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentId: selected,
          path: uploadInfo.path,
          name: uploadInfo.name,
          visibleToCustomer: visible,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setNotice("Document uploaded to private storage.");
      setFile(null);
      await refresh();
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Unable to upload this document.",
      );
    }
  }
  function exportCsv() {
    const columns = [
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
    const csv = [
      columns.join(","),
      ...rows.map((row) =>
        columns
          .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
          .join(","),
      ),
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
  return (
    <>
      <section className="portal-card">
        <div className="portal-card-head">
          <h2>Create shipment</h2>
          <span className="table-muted">
            New tracking numbers are random and unique.
          </span>
        </div>
        <form className="ship-create" onSubmit={submitCreate}>
          <select required name="customerId" defaultValue="">
            <option value="" disabled>
              Assign customer account
            </option>
            {data.customers.map((row) => (
              <option key={row.id} value={row.id}>
                {String(row.name ?? row.email)} · {row.id.slice(0, 8)}
              </option>
            ))}
          </select>
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
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input name="packageCount" placeholder="Package count" />
          <input name="weight" placeholder="Weight and unit" />
          <input name="dimensions" placeholder="Dimensions" />
          <label className="ship-date-label">
            Estimated delivery
            <input name="estimatedDelivery" type="date" />
          </label>
          <input name="currentLocation" placeholder="Current city / location" />
          <input name="description" placeholder="Public shipment description" />
          <button className="button button-orange">
            Create shipment <Plus size={14} />
          </button>
        </form>
      </section>
      <section className="portal-card">
        <div className="portal-card-head">
          <h2>
            Shipment records <span className="pill">{rows.length}</span>
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label className="search-box">
              <Search />
              <input
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search all shipments"
              />
            </label>
            <button
              className="button button-outline"
              style={{ minHeight: 36, padding: "0 10px", fontSize: 9 }}
              onClick={exportCsv}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>TRACKING</th>
                <th>CUSTOMER</th>
                <th>ROUTE</th>
                <th>STATUS</th>
                <th>UPDATED · UTC</th>
                <th>TOOLS</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td className="table-strong">{String(row.trackingNumber)}</td>
                  <td>{String(row.customerName ?? row.customerId ?? "—")}</td>
                  <td>
                    {String(row.originCity ?? "—")} →{" "}
                    {String(row.destinationCity ?? "—")}
                  </td>
                  <td>
                    <span className="pill">{String(row.status)}</span>
                  </td>
                  <td>{d(row.updatedAt ?? row.createdAt)}</td>
                  <td>
                    <button
                      className="text-link"
                      style={{ border: 0, background: "none", fontSize: 9 }}
                      onClick={() => {
                        setSelected(row.id);
                        setStatus(String(row.status));
                        setLocation(String(row.currentLocation ?? ""));
                        setEstimate(
                          String(row.estimatedDelivery ?? "").slice(0, 10),
                        );
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
                      href={`/api/admin/shipments/${row.id}/label`}
                    >
                      <Printer size={12} /> Label
                    </a>{" "}
                    ·{" "}
                    <button
                      className="text-link"
                      style={{ border: 0, background: "none", fontSize: 9 }}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Archive ${String(row.trackingNumber)}?`,
                          )
                        )
                          void mutate("/api/admin/shipments", {
                            id: row.id,
                            archived: true,
                          });
                      }}
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="empty-state">
            <p>No matching shipment records.</p>
          </div>
        )}
        <div className="pagination">
          <span>
            Showing {rows.length ? (page - 1) * 20 + 1 : 0}–
            {Math.min(page * 20, rows.length)} of {rows.length}
          </span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <button
              disabled={page * 20 >= rows.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
      {selected && active && (
        <section className="portal-card">
          <div className="portal-card-head">
            <h2>Update {String(active.trackingNumber)}</h2>
            <button className="portal-logout" onClick={() => setSelected("")}>
              Close
            </button>
          </div>
          <form className="admin-status" onSubmit={submitUpdate}>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Current location
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label>
              Estimated delivery
              <input
                type="date"
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
              />
            </label>
            <label>
              Public event description
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share a brief confirmed update"
              />
            </label>
            <label>
              Internal note
              <input name="internalNote" placeholder="Private to staff" />
            </label>
            <p className="table-muted" style={{ gridColumn: "1/-1" }}>
              Status changes create an event in UTC. Estimated delivery remains
              a planning estimate and is separate from confirmed events.
            </p>
            <button className="button button-dark">
              Save update <ArrowRight size={14} />
            </button>
          </form>
          <form className="request-form document-upload" onSubmit={uploadDoc}>
            <label>
              Private shipment document (PDF, JPG, PNG · max 10 MB)
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <label className="visible-choice">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />{" "}
              Make this document available to the assigned customer
            </label>
            <button className="button button-outline" disabled={!file}>
              <Upload size={14} /> Upload document
            </button>
          </form>
          {Array.isArray(active.documents) &&
            active.documents.map((doc) => (
              <p className="form-note" key={String(doc.path)}>
                <a
                  href={`/api/admin/documents?path=${encodeURIComponent(String(doc.path))}`}
                >
                  Download {String(doc.name)} ·{" "}
                  {doc.visibleToCustomer === true
                    ? "Customer accessible"
                    : "Staff only"}
                </a>
              </p>
            ))}
        </section>
      )}
      {notice && (
        <p className="form-note form-success" role="status">
          {notice}
        </p>
      )}
    </>
  );
}
