import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@shared/interfaces/api/page.interface';
import {
  AskableDay,
  StaffRequest,
  StaffRequestPayload,
} from '@shared/interfaces/hr/staff-request.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** HR › Requests — late excuses and overtime: staff ask about their days, HR approves or rejects with a reason. */
@Injectable({ providedIn: 'root' })
export class StaffRequestApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/requests';

  /** Own requests, or everyone's for HR. */
  list(query: ListQuery): Observable<Page<StaffRequest>> {
    return this.api.list<StaffRequest>(this.path, query);
  }

  /** My recent days that can still be asked about (only kinds HR has switched on). */
  askable(): Observable<AskableDay[]> {
    return this.api.get<AskableDay[]>(`${this.path}/askable`);
  }

  create(payload: StaffRequestPayload): Observable<StaffRequest> {
    return this.api.post<StaffRequest>(this.path, payload);
  }

  /** The reason is optional when approving. */
  approve(id: string, reason: string | null): Observable<StaffRequest> {
    return this.api.patch<StaffRequest>(`${this.path}/${id}/approve`, { reason });
  }

  /** The reason is required when rejecting. */
  reject(id: string, reason: string): Observable<StaffRequest> {
    return this.api.patch<StaffRequest>(`${this.path}/${id}/reject`, { reason });
  }

  cancel(id: string): Observable<StaffRequest> {
    return this.api.patch<StaffRequest>(`${this.path}/${id}/cancel`);
  }
}
