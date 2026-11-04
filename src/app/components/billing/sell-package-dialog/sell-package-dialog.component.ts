import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PACKAGE_TEXT } from '@constants/billing/package.constants';
import { PatientPackage } from '@interfaces/billing/patient-package.interface';
import { ServicePackage } from '@interfaces/billing/service-package.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { PackageApi } from '@services/billing/package-api.service';
import { formatMoney } from '@utilities/money';

/** Sells a package on sale to the patient: picked from the catalog, added to their draft invoice. */
@Component({
  selector: 'app-sell-package-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, EntitySelect],
  template: `
    <h2 mat-dialog-title>
      {{ text.sellTitle }}
      <span class="block text-sm font-normal text-on-surface-variant">{{ patient.fullName }}</span>
    </h2>
    <mat-dialog-content>
      <p class="mt-0 text-sm text-on-surface-variant">{{ text.sellHint }}</p>
      <ui-form
        [form]="form"
        [submit]="submit"
        [submitLabel]="text.sell"
        [compact]="true"
        (cancelled)="ref.close()"
      >
        <ui-entity-select
          [label]="text.title"
          endpoint="billing/packages"
          [display]="packageName"
          [filter]="onSale"
          [control]="form.controls.packageId"
        />
      </ui-form>
    </mat-dialog-content>
  `,
})
export class SellPackageDialog {
  protected readonly patient = inject<PatientSummary>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<SellPackageDialog, PatientPackage>);
  private readonly api = inject(PackageApi);
  private readonly key = newIdempotencyKey();
  protected readonly text = PACKAGE_TEXT;
  protected readonly onSale: FilterGroup = { and: [{ isActive: { eq: true } }] };
  protected readonly form = new FormGroup({
    packageId: new FormControl<string | null>(null, [Validators.required]),
  });

  protected readonly packageName = (p: ServicePackage): string =>
    `${p.name} · ${p.sessions} × ${p.coveredService.name} · ${formatMoney(p.price)}`;

  protected readonly submit = async (): Promise<PatientPackage> => {
    const sold = await firstValueFrom(
      this.api.sell(this.patient.id, this.form.getRawValue().packageId as string, this.key),
    );
    this.ref.close(sold);
    return sold;
  };
}
