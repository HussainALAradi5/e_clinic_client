import { WalletEntryType } from '@enums/billing/wallet-entry-type.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Money } from '@interfaces/common/money.interface';

/** WalletEntryResource: one movement of a patient's balance, with the balance after it. */
export interface WalletEntry {
  id: string;
  code: string;
  type: WalletEntryType;
  isCredit: boolean;
  amount: Money;
  balanceAfter: Money;
  method: PaymentMethod | null;
  referenceNumber: string | null;
  invoiceId: string | null;
  paymentId: string | null;
  reason: string | null;
  createdAt: string;
}

/** GET patients/{id}/wallet: the current balance and the latest movements. */
export interface Wallet {
  balance: Money;
  entries: WalletEntry[];
}
