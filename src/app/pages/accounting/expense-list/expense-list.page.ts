import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingActions } from '@services/accounting/accounting-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/accounting/expenses` — what the clinic spends: drafts, approvals waiting, approved to pay, paid. */
@Component({
  selector: 'app-expense-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, MoneyPipe, DatePipe],
  templateUrl: './expense-list.page.html',
})
export class ExpenseListPage {
  private readonly actions = inject(AccountingActions);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const expense = await this.actions.editExpense(null);
    if (expense) await this.router.navigate(['/accounting/expenses', expense.id]);
  };
}
