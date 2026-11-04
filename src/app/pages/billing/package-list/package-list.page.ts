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
  template: `
    <ui-resource-list
      resource="packages"
      endpoint="billing/packages"
      [title]="text.title"
      [subtitle]="text.subtitle"
      [emptyTitle]="text.empty"
    >
      <ui-button actions icon="add" access="packages.create" [action]="create">{{
        text.create
      }}</ui-button>
      <ng-template uiCell="code" let-row
        ><span class="font-mono">{{ row.code }}</span></ng-template
      >
      <ng-template uiCell="name" let-row>
        <span class="font-medium">{{ row.name }}</span>
        <ui-button
          class="ml-1"
          icon="edit"
          [variant]="variants.Text"
          access="packages.write"
          [action]="edit.bind(this, row)"
          >{{ text.edit }}</ui-button
        >
      </ng-template>
      <ng-template uiCell="service" let-row>{{ row.coveredService.name }}</ng-template>
      <ng-template uiCell="price" let-row
        ><span class="tabular-nums">{{ row.price | money }}</span></ng-template
      >
      <ng-template uiCell="is_active" let-row>{{
        row.isActive ? text.onSaleYes : text.onSaleNo
      }}</ng-template>
    </ui-resource-list>
  `,
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
