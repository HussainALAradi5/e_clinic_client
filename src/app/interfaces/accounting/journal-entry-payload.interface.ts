import { JournalEntryType } from '@enums/accounting/journal-entry-type.enum';
import { JournalLinePayload } from '@interfaces/accounting/journal-line-payload.interface';

/** POST / PUT /accounting/journal-entries — a draft may be saved unbalanced; it must balance to post. */
export interface JournalEntryPayload {
  entryDate: string;
  type: JournalEntryType.Manual | JournalEntryType.Adjustment;
  description: string;
  lines: JournalLinePayload[];
}
