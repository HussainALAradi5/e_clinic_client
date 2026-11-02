import { Expense } from '@interfaces/finance/expense.interface';

/** New expense or edit of a draft; closes with the saved expense. */
export interface ExpenseFormDialogData {
  expense: Expense | null;
}
