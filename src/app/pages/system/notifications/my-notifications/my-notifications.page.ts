import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateRangeFilter } from '@components/common/date-range-filter/date-range-filter.component';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Paginator } from '@components/common/paginator/paginator.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { DATE_TIME_FORMAT } from '@constants/app.constants';
import { NOTIFICATION_TOPICS, notificationLink } from '@constants/notification-links.constants';
import { PageMeta } from '@interfaces/api/page-meta.interface';
import { DateRangeValue } from '@interfaces/list/date-range-filter.interface';
import { ListQuery } from '@interfaces/list/list-query.interface';
import { AppNotification } from '@interfaces/notification/notification.interface';
import { PageChange } from '@interfaces/ui/page-change.interface';
import { RelativeTimePipe } from '@pipes/relative-time.pipe';
import { NotificationApi } from '@services/notification/notification-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { NotificationKindIcon } from '@components/notification/notification-kind-icon/notification-kind-icon.component';
import { ReadFilter } from '@interfaces/system/my-notifications.interface';
import { MY_NOTIFICATIONS_TEXT } from '@constants/system/my-notifications.constants';
const PAGE_SIZE = 20;

/**
 * `/notifications` — my notifications, unread first: All / Unread / Read, what they are about (support tickets,
 * chat, appointments …), text search and dates, all filtered and paged on the server. Unread ones have a blue
 * background; opening one marks it read and goes to its record (a ticket, a chat …).
 */
@Component({
  selector: 'app-my-notifications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    DateRangeFilter,
    EmptyState,
    PageHeader,
    Paginator,
    Skeleton,
    RelativeTimePipe,
    NotificationKindIcon,
  ],
  templateUrl: './my-notifications.page.html',
  styleUrl: './my-notifications.page.scss',
})
export class MyNotificationsPage {
  private readonly api = inject(NotificationApi);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  protected readonly topics = NOTIFICATION_TOPICS;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly dateFields = [{ value: 'created_at', label: MY_NOTIFICATIONS_TEXT.received }];
  protected readonly chips: { value: ReadFilter; label: string }[] = [
    { value: 'all', label: MY_NOTIFICATIONS_TEXT.all },
    { value: 'unread', label: MY_NOTIFICATIONS_TEXT.unread },
    { value: 'read', label: MY_NOTIFICATIONS_TEXT.read },
  ];

  protected readonly read = signal<ReadFilter>('all');
  protected readonly topic = signal<string>('');
  protected readonly search = signal('');
  protected readonly dates = signal<DateRangeValue>({});
  protected readonly page = signal(1);
  protected readonly perPage = signal(PAGE_SIZE);

  protected readonly items = signal<AppNotification[]>([]);
  protected readonly meta = signal<PageMeta>({ perPage: PAGE_SIZE });
  protected readonly loading = signal(true);
  protected readonly unread = computed(() => this.meta().unreadCount ?? 0);
  protected readonly filtered = computed(
    () =>
      this.read() !== 'all' ||
      !!this.topic() ||
      !!this.search().trim() ||
      !!this.dates().from ||
      !!this.dates().preset,
  );

  private readonly load$ = new Subject<void>();

  constructor() {
    this.load$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          this.loading.set(true);
          return this.api.inbox(this.query(), this.readParam());
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (page) => {
          this.items.set(page.data);
          this.meta.set(page.meta);
          this.loading.set(false);
        },
        error: (e: unknown) => {
          this.loading.set(false);
          this.notify.error(e);
        },
      });

    // Any filter change goes back to page 1; paging keeps the filters.
    effect(() => {
      this.read();
      this.topic();
      this.search();
      this.dates();
      untracked(() => this.page.set(1));
      untracked(() => this.load$.next());
    });
  }

  private readParam(): 'unread' | 'read' | null {
    const read = this.read();
    return read === 'all' ? null : read;
  }

  private query(): ListQuery {
    const d = this.dates();
    return {
      page: this.page(),
      perPage: this.perPage(),
      search: this.search().trim() || undefined,
      dateField: d.from || d.to || d.preset ? 'created_at' : undefined,
      dateFrom: d.from,
      dateTo: d.to,
      dateRange: d.preset,
      filter: this.topic() ? { and: [{ related_type: { eq: this.topic() } }] } : undefined,
    };
  }

  protected onPage(change: PageChange): void {
    this.page.set(change.page ?? 1);
    this.perPage.set(change.perPage);
    this.load$.next();
  }

  protected clear(): void {
    this.read.set('all');
    this.topic.set('');
    this.search.set('');
    this.dates.set({});
  }

  protected link = notificationLink;

  protected open(item: AppNotification): void {
    if (!item.readAt) this.markRead(item);
    const link = notificationLink(item);
    if (link) void this.router.navigateByUrl(link);
  }

  protected markRead(item: AppNotification, event?: Event): void {
    event?.stopPropagation();
    this.api.markRead(item.id).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.items.update((list) =>
          list.map((n) => (n.id === item.id ? { ...n, readAt: now } : n)),
        );
        this.meta.update((m) => ({ ...m, unreadCount: Math.max(0, (m.unreadCount ?? 1) - 1) }));
      },
      error: (e: unknown) => this.notify.error(e),
    });
  }

  protected markAllRead(): void {
    this.api.markAllRead().subscribe({
      next: () => this.load$.next(),
      error: (e: unknown) => this.notify.error(e),
    });
  }
}
