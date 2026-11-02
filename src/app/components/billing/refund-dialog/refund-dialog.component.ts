import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { RefundDialogData } from '@interfaces/billing/dialog-data.interface';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { Refund } from '@interfaces/billing/refund.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { MoneyPipe } from '@pipes/money.pipe';
import { RefundApi } from '@services/billing/refund-api.service';
import { EnumService } from '@services/data/enum.service';
import { AppValidators } from '@validations/validators';

/**
 * Ask for a refund of (part of) a payment. Someone else approves it; then the cashier pays it out (cash from the
 * drawer, or back to the card / account).
 */
@Component({
  selector: 'app-refund-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    GenericForm,
    MoneyInput,
    SelectField,
    TextField,
    MoneyPipe,
    EnumLabelPipe,
  ],
  templateUrl: './refund-dialog.component.html',
})
export class RefundDialog {
  protected readonly data = inject<RefundDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<RefundDialog, Refund>);
  private readonly api = inject(RefundApi);

  protected readonly payment = this.data.payment;
  protected readonly methods = inject(EnumService)
    .options('PaymentMethod')
    .filter((o) => o.value !== PaymentMethod.Insurance);
  protected readonly form = new FormGroup({
    amount: new FormControl<string | null>(this.payment.refundable.amount, [
      Validators.required,
      AppValidators.money,
      AppValidators.positive,
      AppValidators.maxAmount(() => this.payment.refundable.amount),
    ]),
    method: new FormControl<PaymentMethod>(this.payment.method, { nonNullable: true }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });

  protected readonly submit = async (): Promise<Refund> => {
    const v = this.form.getRawValue();
    const refund = await firstValueFrom(
      this.api.request({
        paymentId: this.payment.id,
        amount: v.amount as string,
        method: v.method,
        reason: v.reason.trim(),
      }),
    );
    this.ref.close(refund);
    return refund;
  };
}
