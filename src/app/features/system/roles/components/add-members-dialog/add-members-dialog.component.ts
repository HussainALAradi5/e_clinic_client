import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AddMembersDialogData } from '../../interfaces/add-members-dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { UserType } from '@shared/enums/identity/user-type.enum';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { User } from '@shared/interfaces/identity/user.interface';
import { initials } from '@shared/utils/text';

/** Staff accounts only — patients sign in to the portal and never hold staff roles. */
const STAFF_TYPES = Object.values(UserType).filter((type) => type !== UserType.Patient);

/**
 * Pick people one by one (search by name, email or code); they collect in a list until "Add N people".
 * Only people who do not hold the role yet are offered. Closes with how many were added.
 */
@Component({
  selector: 'app-add-members-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, AppButton, EntitySelect, StatusChip],
  templateUrl: './add-members-dialog.component.html',
})
export class AddMembersDialog {
  protected readonly data = inject<AddMembersDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<AddMembersDialog, number>);

  protected readonly picker = new FormControl<string | null>(null);
  protected readonly picked = signal<User[]>([]);
  protected readonly params = { withoutRole: this.data.role.name };
  protected readonly staffOnly: FilterGroup = { and: [{ user_type: { in: STAFF_TYPES } }] };
  protected readonly initials = initials;
  protected readonly name = (user: User): string => user.fullName;
  protected readonly detail = (user: User): string | null => user.email ?? user.code;

  protected pick(user: User | null): void {
    if (user && !this.picked().some((p) => p.id === user.id)) {
      this.picked.update((list) => [...list, user]);
    }
    this.picker.setValue(null);
  }

  protected drop(user: User): void {
    this.picked.update((list) => list.filter((p) => p.id !== user.id));
  }

  protected readonly save = async (): Promise<void> => {
    this.ref.close(await this.data.add(this.picked().map((user) => user.id)));
  };
}
