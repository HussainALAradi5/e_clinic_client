import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RoleFormDialogData } from '@interfaces/system/roles/role-form-dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Role, RolePayload } from '@interfaces/identity/role.interface';

/** Create a custom role, or edit labels (and the machine name of custom roles). Rights are set in the access matrix. */
@Component({
  selector: 'app-role-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField],
  templateUrl: './role-form-dialog.component.html',
})
export class RoleFormDialog {
  protected readonly data = inject<RoleFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<RoleFormDialog, Role>);
  private readonly role = this.data.role;

  protected readonly form = new FormGroup({
    name: new FormControl(
      { value: this.role?.name ?? '', disabled: this.role?.isSystem ?? false },
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[a-z0-9_-]+$/),
        ],
      },
    ),
    displayName: new FormControl(this.role?.displayName ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    description: new FormControl(this.role?.description ?? null, [Validators.maxLength(2000)]),
  });

  private saved: Role | undefined;

  protected readonly submit = async (): Promise<Role> => {
    const { name, displayName, description } = this.form.getRawValue();
    const payload: RolePayload = { displayName, description };
    if (!this.role?.isSystem) {
      payload.name = name;
    }
    this.saved = await this.data.save(payload);
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
