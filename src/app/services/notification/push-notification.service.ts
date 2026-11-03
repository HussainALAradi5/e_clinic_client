import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NotificationApi } from '@services/notification/notification-api.service';
import { base64UrlToBytes } from '@utilities/base64-url';

/** The service worker that shows pushed messages (public/push-sw.js). */
const WORKER_URL = '/push-sw.js';

/**
 * Phone and browser notifications on this browser: the person's switch on the server (`push`), the browser's
 * permission, and this browser's Web Push subscription. Turning it on asks for permission and subscribes; turning it
 * off unsubscribes. After sign-in, sync() re-subscribes a browser that is allowed; sign-out forgets the browser.
 */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly api = inject(NotificationApi);

  /** The browser can show pushed notifications at all (secure page, service worker, Push API). */
  readonly supported =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  /** The person's switch on the server; null until loaded. */
  readonly enabled = signal<boolean | null>(null);
  readonly permission = signal<NotificationPermission>(
    this.supported ? Notification.permission : 'denied',
  );
  readonly busy = signal(false);
  /** Blocked in the browser's site settings: only the person can allow it there. */
  readonly blocked = computed(() => this.permission() === 'denied');

  private key: string | null = null;

  async load(): Promise<void> {
    const settings = await firstValueFrom(this.api.settings());
    this.enabled.set(settings.push);
    this.key = settings.webPushKey;
  }

  /** Asks the browser for permission (when needed), subscribes this browser and turns the switch on. */
  async enable(): Promise<void> {
    await this.run(async () => {
      if (this.supported && this.key) {
        const permission = await Notification.requestPermission();
        this.permission.set(permission);
        if (permission === 'granted') {
          await this.subscribeThisBrowser();
        }
      }
      this.enabled.set((await firstValueFrom(this.api.updateSettings(true))).push);
    });
  }

  /** Turns the switch off (every device of the person) and forgets this browser. */
  async disable(): Promise<void> {
    await this.run(async () => {
      this.enabled.set((await firstValueFrom(this.api.updateSettings(false))).push);
      await this.forgetBrowser();
    });
  }

  /** After sign-in: a browser that is allowed and switched on keeps (or renews) its subscription. */
  async sync(): Promise<void> {
    if (!this.supported) {
      return;
    }
    await this.load().catch(() => undefined);
    if (this.enabled() && this.permission() === 'granted' && this.key) {
      await this.subscribeThisBrowser().catch(() => undefined);
    }
  }

  /** Before sign-out: this browser stops getting the person's messages (another person may sign in next). */
  async forgetBrowser(): Promise<void> {
    if (!this.supported) {
      return;
    }
    const registration = await navigator.serviceWorker.getRegistration(WORKER_URL);
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) {
      await firstValueFrom(this.api.unsubscribeWebPush(subscription.endpoint)).catch(
        () => undefined,
      );
      await subscription.unsubscribe();
    }
  }

  private async subscribeThisBrowser(): Promise<void> {
    const registration = await navigator.serviceWorker.register(WORKER_URL);
    await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(this.key ?? ''),
      }));
    await firstValueFrom(this.api.subscribeWebPush(subscription.toJSON()));
  }

  private async run(work: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await work();
    } finally {
      this.busy.set(false);
    }
  }
}
