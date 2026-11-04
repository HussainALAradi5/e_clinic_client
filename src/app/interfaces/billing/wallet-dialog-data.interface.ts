import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { Money } from '@interfaces/common/money.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';

/** Deposit, pay-back or adjustment of one patient's balance. */
export interface WalletDialogData {
  movement: WalletMovement;
  patient: PatientSummary;
  balance: Money;
}
