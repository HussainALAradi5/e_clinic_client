import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicalHistoryPayload } from '@interfaces/clinic/medical-history-payload.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { PatientLookup } from '@interfaces/clinic/patient-lookup.interface';
import { PatientTimelineEntry } from '@interfaces/clinic/patient-timeline-entry.interface';
import { RegisterPatientPayload } from '@interfaces/clinic/register-patient-payload.interface';
import { UpdatePatientPayload } from '@interfaces/clinic/update-patient-payload.interface';
import { User } from '@interfaces/identity/user.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Clinic › Patients (one method per endpoint). */
@Injectable({ providedIn: 'root' })
export class PatientApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'patients';

  get(id: string): Observable<Patient> {
    return this.api.get<Patient>(`${this.path}/${id}`);
  }

  register(payload: RegisterPatientPayload): Observable<Patient> {
    return this.api.post<Patient>(this.path, payload);
  }

  update(id: string, payload: UpdatePatientPayload): Observable<Patient> {
    return this.api.put<Patient>(`${this.path}/${id}`, payload);
  }

  createPortalAccount(id: string): Observable<User> {
    return this.api.post<User>(`${this.path}/${id}/portal-account`);
  }

  timeline(id: string): Observable<PatientTimelineEntry[]> {
    return this.api.get<PatientTimelineEntry[]>(`${this.path}/${id}/timeline`);
  }

  /** Clinicians caring for the patient update allergies, chronic conditions, family and surgical history. */
  medicalHistory(id: string, payload: MedicalHistoryPayload): Observable<Patient> {
    return this.api.put<Patient>(`${this.path}/${id}/medical-history`, payload);
  }

  /** A patient by file number or national ID, identity only (to confirm before breaking the glass). */
  lookup(query: { code?: string; nationalId?: string }): Observable<PatientLookup | null> {
    const params: Record<string, string> = {};
    if (query.code) params['code'] = query.code;
    if (query.nationalId) params['nationalId'] = query.nationalId;
    return this.api.get<PatientLookup | null>(`${this.path}/lookup`, { params });
  }

  /** Break the glass: opens the file for a few hours; audited, admins are told. */
  emergencyAccess(id: string, reason: string): Observable<{ patient: Patient; expiresAt: string }> {
    return this.api.post<{ patient: Patient; expiresAt: string }>(
      `${this.path}/${id}/emergency-access`,
      { reason },
    );
  }
}
