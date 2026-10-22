import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MedicationFormDialogData } from '../../interfaces/dialog-data.interface';
import { CountrySelect } from '@shared/components/country-select/country-select.component';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { DispenseUnit } from '@shared/enums/pharmacy/dispense-unit.enum';
import { MedicationForm } from '@shared/enums/pharmacy/medication-form.enum';
import { CompanyType } from '@shared/enums/reference/company-type.enum';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { Medication, MedicationPayload } from '@shared/interfaces/pharmacy/medication.interface';
import { Company } from '@shared/interfaces/reference/company.interface';
import { MedicationApi } from '@shared/services/pharmacy/medication-api.service';
import { AppValidators } from '@shared/utils/validators';

/**
 * Medication card: names, form and strength, the unit it is counted in, its barcode and maker, the price (kept on its
 * price-list line) and the pharmacy rules — prescription only, controlled, reorder level.
 */
@Component({
  selector: 'app-medication-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    CountrySelect,
    MoneyInput,
    SelectField,
    TextField,
  ],
  templateUrl: './medication-form-dialog.component.html',
})
export class MedicationFormDialog {
  protected readonly data = inject<MedicationFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<MedicationFormDialog, Medication>);
  private readonly api = inject(MedicationApi);

  protected readonly medication = this.data.medication;
  protected readonly manufacturers: FilterGroup = {
    and: [{ type: { eq: CompanyType.Manufacturer } }],
  };
  protected readonly companyName = (c: Company): string => c.name;

  protected readonly form = new FormGroup({
    code: new FormControl(this.medication?.code ?? 'MED-', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(30),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    genericName: new FormControl(this.medication?.genericName ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    brandName: new FormControl<string | null>(this.medication?.brandName ?? null, [
      Validators.maxLength(150),
    ]),
    nameAr: new FormControl<string | null>(this.medication?.nameAr ?? null, [
      Validators.maxLength(150),
    ]),
    form: new FormControl<MedicationForm>(this.medication?.form ?? MedicationForm.Tablet, {
      nonNullable: true,
    }),
    strength: new FormControl(this.medication?.strength ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    unit: new FormControl<DispenseUnit>(this.medication?.unit ?? DispenseUnit.Tablet, {
      nonNullable: true,
    }),
    gtin: new FormControl<string | null>(this.medication?.gtin ?? null, [
      Validators.pattern(/^\d{8,14}$/),
    ]),
    manufacturerId: new FormControl<string | null>(this.medication?.manufacturerId ?? null),
    originCountryCode: new FormControl<string | null>(this.medication?.originCountryCode ?? null),
    price: new FormControl<string | null>(this.medication?.price?.amount ?? null, [
      Validators.required,
      AppValidators.money,
    ]),
    taxRate: new FormControl(this.medication?.taxRate ?? '0', {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    requiresPrescription: new FormControl(this.medication?.requiresPrescription ?? true, {
      nonNullable: true,
    }),
    isControlled: new FormControl(this.medication?.isControlled ?? false, { nonNullable: true }),
    reorderLevel: new FormControl(this.medication?.reorderLevel ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    storageNotes: new FormControl<string | null>(this.medication?.storageNotes ?? null, [
      Validators.maxLength(255),
    ]),
    description: new FormControl<string | null>(this.medication?.description ?? null),
  });

  protected readonly submit = async (): Promise<Medication> => {
    const v = this.form.getRawValue();
    const text = (value: string | null): string | null => value?.trim() || null;
    const payload: MedicationPayload = {
      code: v.code.trim().toUpperCase(),
      genericName: v.genericName.trim(),
      brandName: text(v.brandName),
      nameAr: text(v.nameAr),
      form: v.form,
      strength: v.strength.trim(),
      unit: v.unit,
      gtin: text(v.gtin),
      manufacturerId: v.manufacturerId,
      originCountryCode: v.originCountryCode,
      description: text(v.description),
      price: v.price as string,
      taxRate: String(v.taxRate),
      // A controlled drug is always prescription only.
      requiresPrescription: v.requiresPrescription || v.isControlled,
      isControlled: v.isControlled,
      reorderLevel: Number(v.reorderLevel),
      storageNotes: text(v.storageNotes),
    };
    const saved = await firstValueFrom(
      this.medication ? this.api.update(this.medication.id, payload) : this.api.create(payload),
    );
    this.ref.close(saved);
    return saved;
  };
}
