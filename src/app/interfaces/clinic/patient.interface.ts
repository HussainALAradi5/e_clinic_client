import { BloodGroup } from '@enums/clinic/blood-group.enum';
import { Gender } from '@enums/shared/gender.enum';
import { Versioned } from '@interfaces/common/generic-entity.interface';
import { NewPersonPayload, Person } from '@interfaces/identity/person.interface';

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

/** POST /patients — an existing person (`personId`) or a new one. */
export interface RegisterPatientPayload extends PatientFields {
  personId?: string;
  person?: NewPersonPayload;
  forceCreate?: boolean;
}

/** PUT /patients/{id}/medical-history — the care team's medical history (absent fields unchanged). */
export interface MedicalHistoryPayload {
  version: number;
  allergies?: string | null;
  chronicConditions?: string | null;
  familyHistory?: string | null;
  surgicalHistory?: string | null;
}

/** GET /patients/lookup — who the patient is (no medical data) and whether the file is open to the caller. */
export interface PatientLookup {
  id: string;
  code: string;
  fullName: string;
  gender: string;
  age: number;
  inCare: boolean;
}

/** PUT /patients/{id}. */
export interface UpdatePatientPayload extends PatientFields {
  version: number;
}

/** GET /patients/{id}/timeline entry (appointments now; records, orders, invoices as they arrive). */
export interface PatientTimelineEntry {
  kind: string;
  id: string;
  at: string;
  title: string;
  status: string | null;
  data: Record<string, unknown>;
}
