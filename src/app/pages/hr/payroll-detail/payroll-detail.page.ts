import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HrActions } from '@services/hr/hr-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { PayrollStatus } from '@enums/hr/payroll-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { PayrollRun } from '@interfaces/hr/payroll-run.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { AuthStore } from '@services/auth/auth.store';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { clinicDateTime, clinicIsoDate } from '@utilities/clinic-time';
import { PAYROLL_DETAIL_TEXT } from '@constants/hr/payroll-detail.constants';

/** `/hr/payroll/:id` — one month's payroll: totals, every payslip, and the next step (calculate → approve → pay). */
@Component({
  selector: 'app-payroll-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    HasAccessDirective,
    MoneyPipe,
    QtyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './payroll-detail.page.html',
})
export class PayrollDetailPage implements OnInit {
  protected readonly text = PAYROLL_DETAIL_TEXT;

  readonly id = input.required<string>();

  private readonly api = inject(PayrollApi);
  private readonly actions = inject(HrActions);
  private readonly me = inject(AuthStore).user()?.id;
  protected readonly run = signal<PayrollRun | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly variants = ButtonVariant;
  protected readonly statuses = PayrollStatus;

  protected readonly month = computed(() => {
    const r = this.run();
    return r
      ? new Date(`${r.periodStart}T00:00:00`).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        })
      : '';
  });
  protected readonly ended = computed(
    () => !!this.run() && (this.run() as PayrollRun).periodEnd < clinicIsoDate(),
  );
  protected readonly calculable = computed(() =>
    [PayrollStatus.Draft, PayrollStatus.Calculated].includes(this.run()?.status as PayrollStatus),
  );
  /** Someone other than who calculated it approves. */
  protected readonly approvable = computed(
    () =>
      this.run()?.status === PayrollStatus.Calculated && this.run()?.calculatedBy?.id !== this.me,
  );
  protected readonly cancellable = computed(() =>
    [PayrollStatus.Draft, PayrollStatus.Calculated, PayrollStatus.Approved].includes(
      this.run()?.status as PayrollStatus,
    ),
  );
  protected readonly facts = computed<Fact[]>(() => {
    const r = this.run();
    if (!r) return [];
    return [
      { label: PAYROLL_DETAIL_TEXT.month, value: `${r.periodStart} – ${r.periodEnd}` },
      {
        label: PAYROLL_DETAIL_TEXT.calculated,
        value: r.calculatedBy
          ? `${r.calculatedBy.fullName} · ${clinicDateTime(r.calculatedAt)}`
          : null,
      },
      {
        label: PAYROLL_DETAIL_TEXT.approved,
        value: r.approvedBy ? `${r.approvedBy.fullName} · ${clinicDateTime(r.approvedAt)}` : null,
      },
      {
        label: PAYROLL_DETAIL_TEXT.paidOn,
        value: r.paidOn
          ? `${r.paidOn}${r.paymentReference ? ' · ' + r.paymentReference : ''}`
          : null,
      },
      { label: PAYROLL_DETAIL_TEXT.cancelledBecause, value: r.cancellationReason },
    ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '');
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.run.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error);
    }
  }

  protected readonly calculate = (): Promise<void> =>
    this.step(this.actions.calculatePayroll(this.record()));
  protected readonly approve = (): Promise<void> =>
    this.step(this.actions.approvePayroll(this.record()));
  protected readonly pay = (): Promise<void> => this.step(this.actions.payPayroll(this.record()));
  protected readonly cancel = (): Promise<void> =>
    this.step(this.actions.cancelPayroll(this.record()));

  private record(): PayrollRun {
    return this.run() as PayrollRun;
  }

  private async step(action: Promise<PayrollRun | undefined>): Promise<void> {
    const result = await action;
    if (result) await this.load();
  }
}
