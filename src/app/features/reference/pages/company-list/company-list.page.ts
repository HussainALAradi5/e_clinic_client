import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CompanyFormDialog } from '../../components/company-form-dialog/company-form-dialog.component';
import { CompanyFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Company } from '@shared/interfaces/reference/company.interface';
import { CompanyApi } from '@shared/services/reference/company-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { Flag } from '@shared/components/flag/flag.component';

/** `/reference/companies` — manufacturers, suppliers, insurers, labs and hospitals; bulk archive / delete / restore. */
@Component({
  selector: 'app-company-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Flag, ResourceListPage, CellDef, AppButton],
  templateUrl: './company-list.page.html',
})
export class CompanyListPage {
  private readonly api = inject(CompanyApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const company = await this.dialogs.open<CompanyFormDialog, CompanyFormDialogData, Company>(
      CompanyFormDialog,
      { company: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '720px' },
    );
    if (company) {
      this.notify.success(`Company ${company.name} created.`);
      await this.router.navigate(['/reference/companies', company.id]);
    }
  };
}
