import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NOTIFICATION_SETTINGS_CARD_TEXT } from '@constants/notification/notification-settings-card.constants';
import { NotifyService } from '@services/ui/notify.service';
import { PushNotificationService } from '@services/notification/push-notification.service';

/** The on / off switch for phone and browser notifications (Account & security). */
@Component({
  selector: 'app-notification-settings-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatSlideToggleModule],
  templateUrl: './notification-settings-card.component.html',
})
export class NotificationSettingsCard {
  protected readonly push = inject(PushNotificationService);
  private readonly notify = inject(NotifyService);
  protected readonly text = NOTIFICATION_SETTINGS_CARD_TEXT;

  constructor() {
    void this.push.load().catch(() => undefined);
  }

  protected async toggle(on: boolean): Promise<void> {
    try {
      await (on ? this.push.enable() : this.push.disable());
      this.notify.success(this.push.enabled() ? this.text.turnedOn : this.text.turnedOff);
    } catch (error) {
      this.notify.error(error);
    }
  }
}
