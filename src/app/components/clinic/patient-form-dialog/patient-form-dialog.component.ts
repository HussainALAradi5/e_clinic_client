import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PatientFields } from '../patient-fields/patient-fields.component';
import { PatientFormDialogData } from '@interfaces/clinic/dialog-data.interface';
import { patientForm } from '@utilities/clinic/patient-form';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { Patient, UpdatePatientPayload } from '@interfaces/clinic/patient.interface';
import { AccessService } from '@services/auth/access.service';
import { PatientApi } from '@services/clinic/patient-api.service';
import { dirtyPayload } from '@utilities/form-payload';

/** Edit the patient file (personal data is edited once on the person). Sends changed fields + version. */
@Component({
  selector: 'app-patient-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, PatientFields],
  templateUrl: './patient-form-dialog.component.html',
})
export class PatientFormDialog {
  protected readonly data = inject<PatientFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PatientFormDialog, Patient>);
  private readonly api = inject(PatientApi);
  protected readonly form = patientForm(
    this.data.patient,
    inject(AccessService).can('patients.view_medical'),
  );
  private saved: Patient | undefined;

  protected readonly submit = async (): Promise<Patient> => {
    const payload = {
      ...dirtyPayload(this.form),
      version: this.data.patient.version,
    } as UpdatePatientPayload;
    this.saved = await firstValueFrom(this.api.update(this.data.patient.id, payload));
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
