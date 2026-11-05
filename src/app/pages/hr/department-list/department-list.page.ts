import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DepartmentFormDialog } from '@components/hr/department-form-dialog/department-form-dialog.component';
import { DepartmentFormDialogData } from '@interfaces/hr/dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Department } from '@interfaces/hr/department.interface';
import { DepartmentApi } from '@services/hr/department-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { DEPARTMENT_LIST_TEXT } from '@constants/hr/department-list.constants';

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

  protected readonly text = DEPARTMENT_LIST_TEXT;
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
      this.notify.success(DEPARTMENT_LIST_TEXT.departmentCreated(department.name));
      await this.router.navigate(['/hr/departments', department.id]);
    }
  };
}
