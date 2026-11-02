import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/billing/invoices` — every draft and issued invoice; filters by status, patient, amount and balance. */
@Component({
  selector: 'app-invoice-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe, DatePipe],
  templateUrl: './invoice-list.page.html',
})
export class InvoiceListPage {
  private readonly actions = inject(BillingActions);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const invoice = await this.actions.editInvoice({ invoice: null });
    if (invoice) await this.router.navigate(['/billing/invoices', invoice.id]);
  };
}
