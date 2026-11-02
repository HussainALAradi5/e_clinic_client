import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ChargePayload, Invoice, InvoicePayload } from '@interfaces/billing/invoice.interface';
import { Page } from '@interfaces/api/page.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Billing › Invoices — the patient's draft, issuing (number + revenue), cancelling, billing a visit by hand. */
@Injectable({ providedIn: 'root' })
export class InvoiceApi extends EntityApi<Invoice, InvoicePayload> {
  constructor() {
    super('billing/invoices');
  }

  /** Issued invoices with a balance, oldest first (cashier desk). */
  outstanding(query: ListQuery): Observable<Page<Invoice>> {
    return this.api.list<Invoice>(`${this.path}/outstanding`, query);
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

  cancel(id: string, reason: string): Observable<Invoice> {
    return this.api.post<Invoice>(`${this.path}/${id}/cancel`, { reason });
  }
}
