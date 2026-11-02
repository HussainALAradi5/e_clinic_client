import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { Page } from '@interfaces/api/page.interface';
import { Refund } from '@interfaces/billing/refund.interface';
import { RefundPayload } from '@interfaces/billing/refund-payload.interface';
import { BulkActionRequest } from '@interfaces/bulk/bulk.interface';
import { BulkResult } from '@interfaces/bulk/bulk-result.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Billing › Refunds — requested at the desk, approved by someone else, paid out by the cashier. */
@Injectable({ providedIn: 'root' })
export class RefundApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.billing.refunds;

  list(query: ListQuery): Observable<Page<Refund>> {
    return this.api.list<Refund>(this.path, query);
  }

  get(id: string): Observable<Refund> {
    return this.api.get<Refund>(`${this.path}/${id}`);
  }

  request(payload: RefundPayload): Observable<Refund> {
    return this.api.post<Refund>(this.path, payload);
  }

  approve(id: string): Observable<Refund> {
    return this.api.post<Refund>(`${this.path}/${id}/approve`);
  }

  reject(id: string, reason: string): Observable<Refund> {
    return this.api.post<Refund>(`${this.path}/${id}/reject`, { reason });
  }

  process(id: string, referenceNumber: string | null, idempotencyKey: string): Observable<Refund> {
    return this.api.post<Refund>(
      `${this.path}/${id}/process`,
      { referenceNumber },
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  bulk(request: BulkActionRequest): Observable<BulkResult> {
    return this.api.post<BulkResult>(`${this.path}/bulk`, request);
  }
}
