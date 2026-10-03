export type WorkspaceRow = Record<string, unknown> & { id: string };
export type AdminWorkspaceData = {
  user: { uid: string; name: string; email: string; role: string };
  metrics: Record<string, number | null>;
  shipments: WorkspaceRow[];
  recentShipments: WorkspaceRow[];
  quotes: WorkspaceRow[];
  requests: WorkspaceRow[];
  customers: WorkspaceRow[];
  staff: WorkspaceRow[];
  supportThreads: WorkspaceRow[];
  contactMessages: WorkspaceRow[];
  invoices: WorkspaceRow[];
};
