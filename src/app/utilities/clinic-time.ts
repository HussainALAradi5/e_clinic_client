import { CLINIC_TIME_ZONE } from '@constants/app.constants';
import { DateRangePreset } from '@enums/shared/date-range-preset.enum';

/** ISO date (YYYY-MM-DD) of an instant in the clinic time zone. */
export function clinicIsoDate(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: CLINIC_TIME_ZONE }).format(instant);
}

/** ISO date `days` after (or before) another. */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function parts(iso: string): { y: number; m: number; d: number; dow: number } {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    y: date.getUTCFullYear(),
    m: date.getUTCMonth(),
    d: date.getUTCDate(),
    dow: date.getUTCDay(),
  };
}

function iso(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

/** Inclusive [from, to] for a preset — same rules as DateRangePreset::range(); null for `custom`. */
export function dateRangeFor(
  preset: DateRangePreset,
  today: string = clinicIsoDate(),
): [string, string] | null {
  const { y, m, dow } = parts(today);
  const weekStart = addDays(today, -dow);
  const quarter = Math.floor(m / 3) * 3;

  switch (preset) {
    case DateRangePreset.Today:
      return [today, today];
    case DateRangePreset.Yesterday:
      return [addDays(today, -1), addDays(today, -1)];
    case DateRangePreset.ThisWeek:
      return [weekStart, addDays(weekStart, 6)];
    case DateRangePreset.LastWeek:
      return [addDays(weekStart, -7), addDays(weekStart, -1)];
    case DateRangePreset.ThisMonth:
      return [iso(y, m, 1), iso(y, m + 1, 0)];
    case DateRangePreset.LastMonth:
      return [iso(y, m - 1, 1), iso(y, m, 0)];
    case DateRangePreset.Last7Days:
      return [addDays(today, -6), today];
    case DateRangePreset.Last30Days:
      return [addDays(today, -29), today];
    case DateRangePreset.ThisQuarter:
      return [iso(y, quarter, 1), iso(y, quarter + 3, 0)];
    case DateRangePreset.ThisYear:
      return [iso(y, 0, 1), iso(y, 11, 31)];
    case DateRangePreset.Custom:
      return null;
  }
}

/** Whole years between an ISO birth date and today (clinic time). */
export function ageInYears(birthDate: string, today: string = clinicIsoDate()): number {
  const b = parts(birthDate);
  const t = parts(today);
  return t.y - b.y - (t.m < b.m || (t.m === b.m && t.d < b.d) ? 1 : 0);
}

/** Clinic wall-clock time (HH:mm, 24 h) of an instant. */
export function clinicTime(instant: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(instant);
}

/** '2026-11-01 08:15' — date and time of an ISO instant in the clinic time zone (for facts and prints). */
export function clinicDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const instant = new Date(iso);
  return `${clinicIsoDate(instant)} ${clinicTime(instant)}`;
}
