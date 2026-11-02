/** One resolved scan kept in the station's history. */
export interface ScanHistoryEntry {
  at: number;
  payload: string;
  ok: boolean;
  label: string;
}
