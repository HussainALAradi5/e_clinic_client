import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { SickLeave } from '@shared/interfaces/clinic/sick-leave.interface';

/**
 * `/clinic/sick-leaves` — certificates on file: the front desk sees all (to print them for a patient), doctors those
 * they issued. A row opens the printable certificate in a new tab.
 */
@Component({
  selector: 'app-sick-leave-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, DatePipe],
  templateUrl: './sick-leave-list.page.html',
})
export class SickLeaveListPage {
  protected readonly dateFormat = DATE_FORMAT;

  protected open(leave: SickLeave): void {
    window.open(`/print/sick-leave/${leave.id}`, '_blank', 'noopener');
  }
}
