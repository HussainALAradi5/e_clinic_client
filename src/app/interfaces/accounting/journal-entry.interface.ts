import { FiscalStatus } from '@enums/accounting/fiscal-status.enum';
import { JournalEntryStatus } from '@enums/accounting/journal-entry-status.enum';
import { JournalEntryType } from '@enums/accounting/journal-entry-type.enum';
import { JournalLine } from '@interfaces/accounting/journal.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Money } from '@interfaces/common/money.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';

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
