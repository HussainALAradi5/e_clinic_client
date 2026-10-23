import { LookupRow } from '@shared/interfaces/ui/lookup-row.interface';

/** 'in_progress' / 'dateOfBirth' → 'In progress' / 'Date of birth'. */
export function humanise(value: string): string {
  const text = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'];

/** 1536 → '1.5 KB'. */
export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${BYTE_UNITS[unit]}`;
}

/** Human name of any record row: a person's full name, else its name, else its code. */
export function recordName(row: LookupRow): string {
  return row.fullName ?? row.name ?? row.code ?? row.id;
}

/** Two-letter avatar initials of a name: 'Rana Saleh' → 'RS', 'Grace Dela Cruz' → 'GC'. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.charAt(0) ?? '') + (parts.length > 1 ? parts[parts.length - 1].charAt(0) : '')
  ).toUpperCase();
}
