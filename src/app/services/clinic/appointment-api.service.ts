import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { BookAppointmentPayload } from '@interfaces/clinic/book-appointment-payload.interface';
import { CancelAppointmentPayload } from '@interfaces/clinic/cancel-appointment-payload.interface';
import { CompleteAppointmentPayload } from '@interfaces/clinic/complete-appointment-payload.interface';
import { ReschedulePayload } from '@interfaces/clinic/reschedule-payload.interface';
import { Slot } from '@interfaces/clinic/slot.interface';
import { AuditLog } from '@interfaces/identity/audit-log.interface';
import { BulkActionRequest } from '@interfaces/bulk/bulk.interface';
import { BulkResult } from '@interfaces/bulk/bulk-result.interface';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Clinic › Appointments (one method per endpoint). Booking sends the wizard's Idempotency-Key. */
@Injectable({ providedIn: 'root' })
export class AppointmentApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'appointments';

  list(query: ListQuery): Observable<Page<Appointment>> {
    return this.api.list<Appointment>(this.path, query);
  }

  get(id: string): Observable<Appointment> {
    return this.api.get<Appointment>(`${this.path}/${id}`);
  }

  calendar(
    from: string,
    to: string,
    filters: { providerId?: string | null; roomId?: string | null } = {},
  ): Observable<Appointment[]> {
    const params: Record<string, string> = { from, to };
    if (filters.providerId) params['providerId'] = filters.providerId;
    if (filters.roomId) params['roomId'] = filters.roomId;
    return this.api.get<Appointment[]>(`${this.path}/calendar`, { params });
  }

  availableSlots(
    providerId: string,
    date: string,
    type: AppointmentType,
    roomId?: string | null,
  ): Observable<Slot[]> {
    const params: Record<string, string> = { providerId, date, type };
    if (roomId) params['roomId'] = roomId;
    return this.api.get<Slot[]>(`${this.path}/available-slots`, { params });
  }

  book(payload: BookAppointmentPayload, idempotencyKey: string): Observable<Appointment> {
    return this.api.post<Appointment>(this.path, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  confirm(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/confirm`);
  }

  checkIn(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/check-in`);
  }

  start(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/start`);
  }

  complete(id: string, payload: CompleteAppointmentPayload = {}): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/complete`, payload);
  }

  cancel(id: string, payload: CancelAppointmentPayload): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/cancel`, payload);
  }

  reschedule(id: string, payload: ReschedulePayload): Observable<Appointment> {
    return this.api.post<Appointment>(`${this.path}/${id}/reschedule`, payload);
  }

  noShow(id: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/${id}/no-show`);
  }

  history(id: string): Observable<AuditLog[]> {
    return this.api.get<AuditLog[]>(`${this.path}/${id}/history`);
  }

  bulk(request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>(`${this.path}/bulk`, request);
  }
}
