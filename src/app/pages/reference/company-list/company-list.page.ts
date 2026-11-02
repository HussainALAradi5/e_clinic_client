import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CompanyFormDialog } from '@components/reference/company-form-dialog/company-form-dialog.component';
import { CompanyFormDialogData } from '@interfaces/reference/dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Company } from '@interfaces/reference/company.interface';
import { CompanyApi } from '@services/reference/company-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { DialogService } from '@services/ui/dialog.service';
import { Flag } from '@components/common/flag/flag.component';
import { COMPANY_LIST_TEXT } from '@constants/reference/company-list.constants';

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
      this.notify.success(COMPANY_LIST_TEXT.companyCreated(company.name));
      await this.router.navigate(['/reference/companies', company.id]);
    }
  };
}
