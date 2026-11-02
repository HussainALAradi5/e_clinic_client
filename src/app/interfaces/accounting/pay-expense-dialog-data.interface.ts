import { Expense } from '@interfaces/finance/expense.interface';

/** Pay an approved expense; closes with the paid expense. */
export interface PayExpenseDialogData {
  expense: Expense;
}
