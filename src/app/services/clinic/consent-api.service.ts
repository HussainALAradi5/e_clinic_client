import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsentPayload } from '@interfaces/clinic/consent-payload.interface';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Clinic › Patient consents — list, record, revoke. */
@Injectable({ providedIn: 'root' })
export class ConsentApi {
  private readonly api = inject(ApiClient);

  list(patientId: string): Observable<PatientConsent[]> {
    return this.api.get<PatientConsent[]>(`patients/${patientId}/consents`);
  }

  get(id: string): Observable<PatientConsent> {
    return this.api.get<PatientConsent>(`consents/${id}`);
  }

  record(patientId: string, payload: ConsentPayload): Observable<PatientConsent> {
    return this.api.post<PatientConsent>(`patients/${patientId}/consents`, payload);
  }

  revoke(id: string, reason: string): Observable<PatientConsent> {
    return this.api.patch<PatientConsent>(`consents/${id}/revoke`, { reason });
  }
}
