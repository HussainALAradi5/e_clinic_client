/** A time of day on the 12-hour clock: hour 1–12, minute 0–59, AM or PM. */
export interface ClockTime {
  hour: number;
  minute: number;
  pm: boolean;
}
