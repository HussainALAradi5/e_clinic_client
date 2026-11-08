import { AUDIT_EMPTY_VALUE } from '@constants/common/audit-changes.constants';
import { humanise } from '@utilities/text';
import { AuditChange } from '@interfaces/identity/audit-change.interface';
import { AuditLog } from '@interfaces/identity/audit-log.interface';

/** A stored value as text; empty values read as AUDIT_EMPTY_VALUE. */
export function displayAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return AUDIT_EMPTY_VALUE;
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(displayAuditValue).join(', ') : AUDIT_EMPTY_VALUE;
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** Old / new values of an audit entry as rows (keys already camelCased by the case interceptor). */
export function auditChanges(entry: Pick<AuditLog, 'oldValues' | 'newValues'>): AuditChange[] {
  const before = entry.oldValues ?? {};
  const after = entry.newValues ?? {};
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].map((key) => ({
    field: humanise(key.replace(/([A-Z])/g, '_$1').toLowerCase()),
    before: displayAuditValue(before[key]),
    after: displayAuditValue(after[key]),
  }));
}
