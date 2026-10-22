import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ServiceFormDialogData } from '../../interfaces/dialog-data.interface';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { AccountType } from '@shared/enums/accounting/account-type.enum';
import { ConsentType } from '@shared/enums/clinic/consent-type.enum';
import { ServiceCategory } from '@shared/enums/billing/service-category.enum';
import { Account } from '@shared/interfaces/accounting/account.interface';
import {
  BillableService,
  BillableServicePayload,
} from '@shared/interfaces/billing/billable-service.interface';
import { Specialty } from '@shared/interfaces/clinic/doctor.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { dirtyPayload } from '@shared/utils/form-payload';

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
