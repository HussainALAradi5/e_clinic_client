import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { RelativeTimePipe } from '@pipes/relative-time.pipe';
import { USER_LIST_TEXT } from '@constants/system/user-list.constants';

/** `/system/users` — login accounts (created by HR / patient registration, never here). */
@Component({
  selector: 'app-user-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, RelativeTimePipe],
  templateUrl: './user-list.page.html',
})
export class UserListPage {
  protected readonly text = USER_LIST_TEXT;

  protected readonly columns = [
    'code',
    'full_name',
    'email',
    'user_type',
    'status',
    'last_login_at',
  ];
}
