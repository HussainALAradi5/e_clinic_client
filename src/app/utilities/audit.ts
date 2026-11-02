import { humanise } from '@utilities/text';
import { AuditChange } from '@interfaces/identity/audit-change.interface';
import { AuditLog } from '@interfaces/identity/audit-log.interface';

function display(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(display).join(', ') : '—';
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/** Old / new values of an audit entry as rows (keys already camelCased by the case interceptor). */
export function auditChanges(entry: Pick<AuditLog, 'oldValues' | 'newValues'>): AuditChange[] {
  const before = entry.oldValues ?? {};
  const after = entry.newValues ?? {};
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].map((key) => ({
    field: humanise(key.replace(/([A-Z])/g, '_$1').toLowerCase()),
    before: display(before[key]),
    after: display(after[key]),
  }));
}
