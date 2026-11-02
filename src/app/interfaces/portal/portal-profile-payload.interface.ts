import { AddressPayload } from '@interfaces/reference/address-payload.interface';

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
