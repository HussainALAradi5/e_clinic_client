import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DoctorFormDialogData } from '../../interfaces/dialog-data.interface';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ServiceCategory } from '@shared/enums/billing/service-category.enum';
import { RoomType } from '@shared/enums/clinic/room-type.enum';
import { EmployeeStatus } from '@shared/enums/hr/employee-status.enum';
import { BillableService } from '@shared/interfaces/billing/billable-service.interface';
import { Doctor, DoctorPayload, Specialty } from '@shared/interfaces/clinic/doctor.interface';
import { Room } from '@shared/interfaces/clinic/room.interface';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { DoctorApi } from '@shared/services/clinic/doctor-api.service';
import { dirtyPayload } from '@shared/utils/form-payload';
import { formatMoney } from '@shared/utils/money';

/**
 * Doctor profile: pick an active employee (their id becomes the doctor id), specialty, licence, the price-list
 * items billed for consultations and follow-ups, slot length and usual room.
 */
@Component({
  selector: 'app-doctor-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, EntitySelect],
  templateUrl: './doctor-form-dialog.component.html',
})
export class DoctorFormDialog {
  protected readonly data = inject<DoctorFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<DoctorFormDialog, Doctor>);
  private readonly api = inject(DoctorApi);
  protected readonly doctor = this.data.doctor;

  protected readonly form = new FormGroup({
    employeeId: new FormControl<string | null>(
      this.doctor?.id ?? null,
      this.doctor ? [] : [Validators.required],
    ),
    specialtyId: new FormControl<string | null>(this.doctor?.specialtyId ?? null, [
      Validators.required,
    ]),
    licenseNumber: new FormControl(this.doctor?.licenseNumber ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    licenseExpiryDate: new FormControl(this.doctor?.licenseExpiryDate ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    title: new FormControl<string | null>(this.doctor?.title ?? null, [Validators.maxLength(50)]),
    consultationServiceId: new FormControl<string | null>(
      this.doctor?.consultationServiceId ?? null,
      [Validators.required],
    ),
    followUpServiceId: new FormControl<string | null>(this.doctor?.followUpServiceId ?? null, [
      Validators.required,
    ]),
    defaultSlotMinutes: new FormControl<number>(this.doctor?.defaultSlotMinutes ?? 15, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(5), Validators.max(240)],
    }),
    maxDailyAppointments: new FormControl<number | null>(
      this.doctor?.maxDailyAppointments ?? null,
      [Validators.min(1)],
    ),
    defaultRoomId: new FormControl<string | null>(this.doctor?.defaultRoomId ?? null),
    bio: new FormControl<string | null>(this.doctor?.bio ?? null, [Validators.maxLength(5000)]),
  });

  protected readonly activeStaff: FilterGroup = {
    and: [{ status: { eq: EmployeeStatus.Active } }],
  };
  protected readonly consultations: FilterGroup = {
    and: [{ category: { eq: ServiceCategory.Consultation } }],
  };
  protected readonly visitRooms: FilterGroup = {
    and: [{ type: { in: [RoomType.Consultation, RoomType.Physical] } }],
  };
  protected readonly employeeName = (e: Employee): string => e.fullName;
  protected readonly employeeDetail = (e: Employee): string =>
    `${e.jobTitle} · ${e.department?.name ?? ''}`;
  protected readonly specialtyName = (s: Specialty): string => s.name;
  protected readonly serviceName = (s: BillableService): string =>
    `${s.name} — ${formatMoney(s.price)}`;
  protected readonly roomName = (r: Room): string => `${r.code} · ${r.name}`;
  private saved: Doctor | undefined;

  protected readonly submit = async (): Promise<Doctor> => {
    const payload = dirtyPayload(
      this.form,
      this.doctor ? ['employeeId'] : [],
      !this.doctor,
    ) as DoctorPayload;
    this.saved = await firstValueFrom(
      this.doctor ? this.api.update(this.doctor.id, payload) : this.api.create(payload),
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
