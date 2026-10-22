import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingActions } from '../../services/accounting-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';

/** `/accounting/expenses` — what the clinic spends: drafts, approvals waiting, approved to pay, paid. */
@Component({
  selector: 'app-expense-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, EnumLabelPipe, MoneyPipe, DatePipe],
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
