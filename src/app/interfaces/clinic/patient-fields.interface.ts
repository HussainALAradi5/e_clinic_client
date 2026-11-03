import { BloodGroup } from '@enums/clinic/blood-group.enum';
import { EmergencyContact } from '@interfaces/clinic/emergency-contact.interface';

/** Medical / insurance fields of POST / PUT /patients. */
export interface PatientFields {
  bloodGroup?: BloodGroup;
  allergies?: string | null;
  chronicConditions?: string | null;
  familyHistory?: string | null;
  surgicalHistory?: string | null;
  emergencyContacts?: EmergencyContact[];
  insuranceCompanyId?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiryDate?: string | null;
  insuranceCoveragePercent?: string | null;
  notes?: string | null;
}
