import { AccountRef } from '@interfaces/accounting/account-ref.interface';
import { Money } from '@interfaces/common/money.interface';

/** One side of an entry, with its optional cost centre and patient / doctor sub-ledger. */
export interface JournalLine {
  id: string;
  lineNumber: number;
  accountId: string;
  account: AccountRef | null;
  debit: Money;
  credit: Money;
  description: string | null;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  patientId: string | null;
  patient: { id: string; fullName: string } | null;
  doctorId: string | null;
  doctor: { id: string; fullName: string } | null;
}
