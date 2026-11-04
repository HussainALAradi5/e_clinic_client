import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ENDPOINTS } from '@config/endpoints';
import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { Payment } from '@interfaces/billing/payment.interface';
import { Wallet, WalletEntry } from '@interfaces/billing/wallet-entry.interface';
import { WalletMovementPayload } from '@interfaces/billing/wallet-movement-payload.interface';
import { withIdempotencyKey } from '@middlewares/interceptors/http-context';
import { ApiClient } from '@services/api/api-client.service';
import { defaultQuery } from '@utilities/list-query';
import { money } from '@utilities/money';

/** Path of each movement under patients/{id}/wallet. */
const MOVEMENT_PATHS: Record<WalletMovement, string> = {
  [WalletMovement.Deposit]: 'deposits',
  [WalletMovement.Payback]: 'withdrawals',
  [WalletMovement.Adjust]: 'adjustments',
};

/** Billing › Patient balance — money the clinic holds for a patient; the server applies every limit and role rule. */
@Injectable({ providedIn: 'root' })
export class WalletApi {
  private readonly api = inject(ApiClient);

  private path(patientId: string): string {
    return `${ENDPOINTS.billing.patients}/${patientId}/wallet`;
  }

  /** Balance plus the latest movements (newest first). */
  get(patientId: string, perPage = 20): Observable<Wallet> {
    const query = defaultQuery({ perPage, sort: ['-createdAt'] });
    return this.api.list<WalletEntry>(this.path(patientId), query).pipe(
      map((page) => ({
        balance: page.meta.balance ?? money('0.000'),
        entries: page.data,
      })),
    );
  }

  /** Deposit and pay-back replay on a retried click (same key); adjustments carry no key. */
  move(
    patientId: string,
    movement: WalletMovement,
    payload: WalletMovementPayload,
    idempotencyKey: string,
  ): Observable<WalletEntry> {
    return this.api.post<WalletEntry>(
      `${this.path(patientId)}/${MOVEMENT_PATHS[movement]}`,
      payload,
      {
        context: withIdempotencyKey(idempotencyKey),
      },
    );
  }

  /** Pays the invoice from the balance: all that is due, or `amount`, within what the balance holds. */
  payInvoice(
    invoiceId: string,
    amount: string | null,
    idempotencyKey: string,
  ): Observable<Payment> {
    return this.api.post<Payment>(
      `${ENDPOINTS.billing.invoices}/${invoiceId}/pay-from-balance`,
      amount ? { amount } : {},
      { context: withIdempotencyKey(idempotencyKey) },
    );
  }
}
