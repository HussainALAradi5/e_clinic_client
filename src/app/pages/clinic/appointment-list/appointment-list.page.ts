import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';

/** `/clinic/appointments` — every booking, searchable and filterable; book from here. */
@Component({
  selector: 'app-appointment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe],
  templateUrl: './appointment-list.page.html',
})
export class AppointmentListPage {
  private readonly actions = inject(AppointmentActions);
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly book = async (): Promise<void> => {
    if (await this.actions.book()) this.list().reload();
  };
}
