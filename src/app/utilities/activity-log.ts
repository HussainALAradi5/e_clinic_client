import { Data } from '@angular/router';
import { AUDIT_EMPTY_VALUE } from '@constants/common/audit-changes.constants';
import { ACTIVITY_LOG_TEXT } from '@constants/common/activity-log.constants';
import { ActivityChange } from '@interfaces/identity/activity-change.interface';
import { ActivityEntry } from '@interfaces/identity/activity-entry.interface';
import { ActivityRouteData } from '@interfaces/identity/activity-route-data.interface';
import { displayAuditValue } from '@utilities/audit';

function describeChange(change: ActivityChange): string {
  const { from, to, setTo, cleared, was } = ACTIVITY_LOG_TEXT;
  const before = displayAuditValue(change.old);
  const after = displayAuditValue(change.new);
  if (before === AUDIT_EMPTY_VALUE) {
    return `${change.label} ${setTo} ${after}`;
  }
  if (after === AUDIT_EMPTY_VALUE) {
    return `${change.label} ${cleared} (${was} ${before})`;
  }
  return `${change.label} ${from} ${before} ${to} ${after}`;
}

/** The changes of an entry as words: `Email from a@x.com to b@x.com; Phone set to 123`. */
export function describeChanges(changes: ActivityChange[]): string {
  return changes.map(describeChange).join(ACTIVITY_LOG_TEXT.changeSeparator);
}

/** A stable sort, so entries of the same moment keep the server's order. */
export function newestFirst(entries: ActivityEntry[]): ActivityEntry[] {
  return [...entries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Route data that puts the event log below a record page; [access] is who sees it there. */
export function activityLogRoute(entity: string, access: string): Data {
  const activityLog: ActivityRouteData = { entity, access };
  return { activityLog };
}
