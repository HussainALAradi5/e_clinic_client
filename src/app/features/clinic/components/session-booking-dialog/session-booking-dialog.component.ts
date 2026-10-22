import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, map, startWith } from 'rxjs';
import { SlotPicker } from '../slot-picker/slot-picker.component';
import { TreatmentDialogData } from '../../interfaces/dialog-data.interface';
import { newIdempotencyKey } from '@core/interceptors/http-context';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ErrorCode } from '@shared/enums/api/error-code.enum';
import { AppointmentType } from '@shared/enums/clinic/appointment-type.enum';
import { RoomType } from '@shared/enums/clinic/room-type.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Room } from '@shared/interfaces/clinic/room.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { TreatmentApi } from '@shared/services/clinic/treatment-api.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';
import { isApiError } from '@shared/utils/guards';

/**
 * Book the next session of a plan: therapist / doctor, day, room and a free time. The session takes the plan's
 * length; an urgent plan's first session later than its deadline needs the override right.
 */
@Component({
  selector: 'app-session-booking-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    SelectField,
    TextField,
    EntitySelect,
    SlotPicker,
    AppButton,
  ],
  templateUrl: './session-booking-dialog.component.html',
})
export class SessionBookingDialog {
  protected readonly data = inject<TreatmentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SessionBookingDialog, Appointment>);
  private readonly api = inject(TreatmentApi);
  protected readonly canOverride = inject(AccessService).can('treatments.override_priority');
  private readonly key = newIdempotencyKey();

  protected readonly type = AppointmentType.TreatmentSession;
  protected readonly providers = toSignal(
    this.api
      .providers(AppointmentType.TreatmentSession)
      .pipe(
        map((list) => list.map((p) => ({ value: p.id, label: `${p.fullName} · ${p.jobTitle}` }))),
      ),
    { initialValue: [] },
  );
  protected readonly form = new FormGroup({
    providerId: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    roomId: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null, [Validators.maxLength(2000)]),
    override: new FormControl(false, { nonNullable: true }),
  });
  protected readonly start = signal<string | null>(null);
  protected readonly deadlineMissed = signal(false);
  protected readonly providerId = this.value('providerId');
  protected readonly date = this.value('date');
  protected readonly roomId = this.value('roomId');
  protected readonly sessionRooms: FilterGroup = {
    and: [
      { type: { in: [RoomType.SessionRoom, RoomType.TreatmentRoom, RoomType.Physical] } },
      { isInService: { eq: true } },
    ],
  };
  protected readonly roomName = (r: Room): string => `${r.code} · ${r.name}`;
  protected readonly summary = computed(() => {
    const t = this.data.treatment;
    const next = (t.progress?.attendedSessions ?? 0) + (t.progress?.upcomingSessions ?? 0) + 1;
    return `Session ${Math.min(next, t.plannedSessions)} of ${t.plannedSessions} · ${t.sessionDurationMinutes} min`;
  });

  protected readonly book = async (): Promise<void> => {
    const v = this.form.getRawValue();
    try {
      const booked = await firstValueFrom(
        this.api.bookSession(
          this.data.treatment.id,
          {
            providerId: v.providerId as string,
            scheduledDate: v.date,
            startTime: this.start() as string,
            roomId: v.roomId,
            notes: v.notes,
            overridePriorityDeadline: v.override,
          },
          this.key,
        ),
      );
      this.ref.close(booked);
    } catch (error) {
      if (isApiError(error) && error.code === ErrorCode.PriorityDeadlineMissed)
        this.deadlineMissed.set(true);
      throw error;
    }
  };

  private value<K extends 'providerId' | 'date' | 'roomId'>(key: K) {
    const control = this.form.controls[key] as FormControl<string | null>;
    return toSignal(control.valueChanges.pipe(startWith(control.value)), {
      initialValue: control.value,
    });
  }
}
