import { FiscalStatus } from '@shared/enums/accounting/fiscal-status.enum';
import { JournalEntryStatus } from '@shared/enums/accounting/journal-entry-status.enum';
import { JournalEntryType } from '@shared/enums/accounting/journal-entry-type.enum';
import { AccountRef } from '@shared/interfaces/accounting/account.interface';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';
import { Money } from '@shared/interfaces/common/money.interface';
import { UserSummary } from '@shared/interfaces/common/summary.interface';

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

/** Mirror of JournalEntryResource. `sourceType` / `sourceId` = the document an automatic entry was posted for. */
export interface JournalEntry extends GenericEntity {
  entryNumber: string | null;
  entryDate: string;
  type: JournalEntryType;
  status: JournalEntryStatus;
  isManual: boolean;
  description: string;
  sourceType: string | null;
  sourceId: string | null;
  totalDebit: Money;
  totalCredit: Money;
  fiscalPeriod?: { id: string; name: string; status: FiscalStatus };
  lines?: JournalLine[];
  reversalOf?: { id: string; entryNumber: string | null } | null;
  reversedBy?: { id: string; entryNumber: string | null } | null;
  postedBy?: UserSummary | null;
  createdBy?: UserSummary | null;
  postedAt: string | null;
}

export interface JournalLinePayload {
  accountId: string;
  debit?: string | null;
  credit?: string | null;
  description?: string | null;
  departmentId?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
}

/** POST / PUT /accounting/journal-entries — a draft may be saved unbalanced; it must balance to post. */
export interface JournalEntryPayload {
  entryDate: string;
  type: JournalEntryType.Manual | JournalEntryType.Adjustment;
  description: string;
  lines: JournalLinePayload[];
}
