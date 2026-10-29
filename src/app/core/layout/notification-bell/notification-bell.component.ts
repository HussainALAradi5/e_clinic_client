import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { AppNotification } from '@shared/interfaces/notification/notification.interface';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { NotificationApi } from '@shared/services/notification/notification-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { poll } from '@shared/utils/poll';

const POLL_MS = 60_000;
const INBOX_SIZE = 10;

/**
 * Where an in-app notification leads, by its related record alias (the server's morph map): the record's page
 * (`:id`) or, for records shown only in a list, that list.
 */
const RELATED_ROUTES: Record<string, string> = {
  background_task: '/system/background-tasks/:id',
  attachment: '/system/attachments',
  user: '/system/users/:id',
  role: '/system/roles-permissions/:id',
  person: '/system/people',
  company: '/reference/companies/:id',
  account: '/accounting/chart-of-accounts/:id',
  expense: '/accounting/expenses/:id',
  department: '/hr/departments/:id',
  employee: '/hr/employees/:id',
  attendance: '/hr/attendance',
  leave_request: '/hr/leaves/:id',
  payroll_run: '/hr/payroll/:id',
  payslip: '/hr/me',
  patient: '/clinic/patients/:id',
  doctor: '/clinic/doctors/:id',
  room: '/clinic/rooms/:id',
  appointment: '/clinic/appointments/:id',
  treatment: '/clinic/treatments/:id',
  clinical_order: '/clinic/clinical-orders/:id',
  billable_service: '/billing/service-catalog/:id',
  invoice: '/billing/invoices/:id',
  payment: '/billing/payments',
  refund: '/billing/refunds',
  insurance_claim: '/billing/insurance-claims/:id',
  cash_session: '/billing/cash-drawers/:id',
  medication: '/pharmacy/medications/:id',
  medication_batch: '/pharmacy/stock',
  prescription: '/pharmacy/prescriptions/:id',
  dispensation: '/pharmacy/dispensations/:id',
};

/**
 * Toolbar bell: unread badge (polled every minute, paused in hidden tabs), latest messages, mark read. With
 * `inboxLink` (portal) it links to the inbox page instead, and the badge refreshes after each navigation.
 */
@Component({
  selector: 'app-notification-bell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RelativeTimePipe,
  ],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBell implements OnInit {
  readonly inboxLink = input<string | null>(null);

  private readonly api = inject(NotificationApi);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly unread = signal(0);
  protected readonly items = signal<AppNotification[]>([]);
  protected readonly loading = signal(false);

  ngOnInit(): void {
    poll(() => this.api.unreadCount(), { interval: POLL_MS, maxInterval: POLL_MS })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (count) => this.unread.set(count), error: () => undefined });
    if (this.inboxLink()) {
      this.router.events
        .pipe(
          filter((e) => e instanceof NavigationEnd),
          switchMap(() => this.api.unreadCount()),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({ next: (count) => this.unread.set(count), error: () => undefined });
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.api.inbox({ perPage: INBOX_SIZE }, false, true).subscribe({
      next: (page) => {
        this.items.set(page.data);
        this.unread.set(page.meta.unreadCount ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected open(item: AppNotification): void {
    if (!item.readAt) {
      this.api.markRead(item.id).subscribe(() => {
        this.unread.update((n) => Math.max(0, n - 1));
        this.items.update((list) =>
          list.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
        );
      });
    }
    const route = item.relatedType ? RELATED_ROUTES[item.relatedType] : undefined;
    if (route && !(route.includes(':id') && !item.relatedId)) {
      void this.router.navigateByUrl(route.replace(':id', item.relatedId ?? ''));
    }
  }

  protected markAllRead(event: Event): void {
    event.stopPropagation();
    this.api.markAllRead().subscribe({
      next: () => {
        this.unread.set(0);
        const now = new Date().toISOString();
        this.items.update((list) => list.map((n) => ({ ...n, readAt: n.readAt ?? now })));
      },
      error: (e: unknown) => this.notify.error(e),
    });
  }
}
