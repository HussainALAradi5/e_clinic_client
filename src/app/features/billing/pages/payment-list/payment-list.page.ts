import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';

/** `/billing/payments` — every receipt by method, cashier and drawer; a row opens its invoice. */
@Component({
  selector: 'app-payment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, EnumLabelPipe, MoneyPipe, DatePipe, RouterLink],
  templateUrl: './payment-list.page.html',
})
export class PaymentListPage {
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
