import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HireDialog } from '@components/hr/hire-dialog/hire-dialog.component';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Employee } from '@interfaces/hr/employee.interface';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { DatePipe } from '@angular/common';
import { DATE_FORMAT } from '@constants/app.constants';
import { EMPLOYEE_LIST_TEXT } from '@constants/hr/employee-list.constants';

/** `/hr/employees` — staff list; hire opens the one-step hire dialog. */
@Component({
  selector: 'app-employee-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe],
  templateUrl: './employee-list.page.html',
})
export class EmployeeListPage {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly text = EMPLOYEE_LIST_TEXT;
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly hire = async (): Promise<void> => {
    const employee = await this.dialogs.open<HireDialog, null, Employee>(HireDialog, null, {
      width: '760px',
    });
    if (employee) {
      this.notify.success(`${employee.fullName} hired.`);
      await this.router.navigate(['/hr/employees', employee.id]);
    }
  };
}
