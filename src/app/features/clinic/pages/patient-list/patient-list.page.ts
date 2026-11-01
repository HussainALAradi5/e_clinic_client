import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmergencyAccessDialog } from '../../components/emergency-access-dialog/emergency-access-dialog.component';
import {
  PatientRegisterDialog,
  RegisterResult,
} from '../../components/patient-register-dialog/patient-register-dialog.component';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { AccessService } from '@shared/services/auth/access.service';
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
  protected readonly variants = ButtonVariant;
  private readonly access = inject(AccessService);
  /** Clinicians who see only their own patients can open another one in an emergency (everyone else sees all). */
  // `can` reads the signed-in user's rights (signals), so this updates once they have loaded.
  protected readonly canBreakGlass = computed(
    () =>
      this.access.can('patients.read_own & patients.view_medical') &&
      !this.access.can('patients.read_all'),
  );

  protected readonly emergency = async (): Promise<void> => {
    const id = await this.dialogs.open<EmergencyAccessDialog, null, string>(
      EmergencyAccessDialog,
      null,
      {
        width: '560px',
      },
    );
    if (id) await this.router.navigate(['/clinic/patients', id]);
  };

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
