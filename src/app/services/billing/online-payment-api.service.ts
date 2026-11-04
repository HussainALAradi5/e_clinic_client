import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { OnlinePayment } from '@interfaces/billing/online-payment.interface';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ApiClient } from '@services/api/api-client.service';

/** Billing › Online payments — the server opens the gateway charge and books it once the gateway confirms. */
@Injectable({ providedIn: 'root' })
export class OnlinePaymentApi {
  private readonly api = inject(ApiClient);

  /** Opens a charge for what the patient owes on the invoice; send the payer to `checkoutUrl`. */
  start(invoiceId: string, idempotencyKey: string): Observable<OnlinePayment> {
    return this.api.post<OnlinePayment>(
      `${ENDPOINTS.billing.invoices}/${invoiceId}/online-payments`,
      {},
      { context: withIdempotencyKey(idempotencyKey) },
    );
  }

  /** The attempt as it stands (the server asks the gateway again while it waits). */
  get(id: string): Observable<OnlinePayment> {
    return this.api.get<OnlinePayment>(`${ENDPOINTS.billing.onlinePayments}/${id}`);
  }
}
