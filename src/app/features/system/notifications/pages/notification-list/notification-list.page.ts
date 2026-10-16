import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';

/** `/system/notifications` — delivery log of every channel; bulk resend (failed) and cancel (queued). */
@Component({
  selector: 'app-notification-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, DatePipe, EnumLabelPipe],
  templateUrl: './notification-list.page.html',
})
export class NotificationListPage {
  protected readonly dateTimeFormat = `${DATE_FORMAT}, ${TIME_FORMAT}`;
}
