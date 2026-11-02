import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { HrActions } from '../../services/hr-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@shared/constants/app.constants';
import { SettingKey } from '@shared/enums/hr/setting-key.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Attendance } from '@shared/interfaces/hr/attendance.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { AuthStore } from '@shared/services/auth/auth.store';
import { SettingApi } from '@shared/services/hr/setting-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/** `/hr/attendance` — everyone's days: lateness, overtime to approve, missing check-outs, HR corrections. */
@Component({
  selector: 'app-attendance-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    StatusChip,
    DatePipe,
    MatIconModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './attendance-list.page.html',
})
export class AttendanceListPage {
  private readonly actions = inject(HrActions);
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly me = inject(AuthStore).user()?.id;
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly timeFormat = TIME_FORMAT;
  protected readonly zone = '+0300';
  protected readonly variants = ButtonVariant;
  protected readonly today = clinicIsoDate();
  /** Overtime requests on: overtime is approved from the employee's request (Requests), not here. */
  protected readonly overtimeByRequest = signal(false);

  constructor() {
    if (inject(AccessService).can('settings.read_all')) {
      inject(SettingApi)
        .list()
        .subscribe((page) =>
          this.overtimeByRequest.set(
            page.data.some((s) => s.key === SettingKey.Overtime && s.isEnabled),
          ),
        );
    }
  }

  protected readonly record = async (): Promise<void> => {
    if (await this.actions.recordAttendance({ employee: null, date: null })) this.list().reload();
  };

  protected readonly correct = async (row: Attendance): Promise<void> => {
    const employee = row.employee ? { id: row.employee.id, fullName: row.employee.fullName } : null;
    if (await this.actions.recordAttendance({ employee, date: row.date })) this.list().reload();
  };

  protected readonly approve = async (row: Attendance): Promise<void> => {
    if (await this.actions.approveOvertime(row)) this.list().reload();
  };

  protected duration(minutes: number): string {
    return minutes ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` : '—';
  }
}
