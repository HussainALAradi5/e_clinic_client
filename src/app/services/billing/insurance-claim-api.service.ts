import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { Page } from '@interfaces/api/page.interface';
import { ClaimDecisionPayload } from '@interfaces/billing/claim-decision-payload.interface';
import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';
import { RemittancePayload } from '@interfaces/billing/remittance-payload.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { ApiClient } from '@services/api/api-client.service';
import { ENDPOINTS } from '@config/endpoints';

/** Billing › Insurance claims — prepare from an invoice, send, record the decision and the insurer's remittance. */
@Injectable({ providedIn: 'root' })
export class InsuranceClaimApi {
  private readonly api = inject(ApiClient);
  private readonly path = ENDPOINTS.billing.insuranceClaims;

  list(query: ListQuery): Observable<Page<InsuranceClaim>> {
    return this.api.list<InsuranceClaim>(this.path, query);
  }

  get(id: string): Observable<InsuranceClaim> {
    return this.api.get<InsuranceClaim>(`${this.path}/${id}`);
  }

  create(
    invoiceId: string,
    preAuthorizationNumber: string | null,
    idempotencyKey: string,
  ): Observable<InsuranceClaim> {
    return this.api.post<InsuranceClaim>(
      this.path,
      { invoiceId, preAuthorizationNumber },
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  submit(id: string): Observable<InsuranceClaim> {
    return this.api.patch<InsuranceClaim>(`${this.path}/${id}/submit`);
  }

  decide(id: string, payload: ClaimDecisionPayload): Observable<InsuranceClaim> {
    return this.api.patch<InsuranceClaim>(`${this.path}/${id}/decision`, payload);
  }

  cancel(id: string, reason: string): Observable<InsuranceClaim> {
    return this.api.patch<InsuranceClaim>(`${this.path}/${id}/cancel`, { reason });
  }

  remittance(payload: RemittancePayload, idempotencyKey: string): Observable<InsuranceClaim[]> {
    return this.api.post<InsuranceClaim[]>(`${this.path}/remittances`, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }
}
