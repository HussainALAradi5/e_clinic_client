import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { PACKAGE_LIMITS, PACKAGE_TEXT } from '@constants/billing/package.constants';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { ServicePackage } from '@interfaces/billing/service-package.interface';
import { PackageApi } from '@services/billing/package-api.service';
import { formatMoney, fromMinor, money, toMinor } from '@utilities/money';
import { AppValidators } from '@validations/validators';

/**
 * Creates or edits a package: the covered service, how many sessions, the price (the per-session price shows as
 * you type) and how long it stays valid after payment. New terms apply to future sales only.
 */
@Component({
  selector: 'app-package-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    MoneyInput,
    TextField,
  ],
  templateUrl: './package-form-dialog.component.html',
})
export class PackageFormDialog {
  protected readonly pkg = inject<ServicePackage | null>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<PackageFormDialog, ServicePackage>);
  private readonly api = inject(PackageApi);
  protected readonly text = PACKAGE_TEXT;

  protected readonly form = new FormGroup({
    name: new FormControl(this.pkg?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    coveredServiceId: new FormControl<string | null>(this.pkg?.coveredService.id ?? null, [
      Validators.required,
    ]),
    sessions: new FormControl<number | null>(this.pkg?.sessions ?? 10, [
      Validators.required,
      Validators.min(PACKAGE_LIMITS.minSessions),
      Validators.max(PACKAGE_LIMITS.maxSessions),
    ]),
    price: new FormControl<string | null>(this.pkg?.price.amount ?? null, [
      Validators.required,
      AppValidators.money,
      AppValidators.positive,
    ]),
    validityDays: new FormControl<number | null>(this.pkg?.validityDays ?? 90, [
      Validators.required,
      Validators.min(PACKAGE_LIMITS.minDays),
      Validators.max(PACKAGE_LIMITS.maxDays),
    ]),
    description: new FormControl(this.pkg?.description ?? '', { nonNullable: true }),
    isActive: new FormControl(this.pkg?.isActive ?? true, { nonNullable: true }),
  });

  private readonly values = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });
  /** "BHD 9.000 per session" under the price. */
  protected readonly perSession = computed(() => {
    const { price, sessions } = this.values();
    const minor = toMinor(price ?? null);
    if (minor === null || !sessions || sessions < 1) return null;
    return PACKAGE_TEXT.perSession(formatMoney(money(fromMinor(minor / BigInt(sessions)))));
  });

  protected readonly serviceName = (s: BillableService): string => `${s.code} · ${s.name}`;

  protected readonly submit = async (): Promise<ServicePackage> => {
    const v = this.form.getRawValue();
    const payload = {
      name: v.name.trim(),
      description: v.description.trim() || null,
      coveredServiceId: v.coveredServiceId as string,
      sessions: Number(v.sessions),
      price: v.price as string,
      validityDays: Number(v.validityDays),
      isActive: v.isActive,
    };
    const saved = await firstValueFrom(
      this.pkg ? this.api.update(this.pkg.id, payload) : this.api.create(payload),
    );
    this.ref.close(saved);
    return saved;
  };
}
