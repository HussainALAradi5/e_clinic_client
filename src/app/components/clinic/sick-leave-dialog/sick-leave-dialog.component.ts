import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import {
  SICK_LEAVE_DAY_CHOICES,
  SICK_LEAVE_DIALOG_TEXT,
  SICK_LEAVE_MAX_DAYS,
} from '@constants/clinic/sick-leave.constants';
import { SickLeave } from '@interfaces/clinic/sick-leave.interface';
import { SickLeaveDialogData } from '@interfaces/clinic/sick-leave-dialog.interface';
import { SickLeaveApi } from '@services/clinic/sick-leave-api.service';
import { addDays, daysBetween } from '@utilities/clinic-time';

/**
 * The doctor issues a sick leave at the visit: the number of days off (quick choices or typed) or the first and last
 * day — each follows the other — the reason, and whether to print it (off by default: the certificate then says
 * "for medical reasons").
 */
@Component({
  selector: 'app-sick-leave-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatChipsModule,
    MatDialogModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
  ],
  templateUrl: './sick-leave-dialog.component.html',
})
export class SickLeaveDialog {
  protected readonly data = inject<SickLeaveDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SickLeaveDialog, SickLeave>);
  private readonly api = inject(SickLeaveApi);

  protected readonly text = SICK_LEAVE_DIALOG_TEXT;
  protected readonly maxDays = SICK_LEAVE_MAX_DAYS;
  protected readonly dayChoices = SICK_LEAVE_DAY_CHOICES;

  protected readonly form = new FormGroup({
    days: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(SICK_LEAVE_MAX_DAYS)],
    }),
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

  constructor() {
    const { days, startDate, endDate } = this.form.controls;
    const sync = { emitEvent: false };
    const destroyRef = inject(DestroyRef);
    // Days or first day changed → the last day follows; last day changed → the count follows.
    days.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((n) => endDate.setValue(addDays(startDate.value, Math.max(1, n) - 1), sync));
    startDate.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((d) => endDate.setValue(addDays(d, Math.max(1, days.value) - 1), sync));
    endDate.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((d) => days.setValue(daysBetween(startDate.value, d) + 1, sync));
  }

  protected choose(n: number): void {
    this.form.controls.days.setValue(n);
  }

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
