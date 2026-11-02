import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { PrescriptionPayload } from '@interfaces/pharmacy/prescription-payload.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Pharmacy › Prescriptions — written by the doctor, queued for the pharmacy until dispensed or cancelled. */
@Injectable({ providedIn: 'root' })
export class PrescriptionApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'pharmacy/prescriptions';

  list(query: ListQuery): Observable<Page<Prescription>> {
    return this.api.list<Prescription>(this.path, query);
  }

  /** Open and still valid, oldest first — what the pharmacy has to hand over. */
  queue(query: ListQuery): Observable<Page<Prescription>> {
    return this.api.list<Prescription>(`${this.path}/queue`, query);
  }

  get(id: string): Observable<Prescription> {
    return this.api.get<Prescription>(`${this.path}/${id}`);
  }

  create(payload: PrescriptionPayload): Observable<Prescription> {
    return this.api.post<Prescription>(this.path, payload);
  }

  /** Only while nothing was dispensed. */
  update(id: string, payload: PrescriptionPayload): Observable<Prescription> {
    return this.api.put<Prescription>(`${this.path}/${id}`, payload);
  }

  cancel(id: string, reason: string): Observable<Prescription> {
    return this.api.patch<Prescription>(`${this.path}/${id}/cancel`, { reason });
  }
}
