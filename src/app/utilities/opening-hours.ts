import { CLINIC_TIME_ZONE } from '@constants/app.constants';
import { DayHours } from '@interfaces/public/day-hours.interface';
import { OpeningStatus } from '@interfaces/public/opening-status.interface';

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Weekday (0–6) and `HH:mm` of an instant in the clinic time zone. */
export function clinicClock(instant: Date): { day: number; time: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
  return { day: WEEKDAY_INDEX[get('weekday')] ?? 0, time: `${get('hour')}:${get('minute')}` };
}

/** Is the clinic open at `instant` (clinic time), and when does it close / open next? */
export function openingStatus(hours: DayHours[], instant: Date = new Date()): OpeningStatus {
  const { day, time } = clinicClock(instant);
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const today = byDay.get(day);

  if (today?.opens && today.closes && time >= today.opens && time < today.closes) {
    return { open: true, closesAt: today.closes, nextOpen: null };
  }
  if (today?.opens && time < today.opens) {
    return { open: false, closesAt: null, nextOpen: { day, time: today.opens } };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const next = byDay.get((day + offset) % 7);
    if (next?.opens) {
      return { open: false, closesAt: null, nextOpen: { day: next.day, time: next.opens } };
    }
  }
  return { open: false, closesAt: null, nextOpen: null };
}
