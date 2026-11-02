import { PaymentMethod } from '@enums/shared/payment-method.enum';

export interface RefundPayload {
  paymentId: string;
  amount: string;
  method?: PaymentMethod | null;
  reason: string;
}
