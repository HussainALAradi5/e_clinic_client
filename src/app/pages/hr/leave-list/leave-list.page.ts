import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { HrActions } from '@services/hr/hr-actions.service';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { QtyPipe } from '@pipes/qty.pipe';
import { DATE_FORMAT } from '@constants/app.constants';

/** `/hr/leaves` — leave requests, newest first; staff see their own. */
@Component({
  selector: 'app-leave-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
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
