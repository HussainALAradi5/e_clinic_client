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

/** `/accounting/journal` — the general journal: automatic entries of every document and manual entries. */
@Component({
  selector: 'app-journal-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, EnumLabelPipe, MoneyPipe, DatePipe],
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
