import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { startWith } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ShiftType } from '@shared/enums/hr/shift-type.enum';
import { Shift, ShiftPayload } from '@shared/interfaces/hr/shift.interface';
import { hoursText, minutesOf } from '../../utils/shift-hours';

export interface ShiftFormDialogData {
  shift: Shift | null;
  save: (payload: ShiftPayload) => Promise<Shift>;
}

/**
 * Create or edit a shift. Fixed: start and end. Flexible: the window (earliest in, latest out), the time to arrive
 * by, and the hours due a day — with a live sentence of what it means.
 */
@Component({
  selector: 'app-shift-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
  ],
  templateUrl: './shift-form-dialog.component.html',
})
export class ShiftFormDialog {
  protected readonly data = inject<ShiftFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ShiftFormDialog, Shift>);
  protected readonly shift = this.data.shift;
  protected readonly types = ShiftType;

  protected readonly form = new FormGroup({
    name: new FormControl(this.shift?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    }),
    type: new FormControl<ShiftType>(this.shift?.type ?? ShiftType.Fixed, { nonNullable: true }),
    startTime: new FormControl(this.shift?.startTime ?? '08:00', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endTime: new FormControl(this.shift?.endTime ?? '16:00', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    latestStart: new FormControl(this.shift?.latestStart ?? '10:00', { nonNullable: true }),
    hours: new FormControl<number>((this.shift?.requiredMinutes ?? 480) / 60, {
      nonNullable: true,
      validators: [Validators.min(0.5), Validators.max(16)],
    }),
    notes: new FormControl<string | null>(this.shift?.notes ?? null, [Validators.maxLength(500)]),
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );
  protected readonly flexible = computed(() => this.value().type === ShiftType.Flexible);
  /** "Arrive by 10:00 · 8 h a day, any time between 07:00 and 19:00". */
  protected readonly summary = computed(() => {
    const v = { ...this.form.getRawValue(), ...this.value() };
    return hoursText({
      type: v.type,
      startTime: v.startTime,
      endTime: v.endTime,
      latestStart: v.latestStart,
      requiredMinutes: Math.round((v.hours ?? 0) * 60),
    });
  });

  private saved: Shift | undefined;

  protected readonly submit = async (): Promise<Shift> => {
    const v = this.form.getRawValue();
    if (minutesOf(v.endTime) <= minutesOf(v.startTime)) {
      throw new Error('The end must be after the start.');
    }
    const flexible = v.type === ShiftType.Flexible;
    this.saved = await this.data.save({
      name: v.name.trim(),
      type: v.type,
      startTime: v.startTime,
      endTime: v.endTime,
      latestStart: flexible ? v.latestStart : null,
      requiredMinutes: flexible ? Math.round(v.hours * 60) : null,
      notes: v.notes?.trim() || null,
    });
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
