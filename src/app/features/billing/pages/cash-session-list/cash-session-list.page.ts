import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { MoneyPipe } from '@shared/pipes/money.pipe';

/** `/billing/cash-drawers` — every drawer shift: open ones, differences waiting for a supervisor, deposits. */
@Component({
  selector: 'app-cash-session-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, MoneyPipe, DatePipe],
  templateUrl: './cash-session-list.page.html',
})
export class CashSessionListPage {
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
