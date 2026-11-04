import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ChargePayload } from '@interfaces/billing/charge-payload.interface';
import { Coverage } from '@interfaces/billing/coverage.interface';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { InvoicePayload } from '@interfaces/billing/invoice-payload.interface';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { EntityApi } from '@services/api/entity-api.service';
import { ENDPOINTS } from '@config/endpoints';

/** Billing › Invoices — the patient's draft, issuing (number + revenue), cancelling, billing a visit by hand. */
@Injectable({ providedIn: 'root' })
export class InvoiceApi extends EntityApi<Invoice, InvoicePayload> {
  constructor() {
    super(ENDPOINTS.billing.invoices);
  }

  /** Issued invoices with a balance, oldest first (cashier desk). */
  outstanding(query: ListQuery): Observable<Page<Invoice>> {
    return this.api.list<Invoice>(`${this.path}/outstanding`, query);
  }

  /** Invoices narrowed on the server to a payment state (unpaid, overdue …) and / or a way of paying. */
  listBy(
    query: ListQuery,
    paymentState: string | null,
    method: string | null,
  ): Observable<Page<Invoice>> {
    return this.api.list<Invoice>(this.path, query, { payment_state: paymentState, method });
  }

  /** Adds the source's lines to the patient's open draft (created when missing). */
  charge(payload: ChargePayload): Observable<Invoice> {
    return this.api.post<Invoice>(`${this.path}/charge`, payload);
  }

  issue(id: string, idempotencyKey: string): Observable<Invoice> {
    return this.api.post<Invoice>(
      `${this.path}/${id}/issue`,
      {},
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  /** Sends the patient a payment reminder now (their own part owed); not twice within a day. */
  remind(id: string): Observable<Invoice> {
    return this.api.post<Invoice>(`${this.path}/${id}/remind`, {});
  }

  cancel(id: string, reason: string): Observable<Invoice> {
    return this.api.post<Invoice>(`${this.path}/${id}/cancel`, { reason });
  }

  /** The insurer / patient split: what the desk takes now on an insured invoice (the co-pay). */
  coverage(id: string): Observable<Coverage> {
    return this.api.get<Coverage>(`${this.path}/${id}/coverage`);
  }
}
