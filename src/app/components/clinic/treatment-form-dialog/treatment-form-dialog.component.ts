import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TreatmentFormDialogData } from '@interfaces/clinic/treatment-form-dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { TreatmentType } from '@enums/clinic/treatment-type.enum';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { Treatment } from '@interfaces/clinic/treatment.interface';
import { TreatmentPayload } from '@interfaces/clinic/treatment-payload.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { AuthStore } from '@services/auth/auth.store';
import { TreatmentApi } from '@services/clinic/treatment-api.service';
import { dirtyPayload } from '@utilities/form-payload';
import { TREATMENT_FORM_DIALOG_TEXT } from '@constants/clinic/treatment-form-dialog.constants';

/**
 * Prescribe a treatment plan (title, type, sessions, priority, diagnosis and plan) or edit an open one. Patient,
 * doctor and priority are set once; priority changes have their own audited dialog.
 */
@Component({
  selector: 'app-treatment-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField, EntitySelect],
  templateUrl: './treatment-form-dialog.component.html',
})
export class TreatmentFormDialog {
  protected readonly text = TREATMENT_FORM_DIALOG_TEXT;

  protected readonly data = inject<TreatmentFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<TreatmentFormDialog, Treatment>);
  private readonly api = inject(TreatmentApi);
  private readonly me = inject(AuthStore).user()?.id ?? null;
  private readonly key = newIdempotencyKey();

  protected readonly editing = this.data.treatment;
  protected readonly form = new FormGroup({
    patientId: new FormControl<string | null>(
      this.editing?.patientId ?? this.data.patient?.id ?? null,
      [Validators.required],
    ),
    doctorId: new FormControl<string | null>(
      this.editing?.doctorId ?? this.data.doctorId ?? this.me,
      [Validators.required],
    ),
    title: new FormControl(this.editing?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    type: new FormControl<TreatmentType>(this.editing?.type ?? TreatmentType.Physiotherapy, {
      nonNullable: true,
    }),
    priority: new FormControl<TreatmentPriority>(
      this.editing?.priority ?? TreatmentPriority.Medium,
      { nonNullable: true },
    ),
    plannedSessions: new FormControl<number>(this.editing?.plannedSessions ?? 6, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    sessionDurationMinutes: new FormControl<number | null>(
      this.editing?.sessionDurationMinutes ?? null,
      [Validators.min(5), Validators.max(480)],
    ),
    billableServiceId: new FormControl<string | null>(this.editing?.billableServiceId ?? null),
    diagnosis: new FormControl<string | null>(this.editing?.diagnosis ?? null, [
      Validators.maxLength(5000),
    ]),
    plan: new FormControl<string | null>(this.editing?.plan ?? null, [Validators.maxLength(5000)]),
  });
  protected readonly patientName = (p: Patient): string => p.fullName;
  protected readonly patientDetail = (p: Patient): string => `${p.code} · ${p.phone}`;
  protected readonly doctorName = (d: Doctor): string => d.displayName;
  protected readonly serviceName = (s: BillableService): string => `${s.code} · ${s.name}`;
  protected readonly procedures: FilterGroup = {
    and: [{ category: { in: ['procedure', 'other'] } }],
  };

  constructor() {
    if (this.editing) {
      this.form.controls.patientId.disable();
      this.form.controls.doctorId.disable();
      this.form.controls.priority.disable();
    }
  }

  protected readonly submit = async (): Promise<Treatment> => {
    let saved: Treatment;
    if (this.editing) {
      const changes = dirtyPayload(this.form, [
        'patientId',
        'doctorId',
        'priority',
      ]) as TreatmentPayload;
      saved = await firstValueFrom(
        this.api.update(this.editing.id, { ...changes, version: this.editing.version }),
      );
    } else {
      const v = this.form.getRawValue();
      saved = await firstValueFrom(
        this.api.prescribe(
          {
            ...v,
            patientId: v.patientId ?? undefined,
            doctorId: v.doctorId ?? undefined,
            appointmentId: this.data.appointmentId ?? null,
            title: v.title.trim(),
          },
          this.key,
        ),
      );
    }
    this.ref.close(saved);
    return saved;
  };
}
