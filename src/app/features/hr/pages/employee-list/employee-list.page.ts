import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HireDialog } from '../../components/hire-dialog/hire-dialog.component';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { Employee } from '@shared/interfaces/hr/employee.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { DatePipe } from '@angular/common';
import { DATE_FORMAT } from '@shared/constants/app.constants';

/** `/hr/employees` — staff list; hire opens the one-step hire dialog. */
@Component({
  selector: 'app-employee-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, StatusChip, EnumLabelPipe, DatePipe],
  templateUrl: './employee-list.page.html',
})
export class EmployeeListPage {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
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
