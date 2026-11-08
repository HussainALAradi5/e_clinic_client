import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardComponent } from '@components/common/dashboard/dashboard.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { ATTENDANCE_DASHBOARD_TEXT } from '@constants/hr/attendance-dashboard.constants';
import { DashboardSection } from '@enums/dashboard/dashboard-section.enum';

/** `/hr/dashboard` — the attendance section's default dashboard. */
@Component({
  selector: 'app-attendance-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardComponent, PageHeader],
  templateUrl: './attendance-dashboard.page.html',
})
export class AttendanceDashboardPage {
  protected readonly text = ATTENDANCE_DASHBOARD_TEXT;
  protected readonly section = DashboardSection.Attendance;
}
