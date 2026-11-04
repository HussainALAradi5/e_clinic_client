import { Money } from '@interfaces/common/money.interface';

/** GET billing/invoices/{id}/coverage: the insurer / patient split; `patientDue` is what the desk takes now. */
export interface Coverage {
  covered: boolean;
  /** Why the patient pays it all: no_insurance, expired, nothing_insurable, claim_rejected. */
  reason: string | null;
  insurer: string | null;
  coveragePercent: string;
  insurableTotal: Money;
  insurerShare: Money;
  patientShare: Money;
  patientPaid: Money;
  patientDue: Money;
}
