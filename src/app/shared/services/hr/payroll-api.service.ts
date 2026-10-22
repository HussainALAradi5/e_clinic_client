import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '@shared/interfaces/api/page.interface';
import { Payslip, PayrollRun } from '@shared/interfaces/hr/payroll.interface';
import { ListQuery } from '@shared/interfaces/list/list-query.interface';
import { ApiClient } from '@shared/services/api/api-client.service';

/** HR › Payroll — monthly runs (calculate → approve → mark paid) and payslips. */
@Injectable({ providedIn: 'root' })
export class PayrollApi {
  private readonly api = inject(ApiClient);
  private readonly path = 'hr/payroll-runs';

  list(query: ListQuery): Observable<Page<PayrollRun>> {
    return this.api.list<PayrollRun>(this.path, query);
  }

  get(id: string): Observable<PayrollRun> {
    return this.api.get<PayrollRun>(`${this.path}/${id}`);
  }

  create(year: number, month: number): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(this.path, { year, month });
  }

  calculate(id: string): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(`${this.path}/${id}/calculate`);
  }

  approve(id: string): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(`${this.path}/${id}/approve`);
  }

  markPaid(id: string, paidOn: string, reference: string | null): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(`${this.path}/${id}/mark-paid`, { paidOn, reference });
  }

  cancel(id: string, reason: string): Observable<PayrollRun> {
    return this.api.post<PayrollRun>(`${this.path}/${id}/cancel`, { reason });
  }

  payslips(query: ListQuery): Observable<Page<Payslip>> {
    return this.api.list<Payslip>('hr/payslips', query);
  }

  payslip(id: string): Observable<Payslip> {
    return this.api.get<Payslip>(`hr/payslips/${id}`);
  }
}
