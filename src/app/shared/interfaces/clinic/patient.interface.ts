import { BloodGroup } from '@shared/enums/clinic/blood-group.enum';
import { Gender } from '@shared/enums/shared/gender.enum';
import { Versioned } from '@shared/interfaces/common/generic-entity.interface';
import { NewPersonPayload, Person } from '@shared/interfaces/identity/person.interface';

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
