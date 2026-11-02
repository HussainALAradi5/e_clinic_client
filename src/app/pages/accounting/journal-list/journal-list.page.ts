import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountingActions } from '@services/accounting/accounting-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/accounting/journal` — the general journal: automatic entries of every document and manual entries. */
@Component({
  selector: 'app-journal-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe, DatePipe],
  templateUrl: './journal-list.page.html',
})
export class JournalListPage {
  private readonly actions = inject(AccountingActions);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const entry = await this.actions.editEntry(null);
    if (entry) await this.router.navigate(['/accounting/journal', entry.id]);
  };
}
