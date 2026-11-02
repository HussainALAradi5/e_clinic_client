import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { ReviewRequestDialog } from '@components/hr/review-request-dialog/review-request-dialog.component';
import { ReviewRequestDialogData } from '@interfaces/hr/review-request-dialog.interface';
import { StaffRequestDialog } from '@components/hr/staff-request-dialog/staff-request-dialog.component';
import { StaffRequestDialogData } from '@interfaces/hr/staff-request-dialog.interface';
import { EmptyState } from '@components/common/empty-state/empty-state.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Paginator } from '@components/common/paginator/paginator.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { StaffRequestType } from '@enums/hr/staff-request-type.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { PageMeta } from '@interfaces/api/page.interface';
import { Attendance } from '@interfaces/hr/attendance.interface';
import { AskableDay, StaffRequest } from '@interfaces/hr/staff-request.interface';
import { FilterCondition, ListQuery } from '@interfaces/list/list-query.interface';
import { PageChange } from '@interfaces/ui/table.interface';
import { DurationPipe } from '@pipes/duration.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { StaffRequestApi } from '@services/hr/staff-request-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { StatusTab } from '@interfaces/hr/staff-requests.interface';

const TABS: { value: StatusTab; label: string; icon: string }[] = [
  { value: 'pending', label: 'Waiting', icon: 'hourglass_top' },
  { value: 'approved', label: 'Approved', icon: 'check_circle' },
  { value: 'rejected', label: 'Rejected', icon: 'cancel' },
  { value: 'all', label: 'All', icon: 'list' },
];

/**
 * `/hr/requests` — late excuses and overtime in one place. Staff see their recent days they can still ask about
 * (late in amber, overtime in blue) and their own requests; HR sees everyone's, waiting first, and approves (reason
 * optional) or rejects (reason required). Counts, filters and pages come from the server.
 */
@Component({
  selector: 'app-staff-requests-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DurationPipe,
    MoneyPipe,
    EmptyState,
    PageHeader,
    Paginator,
    StatusChip,
  ],
  templateUrl: './staff-requests.page.html',
  styleUrl: './staff-requests.page.scss',
})
export class StaffRequestsPage implements OnInit {
  private readonly api = inject(StaffRequestApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly auth = inject(AuthStore);
  private readonly access = inject(AccessService);

  protected readonly tabs = TABS;
  protected readonly types = StaffRequestType;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = DATE_TIME_FORMAT;
  protected readonly timeFormat = TIME_FORMAT;
  protected readonly zone = '+0300';
  /** HR: everyone's requests and the decision buttons. */
  protected readonly canReview = this.access.can('staff_requests.review');
  protected readonly seesEveryone = this.access.can('staff_requests.read_all');
  protected readonly canAsk = this.access.can('staff_requests.create');
  protected readonly me = computed(() => this.auth.user()?.id ?? null);

  protected readonly tab = signal<StatusTab>('pending');
  protected readonly type = signal<StaffRequestType | null>(null);
  protected readonly search = signal('');
  protected readonly page = signal<PageChange>({ page: 1, perPage: 10 });

  protected readonly requests = signal<StaffRequest[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly counts = signal<Record<StatusTab, number | null>>({
    pending: null,
    approved: null,
    rejected: null,
    all: null,
  });
  protected readonly askable = signal<AskableDay[]>([]);
  protected readonly loading = signal(true);
  private loadSeq = 0;

  protected readonly title = computed(() => (this.seesEveryone ? 'Requests' : 'My requests'));

  ngOnInit(): void {
    void this.reload();
  }

  protected setTab(tab: StatusTab): void {
    this.tab.set(tab);
    this.page.update((p) => ({ ...p, page: 1 }));
    void this.load();
  }

  protected setType(type: StaffRequestType | null): void {
    this.type.set(type);
    this.page.update((p) => ({ ...p, page: 1 }));
    void this.reload();
  }

  protected setSearch(value: string): void {
    this.search.set(value.trim());
    this.page.update((p) => ({ ...p, page: 1 }));
    void this.reload();
  }

  protected changePage(change: PageChange): void {
    this.page.set(change);
    void this.load();
  }

  /** What the amount means now: a late excuse saves a deduction, overtime adds pay — once decided, what happened. */
  protected amountLabel(r: StaffRequest): { label: string; sign: string; tone: string } {
    const late = r.type === StaffRequestType.LateExcuse;
    switch (r.status) {
      case ApprovalStatus.Approved:
        return late
          ? { label: 'Excused', sign: '', tone: 'struck' }
          : { label: 'Paid', sign: '+', tone: 'plus' };
      case ApprovalStatus.Rejected:
        return late
          ? { label: 'Deducted', sign: '−', tone: 'minus' }
          : { label: 'Not paid', sign: '', tone: 'struck' };
      default:
        return late
          ? { label: 'If not excused', sign: '−', tone: 'minus' }
          : { label: 'To pay', sign: '+', tone: 'plus' };
    }
  }

  protected minutesOf(day: Attendance, type: StaffRequestType): number {
    return type === StaffRequestType.LateExcuse ? day.lateMinutes : day.overtimeMinutes;
  }

  protected initials(name: string | undefined): string {
    return (name ?? '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');
  }

  protected async ask(day: Attendance, type: StaffRequestType): Promise<void> {
    const created = await this.dialogs.open<
      StaffRequestDialog,
      StaffRequestDialogData,
      StaffRequest
    >(StaffRequestDialog, { day, type }, { width: '520px' });
    if (created) {
      this.notify.success(`Sent to HR — ${created.code}.`);
      this.tab.set('pending');
      void this.reload();
    }
  }

  protected async review(request: StaffRequest, decision: 'approve' | 'reject'): Promise<void> {
    const decided = await this.dialogs.open<
      ReviewRequestDialog,
      ReviewRequestDialogData,
      StaffRequest
    >(ReviewRequestDialog, { request, decision }, { width: '520px' });
    if (decided) {
      this.notify.success(`${decided.code} ${decision === 'approve' ? 'approved' : 'rejected'}.`);
      void this.reload();
    }
  }

  protected async withdraw(request: StaffRequest): Promise<void> {
    const confirmed = await this.dialogs.confirm({
      title: `Withdraw ${request.code}?`,
      message: 'HR will not decide it. You can ask about the same day again later.',
      confirmLabel: 'Withdraw',
      danger: true,
    });
    if (!confirmed) return;
    await firstValueFrom(this.api.cancel(request.id));
    this.notify.success(`${request.code} withdrawn.`);
    void this.reload();
  }

  /** The list, the tab counts and (for staff) the days still open to ask about. */
  private async reload(): Promise<void> {
    await Promise.all([this.load(), this.loadCounts(), this.loadAskable()]);
  }

  private async load(): Promise<void> {
    // Only the latest list counts: a slower earlier one (another tab) must not overwrite it.
    const seq = ++this.loadSeq;
    this.loading.set(true);
    try {
      const page = await firstValueFrom(
        this.api.list({
          ...this.query(this.tab()),
          page: this.page().page,
          perPage: this.page().perPage,
          sort: ['-createdAt'],
        }),
      );
      if (seq !== this.loadSeq) return;
      this.requests.set(page.data);
      this.meta.set(page.meta);
    } finally {
      if (seq === this.loadSeq) this.loading.set(false);
    }
  }

  /** One-row pages per status: the server's totals feed the tab badges. */
  private async loadCounts(): Promise<void> {
    const totals = await Promise.all(
      TABS.map((t) =>
        firstValueFrom(this.api.list({ ...this.query(t.value), perPage: 1 })).then(
          (p) => [t.value, p.meta.total ?? 0] as const,
        ),
      ),
    );
    this.counts.set(Object.fromEntries(totals) as Record<StatusTab, number>);
  }

  private async loadAskable(): Promise<void> {
    if (this.canAsk) this.askable.set(await firstValueFrom(this.api.askable()));
  }

  private query(tab: StatusTab): ListQuery {
    const and: FilterCondition[] = [];
    if (tab !== 'all') and.push({ status: { eq: tab as ApprovalStatus } });
    if (this.type()) and.push({ type: { eq: this.type() } });
    return {
      filter: and.length ? { and } : undefined,
      search: this.search() || undefined,
    };
  }
}
