import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, startWith } from 'rxjs';
import { SlotPicker } from '../slot-picker/slot-picker.component';
import { AppointmentDialogData } from '@interfaces/clinic/appointment-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { AppointmentApi } from '@services/clinic/appointment-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';

/** Move a booking to another free time with the same doctor: a new linked booking; the old one becomes rescheduled. */
@Component({
  selector: 'app-reschedule-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, TextField, SlotPicker, AppButton],
  templateUrl: './reschedule-dialog.component.html',
})
export class RescheduleDialog {
  protected readonly data = inject<AppointmentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<RescheduleDialog, Appointment>);
  private readonly api = inject(AppointmentApi);

  protected readonly dateControl = new FormControl(
    this.data.appointment.scheduledDate < clinicIsoDate()
      ? clinicIsoDate()
      : this.data.appointment.scheduledDate,
    { nonNullable: true },
  );
  protected readonly date = toSignal(
    this.dateControl.valueChanges.pipe(startWith(this.dateControl.value)),
    { initialValue: this.dateControl.value },
  );
  protected readonly start = signal<string | null>(null);

  protected readonly move = async (): Promise<Appointment> => {
    const moved = await firstValueFrom(
      this.api.reschedule(this.data.appointment.id, {
        scheduledDate: this.date(),
        startTime: this.start() as string,
      }),
    );
    this.ref.close(moved);
    return moved;
  };
}
