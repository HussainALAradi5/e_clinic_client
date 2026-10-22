import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, startWith } from 'rxjs';
import { ScheduleExceptionDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ErrorCode } from '@shared/enums/api/error-code.enum';
import { ScheduleExceptionType } from '@shared/enums/clinic/schedule-exception-type.enum';
import {
  AffectedBooking,
  ScheduleException,
  ScheduleExceptionPayload,
} from '@shared/interfaces/clinic/schedule.interface';
import { ScheduleApi } from '@shared/services/clinic/schedule-api.service';
import { EnumService } from '@shared/services/data/enum.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';
import { isApiError } from '@shared/utils/guards';

/**
 * Day off / custom hours for a provider, or a clinic holiday. Bookings it would break are listed first; ticking
 * "cancel them" cancels those bookings (patients are told) and saves.
 */
@Component({
  selector: 'app-schedule-exception-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    SelectField,
    TextField,
  ],
  templateUrl: './schedule-exception-dialog.component.html',
})
export class ScheduleExceptionDialog {
  protected readonly data = inject<ScheduleExceptionDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ScheduleExceptionDialog, ScheduleException>);
  private readonly api = inject(ScheduleApi);
  protected readonly clinicWide = this.data.providerId === null;

  protected readonly types = inject(EnumService)
    .options('ScheduleExceptionType')
    .filter((o) =>
      this.clinicWide
        ? o.value === ScheduleExceptionType.Holiday
        : o.value !== ScheduleExceptionType.Holiday,
    );
  protected readonly form = new FormGroup({
    date: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<ScheduleExceptionType>(
      this.clinicWide ? ScheduleExceptionType.Holiday : ScheduleExceptionType.DayOff,
      { nonNullable: true },
    ),
    startTime: new FormControl<string | null>(null),
    endTime: new FormControl<string | null>(null),
    reason: new FormControl<string | null>(null, [Validators.maxLength(255)]),
    cancelAffected: new FormControl(false, { nonNullable: true }),
  });
  protected readonly type = toSignal(
    this.form.controls.type.valueChanges.pipe(startWith(this.form.controls.type.value)),
  );
  protected readonly custom = ScheduleExceptionType.CustomHours;
  protected readonly affected = signal<AffectedBooking[]>([]);
  private saved: ScheduleException | undefined;

  protected readonly submit = async (): Promise<ScheduleException> => {
    const v = this.form.getRawValue();
    const payload: ScheduleExceptionPayload = {
      date: v.date,
      type: v.type,
      startTime: v.type === this.custom ? v.startTime : null,
      endTime: v.type === this.custom ? v.endTime : null,
      reason: v.reason?.trim() || null,
      cancelAffected: v.cancelAffected,
    };
    try {
      this.saved = await firstValueFrom(
        this.clinicWide
          ? this.api.addHoliday(payload)
          : this.api.addException(this.data.providerId as string, payload),
      );
    } catch (error) {
      if (isApiError(error) && error.code === ErrorCode.ScheduleHasAppointments) {
        this.affected.set((error.meta?.['appointments'] as AffectedBooking[] | undefined) ?? []);
      }
      throw error;
    }
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
