import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { Page } from '@interfaces/api/page.interface';
import { DailySummary } from '@interfaces/billing/daily-summary.interface';
import { Payment } from '@interfaces/billing/payment.interface';
import { PaymentPayload } from '@interfaces/billing/payment-payload.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Billing › Payments — money taken against invoices; never edited, voided the same day or refunded. */
@Injectable({ providedIn: 'root' })
export class PaymentApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.billing.payments;

  list(query: ListQuery): Observable<Page<Payment>> {
    return this.api.list<Payment>(this.path, query);
  }

  get(id: string): Observable<Payment> {
    return this.api.get<Payment>(`${this.path}/${id}`);
  }

  /** One method per call; a retried click replays the same payment (same key). */
  record(payload: PaymentPayload, idempotencyKey: string): Observable<Payment> {
    return this.api.post<Payment>(this.path, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }

  void(id: string, reason: string): Observable<Payment> {
    return this.api.post<Payment>(`${this.path}/${id}/void`, { reason });
  }

  dailySummary(date?: string, cashierId?: string | null): Observable<DailySummary> {
    const params: Record<string, string> = {};
    if (date) params['date'] = date;
    if (cashierId) params['cashierId'] = cashierId;
    return this.api.get<DailySummary>(`${this.path}/daily-summary`, { params });
  }
}
