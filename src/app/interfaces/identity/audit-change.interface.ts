/** One changed attribute of an audit entry (old → new), for display. */
export interface AuditChange {
  field: string;
  before: string;
  after: string;
}
