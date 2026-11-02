import { ShiftType } from '@enums/hr/shift-type.enum';
import { Shift } from '@interfaces/hr/shift.interface';

/** Minutes since midnight of "HH:mm". */
export function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** "8 h", "7 h 30". */
export function hoursLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

/** What a shift means, in one line: "08:00 – 16:00 · 8 h" or "In by 10:00 · 8 h a day between 07:00 and 19:00". */
export function hoursText(
  shift: Pick<Shift, 'type' | 'startTime' | 'endTime' | 'latestStart' | 'requiredMinutes'>,
): string {
  if (shift.type === ShiftType.Fixed) {
    const length = Math.max(0, minutesOf(shift.endTime) - minutesOf(shift.startTime));
    return `${shift.startTime} – ${shift.endTime} · ${hoursLabel(length)}`;
  }
  return `In by ${shift.latestStart ?? '—'} · ${hoursLabel(shift.requiredMinutes)} a day between ${shift.startTime} and ${shift.endTime}`;
}
