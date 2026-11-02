/** Opening hours of one weekday (0 = Sunday); null = closed. Times are clinic-local `HH:mm`. */
export interface DayHours {
  day: number;
  opens: string | null;
  closes: string | null;
}
