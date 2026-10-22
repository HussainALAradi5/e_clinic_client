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
import { HrActions } from '../../services/hr-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { PayrollStatus } from '@shared/enums/hr/payroll-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { PayrollRun } from '@shared/interfaces/hr/payroll.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { AuthStore } from '@shared/services/auth/auth.store';
import { PayrollApi } from '@shared/services/hr/payroll-api.service';
import { clinicDateTime, clinicIsoDate } from '@shared/utils/clinic-time';

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
      { label: 'Month', value: `${r.periodStart} – ${r.periodEnd}` },
      {
        label: 'Calculated',
        value: r.calculatedBy
          ? `${r.calculatedBy.fullName} · ${clinicDateTime(r.calculatedAt)}`
          : null,
      },
      {
        label: 'Approved',
        value: r.approvedBy ? `${r.approvedBy.fullName} · ${clinicDateTime(r.approvedAt)}` : null,
      },
      {
        label: 'Paid on',
        value: r.paidOn
          ? `${r.paidOn}${r.paymentReference ? ' · ' + r.paymentReference : ''}`
          : null,
      },
      { label: 'Cancelled because', value: r.cancellationReason },
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
