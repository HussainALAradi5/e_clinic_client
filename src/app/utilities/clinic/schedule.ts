import { ScheduleBlock } from '@interfaces/clinic/schedule.interface';

/** Clinic week order: Sunday first (Bahrain weekend Friday–Saturday). */
export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** One row per weekday with its working blocks as text, e.g. `Sunday — 08:00–13:00, 16:00–20:00`. */
export function weekRows(
  blocks: ScheduleBlock[],
  dayName: (day: number) => string,
): { day: string; hours: string }[] {
  return WEEK_DAYS.map((day) => ({
    day: dayName(day),
    hours:
      blocks
        .filter((b) => b.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((b) => `${b.startTime}–${b.endTime}`)
        .join(', ') || 'Off',
  }));
}
