import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { PACKAGE_TEXT } from '@constants/billing/package.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ServicePackage } from '@interfaces/billing/service-package.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { BillingActions } from '@services/billing/billing-actions.service';

/** `/billing/packages` — the package catalog: what each covers, sessions, price, validity and whether it is on sale. */
@Component({
  selector: 'app-package-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe],
  templateUrl: './package-list.page.html',
})
export class PackageListPage {
  private readonly actions = inject(BillingActions);
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly text = PACKAGE_TEXT;
  protected readonly variants = ButtonVariant;

  protected readonly create = async (): Promise<void> => {
    if (await this.actions.editPackage(null)) this.list().reload();
  };

  protected readonly edit = async (pkg: ServicePackage): Promise<void> => {
    if (await this.actions.editPackage(pkg)) this.list().reload();
  };
}
