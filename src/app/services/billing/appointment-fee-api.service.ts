import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { AppointmentFee } from '@interfaces/billing/appointment-fee.interface';
import { Money } from '@interfaces/common/money.interface';
import { ApiClient } from '@services/api/api-client.service';

/** Billing › Fees for missed and late-cancelled visits; the server charges them and decides who may waive. */
@Injectable({ providedIn: 'root' })
export class AppointmentFeeApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.billing.appointmentFees;

  /** Reason is required (at least 10 characters); only while the fee's invoice is a draft. */
  waive(id: string, reason: string): Observable<AppointmentFee> {
    return this.api.post<AppointmentFee>(`${this.path}/${id}/waive`, { reason });
  }

  /** What the patient would pay for cancelling this visit now; null = free. */
  cancellationFee(appointmentId: string): Observable<Money | null> {
    return this.api
      .get<{ amount: Money | null }>(
        `${ENDPOINTS.billing.appointments}/${appointmentId}/cancellation-fee`,
      )
      .pipe(map((r) => r.amount));
  }
}
