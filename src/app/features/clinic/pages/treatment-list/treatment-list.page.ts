import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ClinicalActions } from '../../services/clinical-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';

/** `/clinic/treatments` — every plan with its progress; prescribe from here or from a visit. */
@Component({
  selector: 'app-treatment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ResourceListPage,
    CellDef,
    AppButton,
    StatusChip,
    EnumLabelPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
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
