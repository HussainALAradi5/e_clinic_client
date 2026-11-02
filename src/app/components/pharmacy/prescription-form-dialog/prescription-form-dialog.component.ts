import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { PrescriptionFormDialogData } from '@interfaces/pharmacy/prescription-form-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { ErrorCode } from '@enums/api/error-code.enum';
import { UserType } from '@enums/identity/user-type.enum';
import { MedicationRoute } from '@enums/pharmacy/medication-route.enum';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { Medication } from '@interfaces/pharmacy/medication.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { PrescriptionItem } from '@interfaces/pharmacy/prescription-item.interface';
import { PrescriptionPayload } from '@interfaces/pharmacy/prescription-payload.interface';
import { AuthStore } from '@services/auth/auth.store';
import { PatientApi } from '@services/clinic/patient-api.service';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { addDays, clinicIsoDate } from '@utilities/clinic-time';
import { isApiError } from '@utilities/guards';
import { formatQty } from '@utilities/quantity';
import { AppValidators } from '@validations/validators';
import { ItemGroup } from '@interfaces/pharmacy/prescription-form-dialog.interface';

/**
 * Prescription form: one line per medicine with a structured dosage (dose, how often, route, for how many days) and
 * the total to hand over. The patient's recorded allergies are shown; a duplicate-therapy or allergy warning from the
 * server is confirmed before it is sent again.
 */
@Component({
  selector: 'app-prescription-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    SelectField,
    TextField,
  ],
  templateUrl: './prescription-form-dialog.component.html',
})
export class PrescriptionFormDialog implements OnInit {
  protected readonly data = inject<PrescriptionFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PrescriptionFormDialog, Prescription>);
  private readonly api = inject(PrescriptionApi);
  private readonly patients = inject(PatientApi);
  private readonly dialogs = inject(DialogService);

  protected readonly editing = this.data.prescription;
  protected readonly isDoctor = inject(AuthStore).user()?.userType === UserType.Doctor;
  protected readonly allergies = signal<string | null>(null);
  protected readonly patientName = (p: Patient): string => p.fullName;
  protected readonly patientDetail = (p: Patient): string => `${p.code} · ${p.phone}`;
  protected readonly doctorName = (d: Doctor): string => d.displayName;
  protected readonly medicationName = (m: Medication): string => m.name;
  protected readonly medicationDetail = (m: Medication): string =>
    `${m.code} · ${m.stockOnHand === null ? '' : formatQty(m.stockOnHand) + ' in stock'}${m.isControlled ? ' · controlled' : ''}`;
  protected readonly defaultValidity = addDays(clinicIsoDate(), 30);

  protected readonly items = new FormArray<ItemGroup>(
    this.editing?.items?.length ? this.editing.items.map((i) => this.item(i)) : [this.item(null)],
  );
  protected readonly form = new FormGroup({
    patientId: new FormControl<string | null>(
      this.editing?.patientId ?? this.data.patient?.id ?? null,
      [Validators.required],
    ),
    doctorId: new FormControl<string | null>(this.editing?.doctorId ?? null),
    validUntil: new FormControl<string | null>(this.editing?.validUntil ?? null),
    notes: new FormControl<string | null>(this.editing?.notes ?? null, [
      Validators.maxLength(2000),
    ]),
    items: this.items,
  });

  constructor() {
    this.form.controls.doctorId.addValidators(
      AppValidators.requiredIf(() => !this.isDoctor && !this.editing),
    );
  }

  async ngOnInit(): Promise<void> {
    const id = this.form.controls.patientId.value;
    if (id) {
      const patient = await firstValueFrom(this.patients.get(id)).catch(() => null);
      this.allergies.set(patient?.allergies ?? null);
    }
  }

  protected patientPicked(patient: Patient | null): void {
    this.allergies.set(patient?.allergies ?? null);
  }

  protected add(): void {
    this.items.push(this.item(null));
  }

  protected remove(index: number): void {
    this.items.removeAt(index);
    this.items.markAsDirty();
  }

  protected initial(index: number): Medication | null {
    return (this.editing?.items?.[index]?.medication as unknown as Medication) ?? null;
  }

  protected readonly submit = async (): Promise<Prescription | undefined> => {
    const v = this.form.getRawValue();
    const payload: PrescriptionPayload = {
      patientId: v.patientId as string,
      doctorId: this.isDoctor ? null : v.doctorId,
      appointmentId: this.editing?.appointmentId ?? this.data.appointmentId ?? null,
      treatmentId: this.editing?.treatmentId ?? this.data.treatmentId ?? null,
      validUntil: v.validUntil || null,
      notes: v.notes?.trim() || null,
      items: v.items.map((i) => ({
        medicationId: i.medicationId as string,
        dose: i.dose.trim(),
        frequency: i.frequency.trim(),
        route: i.route,
        durationDays: Number(i.durationDays),
        quantity: String(i.quantity),
        instructions: i.instructions?.trim() || null,
      })),
    };
    const saved = await this.send(payload);
    if (saved) this.ref.close(saved);
    return saved;
  };

  /** Sends; a clinical warning (same medicine already open, recorded allergy) is shown and confirmed, then resent. */
  private async send(payload: PrescriptionPayload): Promise<Prescription | undefined> {
    try {
      return await firstValueFrom(
        this.editing ? this.api.update(this.editing.id, payload) : this.api.create(payload),
      );
    } catch (error) {
      const warning =
        isApiError(error) &&
        [ErrorCode.DuplicateTherapy, ErrorCode.AllergyWarning].includes(error.code as ErrorCode);
      if (!warning) throw error;
      const allergy = error.code === ErrorCode.AllergyWarning;
      const ok = await this.dialogs.confirm({
        title: allergy ? 'Allergy warning' : 'Already prescribed',
        message: error.message,
        confirmLabel: 'Prescribe anyway',
        cancelLabel: 'Review',
        danger: allergy,
      });
      if (!ok) return undefined;
      return this.send({
        ...payload,
        ...(allergy ? { overrideAllergy: true } : { overrideDuplicate: true }),
      });
    }
  }

  private item(item: PrescriptionItem | null): ItemGroup {
    return new FormGroup({
      medicationId: new FormControl<string | null>(item?.medicationId ?? null, [
        Validators.required,
      ]),
      dose: new FormControl(item?.dose ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      frequency: new FormControl(item?.frequency ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      route: new FormControl<MedicationRoute>(item?.route ?? MedicationRoute.Oral, {
        nonNullable: true,
      }),
      durationDays: new FormControl(item?.durationDays ?? 7, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(365)],
      }),
      quantity: new FormControl<string | null>(item ? formatQty(item.quantity) : null, [
        Validators.required,
        AppValidators.quantity,
        AppValidators.positive,
      ]),
      instructions: new FormControl<string | null>(item?.instructions ?? null, [
        Validators.maxLength(255),
      ]),
    });
  }
}
