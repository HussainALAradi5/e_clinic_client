import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorFormDialog } from '../../components/doctor-form-dialog/doctor-form-dialog.component';
import { DoctorFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { Doctor } from '@shared/interfaces/clinic/doctor.interface';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/** `/clinic/doctors` — doctors with specialty, licence expiry and booking switch. */
@Component({
  selector: 'app-doctor-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe],
  templateUrl: './doctor-list.page.html',
})
export class DoctorListPage {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly today = clinicIsoDate();

  protected readonly create = async (): Promise<void> => {
    const doctor = await this.dialogs.open<DoctorFormDialog, DoctorFormDialogData, Doctor>(
      DoctorFormDialog,
      { doctor: null },
      { width: '760px' },
    );
    if (doctor) {
      this.notify.success(`${doctor.displayName} can now take bookings once a schedule is set.`);
      await this.router.navigate(['/clinic/doctors', doctor.id]);
    }
  };
}
