import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { BillingActions } from '../../services/billing-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { MoneyPipe } from '@shared/pipes/money.pipe';

/** `/billing/insurance-claims` — claims by insurer and status; record an insurer's remittance from here. */
@Component({
  selector: 'app-claim-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, MoneyPipe, DatePipe],
  templateUrl: './claim-list.page.html',
})
export class ClaimListPage {
  private readonly actions = inject(BillingActions);
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly remittance = async (): Promise<void> => {
    if (await this.actions.recordRemittance()) this.list().reload();
  };
}
