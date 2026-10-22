import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BillingActions } from '../../services/billing-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { MoneyPipe } from '@shared/pipes/money.pipe';

/** `/billing/invoices` — every draft and issued invoice; filters by status, patient, amount and balance. */
@Component({
  selector: 'app-invoice-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, MoneyPipe, DatePipe],
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
