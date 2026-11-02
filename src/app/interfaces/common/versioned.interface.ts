/** Records with optimistic locking (HasVersion) — send `version` back on update. */
export interface Versioned {
  version: number;
}
