import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { Page } from '@shared/interfaces/api/page.interface';
import { SickLeave, SickLeavePayload } from '@shared/interfaces/clinic/sick-leave.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Sick leave certificates: issued at a visit by its doctor; listed (own / all), printed, cancelled. */
@Injectable({ providedIn: 'root' })
export class SickLeaveApi {
  private readonly api = inject(ApiClient);

  list(query: ListQuery): Observable<Page<SickLeave>> {
    return this.api.list<SickLeave>('sick-leaves', query);
  }

  get(id: string): Observable<SickLeave> {
    return this.api.get<SickLeave>(`sick-leaves/${id}`);
  }

  issue(appointmentId: string, payload: SickLeavePayload): Observable<SickLeave> {
    return this.api.post<SickLeave>(`appointments/${appointmentId}/sick-leaves`, payload);
  }

  cancel(id: string, reason: string): Observable<SickLeave> {
    return this.api.patch<SickLeave>(`sick-leaves/${id}/cancel`, { reason });
  }
}
