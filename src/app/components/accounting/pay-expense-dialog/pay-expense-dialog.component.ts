import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { PayExpenseDialogData } from '@interfaces/accounting/pay-expense-dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Expense } from '@interfaces/finance/expense.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { EnumService } from '@services/data/enum.service';
import { ExpenseApi } from '@services/finance/expense-api.service';
import { AppValidators } from '@validations/validators';
import { PAY_EXPENSE_DIALOG_TEXT } from '@constants/accounting/pay-expense-dialog.constants';

/** Pay an approved expense: cash comes out of the payer's open drawer; other methods need the bank reference. */
@Component({
  selector: 'app-pay-expense-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, SelectField, TextField, MoneyPipe],
  templateUrl: './pay-expense-dialog.component.html',
})
export class PayExpenseDialog {
  protected readonly text = PAY_EXPENSE_DIALOG_TEXT;

  protected readonly data = inject<PayExpenseDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PayExpenseDialog, Expense>);
  private readonly api = inject(ExpenseApi);
  private readonly key = newIdempotencyKey();

  protected readonly expense = this.data.expense;
  protected readonly cash = PaymentMethod.Cash;
  protected readonly methods = inject(EnumService)
    .options('PaymentMethod')
    .filter((o) => o.value !== PaymentMethod.Insurance);
  protected readonly form = new FormGroup({
    method: new FormControl<PaymentMethod>(PaymentMethod.BankTransfer, { nonNullable: true }),
    reference: new FormControl<string | null>(null, [
      Validators.maxLength(100),
      AppValidators.requiredIf((c) => c.parent?.get('method')?.value !== PaymentMethod.Cash),
    ]),
  });

  constructor() {
    this.form.controls.method.valueChanges.subscribe(() =>
      this.form.controls.reference.updateValueAndValidity(),
    );
  }

  protected readonly submit = async (): Promise<Expense> => {
    const v = this.form.getRawValue();
    const paid = await firstValueFrom(
      this.api.pay(this.expense.id, v.method, v.reference?.trim() || null, this.key),
    );
    this.ref.close(paid);
    return paid;
  };
}
