import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { UserRolesDialogData } from '@interfaces/system/users/user-roles-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { MAX_PER_PAGE } from '@constants/limits.constants';
import { RoleApi } from '@services/identity/role-api.service';
import { USER_ROLES_DIALOG_TEXT } from '@constants/system/user-roles-dialog.constants';

/**
 * Replaces a user's roles (PUT /roles/users/{user}). The server refuses roles whose rights the caller does not hold
 * and signs the user out so the new rights apply.
 */
@Component({
  selector: 'app-user-roles-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatCheckboxModule, MatButtonModule, AppButton, Skeleton, ErrorState],
  templateUrl: './user-roles-dialog.component.html',
})
export class UserRolesDialog {
  protected readonly text = USER_ROLES_DIALOG_TEXT;

  protected readonly data = inject<UserRolesDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<UserRolesDialog>);
  private readonly api = inject(RoleApi);

  protected readonly roles = rxResource({
    stream: () =>
      this.api
        .list({ perPage: MAX_PER_PAGE, sort: ['displayName'] })
        .pipe(map((page) => page.data)),
  });
  protected readonly selected = signal(new Set(this.data.current));
  protected readonly changed = computed(() => {
    const now = this.selected();
    return (
      now.size !== this.data.current.length || this.data.current.some((name) => !now.has(name))
    );
  });

  protected toggle(name: string, checked: boolean): void {
    const next = new Set(this.selected());
    if (checked) {
      next.add(name);
    } else {
      next.delete(name);
    }
    this.selected.set(next);
  }

  protected readonly save = async (): Promise<void> => {
    await this.data.save([...this.selected()]);
    this.ref.close(true);
  };
}
