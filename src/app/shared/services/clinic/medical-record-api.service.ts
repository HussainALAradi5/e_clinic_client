import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Icd10Code,
  MedicalRecord,
  MedicalRecordPayload,
} from '@shared/interfaces/clinic/medical-record.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Clinic › Medical records — the note of one visit (same id as the appointment) and ICD-10 search. */
@Injectable({ providedIn: 'root' })
export class MedicalRecordApi {
  private readonly api = inject(ApiClient);

  get(appointmentId: string): Observable<MedicalRecord> {
    return this.api.get<MedicalRecord>(this.path(appointmentId));
  }

  save(appointmentId: string, payload: MedicalRecordPayload): Observable<MedicalRecord> {
    return this.api.put<MedicalRecord>(this.path(appointmentId), payload);
  }

  sign(appointmentId: string): Observable<MedicalRecord> {
    return this.api.post<MedicalRecord>(`${this.path(appointmentId)}/sign`);
  }

  addAddendum(appointmentId: string, text: string): Observable<MedicalRecord> {
    return this.api.post<MedicalRecord>(`${this.path(appointmentId)}/addenda`, { text });
  }

  searchIcd10(search: string): Observable<Icd10Code[]> {
    return this.api.get<Icd10Code[]>('icd10', { params: { search } });
  }

  private path(appointmentId: string): string {
    return `appointments/${appointmentId}/medical-record`;
  }
}
