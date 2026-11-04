import { PatientPackageStatus } from '@enums/billing/patient-package-status.enum';
import { InvoiceStatus } from '@enums/billing/invoice-status.enum';
import { Money } from '@interfaces/common/money.interface';

/** PatientPackageResource: a package a patient bought. */
export interface PatientPackage {
  id: string;
  code: string;
  name: string;
  status: PatientPackageStatus;
  patient: { id: string; fullName: string };
  coveredService: { id: string; name: string };
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsLeft: number;
  price: Money;
  remainingValue: Money;
  startsOn: string | null;
  expiresOn: string | null;
  invoice: { id: string; number: string; status: InvoiceStatus } | null;
}
