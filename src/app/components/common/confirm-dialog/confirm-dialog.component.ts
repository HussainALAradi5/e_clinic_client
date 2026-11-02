import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { REASON_MAX_LENGTH } from '@constants/limits.constants';
import { ConfirmConfig } from '@interfaces/ui/confirm-config.interface';
import { CONFIRM_DIALOG_TEXT } from '@constants/common/confirm-dialog.constants';

/**
 * `ui-confirm` / `ui-reason` in one component: closes with `true` (confirm), the reason string (reason mode) or nothing.
 */
@Component({
  selector: 'ui-confirm',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmConfig>(MAT_DIALOG_DATA);
  protected readonly maxLength = REASON_MAX_LENGTH;
  protected readonly reason = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly typed = new FormControl('', { nonNullable: true });
  /** "Cancel" next to "Cancel treatment" is ambiguous: the way back reads "Keep it" then. */
  protected readonly dismissLabel =
    this.data.cancelLabel ??
    (this.data.confirmLabel?.startsWith(CONFIRM_DIALOG_TEXT.cancel)
      ? CONFIRM_DIALOG_TEXT.keepIt
      : CONFIRM_DIALOG_TEXT.cancel);

  protected canConfirm(): boolean {
    const reasonOk = !this.data.reason || this.reason.value.trim().length > 0;
    const typedOk = !this.data.typeToConfirm || this.typed.value.trim() === this.data.typeToConfirm;
    return reasonOk && typedOk;
  }
}
