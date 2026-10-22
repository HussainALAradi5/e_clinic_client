import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@core/interceptors/http-context';
import { AppointmentType } from '@shared/enums/clinic/appointment-type.enum';
import { Appointment, Slot } from '@shared/interfaces/clinic/appointment.interface';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import {
  PortalBookingPayload,
  PortalProfilePayload,
} from '@shared/interfaces/portal/portal.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/**
 * Patient portal — what a patient changes themselves (`/portal/*`). Their appointments, treatments, results,
 * prescriptions and invoices are read with the regular APIs, which return only their own records.
 */
@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'portal';

  profile(): Observable<Patient> {
    return this.api.get<Patient>(`${this.path}/profile`);
  }

  updateProfile(payload: PortalProfilePayload): Observable<Patient> {
    return this.api.put<Patient>(`${this.path}/profile`, payload);
  }

  /** Free slots that can still be booked online (at least two hours ahead). */
  slots(doctorId: string, date: string, type: AppointmentType): Observable<Slot[]> {
    return this.api.get<Slot[]>(`${this.path}/slots`, { params: { doctorId, date, type } });
  }

  book(payload: PortalBookingPayload, idempotencyKey: string): Observable<Appointment> {
    return this.api.post<Appointment>(`${this.path}/appointments`, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  cancel(id: string, reason: string): Observable<Appointment> {
    return this.api.patch<Appointment>(`${this.path}/appointments/${id}/cancel`, { reason });
  }
}
