import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyActions } from '../../services/pharmacy-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { QtyPipe } from '@shared/pipes/qty.pipe';

/** `/pharmacy/medications` — the catalogue with price and stock on hand; low stock stands out. */
@Component({
  selector: 'app-medication-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe, EnumLabelPipe, MoneyPipe, QtyPipe],
  templateUrl: './medication-list.page.html',
})
export class MedicationListPage {
  private readonly actions = inject(PharmacyActions);
  private readonly router = inject(Router);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const medication = await this.actions.editMedication(null);
    if (medication) await this.router.navigate(['/pharmacy/medications', medication.id]);
  };

  protected readonly receive = async (): Promise<void> => {
    await this.actions.receive();
  };
}
