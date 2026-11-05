import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyActions } from '@services/pharmacy/pharmacy-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { PRESCRIPTION_LIST_TEXT } from '@constants/pharmacy/prescription-list.constants';

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

  protected readonly text = PRESCRIPTION_LIST_TEXT;
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly create = async (): Promise<void> => {
    const prescription = await this.actions.prescribe({ prescription: null, patient: null });
    if (prescription) await this.router.navigate(['/pharmacy/prescriptions', prescription.id]);
  };
}
