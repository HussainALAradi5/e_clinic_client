import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HrActions } from '@services/hr/hr-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { MoneyPipe } from '@pipes/money.pipe';

/** `/hr/payroll` — monthly payroll runs: calculated by HR, approved and paid by finance. */
@Component({
  selector: 'app-payroll-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, MoneyPipe],
  templateUrl: './payroll-list.page.html',
})
export class PayrollListPage {
  private readonly actions = inject(HrActions);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const run = await this.actions.createPayroll();
    if (run) await this.router.navigate(['/hr/payroll', run.id]);
  };

  protected monthLabel(start: string): string {
    return new Date(`${start}T00:00:00`).toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
  }
}
