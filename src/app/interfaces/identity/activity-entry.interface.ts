import { AuditAction } from '@enums/identity/audit-action.enum';
import { ActivityChange } from '@interfaces/identity/activity-change.interface';

/** One row of GET /activity/{entity}/{id}. */
export interface ActivityEntry {
  id: string;
  action: AuditAction;
  actionLabel: string;
  entity: string;
  changes: ActivityChange[];
  /** Null when the system made the change. */
  changedBy: string | null;
  createdAt: string;
}
