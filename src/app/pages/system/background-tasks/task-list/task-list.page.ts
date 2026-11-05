import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { TASK_LIST_TEXT } from '@constants/system/task-list.constants';

/** `/system/background-tasks` — own exports, ZIPs and bulk actions (administrators see everyone's). */
@Component({
  selector: 'app-task-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, MatProgressBarModule, DatePipe],
  templateUrl: './task-list.page.html',
})
export class TaskListPage {
  protected readonly text = TASK_LIST_TEXT;

  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
}
