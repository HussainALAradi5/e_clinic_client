import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT, DATE_TIME_FORMAT } from '@constants/app.constants';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/billing/cash-drawers` — every drawer shift: open ones, differences waiting for a supervisor, deposits. */
@Component({
  selector: 'app-cash-session-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, MoneyPipe, DatePipe],
  templateUrl: './cash-session-list.page.html',
})
export class CashSessionListPage {
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
