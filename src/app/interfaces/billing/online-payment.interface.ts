import { OnlinePaymentStatus } from '@enums/billing/online-payment-status.enum';
import { Money } from '@interfaces/common/money.interface';

/** OnlinePaymentResource: one attempt to pay an invoice online. */
export interface OnlinePayment {
  id: string;
  code: string;
  status: OnlinePaymentStatus;
  amount: Money;
  invoice: { id: string; number: string };
  patient: { id: string; fullName: string };
  /** The gateway's payment page while the attempt waits for the payer. */
  checkoutUrl: string | null;
  paymentId: string | null;
  failureReason: string | null;
  expiresAt: string | null;
  capturedAt: string | null;
  createdAt: string;
}
