import { BloodGroup } from '@enums/clinic/blood-group.enum';
import { Gender } from '@enums/shared/gender.enum';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Person } from '@interfaces/identity/person.interface';

/** Mirror of PatientResource — the patient file (medical extension of a person, same id; code = MRN). */
export interface Patient extends Versioned {
  id: string;
  code: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  age: number;
  phone: string;
  email: string | null;
  person: Person;
  /** Only with `patients.view_medical`. */
  bloodGroup?: BloodGroup;
  allergies?: string | null;
  chronicConditions?: string | null;
  familyHistory?: string | null;
  surgicalHistory?: string | null;
  hasMedicalAlerts: boolean | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  insuranceCompanyId: string | null;
  insurer?: { id: string; name: string } | null;
  insurancePolicyNumber: string | null;
  insuranceExpiryDate: string | null;
  insuranceCoveragePercent: string | null;
  notes: string | null;
  hasPortalAccount?: boolean;
  appointmentsCount?: number;
  upcomingAppointmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}
