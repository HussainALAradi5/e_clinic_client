import { DayHours } from '@interfaces/public/day-hours.interface';

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
