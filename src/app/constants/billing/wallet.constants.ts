import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { EnumOption } from '@interfaces/common/enum-option.interface';

/** Text of the patient balance card, the movement dialog and the pay-from-balance step. */
export const WALLET_TEXT = {
  title: 'Patient balance',
  hint: 'Money the clinic holds for the patient. It can pay their invoices.',
  empty: 'No movements yet.',
  loading: 'Loading…',
  deposit: 'Deposit',
  payback: 'Pay back',
  adjust: 'Adjust',
  payFromBalance: 'From balance',
  amount: 'Amount',
  method: 'Paid by',
  reference: 'Bank reference',
  reason: 'Reason',
  notes: 'Notes',
  reasonHint: 'At least 10 characters — kept on the record.',
  direction: 'Direction',
  credit: 'Add to balance',
  debit: 'Take from balance',
  available: 'Available',
  balanceDeposits: 'Cash deposits to balances',
  balancePaybacks: 'Cash paid back from balances',
};

/** Dialog title and submit label of each movement. */
export const WALLET_MOVEMENT_TEXT: Record<WalletMovement, { title: string; submit: string }> = {
  [WalletMovement.Deposit]: { title: 'Deposit to balance', submit: 'Record deposit' },
  [WalletMovement.Payback]: { title: 'Pay back from balance', submit: 'Record pay-back' },
  [WalletMovement.Adjust]: { title: 'Adjust balance', submit: 'Save adjustment' },
};

/** Methods the server accepts per movement (config payments.wallet). */
export const WALLET_METHODS: Record<WalletMovement, EnumOption<PaymentMethod>[]> = {
  [WalletMovement.Deposit]: [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.Card, label: 'Card' },
    { value: PaymentMethod.BenefitPay, label: 'BenefitPay' },
    { value: PaymentMethod.BankTransfer, label: 'Bank transfer' },
  ],
  [WalletMovement.Payback]: [
    { value: PaymentMethod.Cash, label: 'Cash' },
    { value: PaymentMethod.BankTransfer, label: 'Bank transfer' },
  ],
  [WalletMovement.Adjust]: [],
};

export const WALLET_DIRECTIONS: EnumOption<'credit' | 'debit'>[] = [
  { value: 'credit', label: WALLET_TEXT.credit },
  { value: 'debit', label: WALLET_TEXT.debit },
];

/** Shortest reason the server accepts for pay-backs and adjustments. */
export const WALLET_REASON_MIN = 10;

/** Toasts and confirmations. */
export const WALLET_MESSAGES = {
  saved: (code: string, balance: string) => `${code} saved — balance is now ${balance}.`,
  payTitle: (amount: string) => `Pay ${amount} from the patient's balance?`,
  payMessage:
    'The invoice is paid from money the clinic already holds. A voided payment returns it.',
  payConfirm: 'Pay from balance',
  paid: (code: string, amount: string) => `Payment ${code} taken from the balance — ${amount}.`,
};
