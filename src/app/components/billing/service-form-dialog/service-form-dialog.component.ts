import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ServiceFormDialogData } from '@interfaces/billing/dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { AccountType } from '@enums/accounting/account-type.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { ServiceCategory } from '@enums/billing/service-category.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { BillableServicePayload } from '@interfaces/billing/billable-service-payload.interface';
import { Specialty } from '@interfaces/clinic/specialty.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { dirtyPayload } from '@utilities/form-payload';
import { SERVICE_FORM_DIALOG_TEXT } from '@constants/billing/service-form-dialog.constants';

/** Create or edit a price-list item; a new price applies to new charges only. */
@Component({
  selector: 'app-service-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
    SelectField,
    MoneyInput,
    EntitySelect,
  ],
  templateUrl: './service-form-dialog.component.html',
})
export class ServiceFormDialog {
  protected readonly text = SERVICE_FORM_DIALOG_TEXT;

  protected readonly data = inject<ServiceFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ServiceFormDialog, BillableService>);
  protected readonly service = this.data.service;

  protected readonly form = new FormGroup({
    code: new FormControl(this.service?.code ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(30),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    name: new FormControl(this.service?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    category: new FormControl<ServiceCategory | null>(this.service?.category ?? null, [
      Validators.required,
    ]),
    price: new FormControl<string | null>(this.service?.price.amount ?? null, [
      Validators.required,
    ]),
    taxRate: new FormControl(this.service?.taxRate ?? '0', {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    revenueAccountId: new FormControl<string | null>(this.service?.revenueAccountId ?? null, [
      Validators.required,
    ]),
    specialtyId: new FormControl<string | null>(this.service?.specialtyId ?? null),
    isInsurable: new FormControl(this.service?.isInsurable ?? true, { nonNullable: true }),
    consentType: new FormControl<ConsentType | null>(this.service?.consentType ?? null),
  });

  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;
  protected readonly specialtyName = (s: Specialty): string => s.name;
  protected readonly revenueAccounts: FilterGroup = {
    and: [{ type: { eq: AccountType.Revenue } }, { isGroup: { eq: false } }],
  };

  private saved: BillableService | undefined;

  protected readonly submit = async (): Promise<BillableService> => {
    this.saved = await this.data.save(
      dirtyPayload(this.form, [], !this.service) as BillableServicePayload,
    );
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
