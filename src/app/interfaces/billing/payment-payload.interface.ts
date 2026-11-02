import { PaymentMethod } from '@enums/shared/payment-method.enum';

/** POST /billing/payments — one method; a split payment is one request per method. */
export interface PaymentPayload {
  invoiceId: string;
  amount: string;
  method: PaymentMethod;
  referenceNumber?: string | null;
  cardLast4?: string | null;
  notes?: string | null;
}
