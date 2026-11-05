import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CompanyFormDialogData } from '@interfaces/reference/dialog-data.interface';
import { AddressFields } from '@components/common/address-fields/address-fields.component';
import { CountrySelect } from '@components/common/country-select/country-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CompanyType } from '@enums/reference/company-type.enum';
import { Company } from '@interfaces/reference/company.interface';
import { CompanyPayload } from '@interfaces/reference/company-payload.interface';
import { addressForm, toAddressPayload } from '@utilities/address';
import { COMPANY_FORM_DIALOG_TEXT } from '@constants/reference/company-form-dialog.constants';

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
  protected readonly text = COMPANY_FORM_DIALOG_TEXT;

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
