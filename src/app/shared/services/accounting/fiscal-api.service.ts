import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FiscalPeriod,
  FiscalYear,
  FiscalYearPayload,
} from '@shared/interfaces/accounting/fiscal.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** Accounting › Fiscal years — monthly periods closed in order, reopened with a reason, years closed and locked. */
@Injectable({ providedIn: 'root' })
export class FiscalApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'accounting/fiscal-years';

  years(): Observable<FiscalYear[]> {
    return this.api.get<FiscalYear[]>(this.path);
  }

  create(payload: FiscalYearPayload): Observable<FiscalYear> {
    return this.api.post<FiscalYear>(this.path, payload);
  }

  closePeriod(id: string): Observable<FiscalPeriod> {
    return this.api.post<FiscalPeriod>(`${this.path}/periods/${id}/close`);
  }

  reopenPeriod(id: string, reason: string): Observable<FiscalPeriod> {
    return this.api.post<FiscalPeriod>(`${this.path}/periods/${id}/reopen`, { reason });
  }

  closeYear(id: string): Observable<FiscalYear> {
    return this.api.post<FiscalYear>(`${this.path}/${id}/close`);
  }

  lockYear(id: string): Observable<FiscalYear> {
    return this.api.post<FiscalYear>(`${this.path}/${id}/lock`);
  }
}
