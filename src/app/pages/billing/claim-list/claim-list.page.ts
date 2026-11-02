import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/billing/insurance-claims` — claims by insurer and status; record an insurer's remittance from here. */
@Component({
  selector: 'app-claim-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe, DatePipe],
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
