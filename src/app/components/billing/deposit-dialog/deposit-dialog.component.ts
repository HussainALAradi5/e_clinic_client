import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { DepositDialogData } from '@interfaces/billing/dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CashSession } from '@interfaces/finance/cash-session.interface';
import { CashSessionApi } from '@services/finance/cash-session-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { AppValidators } from '@validations/validators';

/** Bank deposit of a closed drawer's cash (posts bank / cash on hand). */
@Component({
  selector: 'app-deposit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, MoneyInput, TextField],
  templateUrl: './deposit-dialog.component.html',
})
export class DepositDialog {
  protected readonly data = inject<DepositDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<DepositDialog, CashSession>);
  private readonly api = inject(CashSessionApi);
  private readonly key = newIdempotencyKey();

  protected readonly session = this.data.session;
  protected readonly form = new FormGroup({
    date: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    amount: new FormControl<string | null>(this.session.countedClosing?.amount ?? null, [
      Validators.required,
      AppValidators.money,
      AppValidators.positive,
      AppValidators.maxAmount(() => this.session.countedClosing?.amount),
    ]),
  });

  protected readonly submit = async (): Promise<CashSession> => {
    const v = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.deposit(
        this.session.id,
        { date: v.date, reference: v.reference.trim(), amount: v.amount as string },
        this.key,
      ),
    );
    this.ref.close(saved);
    return saved;
  };
}
