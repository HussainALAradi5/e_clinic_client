import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ExpenseFormDialog } from '@components/accounting/expense-form-dialog/expense-form-dialog.component';
import { FiscalYearDialog } from '@components/accounting/fiscal-year-dialog/fiscal-year-dialog.component';
import { JournalEntryDialog } from '@components/accounting/journal-entry-dialog/journal-entry-dialog.component';
import { PayExpenseDialog } from '@components/accounting/pay-expense-dialog/pay-expense-dialog.component';
import {
  ExpenseFormDialogData,
  JournalEntryDialogData,
  PayExpenseDialogData,
} from '@interfaces/accounting/dialog-data.interface';
import { JournalEntryStatus } from '@enums/accounting/journal-entry-status.enum';
import { FiscalPeriod, FiscalYear } from '@interfaces/accounting/fiscal.interface';
import { JournalEntry } from '@interfaces/accounting/journal.interface';
import { Expense } from '@interfaces/finance/expense.interface';
import { FiscalApi } from '@services/accounting/fiscal-api.service';
import { JournalApi } from '@services/accounting/journal-api.service';
import { ExpenseApi } from '@services/finance/expense-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { formatMoney } from '@utilities/money';

/**
 * Accounting steps with their confirmations and messages — journal entries, expenses and fiscal periods — for the
 * list and detail pages. Each returns the changed record, or undefined when the user backed out.
 */
@Injectable({ providedIn: 'root' })
export class AccountingActions {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly journal = inject(JournalApi);
  private readonly expenses = inject(ExpenseApi);
  private readonly fiscal = inject(FiscalApi);

  // Journal

  editEntry(entry: JournalEntry | null): Promise<JournalEntry | undefined> {
    return this.dialogs.openAction<JournalEntryDialog, JournalEntryDialogData, JournalEntry>(
      JournalEntryDialog,
      { entry },
      (e) =>
        e.status === JournalEntryStatus.Posted
          ? `Entry ${e.entryNumber} posted.`
          : 'Draft entry saved.',
      '1040px',
    );
  }

  async postEntry(entry: JournalEntry): Promise<JournalEntry | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Post ${formatMoney(entry.totalDebit)}?`,
      message: 'A posted entry is numbered and reaches the reports; it can then only be reversed.',
      confirmLabel: 'Post',
    });
    if (!ok) return undefined;
    const posted = await firstValueFrom(this.journal.post(entry.id));
    this.notify.success(`Entry ${posted.entryNumber} posted.`);
    return posted;
  }

  async reverseEntry(entry: JournalEntry): Promise<JournalEntry | undefined> {
    const reason = await this.dialogs.reason({
      title: `Reverse ${entry.entryNumber}?`,
      message: 'A mirror entry dated today cancels it; both stay in the journal.',
      confirmLabel: 'Reverse',
      danger: true,
    });
    if (!reason) return undefined;
    const reversal = await firstValueFrom(this.journal.reverse(entry.id, clinicIsoDate(), reason));
    this.notify.success(`Entry reversed by ${reversal.entryNumber}.`);
    return reversal;
  }

  // Expenses

  editExpense(expense: Expense | null): Promise<Expense | undefined> {
    return this.dialogs.openAction<ExpenseFormDialog, ExpenseFormDialogData, Expense>(
      ExpenseFormDialog,
      { expense },
      (e) => `Expense ${e.code} saved.`,
      '720px',
    );
  }

  async submitExpense(expense: Expense): Promise<Expense | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Send ${formatMoney(expense.amount)} for approval?`,
      message: 'Approvers are told; the expense can no longer be edited.',
      confirmLabel: 'Submit',
    });
    if (!ok) return undefined;
    const sent = await firstValueFrom(this.expenses.submit(expense.id));
    this.notify.success('Expense sent for approval.');
    return sent;
  }

  async approveExpense(expense: Expense): Promise<Expense | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Approve ${formatMoney(expense.amount)} to ${expense.payeeName}?`,
      message: expense.description,
      confirmLabel: 'Approve',
    });
    if (!ok) return undefined;
    const approved = await firstValueFrom(this.expenses.approve(expense.id));
    this.notify.success('Expense approved — it can be paid.');
    return approved;
  }

  async rejectExpense(expense: Expense): Promise<Expense | undefined> {
    const reason = await this.dialogs.reason({
      title: `Reject expense ${expense.code}?`,
      confirmLabel: 'Reject',
      danger: true,
    });
    if (!reason) return undefined;
    const rejected = await firstValueFrom(this.expenses.reject(expense.id, reason));
    this.notify.success('Expense rejected.');
    return rejected;
  }

  payExpense(expense: Expense): Promise<Expense | undefined> {
    return this.dialogs.openAction<PayExpenseDialog, PayExpenseDialogData, Expense>(
      PayExpenseDialog,
      { expense },
      (e) => `Expense ${e.code} paid.`,
    );
  }

  async cancelExpense(expense: Expense): Promise<Expense | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Cancel expense ${expense.code}?`,
      confirmLabel: 'Cancel expense',
      cancelLabel: 'Keep',
      danger: true,
    });
    if (!ok) return undefined;
    const cancelled = await firstValueFrom(this.expenses.cancel(expense.id));
    this.notify.success('Expense cancelled.');
    return cancelled;
  }

  // Fiscal years

  createYear(): Promise<FiscalYear | undefined> {
    return this.dialogs.openAction<FiscalYearDialog, null, FiscalYear>(
      FiscalYearDialog,
      null,
      (y) => `${y.name} created with ${y.periods?.length ?? 12} periods.`,
    );
  }

  async closePeriod(period: FiscalPeriod): Promise<FiscalPeriod | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Close ${period.name}?`,
      message: 'Nothing more can be posted with a date in this month until it is reopened.',
      confirmLabel: 'Close month',
    });
    if (!ok) return undefined;
    const closed = await firstValueFrom(this.fiscal.closePeriod(period.id));
    this.notify.success(`${closed.name} closed.`);
    return closed;
  }

  async reopenPeriod(period: FiscalPeriod): Promise<FiscalPeriod | undefined> {
    const reason = await this.dialogs.reason({
      title: `Reopen ${period.name}?`,
      message: 'Reopening is recorded with your reason. Reports already shared may change.',
      confirmLabel: 'Reopen',
      danger: true,
    });
    if (!reason) return undefined;
    const reopened = await firstValueFrom(this.fiscal.reopenPeriod(period.id, reason));
    this.notify.success(`${reopened.name} reopened.`);
    return reopened;
  }

  async closeYear(year: FiscalYear): Promise<FiscalYear | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Close ${year.name}?`,
      message:
        'Profit or loss is carried to retained earnings with a closing entry. Every month must be closed first.',
      confirmLabel: 'Close year',
    });
    if (!ok) return undefined;
    const closed = await firstValueFrom(this.fiscal.closeYear(year.id));
    this.notify.success(`${closed.name} closed.`);
    return closed;
  }

  async lockYear(year: FiscalYear): Promise<FiscalYear | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Lock ${year.name} for good?`,
      message: 'After the audit: a locked year can never be reopened.',
      confirmLabel: 'Lock year',
      danger: true,
      typeToConfirm: year.name,
    });
    if (!ok) return undefined;
    const locked = await firstValueFrom(this.fiscal.lockYear(year.id));
    this.notify.success(`${locked.name} locked.`);
    return locked;
  }
}
