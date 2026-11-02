import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { CashSession } from '@interfaces/finance/cash-session.interface';
import { CashSessionApi } from '@services/finance/cash-session-api.service';
import { AppValidators } from '@validations/validators';

/** Start a shift: the float (change) put in the drawer. Every cash payment, refund and expense then lands in it. */
@Component({
  selector: 'app-open-drawer-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, MoneyInput],
  templateUrl: './open-drawer-dialog.component.html',
})
export class OpenDrawerDialog {
  protected readonly ref = inject(MatDialogRef<OpenDrawerDialog, CashSession>);
  private readonly api = inject(CashSessionApi);

  protected readonly form = new FormGroup({
    openingFloat: new FormControl<string | null>('0.000', [
      Validators.required,
      AppValidators.money,
    ]),
  });

  protected readonly submit = async (): Promise<CashSession> => {
    const session = await firstValueFrom(
      this.api.open(this.form.getRawValue().openingFloat ?? '0'),
    );
    this.ref.close(session);
    return session;
  };
}
