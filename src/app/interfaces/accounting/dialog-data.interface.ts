import { Account, AccountPayload } from '@interfaces/accounting/account.interface';
import { JournalEntry } from '@interfaces/accounting/journal.interface';
import { Expense } from '@interfaces/finance/expense.interface';

/** New account (no `account`, optional preset parent) or edit; closes with the saved account. */
export interface AccountFormDialogData {
  account: Account | null;
  parent?: Account | null;
  save: (payload: AccountPayload) => Promise<Account>;
}

/** New manual entry or edit of a draft; closes with the saved (maybe posted) entry. */
export interface JournalEntryDialogData {
  entry: JournalEntry | null;
}

/** New expense or edit of a draft; closes with the saved expense. */
export interface ExpenseFormDialogData {
  expense: Expense | null;
}

/** Pay an approved expense; closes with the paid expense. */
export interface PayExpenseDialogData {
  expense: Expense;
}
