import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsentPayload } from '@interfaces/clinic/consent-payload.interface';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Clinic › Patient consents — list, record, revoke. */
@Injectable({ providedIn: 'root' })
export class ConsentApi {
  private readonly api = inject(ApiClient);

  list(patientId: string): Observable<PatientConsent[]> {
    return this.api.get<PatientConsent[]>(`${ENDPOINTS.patients}/${patientId}/consents`);
  }

  get(id: string): Observable<PatientConsent> {
    return this.api.get<PatientConsent>(`${ENDPOINTS.consents}/${id}`);
  }

  record(patientId: string, payload: ConsentPayload): Observable<PatientConsent> {
    return this.api.post<PatientConsent>(`${ENDPOINTS.patients}/${patientId}/consents`, payload);
  }

  revoke(id: string, reason: string): Observable<PatientConsent> {
    return this.api.patch<PatientConsent>(`${ENDPOINTS.consents}/${id}/revoke`, { reason });
  }
}
