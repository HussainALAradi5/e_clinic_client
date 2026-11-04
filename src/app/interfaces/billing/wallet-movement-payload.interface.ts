import { PaymentMethod } from '@enums/shared/payment-method.enum';

/** Body of a deposit, pay-back (`method`) or adjustment (`direction`). */
export interface WalletMovementPayload {
  amount: string;
  method?: PaymentMethod;
  direction?: 'credit' | 'debit';
  referenceNumber?: string | null;
  reason?: string | null;
}
