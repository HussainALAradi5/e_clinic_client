import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import {
  WALLET_DIRECTIONS,
  WALLET_METHODS,
  WALLET_MOVEMENT_TEXT,
  WALLET_REASON_MIN,
  WALLET_TEXT,
} from '@constants/billing/wallet.constants';
import { WalletMovement } from '@enums/billing/wallet-movement.enum';
import { PaymentMethod } from '@enums/shared/payment-method.enum';
import { WalletDialogData } from '@interfaces/billing/wallet-dialog-data.interface';
import { WalletEntry } from '@interfaces/billing/wallet-entry.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { MoneyPipe } from '@pipes/money.pipe';
import { WalletApi } from '@services/billing/wallet-api.service';
import { AppValidators } from '@validations/validators';

/**
 * Deposit, pay-back or adjustment of a patient's balance. Pay-backs and adjustments need a reason; a bank
 * transfer needs its reference. The server applies the limits and roles; the form only mirrors them.
 */
@Component({
  selector: 'app-wallet-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, MoneyInput, SelectField, TextField, MoneyPipe],
  templateUrl: './wallet-dialog.component.html',
})
export class WalletDialog {
  protected readonly data = inject<WalletDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<WalletDialog, WalletEntry>);
  private readonly api = inject(WalletApi);
  private readonly key = newIdempotencyKey();

  protected readonly text = WALLET_TEXT;
  protected readonly labels = WALLET_MOVEMENT_TEXT[this.data.movement];
  protected readonly methods = WALLET_METHODS[this.data.movement];
  protected readonly directions = WALLET_DIRECTIONS;
  protected readonly adjusting = this.data.movement === WalletMovement.Adjust;
  protected readonly needsReason = this.data.movement !== WalletMovement.Deposit;

  protected readonly form = new FormGroup({
    amount: new FormControl<string | null>(null, [
      Validators.required,
      AppValidators.money,
      AppValidators.positive,
      ...(this.data.movement === WalletMovement.Payback
        ? [AppValidators.maxAmount(() => this.data.balance.amount)]
        : []),
    ]),
    method: new FormControl<PaymentMethod | null>(this.methods[0]?.value ?? null, [
      AppValidators.requiredIf(() => !this.adjusting),
    ]),
    direction: new FormControl<'credit' | 'debit'>('credit', { nonNullable: true }),
    reference: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(100),
        AppValidators.requiredIf(
          (c) => c.parent?.get('method')?.value === PaymentMethod.BankTransfer,
        ),
      ],
    }),
    reason: new FormControl('', {
      nonNullable: true,
      validators: this.needsReason
        ? [Validators.required, Validators.minLength(WALLET_REASON_MIN), Validators.maxLength(500)]
        : [Validators.maxLength(500)],
    }),
  });

  protected readonly method = toSignal(this.form.controls.method.valueChanges, {
    initialValue: this.form.controls.method.value,
  });
  protected readonly transfer = PaymentMethod.BankTransfer;

  constructor() {
    this.form.controls.method.valueChanges.subscribe(() =>
      this.form.controls.reference.updateValueAndValidity(),
    );
  }

  protected readonly submit = async (): Promise<WalletEntry> => {
    const v = this.form.getRawValue();
    const entry = await firstValueFrom(
      this.api.move(
        this.data.patient.id,
        this.data.movement,
        {
          amount: v.amount as string,
          ...(this.adjusting ? { direction: v.direction } : { method: v.method as PaymentMethod }),
          referenceNumber: v.reference.trim() || null,
          reason: v.reason.trim() || null,
        },
        this.key,
      ),
    );
    this.ref.close(entry);
    return entry;
  };
}
