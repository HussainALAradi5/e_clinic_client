import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProgressMeter } from '@components/common/progress-meter/progress-meter.component';
import { RouterLink } from '@angular/router';
import { ClinicalActions } from '@services/clinic/clinical-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';

/** `/clinic/treatments` — every plan with its progress; prescribe from here or from a visit. */
@Component({
  selector: 'app-treatment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    ProgressMeter,
    RouterLink,
  ],
  templateUrl: './treatment-list.page.html',
})
export class TreatmentListPage {
  private readonly actions = inject(ClinicalActions);
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly prescribe = async (): Promise<void> => {
    if (await this.actions.prescribe({})) this.list().reload();
  };
}
