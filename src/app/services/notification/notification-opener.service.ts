import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationMessageDialog } from '@components/notification/notification-message-dialog/notification-message-dialog.component';
import { notificationLinkLabel } from '@constants/notification-links.constants';
import { AppNotification } from '@interfaces/notification/notification.interface';
import { NotificationMessageData } from '@interfaces/notification/notification-message-data.interface';
import { DialogService } from '@services/ui/dialog.service';

/**
 * Opening a notification, the same in the bell, the inbox and the portal: the message in full first, with a
 * button to the place it is about ("Open result", "Open appointment"); `go` skips the message.
 */
@Injectable({ providedIn: 'root' })
export class NotificationOpener {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);

  async show(notification: AppNotification, link: string | null): Promise<void> {
    const go = await this.dialogs.open<NotificationMessageDialog, NotificationMessageData, boolean>(
      NotificationMessageDialog,
      { notification, link, linkLabel: notificationLinkLabel(notification.relatedType) },
      // Focus the dialog, not a button: both stay plain text buttons (no focus fill).
      { autoFocus: 'dialog' },
    );
    if (go && link) await this.router.navigateByUrl(link);
  }

  /** Straight to the place (the row's own "Open …" link). */
  go(link: string): Promise<boolean> {
    return this.router.navigateByUrl(link);
  }
}
