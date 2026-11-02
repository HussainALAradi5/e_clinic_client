import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';

/** `/system/notifications` — delivery log of every channel; bulk resend (failed) and cancel (queued). */
@Component({
  selector: 'app-notification-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, DatePipe],
  templateUrl: './notification-list.page.html',
})
export class NotificationListPage {
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
}
