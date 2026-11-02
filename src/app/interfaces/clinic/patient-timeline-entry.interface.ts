/** GET /patients/{id}/timeline entry (appointments now; records, orders, invoices as they arrive). */
export interface PatientTimelineEntry {
  kind: string;
  id: string;
  at: string;
  title: string;
  status: string | null;
  data: Record<string, unknown>;
}
