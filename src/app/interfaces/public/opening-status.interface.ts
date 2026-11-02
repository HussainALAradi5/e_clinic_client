/** Result of openingStatus(). */
export interface OpeningStatus {
  open: boolean;
  /** `HH:mm` closing time today when open. */
  closesAt: string | null;
  /** Next opening (weekday 0–6 and time) when closed. */
  nextOpen: { day: number; time: string } | null;
}
