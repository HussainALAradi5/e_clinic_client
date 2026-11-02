import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { AddressPayload } from '@interfaces/reference/address.interface';

/** POST /portal/appointments — always for the signed-in patient; the clinic confirms it. */
export interface PortalBookingPayload {
  doctorId: string;
  type: AppointmentType;
  scheduledDate: string;
  startTime: string;
  reason?: string | null;
}

/**
 * PUT /portal/profile — how to reach the patient and their emergency contact. `version` locks the patient file and
 * `personVersion` the person record; only the sent keys change.
 */
export interface PortalProfilePayload {
  version: number;
  personVersion: number;
  phone?: string;
  email?: string;
  language?: 'en' | 'ar';
  notificationOptOut?: string[];
  address?: AddressPayload | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}
