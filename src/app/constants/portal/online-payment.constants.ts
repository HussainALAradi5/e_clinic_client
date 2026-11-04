import { OnlinePaymentStatus } from '@enums/billing/online-payment-status.enum';

/** Text of paying online from the patient's invoices. */
export const ONLINE_PAY_TEXT = {
  pay: 'Pay online',
  secure: 'BenefitPay, Benefit debit or card — on the secure Tap page.',
  /** Seconds between status checks while the gateway confirms. */
  pollSeconds: 3,
  /** Status checks before showing "still confirming". */
  pollTries: 10,
};

/** The banner shown when the patient comes back from the payment page. */
export const ONLINE_RESULT: Record<
  OnlinePaymentStatus,
  { icon: string; title: string; message: string }
> = {
  [OnlinePaymentStatus.Captured]: {
    icon: 'verified',
    title: 'Payment received — thank you',
    message: 'Your invoice is updated and the receipt is ready below.',
  },
  [OnlinePaymentStatus.Initiated]: {
    icon: 'hourglass_top',
    title: 'Confirming your payment…',
    message: 'This takes a few seconds. You do not need to pay again.',
  },
  [OnlinePaymentStatus.Failed]: {
    icon: 'error',
    title: 'The payment did not go through',
    message: 'Nothing was charged. You can try again or pay at the clinic.',
  },
  [OnlinePaymentStatus.Expired]: {
    icon: 'schedule',
    title: 'The payment page timed out',
    message: 'Nothing was charged. You can start again.',
  },
};
