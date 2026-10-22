import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Patient,
  PatientTimelineEntry,
  RegisterPatientPayload,
  UpdatePatientPayload,
} from '@shared/interfaces/clinic/patient.interface';
import { User } from '@shared/interfaces/identity/user.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

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
}
