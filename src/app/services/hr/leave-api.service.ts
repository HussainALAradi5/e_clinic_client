import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@interfaces/api/page.interface';
import {
  LeaveBalance,
  LeaveRequest,
  LeaveRequestPayload,
  LeaveType,
  LeaveTypePayload,
} from '@interfaces/hr/leave.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** HR › Leaves — types, yearly balances and requests (approved by someone other than the requester). */
@Injectable({ providedIn: 'root' })
export class LeaveApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/leaves';

  types(withArchived = false): Observable<LeaveType[]> {
    return this.api.get<LeaveType[]>(`${this.path}/types`, { params: { withArchived } });
  }

  saveType(payload: LeaveTypePayload, id?: string): Observable<LeaveType> {
    return id
      ? this.api.put<LeaveType>(`${this.path}/types/${id}`, payload)
      : this.api.post<LeaveType>(`${this.path}/types`, payload);
  }

  balances(employeeId: string, year?: number): Observable<LeaveBalance[]> {
    return this.api.get<LeaveBalance[]>(`${this.path}/balances/${employeeId}`, {
      params: year ? { year } : {},
    });
  }

  list(query: ListQuery): Observable<Page<LeaveRequest>> {
    return this.api.list<LeaveRequest>(this.path, query);
  }

  get(id: string): Observable<LeaveRequest> {
    return this.api.get<LeaveRequest>(`${this.path}/${id}`);
  }

  /** Waits as a draft when the type needs a certificate (attach it, then submit). */
  request(payload: LeaveRequestPayload): Observable<LeaveRequest> {
    return this.api.post<LeaveRequest>(this.path, payload);
  }

  submit(id: string): Observable<LeaveRequest> {
    return this.api.patch<LeaveRequest>(`${this.path}/${id}/submit`);
  }

  /** `cancelAffected` confirms cancelling a provider's bookings on the leave days. */
  approve(id: string, notes: string | null, cancelAffected = false): Observable<LeaveRequest> {
    return this.api.patch<LeaveRequest>(`${this.path}/${id}/approve`, { notes, cancelAffected });
  }

  reject(id: string, notes: string): Observable<LeaveRequest> {
    return this.api.patch<LeaveRequest>(`${this.path}/${id}/reject`, { notes });
  }

  cancel(id: string): Observable<LeaveRequest> {
    return this.api.patch<LeaveRequest>(`${this.path}/${id}/cancel`);
  }
}
