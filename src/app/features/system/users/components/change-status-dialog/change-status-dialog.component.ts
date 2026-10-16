import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ChangeStatusDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { REASON_MAX_LENGTH } from '@shared/constants/limits.constants';
import { UserStatus } from '@shared/enums/identity/user-status.enum';
import { EnumService } from '@shared/services/data/enum.service';
import { AppValidators } from '@shared/utils/validators';

const NEEDS_REASON: string[] = [UserStatus.Locked, UserStatus.Inactive];

/** Activate, deactivate, lock or unlock an account (reason required for lock / deactivate — audited). */
@Component({
  selector: 'app-change-status-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField],
  templateUrl: './change-status-dialog.component.html',
})
export class ChangeStatusDialog {
  protected readonly data = inject<ChangeStatusDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ChangeStatusDialog>);
  private readonly enums = inject(EnumService);

  protected readonly reasonMax = REASON_MAX_LENGTH;
  protected readonly form = new FormGroup({
    status: new FormControl<UserStatus | null>(null, { validators: [Validators.required] }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [
        AppValidators.requiredIf((c) =>
          NEEDS_REASON.includes(String(c.parent?.get('status')?.value)),
        ),
        Validators.maxLength(REASON_MAX_LENGTH),
      ],
    }),
  });
  protected readonly status = toSignal(this.form.controls.status.valueChanges, {
    initialValue: null,
  });
  protected readonly needsReason = computed(() => NEEDS_REASON.includes(String(this.status())));
  protected readonly options = computed(() =>
    this.enums.options('UserStatus').filter((option) => option.value !== this.data.user.status),
  );

  constructor() {
    this.form.controls.status.valueChanges.subscribe(() =>
      this.form.controls.reason.updateValueAndValidity(),
    );
  }

  protected readonly submit = (value: {
    status: UserStatus | null;
    reason: string;
  }): Promise<unknown> =>
    this.data.save({ status: value.status as UserStatus, reason: value.reason.trim() || null });
}
