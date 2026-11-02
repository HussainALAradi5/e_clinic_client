import { ExpenseCategory } from '@enums/finance/expense-category.enum';

export interface ExpensePayload {
  version?: number;
  category: ExpenseCategory;
  expenseAccountId?: string | null;
  departmentId?: string | null;
  payeeCompanyId?: string | null;
  payee?: string | null;
  description: string;
  amount: string;
  taxAmount?: string | null;
  expenseDate: string;
  vendorInvoiceNumber?: string | null;
}
