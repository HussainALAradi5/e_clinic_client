import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ProfileDialogData } from '@interfaces/portal/profile-dialog-data.interface';
import { AddressFields } from '@components/common/address-fields/address-fields.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { Patient } from '@interfaces/clinic/patient.interface';
import { PortalApi } from '@services/portal/portal-api.service';
import { addressForm, toAddressPayload } from '@utilities/address';
import { AppValidators } from '@validations/validators';

/** The patient's own contact details and emergency contact (name, ID and insurance stay with the front desk). */
@Component({
  selector: 'app-profile-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, ReactiveFormsModule, GenericForm, TextField, AddressFields],
  templateUrl: './profile-dialog.component.html',
})
export class ProfileDialog {
  private readonly patient = inject<ProfileDialogData>(MAT_DIALOG_DATA).patient;
  protected readonly ref = inject(MatDialogRef<ProfileDialog, Patient>);
  private readonly api = inject(PortalApi);

  protected readonly form = new FormGroup({
    phone: new FormControl(this.patient.phone, {
      nonNullable: true,
      validators: [Validators.required, AppValidators.phone],
    }),
    email: new FormControl(this.patient.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(255)],
    }),
    address: addressForm(this.patient.person.address ?? null),
    emergencyContactName: new FormControl(this.patient.emergencyContactName, [
      Validators.maxLength(150),
    ]),
    emergencyContactPhone: new FormControl(this.patient.emergencyContactPhone, [
      AppValidators.phone,
    ]),
    emergencyContactRelation: new FormControl(this.patient.emergencyContactRelation, [
      Validators.maxLength(50),
    ]),
  });

  protected readonly submit = async (): Promise<Patient> => {
    const v = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.updateProfile({
        version: this.patient.version,
        personVersion: this.patient.person.version,
        phone: v.phone.trim(),
        email: v.email.trim(),
        address: toAddressPayload(this.form.controls.address),
        emergencyContactName: v.emergencyContactName?.trim() || null,
        emergencyContactPhone: v.emergencyContactPhone?.trim() || null,
        emergencyContactRelation: v.emergencyContactRelation?.trim() || null,
      }),
    );
    this.ref.close(saved);
    return saved;
  };
}
