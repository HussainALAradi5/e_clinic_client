/** Opening hours of one weekday (0 = Sunday); null = closed. Times are clinic-local `HH:mm`. */
export interface DayHours {
  day: number;
  opens: string | null;
  closes: string | null;
}

/** A service line shown on the public website. */
export interface ServiceLine {
  icon: string;
  title: string;
  description: string;
  /** Shown as the large tile of the services grid. */
  featured?: boolean;
}

/** One step of a patient visit (a real sequence). */
export interface VisitStep {
  title: string;
  description: string;
}

/** Public facts about the clinic (website header, footer, contact section). */
export interface ClinicInfo {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  addressLines: string[];
  mapUrl: string;
  hours: DayHours[];
  emergencyNote: string;
}

/** Result of openingStatus(). */
export interface OpeningStatus {
  open: boolean;
  /** `HH:mm` closing time today when open. */
  closesAt: string | null;
  /** Next opening (weekday 0–6 and time) when closed. */
  nextOpen: { day: number; time: string } | null;
}
