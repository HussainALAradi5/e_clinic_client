import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorFormDialog } from '@components/clinic/doctor-form-dialog/doctor-form-dialog.component';
import { DoctorFormDialogData } from '@interfaces/clinic/doctor-form-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { DOCTOR_LIST_TEXT } from '@constants/clinic/doctor-list.constants';

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

  protected readonly text = DOCTOR_LIST_TEXT;
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
