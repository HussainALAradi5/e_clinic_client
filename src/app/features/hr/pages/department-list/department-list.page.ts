import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DepartmentFormDialog } from '../../components/department-form-dialog/department-form-dialog.component';
import { DepartmentFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Department } from '@shared/interfaces/hr/department.interface';
import { DepartmentApi } from '@shared/services/hr/department-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/hr/departments` — department list with bulk archive / delete / restore. */
@Component({
  selector: 'app-department-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton],
  templateUrl: './department-list.page.html',
})
export class DepartmentListPage {
  private readonly api = inject(DepartmentApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const department = await this.dialogs.open<
      DepartmentFormDialog,
      DepartmentFormDialogData,
      Department
    >(
      DepartmentFormDialog,
      { department: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '560px' },
    );
    if (department) {
      this.notify.success(`Department ${department.name} created.`);
      await this.router.navigate(['/hr/departments', department.id]);
    }
  };
}
