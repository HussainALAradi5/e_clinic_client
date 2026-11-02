import { JournalEntry } from '@interfaces/accounting/journal-entry.interface';

/** New manual entry or edit of a draft; closes with the saved (maybe posted) entry. */
export interface JournalEntryDialogData {
  entry: JournalEntry | null;
}
