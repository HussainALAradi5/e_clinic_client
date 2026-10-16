import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';

/** `/system/background-tasks` — own exports, ZIPs and bulk actions (administrators see everyone's). */
@Component({
  selector: 'app-task-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, MatProgressBarModule, DatePipe, EnumLabelPipe],
  templateUrl: './task-list.page.html',
})
export class TaskListPage {
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
}
