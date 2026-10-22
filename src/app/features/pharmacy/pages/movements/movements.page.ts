import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_TIME_FORMAT } from '@shared/constants/app.constants';
import { QtyPipe } from '@shared/pipes/qty.pipe';

/** `/pharmacy/movements` — the append-only stock ledger: every unit in and out, who and why. */
@Component({
  selector: 'app-movements-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, QtyPipe, DatePipe],
  templateUrl: './movements.page.html',
})
export class MovementsPage {
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
}
