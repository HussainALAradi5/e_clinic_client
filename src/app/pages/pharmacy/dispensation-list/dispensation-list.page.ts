import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { QtyPipe } from '@pipes/qty.pipe';

/** `/pharmacy/dispensations` — every medicine handed over by the pharmacy or given in a session. */
@Component({
  selector: 'app-dispensation-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, QtyPipe, DatePipe],
  templateUrl: './dispensation-list.page.html',
})
export class DispensationListPage {
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
