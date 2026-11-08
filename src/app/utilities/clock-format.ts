import { computed, signal } from '@angular/core';
import { DATE_FORMAT } from '@constants/app.constants';
import { TimeFormat } from '@enums/identity/time-format.enum';

export const DEFAULT_TIME_FORMAT = TimeFormat.TwelveHour;

/** The signed-in person's choice, set from their profile by AuthStore. */
export const clockFormat = signal<TimeFormat>(DEFAULT_TIME_FORMAT);

const is24Hour = computed(() => clockFormat() === TimeFormat.TwentyFourHour);

export const timeFormat = computed(() => (is24Hour() ? 'HH:mm' : 'h:mm a'));
export const timeSecondsFormat = computed(() => (is24Hour() ? 'HH:mm:ss' : 'h:mm:ss a'));
export const dateTimeFormat = computed(() => `${DATE_FORMAT}, ${timeFormat()}`);
export const dateTimeSecondsFormat = computed(() => `${DATE_FORMAT}, ${timeSecondsFormat()}`);

/** A wall-clock time from the API (`16:00` / `16:00:00`) in the person's format; other text is returned as is. */
export function wallClock(time: string | null | undefined): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time ?? '');
  if (!match) {
    return time ?? '';
  }
  if (is24Hour()) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  const hour = Number(match[1]);
  return `${hour % 12 === 0 ? 12 : hour % 12}:${match[2]} ${hour < 12 ? 'AM' : 'PM'}`;
}
