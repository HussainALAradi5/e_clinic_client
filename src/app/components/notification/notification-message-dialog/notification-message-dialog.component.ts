import { dateTimeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NotificationKindIcon } from '@components/notification/notification-kind-icon/notification-kind-icon.component';
import { NOTIFICATION_MESSAGE_TEXT } from '@constants/notification/notification-message.constants';
import { NotificationMessageData } from '@interfaces/notification/notification-message-data.interface';

/** One notification in full, with Close and a button to the place it is about ("Open result"); `true` = go there. */
@Component({
  selector: 'app-notification-message-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatDialogModule, MatIconModule, NotificationKindIcon],
  templateUrl: './notification-message-dialog.component.html',
})
export class NotificationMessageDialog {
  protected readonly data = inject<NotificationMessageData>(MAT_DIALOG_DATA);
  protected readonly text = NOTIFICATION_MESSAGE_TEXT;
  protected readonly dateTimeFormat = dateTimeFormat;
}
