import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { PatientLookup } from '@shared/interfaces/clinic/patient.interface';
import { PatientApi } from '@shared/services/clinic/patient-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicTime } from '@shared/utils/clinic-time';

/**
 * Break the glass: find a patient outside your care by file number or national ID, confirm it is the right person,
 * give the reason, and the file opens for a few hours. Every use is in the audit trail and the admins are told.
 * Closes with the patient id to open.
 */
@Component({
  selector: 'app-emergency-access-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIconModule, GenericForm, TextField, AppButton, StatusChip],
  templateUrl: './emergency-access-dialog.component.html',
})
export class EmergencyAccessDialog {
  protected readonly ref = inject(MatDialogRef<EmergencyAccessDialog, string>);
  private readonly api = inject(PatientApi);
  private readonly notify = inject(NotifyService);
  protected readonly variants = ButtonVariant;

  protected readonly found = signal<PatientLookup | null>(null);
  protected readonly searched = signal(false);
  protected readonly find = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly form = new FormGroup({
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    }),
  });

  protected readonly lookup = async (): Promise<void> => {
    const value = this.find.value.trim();
    if (!value) return;
    // A file number looks like PRS-000123; anything else is taken as a national ID.
    const query = /^prs-/i.test(value) ? { code: value } : { nationalId: value };
    this.found.set(await firstValueFrom(this.api.lookup(query)));
    this.searched.set(true);
  };

  /** Already in care: just open the file. */
  protected readonly openInCare = async (): Promise<void> => {
    this.ref.close(this.found()!.id);
  };

  protected readonly breakGlass = async (): Promise<string> => {
    const patient = this.found()!;
    const result = await firstValueFrom(
      this.api.emergencyAccess(patient.id, this.form.controls.reason.value),
    );
    this.notify.info(
      `Emergency access to ${patient.fullName} until ${clinicTime(new Date(result.expiresAt))} — it is recorded.`,
    );
    this.ref.close(patient.id);
    return patient.id;
  };
}
