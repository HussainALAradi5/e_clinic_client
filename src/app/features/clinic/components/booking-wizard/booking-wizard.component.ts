import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom, map, startWith } from 'rxjs';
import { SlotPicker } from '../slot-picker/slot-picker.component';
import { BookingWizardData } from '../../interfaces/dialog-data.interface';
import {
  PatientRegisterDialog,
  RegisterResult,
} from '../patient-register-dialog/patient-register-dialog.component';
import { newIdempotencyKey } from '@core/interceptors/http-context';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { AppointmentSource } from '@shared/enums/clinic/appointment-source.enum';
import { AppointmentType } from '@shared/enums/clinic/appointment-type.enum';
import { RoomType } from '@shared/enums/clinic/room-type.enum';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Doctor } from '@shared/interfaces/clinic/doctor.interface';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { Room } from '@shared/interfaces/clinic/room.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { AccessService } from '@shared/services/auth/access.service';
import { AppointmentApi } from '@shared/services/clinic/appointment-api.service';
import { PatientApi } from '@shared/services/clinic/patient-api.service';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/**
 * Booking wizard: 1 patient (search or quick-register) → 2 visit type, doctor, room → 3 date and a free slot.
 * One Idempotency-Key per wizard, so a double click or a retry never books twice.
 */
@Component({
  selector: 'app-booking-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    AppButton,
    EntitySelect,
    SelectField,
    TextField,
    SlotPicker,
  ],
  templateUrl: './booking-wizard.component.html',
})
export class BookingWizard {
  protected readonly data = inject<BookingWizardData | null>(MAT_DIALOG_DATA) ?? {};
  protected readonly ref = inject(MatDialogRef<BookingWizard, Appointment>);
  private readonly api = inject(AppointmentApi);
  private readonly patients = inject(PatientApi);
  private readonly dialogs = inject(DialogService);
  private readonly enums = inject(EnumService);
  protected readonly canRegister = inject(AccessService).can('patients.create');

  private readonly key = newIdempotencyKey();
  protected readonly variants = ButtonVariant;
  protected readonly today = clinicIsoDate();
  protected readonly patient = signal<Patient | null>(this.data.patient ?? null);
  protected readonly doctor = signal<Doctor | null>(this.data.doctor ?? null);
  protected readonly start = signal<string | null>(this.data.startTime ?? null);

  protected readonly who = new FormGroup({
    patientId: new FormControl<string | null>(this.data.patient?.id ?? null, [Validators.required]),
  });
  protected readonly what = new FormGroup({
    type: new FormControl<AppointmentType>(AppointmentType.Consultation, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    providerId: new FormControl<string | null>(this.data.doctor?.id ?? null, [Validators.required]),
    roomId: new FormControl<string | null>(this.data.doctor?.defaultRoomId ?? null),
    source: new FormControl<AppointmentSource>(AppointmentSource.Phone, { nonNullable: true }),
  });
  protected readonly when = new FormGroup({
    date: new FormControl(this.data.date ?? this.today, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reason: new FormControl<string | null>(null, [Validators.maxLength(500)]),
  });

  /** Treatment sessions are booked from their treatment plan. */
  protected readonly types = this.enums
    .options('AppointmentType')
    .filter((o) => o.value !== AppointmentType.TreatmentSession);
  protected readonly sources = this.enums
    .options('AppointmentSource')
    .filter((o) => o.value !== AppointmentSource.Portal);
  protected readonly visitRooms: FilterGroup = {
    and: [
      { type: { in: [RoomType.Consultation, RoomType.Physical] } },
      { isInService: { eq: true } },
    ],
  };
  protected readonly bookable: FilterGroup = { and: [{ isAcceptingPatients: { eq: true } }] };

  protected readonly date = toSignal(
    this.when.controls.date.valueChanges.pipe(startWith(this.when.controls.date.value)),
    { initialValue: this.when.controls.date.value },
  );
  protected readonly type = toSignal(
    this.what.controls.type.valueChanges.pipe(startWith(this.what.controls.type.value)),
    { initialValue: this.what.controls.type.value },
  );
  protected readonly providerId = toSignal(
    this.what.controls.providerId.valueChanges.pipe(startWith(this.what.controls.providerId.value)),
    { initialValue: this.what.controls.providerId.value },
  );
  protected readonly roomId = toSignal(
    this.what.controls.roomId.valueChanges.pipe(
      startWith(this.what.controls.roomId.value),
      map((v) => v ?? null),
    ),
    { initialValue: this.what.controls.roomId.value },
  );

  protected readonly summary = computed(() => {
    const parts = [
      this.patient()?.fullName,
      this.doctor()?.displayName,
      this.date(),
      this.start(),
    ].filter(Boolean);
    return parts.join(' · ');
  });

  protected readonly patientName = (p: Patient): string => p.fullName;
  protected readonly patientDetail = (p: Patient): string => `${p.code} · ${p.phone} · ${p.age} y`;
  protected readonly doctorName = (d: Doctor): string => d.displayName;
  protected readonly doctorDetail = (d: Doctor): string =>
    [
      d.specialty?.name,
      d.consultationService
        ? `${d.consultationService.price.currency} ${d.consultationService.price.amount}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');
  protected readonly roomName = (r: Room): string => `${r.code} · ${r.name}`;

  protected pickDoctor(doctor: Doctor | null): void {
    this.doctor.set(doctor);
    if (doctor?.defaultRoom) {
      this.what.controls.roomId.setValue(doctor.defaultRoomId);
    }
  }

  protected readonly register = async (): Promise<void> => {
    const result = await this.dialogs.open<PatientRegisterDialog, null, RegisterResult>(
      PatientRegisterDialog,
      null,
      { width: '760px' },
    );
    if (!result) return;
    const patient =
      'patient' in result
        ? result.patient
        : await firstValueFrom(this.patients.get(result.existingId));
    this.patient.set(patient);
    this.who.controls.patientId.setValue(patient.id);
  };

  protected readonly book = async (): Promise<Appointment> => {
    const what = this.what.getRawValue();
    const when = this.when.getRawValue();
    const appointment = await firstValueFrom(
      this.api.book(
        {
          patientId: this.who.controls.patientId.value as string,
          providerId: what.providerId as string,
          type: what.type,
          scheduledDate: when.date,
          startTime: this.start() as string,
          source: what.source,
          roomId: what.roomId,
          reason: when.reason?.trim() || null,
        },
        this.key,
      ),
    );
    this.ref.close(appointment);
    return appointment;
  };
}
