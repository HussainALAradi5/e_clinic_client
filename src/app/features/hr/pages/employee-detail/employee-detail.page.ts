import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmploymentDialog } from '../../components/employment-dialog/employment-dialog.component';
import { LeaveBalances } from '../../components/leave-balances/leave-balances.component';
import { SalaryComponentDialog } from '../../components/salary-component-dialog/salary-component-dialog.component';
import { TerminateDialog } from '../../components/terminate-dialog/terminate-dialog.component';
import { EmployeeDialogData, EmploymentDialogData } from '../../interfaces/dialog-data.interface';
import { HrActions } from '../../services/hr-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { EmployeeStatus } from '@shared/enums/hr/employee-status.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ApiError } from '@shared/interfaces/api/api-error.interface';
import { Employee, SalaryComponent } from '@shared/interfaces/hr/employee.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { AccessService } from '@shared/services/auth/access.service';
import { EnumService } from '@shared/services/data/enum.service';
import { EmployeeApi } from '@shared/services/hr/employee-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { formatMoney } from '@shared/utils/money';

/** `/hr/employees/:id` — employment, person and account; edit, suspend / reactivate, terminate; salary; leave. */
@Component({
  selector: 'app-employee-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    StatusChip,
    AuditHistory,
    LeaveBalances,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
    HasAccessDirective,
    DatePipe,
    EnumLabelPipe,
    MoneyPipe,
  ],
  templateUrl: './employee-detail.page.html',
})
export class EmployeeDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(EmployeeApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly access = inject(AccessService);
  private readonly enums = inject(EnumService);
  private readonly hr = inject(HrActions);
  protected readonly leaveVersion = signal(0);

  protected readonly employee = signal<Employee | null>(null);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly statuses = EmployeeStatus;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly canManageSalary = this.access.can('employees.manage_salary');

  protected readonly employment = computed<Fact[]>(() => {
    const e = this.employee();
    if (!e) return [];
    const days = e.weeklyOffDays.map((d) => this.enums.label('DayOfWeek', d)).join(', ');
    return [
      { label: 'Department', value: e.department?.name },
      { label: 'Job title', value: e.jobTitle },
      { label: 'Contract', value: this.enums.label('EmploymentType', e.employmentType) },
      { label: 'Hired', value: e.hireDate },
      { label: 'Probation ends', value: e.probationEndDate },
      { label: 'Shift', value: `${e.workStartTime} – ${e.workEndTime}` },
      { label: 'Days off', value: days || 'None' },
      ...(e.terminationDate
        ? [
            {
              label: 'Terminated',
              value: `${e.terminationDate} — ${this.enums.label('TerminationReason', e.terminationReason)}`,
            },
          ]
        : []),
    ];
  });

  protected readonly personal = computed<Fact[]>(() => {
    const p = this.employee()?.person;
    if (!p) return [];
    return [
      { label: 'File number', value: p.code, mono: true },
      { label: 'Gender', value: this.enums.label('Gender', p.gender) },
      { label: 'Date of birth', value: p.dateOfBirth },
      { label: 'National ID', value: p.nationalId, mono: true },
      { label: 'Mobile', value: p.phone },
      { label: 'Email', value: p.email },
    ];
  });

  protected readonly salary = computed<Fact[]>(() => {
    const e = this.employee();
    if (!e?.basicSalary) return [];
    return [
      { label: 'Basic salary', value: formatMoney(e.basicSalary) },
      { label: 'Bank', value: e.bankName },
      { label: 'IBAN', value: e.iban, mono: true },
      { label: 'GOSI number', value: e.socialInsuranceNumber, mono: true },
    ];
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.error.set(null);
    try {
      this.employee.set(await firstValueFrom(this.api.get(this.id())));
    } catch (error) {
      this.error.set(error as ApiError);
    }
  }

  protected readonly recordLeave = async (): Promise<void> => {
    const e = this.employee();
    if (e && (await this.hr.requestLeave({ id: e.id, fullName: e.fullName }))) {
      this.leaveVersion.update((v) => v + 1);
    }
  };

  protected readonly correctDay = async (): Promise<void> => {
    const e = this.employee();
    if (e)
      await this.hr.recordAttendance({ employee: { id: e.id, fullName: e.fullName }, date: null });
  };

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<EmploymentDialog, EmploymentDialogData, Employee>(
      EmploymentDialog,
      { employee: this.employee()!, canManageSalary: this.canManageSalary },
      { width: '720px' },
    );
    if (saved) {
      this.employee.set(saved);
      this.notify.success('Employment data saved.');
    }
  };

  protected readonly suspend = async (): Promise<void> =>
    this.changeStatus(EmployeeStatus.Suspended);
  protected readonly reactivate = async (): Promise<void> =>
    this.changeStatus(EmployeeStatus.Active);

  protected readonly terminate = async (): Promise<void> => {
    const saved = await this.dialogs.open<TerminateDialog, EmployeeDialogData, Employee>(
      TerminateDialog,
      { employee: this.employee()! },
      { width: '560px' },
    );
    if (saved) {
      this.employee.set(saved);
      this.notify.success(`${saved.fullName} terminated; the account is deactivated.`);
    }
  };

  protected readonly addComponent = async (): Promise<void> => {
    const added = await this.dialogs.open<
      SalaryComponentDialog,
      EmployeeDialogData,
      SalaryComponent
    >(SalaryComponentDialog, { employee: this.employee()! }, { width: '560px' });
    if (added) {
      this.notify.success(`${added.name} added.`);
      await this.load();
    }
  };

  protected readonly removeComponent = async (component: SalaryComponent): Promise<void> => {
    await firstValueFrom(this.api.removeSalaryComponent(component.id));
    this.notify.success(`${component.name} ended.`);
    await this.load();
  };

  private async changeStatus(status: EmployeeStatus): Promise<void> {
    const suspending = status === EmployeeStatus.Suspended;
    const reason = await this.dialogs.reason({
      title: suspending ? 'Suspend this employee?' : 'Reactivate this employee?',
      message: suspending
        ? 'Signing in is blocked until the employee is reactivated.'
        : 'Signing in works again for staff with a password.',
      confirmLabel: suspending ? 'Suspend' : 'Reactivate',
      danger: suspending,
    });
    if (reason === null) return;
    this.employee.set(await firstValueFrom(this.api.changeStatus(this.id(), status, reason)));
    this.notify.success(suspending ? 'Employee suspended.' : 'Employee reactivated.');
  }
}
