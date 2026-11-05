import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ExpenseFormDialogData } from '@interfaces/accounting/expense-form-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { AccountType } from '@enums/accounting/account-type.enum';
import { ExpenseCategory } from '@enums/finance/expense-category.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { Expense } from '@interfaces/finance/expense.interface';
import { Department } from '@interfaces/hr/department.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { Company } from '@interfaces/reference/company.interface';
import { ExpenseApi } from '@services/finance/expense-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { AppValidators } from '@validations/validators';
import { EXPENSE_FORM_DIALOG_TEXT } from '@constants/accounting/expense-form-dialog.constants';

/**
 * Expense form: who is paid (a company from the list or a name), what for, how much (VAT included) and when.
 * The expense account follows the category unless chosen; the vendor invoice scan is added on the expense page.
 */
@Component({
  selector: 'app-expense-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    MoneyInput,
    SelectField,
    TextField,
  ],
  templateUrl: './expense-form-dialog.component.html',
})
export class ExpenseFormDialog {
  protected readonly text = EXPENSE_FORM_DIALOG_TEXT;

  protected readonly data = inject<ExpenseFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ExpenseFormDialog, Expense>);
  private readonly api = inject(ExpenseApi);

  protected readonly expense = this.data.expense;
  protected readonly payeeKind = signal<'company' | 'name'>(
    this.expense && !this.expense.payeeCompanyId ? 'name' : 'company',
  );
  protected readonly expenseAccounts: FilterGroup = {
    and: [{ type: { eq: AccountType.Expense } }, { isGroup: { eq: false } }],
  };
  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;
  protected readonly companyName = (c: Company): string => c.name;
  protected readonly departmentName = (d: Department): string => d.name;

  protected readonly form = new FormGroup({
    category: new FormControl<ExpenseCategory>(this.expense?.category ?? ExpenseCategory.Other, {
      nonNullable: true,
    }),
    payeeCompanyId: new FormControl<string | null>(this.expense?.payeeCompanyId ?? null),
    payee: new FormControl<string | null>(this.expense?.payee ?? null, [Validators.maxLength(150)]),
    description: new FormControl(this.expense?.description ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    amount: new FormControl<string | null>(this.expense?.amount.amount ?? null, [
      Validators.required,
      AppValidators.money,
      AppValidators.positive,
    ]),
    taxAmount: new FormControl<string | null>(this.expense?.taxAmount.amount ?? null, [
      AppValidators.money,
    ]),
    expenseDate: new FormControl(this.expense?.expenseDate ?? clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    vendorInvoiceNumber: new FormControl<string | null>(this.expense?.vendorInvoiceNumber ?? null, [
      Validators.maxLength(100),
    ]),
    expenseAccountId: new FormControl<string | null>(this.expense?.expenseAccountId ?? null),
    departmentId: new FormControl<string | null>(this.expense?.departmentId ?? null),
  });

  constructor() {
    this.form.controls.payeeCompanyId.addValidators(
      AppValidators.requiredIf(() => this.payeeKind() === 'company'),
    );
    this.form.controls.payee.addValidators(
      AppValidators.requiredIf(() => this.payeeKind() === 'name'),
    );
  }

  protected setPayeeKind(kind: 'company' | 'name'): void {
    this.payeeKind.set(kind);
    this.form.controls.payeeCompanyId.updateValueAndValidity();
    this.form.controls.payee.updateValueAndValidity();
  }

  protected readonly submit = async (): Promise<Expense> => {
    const v = this.form.getRawValue();
    const byCompany = this.payeeKind() === 'company';
    const payload = {
      category: v.category,
      payeeCompanyId: byCompany ? v.payeeCompanyId : null,
      payee: byCompany ? null : v.payee?.trim() || null,
      description: v.description.trim(),
      amount: v.amount as string,
      taxAmount: v.taxAmount || '0',
      expenseDate: v.expenseDate,
      vendorInvoiceNumber: v.vendorInvoiceNumber?.trim() || null,
      expenseAccountId: v.expenseAccountId,
      departmentId: v.departmentId,
    };
    const saved = await firstValueFrom(
      this.expense
        ? this.api.update(this.expense.id, { ...payload, version: this.expense.version })
        : this.api.create(payload),
    );
    this.ref.close(saved);
    return saved;
  };
}
