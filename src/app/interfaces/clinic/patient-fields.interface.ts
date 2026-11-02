import { BloodGroup } from '@enums/clinic/blood-group.enum';

/** Medical / insurance fields of POST / PUT /patients. */
export interface PatientFields {
  bloodGroup?: BloodGroup;
  allergies?: string | null;
  chronicConditions?: string | null;
  familyHistory?: string | null;
  surgicalHistory?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  insuranceCompanyId?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiryDate?: string | null;
  insuranceCoveragePercent?: string | null;
  notes?: string | null;
}
