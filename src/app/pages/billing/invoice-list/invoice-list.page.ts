import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BillingActions } from '@services/billing/billing-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { TONE_STRIPE_CLASSES } from '@constants/status-tones.constants';
import { Invoice } from '@interfaces/billing/invoice.interface';
import { EnumService } from '@services/data/enum.service';
import { DATE_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';
import { INVOICE_LIST_TEXT } from '@constants/billing/invoice-list.constants';

/**
 * `/billing/invoices` — every draft and issued invoice; filters by status, patient, amount and balance;
 * quick filters for how it stands with its payments and how it was paid; rows carry their payment colour.
 */
@Component({
  selector: 'app-invoice-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe, DatePipe, EnumFilter, StatusChip],
  templateUrl: './invoice-list.page.html',
})
export class InvoiceListPage {
  private readonly actions = inject(BillingActions);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly text = INVOICE_LIST_TEXT;
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly paymentState = signal<string | null>(null);
  protected readonly method = signal<string | null>(null);
  protected readonly params = computed((): Record<string, string> => {
    const params: Record<string, string> = {};
    const state = this.paymentState();
    const method = this.method();
    if (state) params['payment_state'] = state;
    if (method) params['method'] = method;
    return params;
  });
  protected readonly rowClass = (row: { id: string }): string =>
    TONE_STRIPE_CLASSES[this.enums.tone('InvoicePaymentState', (row as Invoice).paymentState)];

  protected readonly create = async (): Promise<void> => {
    const invoice = await this.actions.editInvoice({ invoice: null });
    if (invoice) await this.router.navigate(['/billing/invoices', invoice.id]);
  };
}
