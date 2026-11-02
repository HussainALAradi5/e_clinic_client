import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Expense, ExpensePayload } from '@interfaces/finance/expense.interface';
import { EntityApi } from '@services/api/entity-api.service';

/** Finance › Expenses — submit for approval, approve / reject (someone else), pay (cash from the drawer or bank). */
@Injectable({ providedIn: 'root' })
export class ExpenseApi extends EntityApi<Expense, ExpensePayload> {
  constructor() {
    super('finance/expenses');
  }

  submit(id: string): Observable<Expense> {
    return this.api.post<Expense>(`${this.path}/${id}/submit`);
  }

  approve(id: string): Observable<Expense> {
    return this.api.post<Expense>(`${this.path}/${id}/approve`);
  }

  reject(id: string, reason: string): Observable<Expense> {
    return this.api.post<Expense>(`${this.path}/${id}/reject`, { reason });
  }

  pay(
    id: string,
    method: PaymentMethod,
    reference: string | null,
    idempotencyKey: string,
  ): Observable<Expense> {
    return this.api.post<Expense>(
      `${this.path}/${id}/pay`,
      { method, reference },
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  cancel(id: string): Observable<Expense> {
    return this.api.post<Expense>(`${this.path}/${id}/cancel`);
  }
}
