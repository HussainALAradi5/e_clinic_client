import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ServiceFormDialog } from '../../components/service-form-dialog/service-form-dialog.component';
import { ServiceFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { BillableService } from '@shared/interfaces/billing/billable-service.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { BillableServiceApi } from '@shared/services/billing/billable-service-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/billing/service-catalog` — the price list with bulk archive / delete / restore, Excel export and import. */
@Component({
  selector: 'app-service-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, EnumLabelPipe, MoneyPipe],
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
