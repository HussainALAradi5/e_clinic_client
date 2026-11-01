import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BloodGroup } from '@shared/enums/clinic/blood-group.enum';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { AppValidators } from '@shared/utils/validators';

export type PatientForm = FormGroup<{
  bloodGroup: FormControl<BloodGroup | null>;
  allergies: FormControl<string | null>;
  chronicConditions: FormControl<string | null>;
  familyHistory: FormControl<string | null>;
  surgicalHistory: FormControl<string | null>;
  emergencyContactName: FormControl<string | null>;
  emergencyContactPhone: FormControl<string | null>;
  emergencyContactRelation: FormControl<string | null>;
  insuranceCompanyId: FormControl<string | null>;
  insurancePolicyNumber: FormControl<string | null>;
  insuranceExpiryDate: FormControl<string | null>;
  insuranceCoveragePercent: FormControl<string | null>;
  notes: FormControl<string | null>;
}>;

/** Medical, emergency-contact and insurance fields of a patient file (medical ones only with view_medical). */
export function patientForm(patient: Patient | null = null, medical = true): PatientForm {
  const text = (value: string | null | undefined, max: number): FormControl<string | null> =>
    new FormControl(value ?? null, [Validators.maxLength(max)]);
  const form: PatientForm = new FormGroup({
    bloodGroup: new FormControl<BloodGroup | null>(patient?.bloodGroup ?? BloodGroup.Unknown),
    allergies: text(patient?.allergies, 2000),
    chronicConditions: text(patient?.chronicConditions, 2000),
    familyHistory: text(patient?.familyHistory, 2000),
    surgicalHistory: text(patient?.surgicalHistory, 2000),
    emergencyContactName: text(patient?.emergencyContactName, 150),
    emergencyContactPhone: new FormControl(patient?.emergencyContactPhone ?? null, [
      AppValidators.phone,
    ]),
    emergencyContactRelation: text(patient?.emergencyContactRelation, 50),
    insuranceCompanyId: new FormControl<string | null>(patient?.insuranceCompanyId ?? null),
    insurancePolicyNumber: text(patient?.insurancePolicyNumber, 100),
    insuranceExpiryDate: new FormControl<string | null>(patient?.insuranceExpiryDate ?? null),
    insuranceCoveragePercent: new FormControl<string | null>(
      patient?.insuranceCoveragePercent ?? null,
      [Validators.min(0), Validators.max(100)],
    ),
    notes: text(patient?.notes, 5000),
  });
  if (!medical) {
    form.controls.bloodGroup.disable();
    form.controls.allergies.disable();
    form.controls.chronicConditions.disable();
    form.controls.familyHistory.disable();
    form.controls.surgicalHistory.disable();
  }
  return form;
}
