import { ClockTime } from '@interfaces/ui/clock-time.interface';

/** Times are stored as 24-hour "HH:mm" (what the API takes) and shown on the 12-hour clock with AM / PM. */
export const ClockTimes = {
  /** "16:05" → 4:05 PM; empty or invalid → 9:00 AM (a sensible start for the picker). */
  parse(value: string | null | undefined): ClockTime {
    const match = /^(\d{1,2}):(\d{2})/.exec(value ?? '');
    const h = match ? Math.min(23, Number(match[1])) : 9;
    const minute = match ? Math.min(59, Number(match[2])) : 0;
    return { hour: h % 12 === 0 ? 12 : h % 12, minute, pm: h >= 12 };
  },

  /** 4:05 PM → "16:05". */
  toValue(time: ClockTime): string {
    const h = (time.hour % 12) + (time.pm ? 12 : 0);
    return `${String(h).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  },

  /** "16:05" → "4:05 PM"; empty → "". */
  label(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const t = ClockTimes.parse(value);
    return `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.pm ? 'PM' : 'AM'}`;
  },
};
