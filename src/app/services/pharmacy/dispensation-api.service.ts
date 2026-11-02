import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ColleagueRight } from '@enums/pharmacy/colleague-right.enum';
import { Page } from '@interfaces/api/page.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { AdministerPayload } from '@interfaces/pharmacy/administer-payload.interface';
import { AppointmentMedicines } from '@interfaces/pharmacy/appointment-medicines.interface';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { DispensePayload } from '@interfaces/pharmacy/dispense-payload.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/**
 * Pharmacy › Dispensing — hand-over at the pharmacy, medicines given in a session, same-day returns. Both kinds are
 * billed on the patient's draft invoice; requests carry an Idempotency-Key.
 */
@Injectable({ providedIn: 'root' })
export class DispensationApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.pharmacy.dispensations;

  list(query: ListQuery): Observable<Page<Dispensation>> {
    return this.api.list<Dispensation>(this.path, query);
  }

  get(id: string): Observable<Dispensation> {
    return this.api.get<Dispensation>(`${this.path}/${id}`);
  }

  dispense(payload: DispensePayload, idempotencyKey: string): Observable<Dispensation> {
    return this.api.post<Dispensation>(this.path, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  administer(
    appointmentId: string,
    payload: AdministerPayload,
    idempotencyKey: string,
  ): Observable<Dispensation> {
    return this.api.post<Dispensation>(
      `${ENDPOINTS.appointments}/${appointmentId}/medications`,
      payload,
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  forAppointment(appointmentId: string): Observable<AppointmentMedicines> {
    return this.api.get<AppointmentMedicines>(
      `${ENDPOINTS.appointments}/${appointmentId}/medications`,
    );
  }

  /** Same-day return to stock. */
  cancel(id: string, reason: string): Observable<Dispensation> {
    return this.api.patch<Dispensation>(`${this.path}/${id}/cancel`, { reason });
  }

  /** Staff who may witness a controlled drug or approve a stock correction (never the caller). */
  colleagues(right: ColleagueRight): Observable<UserSummary[]> {
    return this.api.get<UserSummary[]>(ENDPOINTS.pharmacy.colleagues, { params: { right } });
  }
}
