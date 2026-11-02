import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom, startWith } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { SickLeave } from '@interfaces/clinic/sick-leave.interface';
import { SickLeaveApi } from '@services/clinic/sick-leave-api.service';
import { addDays } from '@utilities/clinic-time';
import { SickLeaveDialogData } from '@interfaces/clinic/sick-leave-dialog.interface';

/** Same limits as the server (SickLeaveService). */
const MAX_DAYS = 30;

/**
 * The doctor issues a sick leave at the visit: first and last day (the count follows), the reason, and whether to
 * print the reason (off by default: the certificate then says "for medical reasons").
 */
@Component({
  selector: 'app-sick-leave-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatSlideToggleModule, ReactiveFormsModule, GenericForm, TextField],
  templateUrl: './sick-leave-dialog.component.html',
})
export class SickLeaveDialog {
  protected readonly data = inject<SickLeaveDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SickLeaveDialog, SickLeave>);
  private readonly api = inject(SickLeaveApi);

  protected readonly form = new FormGroup({
    startDate: new FormControl(this.data.visitDate, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl(addDays(this.data.visitDate, 1), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reason: new FormControl<string | null>(null, [Validators.maxLength(500)]),
    showReason: new FormControl(false, { nonNullable: true }),
    notes: new FormControl<string | null>(null, [Validators.maxLength(500)]),
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    {
      initialValue: this.form.getRawValue(),
    },
  );
  /** "3 days off" while choosing. */
  protected readonly days = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.value() };
    const n =
      Math.round((Date.parse(v.endDate ?? '') - Date.parse(v.startDate ?? '')) / 86_400_000) + 1;
    return Number.isFinite(n) ? n : 0;
  });
  protected readonly maxDays = MAX_DAYS;

  protected readonly submit = async (): Promise<SickLeave> => {
    const v = this.form.getRawValue();
    const leave = await firstValueFrom(
      this.api.issue(this.data.appointmentId, {
        startDate: v.startDate,
        endDate: v.endDate,
        reason: v.reason?.trim() || null,
        showReason: v.showReason,
        notes: v.notes?.trim() || null,
      }),
    );
    this.ref.close(leave);
    return leave;
  };
}
