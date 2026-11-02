import { AuditAction } from '@enums/identity/audit-action.enum';
import { AuditActor } from '@interfaces/identity/audit-actor.interface';

/** Mirror of AuditLogResource — append-only, values already masked by the server. */
export interface AuditLog {
  id: string;
  action: AuditAction;
  module: string;
  /** Public alias (`role`, `invoice` …) or the morph class for unlisted models. */
  auditableType: string | null;
  auditableId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
  user: AuditActor | null;
}
