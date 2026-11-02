import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { CompanyType } from '@enums/reference/company-type.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { InsuranceClaim } from '@interfaces/billing/insurance-claim.interface';
import { FilterGroup } from '@interfaces/list/list-query.interface';
import { Company } from '@interfaces/reference/company.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InsuranceClaimApi } from '@services/billing/insurance-claim-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { defaultQuery } from '@utilities/list-query';
import { fromMinor, toMinor } from '@utilities/money';

/**
 * An insurer's bank transfer: pick the insurer, tick the approved claims it pays (the total must match the
 * transfer), and record it — it clears the insurance receivable into the bank.
 */
@Component({
  selector: 'app-remittance-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    TextField,
    MoneyPipe,
  ],
  templateUrl: './remittance-dialog.component.html',
})
export class RemittanceDialog {
  protected readonly ref = inject(MatDialogRef<RemittanceDialog, InsuranceClaim[]>);
  private readonly api = inject(InsuranceClaimApi);
  private readonly key = newIdempotencyKey();

  protected readonly insurers: FilterGroup = { and: [{ type: { eq: CompanyType.Insurer } }] };
  protected readonly insurerName = (c: Company): string => c.name;
  protected readonly claims = signal<InsuranceClaim[] | null>(null);
  protected readonly picked = signal<Set<string>>(new Set());
  protected readonly total = computed(() =>
    fromMinor(
      (this.claims() ?? [])
        .filter((c) => this.picked().has(c.id))
        .reduce((sum, c) => sum + (toMinor(c.approvedAmount?.amount) ?? 0n), 0n),
    ),
  );
  protected readonly form = new FormGroup({
    insurerId: new FormControl<string | null>(null, [Validators.required]),
    date: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    reference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
  });

  constructor() {
    this.form.addValidators(() => (this.picked().size ? null : { noClaims: true }));
    this.form.controls.insurerId.valueChanges.subscribe((id) => void this.load(id));
  }

  protected toggle(id: string): void {
    const next = new Set(this.picked());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.picked.set(next);
    this.form.updateValueAndValidity();
  }

  private async load(insurerId: string | null): Promise<void> {
    this.picked.set(new Set());
    if (!insurerId) {
      this.claims.set(null);
      return;
    }
    const page = await firstValueFrom(
      this.api.list(
        defaultQuery({
          perPage: 100,
          sort: ['createdAt'],
          filter: {
            and: [
              { insurerId: { eq: insurerId } },
              { status: { eq: ApprovalStatus.Approved } },
              { remittedAt: { null: true } },
            ],
          },
        }),
      ),
    ).catch(() => null);
    this.claims.set(page?.data ?? []);
    this.picked.set(new Set(this.claims()?.map((c) => c.id)));
    this.form.updateValueAndValidity();
  }

  protected readonly submit = async (): Promise<InsuranceClaim[]> => {
    const v = this.form.getRawValue();
    const settled = await firstValueFrom(
      this.api.remittance(
        {
          claimIds: [...this.picked()],
          date: v.date,
          reference: v.reference.trim(),
          amount: this.total(),
        },
        this.key,
      ),
    );
    this.ref.close(settled);
    return settled;
  };
}
