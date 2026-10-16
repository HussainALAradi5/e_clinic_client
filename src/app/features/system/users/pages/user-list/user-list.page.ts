import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';

/** `/system/users` — login accounts (created by HR / patient registration, never here). */
@Component({
  selector: 'app-user-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, StatusChip, EnumLabelPipe, RelativeTimePipe],
  templateUrl: './user-list.page.html',
})
export class UserListPage {
  protected readonly columns = [
    'code',
    'full_name',
    'email',
    'user_type',
    'status',
    'last_login_at',
  ];
}
