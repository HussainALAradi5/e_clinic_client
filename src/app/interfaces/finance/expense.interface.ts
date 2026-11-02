import { ExpenseCategory } from '@enums/finance/expense-category.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { AccountRef } from '@interfaces/accounting/account-ref.interface';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Versioned } from '@interfaces/common/versioned.interface';
import { Money } from '@interfaces/common/money.interface';
import { UserSummary } from '@interfaces/common/user-summary.interface';

/** Mirror of ExpenseResource — draft → pending → approved / rejected → paid (`isPaid`). */
export interface Expense extends GenericEntity, Versioned {
  category: ExpenseCategory;
  expenseAccountId: string;
  expenseAccount?: AccountRef;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  payeeCompanyId: string | null;
  payeeCompany?: { id: string; name: string } | null;
  payee: string | null;
  payeeName: string | null;
  description: string;
  amount: Money;
  taxAmount: Money;
  expenseDate: string;
  vendorInvoiceNumber: string | null;
  status: ApprovalStatus;
  isPaid: boolean;
  submittedBy?: UserSummary | null;
  approvedBy?: UserSummary | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null;
  cashSessionId: string | null;
  journalEntryId: string | null;
  attachmentsCount?: number;
}
