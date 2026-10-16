import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CompanyFormDialogData } from '../../interfaces/dialog-data.interface';
import { AddressFields } from '@shared/components/address-fields/address-fields.component';
import { CountrySelect } from '@shared/components/country-select/country-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { CompanyType } from '@shared/enums/reference/company-type.enum';
import { Company, CompanyPayload } from '@shared/interfaces/reference/company.interface';
import { addressForm, toAddressPayload } from '@shared/utils/address';

const optional = (value: string | null | undefined, max: number): FormControl<string | null> =>
  new FormControl(value ?? null, [Validators.maxLength(max)]);

/** Create or edit a company with its address (one transaction on the server). */
@Component({
  selector: 'app-company-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, SelectField, CountrySelect, AddressFields],
  templateUrl: './company-form-dialog.component.html',
})
export class CompanyFormDialog {
  protected readonly data = inject<CompanyFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CompanyFormDialog, Company>);
  private readonly company = this.data.company;

  protected readonly form = new FormGroup({
    type: new FormControl<CompanyType | null>(this.company?.type ?? null, [Validators.required]),
    name: new FormControl(this.company?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    countryCode: new FormControl<string | null>(this.company?.countryCode ?? 'BH', [
      Validators.required,
    ]),
    contactPerson: optional(this.company?.contactPerson, 150),
    phone: optional(this.company?.phone, 20),
    email: new FormControl(this.company?.email ?? null, [
      Validators.email,
      Validators.maxLength(255),
    ]),
    website: optional(this.company?.website, 255),
    vatNumber: optional(this.company?.vatNumber, 30),
    crNumber: optional(this.company?.crNumber, 30),
    description: optional(this.company?.description, 5000),
    address: addressForm(this.company?.address ?? null),
  });

  private saved: Company | undefined;

  protected readonly submit = async (): Promise<Company> => {
    const { address, ...fields } = this.form.controls;
    const payload: Record<string, unknown> = {};
    for (const [key, control] of Object.entries(fields)) {
      if (!this.company || control.dirty) {
        payload[key] =
          typeof control.value === 'string' ? control.value.trim() || null : control.value;
      }
    }
    if (!this.company || address.dirty) {
      payload['address'] = toAddressPayload(address);
    }
    this.saved = await this.data.save(payload as CompanyPayload);
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
