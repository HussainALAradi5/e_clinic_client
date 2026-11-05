import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { PORTAL_RELATED_ROUTES } from '@constants/portal.constants';
import { AppNotification } from '@interfaces/notification/notification.interface';
import { RelativeTimePipe } from '@pipes/relative-time.pipe';
import { NotificationApi } from '@services/notification/notification-api.service';
import { NotificationKindIcon } from '@components/notification/notification-kind-icon/notification-kind-icon.component';
import { NOTIFICATIONS_TEXT } from '@constants/portal/notifications.constants';
import { NotificationOpener } from '@services/notification/notification-opener.service';

const PAGE_SIZE = 25;

/** `/portal/notifications` — the in-app inbox: reminders, confirmations, results ready; each leads to its page. */
@Component({
  selector: 'app-portal-notifications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    EmptyState,
    Skeleton,
    RelativeTimePipe,
    NotificationKindIcon,
  ],
  templateUrl: './notifications.page.html',
})
export class PortalNotificationsPage {
  private readonly api = inject(NotificationApi);
  private readonly opener = inject(NotificationOpener);

  protected readonly text = NOTIFICATIONS_TEXT;
  protected readonly items = signal<AppNotification[] | null>(null);
  protected readonly more = signal(false);
  protected readonly unread = computed(() => (this.items() ?? []).some((n) => !n.readAt));
  private page = 1;

  constructor() {
    void this.load();
  }

  protected async load(next = false): Promise<void> {
    this.page = next ? this.page + 1 : 1;
    const page = await firstValueFrom(
      this.api.inbox({ page: this.page, perPage: PAGE_SIZE }),
    ).catch(() => null);
    const rows = page?.data ?? [];
    this.items.update((list) => (next ? [...(list ?? []), ...rows] : rows));
    this.more.set(rows.length === PAGE_SIZE);
  }

  protected async open(item: AppNotification): Promise<void> {
    if (!item.readAt) {
      const read = await firstValueFrom(this.api.markRead(item.id)).catch(() => null);
      if (read) this.replace(read);
    }
    const route = item.relatedType ? PORTAL_RELATED_ROUTES[item.relatedType] : undefined;
    await this.opener.show(item, route ?? null);
  }

  protected async markAllRead(): Promise<void> {
    await firstValueFrom(this.api.markAllRead());
    const now = new Date().toISOString();
    this.items.update((list) => (list ?? []).map((n) => ({ ...n, readAt: n.readAt ?? now })));
  }

  private replace(updated: AppNotification): void {
    this.items.update((list) => (list ?? []).map((n) => (n.id === updated.id ? updated : n)));
  }
}
