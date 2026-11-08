import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { NOTIFICATION_LIST_TEXT } from '@constants/system/notification-list.constants';

/** `/system/notifications` — delivery log of every channel; bulk resend (failed) and cancel (queued). */
@Component({
  selector: 'app-notification-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, DatePipe],
  templateUrl: './notification-list.page.html',
})
export class NotificationListPage {
  protected readonly text = NOTIFICATION_LIST_TEXT;

  protected readonly dateTimeFormat = dateTimeFormat;
}
