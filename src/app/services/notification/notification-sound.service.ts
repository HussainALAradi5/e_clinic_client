import { Injectable } from '@angular/core';
import { NOTIFICATION_KIND_SOUNDS } from '@constants/notification/notification-kinds.constants';
import { PushedMessage } from '@interfaces/notification/pushed-message.interface';
import { notificationKindOf } from '@utilities/notification-kind';

/**
 * Plays the kind's sound when a message is pushed while e-Clinic is open in a tab (browsers do not let a
 * notification itself choose its sound). Started once from the layouts.
 */
@Injectable({ providedIn: 'root' })
export class NotificationSoundService {
  private listening = false;

  listen(): void {
    if (this.listening || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    this.listening = true;
    navigator.serviceWorker.addEventListener('message', (event: MessageEvent<PushedMessage>) => {
      if (event.data?.type === 'clinic-push') {
        this.play(event.data.template);
      }
    });
  }

  play(template: string | null | undefined): void {
    const audio = new Audio(NOTIFICATION_KIND_SOUNDS[notificationKindOf(template)]);
    audio.volume = 0.8;
    // Browsers may refuse sound before the person has interacted with the page; the notification still shows.
    void audio.play().catch(() => undefined);
  }
}
