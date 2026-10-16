import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CompanyFormDialog } from '../../components/company-form-dialog/company-form-dialog.component';
import { CompanyFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Company } from '@shared/interfaces/reference/company.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { CompanyApi } from '@shared/services/reference/company-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { flag } from '@shared/utils/address';

/** `/reference/companies` — manufacturers, suppliers, insurers, labs and hospitals; bulk archive / delete / restore. */
@Component({
  selector: 'app-company-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, EnumLabelPipe],
  templateUrl: './company-list.page.html',
})
export class CompanyListPage {
  private readonly api = inject(CompanyApi);
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  protected readonly flag = flag;

  protected readonly create = async (): Promise<void> => {
    const company = await this.dialogs.open<CompanyFormDialog, CompanyFormDialogData, Company>(
      CompanyFormDialog,
      { company: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '720px' },
    );
    if (company) {
      await this.router.navigate(['/reference/companies', company.id]);
    }
  };
}
