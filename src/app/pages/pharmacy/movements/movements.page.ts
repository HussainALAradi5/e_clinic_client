import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { QtyPipe } from '@pipes/qty.pipe';

/** `/pharmacy/movements` — the append-only stock ledger: every unit in and out, who and why. */
@Component({
  selector: 'app-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, QtyPipe, DatePipe],
  templateUrl: './movements.page.html',
})
export class MovementsPage {
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
