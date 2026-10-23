import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  PatientRegisterDialog,
  RegisterResult,
} from '../../components/patient-register-dialog/patient-register-dialog.component';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/clinic/patients` — find a patient by name, file number or mobile; register new ones. */
@Component({
  selector: 'app-patient-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe],
  templateUrl: './patient-list.page.html',
})
export class PatientListPage {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly register = async (): Promise<void> => {
    const result = await this.dialogs.open<PatientRegisterDialog, null, RegisterResult>(
      PatientRegisterDialog,
      null,
      { width: '760px' },
    );
    if (!result) return;
    if ('patient' in result) {
      this.notify.success(`${result.patient.fullName} registered as ${result.patient.code}.`);
      await this.router.navigate(['/clinic/patients', result.patient.id]);
    } else {
      this.notify.info('This person already has a patient file — opening it.');
      await this.router.navigate(['/clinic/patients', result.existingId]);
    }
  };
}
