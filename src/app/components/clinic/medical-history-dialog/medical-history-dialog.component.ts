import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PatientFormDialogData } from '@interfaces/clinic/dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { MedicalHistoryPayload, Patient } from '@interfaces/clinic/patient.interface';
import { PatientApi } from '@services/clinic/patient-api.service';
import { dirtyPayload } from '@utilities/form-payload';

/**
 * The care team's medical history of a patient: allergies, chronic conditions, family and surgical history
 * (clinicians who may write records; the rest of the file stays with the front desk). Sends changed fields + version.
 */
@Component({
  selector: 'app-medical-history-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField],
  templateUrl: './medical-history-dialog.component.html',
})
export class MedicalHistoryDialog {
  protected readonly data = inject<PatientFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<MedicalHistoryDialog, Patient>);
  private readonly api = inject(PatientApi);
  private saved: Patient | undefined;

  protected readonly form = new FormGroup({
    allergies: this.text(this.data.patient.allergies),
    chronicConditions: this.text(this.data.patient.chronicConditions),
    familyHistory: this.text(this.data.patient.familyHistory),
    surgicalHistory: this.text(this.data.patient.surgicalHistory),
  });

  protected readonly submit = async (): Promise<Patient> => {
    const payload = {
      ...dirtyPayload(this.form),
      version: this.data.patient.version,
    } as MedicalHistoryPayload;
    this.saved = await firstValueFrom(this.api.medicalHistory(this.data.patient.id, payload));
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }

  private text(value: string | null | undefined): FormControl<string | null> {
    return new FormControl(value ?? null, [Validators.maxLength(2000)]);
  }
}
