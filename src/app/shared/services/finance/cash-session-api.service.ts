import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@core/interceptors/http-context';
import { Page } from '@shared/interfaces/api/page.interface';
import {
  CashSession,
  CloseSessionPayload,
  DepositPayload,
} from '@shared/interfaces/finance/cash-session.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Finance › Cash drawer shifts — open, count and close, supervisor approval of a difference, bank deposit. */
@Injectable({ providedIn: 'root' })
export class CashSessionApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'finance/cash-sessions';

  list(query: ListQuery): Observable<Page<CashSession>> {
    return this.api.list<CashSession>(this.path, query);
  }

  get(id: string): Observable<CashSession> {
    return this.api.get<CashSession>(`${this.path}/${id}`);
  }

  /** The caller's open (or closing) drawer with its running figures; null when none is open. */
  current(): Observable<CashSession | null> {
    return this.api.get<CashSession | null>(`${this.path}/current`);
  }

  open(openingFloat: string): Observable<CashSession> {
    return this.api.post<CashSession>(this.path, { openingFloat });
  }

  close(id: string, payload: CloseSessionPayload): Observable<CashSession> {
    return this.api.post<CashSession>(`${this.path}/${id}/close`, payload);
  }

  approveDifference(id: string, notes: string): Observable<CashSession> {
    return this.api.post<CashSession>(`${this.path}/${id}/approve-difference`, { notes });
  }

  deposit(id: string, payload: DepositPayload, idempotencyKey: string): Observable<CashSession> {
    return this.api.post<CashSession>(`${this.path}/${id}/deposit`, payload, {
      context: withIdempotencyKey(idempotencyKey),
    });
  }
}
