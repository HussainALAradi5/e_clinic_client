import { PaymentMethod } from '@enums/shared/payment-method.enum';

/** GET /billing/payments/daily-summary — end-of-day takings per method and cashier. */
export interface DailySummary {
  date: string;
  rows: {
    method: PaymentMethod;
    receivedBy: string;
    cashier: string;
    count: number;
    total: string;
  }[];
  totals: { method: PaymentMethod; total: string }[];
  grandTotal: string;
  refunds: string;
}
