import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyActions } from '../../services/pharmacy-actions.service';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';

/** `/pharmacy/prescriptions` — every prescription; patients see their own here. */
@Component({
  selector: 'app-prescription-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe],
  templateUrl: './prescription-list.page.html',
})
export class PrescriptionListPage {
  private readonly actions = inject(PharmacyActions);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const prescription = await this.actions.prescribe({ prescription: null, patient: null });
    if (prescription) await this.router.navigate(['/pharmacy/prescriptions', prescription.id]);
  };
}
