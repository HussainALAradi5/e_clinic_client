import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';

/** `/pharmacy/dispensations` — every medicine handed over by the pharmacy or given in a session. */
@Component({
  selector: 'app-dispensation-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, EnumLabelPipe, QtyPipe, DatePipe],
  templateUrl: './dispensation-list.page.html',
})
export class DispensationListPage {
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
