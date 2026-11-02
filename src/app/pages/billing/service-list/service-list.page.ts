import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ServiceFormDialog } from '@components/billing/service-form-dialog/service-form-dialog.component';
import { ServiceFormDialogData } from '@interfaces/billing/dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { BillableServiceApi } from '@services/billing/billable-service-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';

/** `/billing/service-catalog` — the price list with bulk archive / delete / restore, Excel export and import. */
@Component({
  selector: 'app-service-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe],
  templateUrl: './service-list.page.html',
})
export class ServiceListPage {
  private readonly api = inject(BillableServiceApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const service = await this.dialogs.open<
      ServiceFormDialog,
      ServiceFormDialogData,
      BillableService
    >(
      ServiceFormDialog,
      { service: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '720px' },
    );
    if (service) {
      this.notify.success(`Service ${service.code} created.`);
      await this.router.navigate(['/billing/service-catalog', service.id]);
    }
  };
}
