import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { MoneyPipe } from '@pipes/money.pipe';
import { PAYMENT_LIST_TEXT } from '@constants/billing/payment-list.constants';

/** `/billing/payments` — every receipt by method, cashier and drawer; a row opens its invoice. */
@Component({
  selector: 'app-payment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, MoneyPipe, DatePipe, RouterLink],
  templateUrl: './payment-list.page.html',
})
export class PaymentListPage {
  protected readonly text = PAYMENT_LIST_TEXT;

  protected readonly dateTimeFormat = dateTimeFormat;
}
