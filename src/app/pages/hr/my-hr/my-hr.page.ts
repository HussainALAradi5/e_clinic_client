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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CheckInCard } from '@components/hr/check-in-card/check-in-card.component';
import { LeaveBalances } from '@components/hr/leave-balances/leave-balances.component';
import { HrActions } from '@services/hr/hr-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { AttendanceSummary } from '@interfaces/hr/attendance-summary.interface';
import { LeaveRequest } from '@interfaces/hr/leave-request.interface';
import { Payslip } from '@interfaces/hr/payslip.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { AttendanceApi } from '@services/hr/attendance-api.service';
import { LeaveApi } from '@services/hr/leave-api.service';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { defaultQuery } from '@utilities/list-query';

/** `/hr/me` — the staff member's own corner: today's check-in, this month, leave left and requested, payslips. */
import { MyEarningsCard } from '@components/hr/my-earnings-card/my-earnings-card.component';
import { MY_HR_TEXT } from '@constants/hr/my-hr.constants';
@Component({
  selector: 'app-my-hr-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    CheckInCard,
    MyEarningsCard,
    LeaveBalances,
    AppButton,
    StatusChip,
    HasAccessDirective,
    MoneyPipe,
    QtyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './my-hr.page.html',
})
export class MyHrPage implements OnInit {
  private readonly attendance = inject(AttendanceApi);
  private readonly leaves = inject(LeaveApi);
  private readonly payroll = inject(PayrollApi);
  private readonly actions = inject(HrActions);
  private readonly access = inject(AccessService);
  protected readonly me = inject(AuthStore).user()?.id ?? '';

  protected readonly text = MY_HR_TEXT;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly variants = ButtonVariant;

  protected readonly month = clinicIsoDate().slice(0, 7);
  protected readonly monthLabel = new Date(`${this.month}-01T00:00:00`).toLocaleDateString(
    'en-GB',
    {
      month: 'long',
      year: 'numeric',
    },
  );
  protected readonly summary = signal<AttendanceSummary | null>(null);
  protected readonly requests = signal<LeaveRequest[]>([]);
  protected readonly payslips = signal<Payslip[]>([]);
  protected readonly version = signal(0);
  protected readonly canClock = computed(() => this.access.can('attendance.self'));

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadSummary(), this.loadRequests(), this.loadPayslips()]);
  }

  protected readonly request = async (): Promise<void> => {
    if (await this.actions.requestLeave()) await this.refreshLeave();
  };

  protected readonly cancel = async (r: LeaveRequest): Promise<void> => {
    if (await this.actions.cancelLeave(r)) await this.refreshLeave();
  };

  protected cancellable(r: LeaveRequest): boolean {
    return r.status === ApprovalStatus.Draft || r.status === ApprovalStatus.Pending;
  }

  protected hours(minutes: number): string {
    return minutes ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : '—';
  }

  private async refreshLeave(): Promise<void> {
    this.version.update((v) => v + 1);
    await this.loadRequests();
  }

  private async loadSummary(): Promise<void> {
    const [y, m] = this.month.split('-').map(Number);
    this.summary.set(
      await firstValueFrom(this.attendance.summary(this.me, y, m)).catch(() => null),
    );
  }

  private async loadRequests(): Promise<void> {
    const page = await firstValueFrom(
      this.leaves.list(
        defaultQuery({
          perPage: 10,
          sort: ['-startDate'],
          filter: { and: [{ employee_id: { eq: this.me } }] },
        }),
      ),
    ).catch(() => null);
    this.requests.set(page?.data ?? []);
  }

  private async loadPayslips(): Promise<void> {
    if (!this.access.can('payroll.read_own | payroll.read_all')) return;
    const page = await firstValueFrom(
      this.payroll.payslips(
        defaultQuery({
          perPage: 12,
          sort: ['-createdAt'],
          filter: { and: [{ employee_id: { eq: this.me } }] },
        }),
      ),
    ).catch(() => null);
    this.payslips.set(page?.data ?? []);
  }
}
