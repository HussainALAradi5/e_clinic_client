import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ClaimDecisionDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { InsuranceClaim } from '@shared/interfaces/billing/insurance-claim.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { InsuranceClaimApi } from '@shared/services/billing/insurance-claim-api.service';
import { AppValidators } from '@shared/utils/validators';

/**
 * The insurer's answer. Approved (in full or in part) records an insurance payment on the invoice so the patient
 * owes only the rest; rejected leaves the whole balance with the patient.
 */
@Component({
  selector: 'app-claim-decision-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    GenericForm,
    MoneyInput,
    TextField,
    MoneyPipe,
  ],
  templateUrl: './claim-decision-dialog.component.html',
})
export class ClaimDecisionDialog {
  protected readonly data = inject<ClaimDecisionDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ClaimDecisionDialog, InsuranceClaim>);
  private readonly api = inject(InsuranceClaimApi);

  protected readonly claim = this.data.claim;
  protected readonly form = new FormGroup({
    approved: new FormControl(true, { nonNullable: true }),
    approvedAmount: new FormControl<string | null>(this.claim.claimedAmount.amount, [
      AppValidators.money,
      AppValidators.positive,
      AppValidators.maxAmount(() => this.claim.claimedAmount.amount),
      AppValidators.requiredIf((c) => c.parent?.get('approved')?.value === true),
    ]),
    insurerReference: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    rejectionReason: new FormControl<string | null>(null, [
      Validators.maxLength(500),
      AppValidators.requiredIf((c) => c.parent?.get('approved')?.value === false),
    ]),
  });

  constructor() {
    this.form.controls.approved.valueChanges.subscribe(() => {
      this.form.controls.approvedAmount.updateValueAndValidity();
      this.form.controls.rejectionReason.updateValueAndValidity();
    });
  }

  protected readonly submit = async (): Promise<InsuranceClaim> => {
    const v = this.form.getRawValue();
    const decided = await firstValueFrom(
      this.api.decide(this.claim.id, {
        approved: v.approved,
        approvedAmount: v.approved ? v.approvedAmount : null,
        insurerReference: v.insurerReference?.trim() || null,
        rejectionReason: v.approved ? null : v.rejectionReason?.trim() || null,
      }),
    );
    this.ref.close(decided);
    return decided;
  };
}
