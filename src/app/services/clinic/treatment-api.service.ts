import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import {
  BookableProvider,
  SessionBookingPayload,
  Treatment,
  TreatmentPayload,
  TreatmentSession,
} from '@interfaces/clinic/treatment.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Clinic › Treatments — plans, their sessions, the reception queue and the plan lifecycle. */
@Injectable({ providedIn: 'root' })
export class TreatmentApi extends EntityApi<Treatment, TreatmentPayload> {
  constructor() {
    super('treatments');
  }

  /** Prescribe (sent with the dialog's Idempotency-Key). */
  prescribe(payload: TreatmentPayload, idempotencyKey: string): Observable<Treatment> {
    return this.api.post<Treatment>(this.path, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  queue(doctorId?: string | null): Observable<Treatment[]> {
    return this.api.get<Treatment[]>(`${this.path}/queue`, {
      params: doctorId ? { doctorId } : {},
    });
  }

  sessions(id: string): Observable<TreatmentSession[]> {
    return this.api.get<TreatmentSession[]>(`${this.path}/${id}/sessions`);
  }

  bookSession(
    id: string,
    payload: SessionBookingPayload,
    idempotencyKey: string,
  ): Observable<Appointment> {
    return this.api.post<Appointment>(`${this.path}/${id}/sessions`, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  changePriority(id: string, priority: TreatmentPriority, reason: string): Observable<Treatment> {
    return this.api.patch<Treatment>(`${this.path}/${id}/priority`, { priority, reason });
  }

  complete(id: string): Observable<Treatment> {
    return this.api.patch<Treatment>(`${this.path}/${id}/complete`);
  }

  cancel(id: string, reason: string): Observable<Treatment> {
    return this.api.patch<Treatment>(`${this.path}/${id}/cancel`, { reason });
  }

  /** Doctors (and medical staff for sessions) that can take a booking. */
  providers(type: AppointmentType): Observable<BookableProvider[]> {
    return this.api.get<BookableProvider[]>('appointments/providers', { params: { type } });
  }
}
