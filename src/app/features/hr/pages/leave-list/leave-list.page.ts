import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { HrActions } from '../../services/hr-actions.service';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { QtyPipe } from '@shared/pipes/qty.pipe';
import { DATE_FORMAT } from '@shared/constants/app.constants';

/** `/hr/leaves` — leave requests, newest first; staff see their own. */
@Component({
  selector: 'app-leave-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    StatusChip,
    HasAccessDirective,
    DatePipe,
    QtyPipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './leave-list.page.html',
})
export class LeaveListPage {
  private readonly actions = inject(HrActions);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly request = async (): Promise<void> => {
    const request = await this.actions.requestLeave();
    if (request) await this.router.navigate(['/hr/leaves', request.id]);
  };
}
