import { AppointmentFeeStatus } from '@enums/billing/appointment-fee-status.enum';
import { AppointmentFeeType } from '@enums/billing/appointment-fee-type.enum';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { Money } from '@interfaces/common/money.interface';

/** AppointmentFeeResource: a fee for a missed or late-cancelled visit. */
export interface AppointmentFee {
  id: string;
  code: string;
  type: AppointmentFeeType;
  status: AppointmentFeeStatus;
  amount: Money;
  appointment: { id: string; code: string; scheduledDate: string; startTime: string };
  patient: { id: string; fullName: string };
  invoice: { id: string; number: string | null; status: InvoiceStatus } | null;
  waivedBy: string | null;
  waivedAt: string | null;
  waiverReason: string | null;
  createdAt: string;
}
