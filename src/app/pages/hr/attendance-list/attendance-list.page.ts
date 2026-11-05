import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { HrActions } from '@services/hr/hr-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { SettingKey } from '@enums/hr/setting-key.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';
import { AccessService } from '@services/auth/access.service';
import { AuthStore } from '@services/auth/auth.store';
import { SettingApi } from '@services/hr/setting-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { ATTENDANCE_LIST_TEXT } from '@constants/hr/attendance-list.constants';

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

  protected readonly text = ATTENDANCE_LIST_TEXT;
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
