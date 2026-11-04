import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Money } from '@interfaces/common/money.interface';

/** One month's figures of GET accounting/month-summary. */
export interface MonthFigures {
  revenue: Money;
  expenses: Money;
  netResult: Money;
  collected: Money;
  collectedByMethod: { method: PaymentMethod; total: Money }[];
  refunded: Money;
  owedByPatients: Money;
  owedByInsurers: Money;
  patientBalancesHeld: Money;
  unearnedPackages: Money;
  visitsCompleted: number;
  noShows: number;
  cancellations: number;
  newPatients: number;
  feesCharged: Money;
  packagesSold: number;
  packageSessionsUsed: number;
}

/** The owner's month-end summary: the month, the month before, and the top doctors. */
export interface MonthSummary {
  period: { from: string; to: string };
  current: MonthFigures;
  previous: MonthFigures;
  topDoctors: { doctorId: string; fullName: string; revenue: Money }[];
}
