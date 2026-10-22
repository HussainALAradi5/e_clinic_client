import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { ScheduleExceptionDialog } from '../../components/schedule-exception-dialog/schedule-exception-dialog.component';
import { ScheduleExceptionDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { ScheduleException } from '@shared/interfaces/clinic/schedule.interface';
import { ScheduleApi } from '@shared/services/clinic/schedule-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

/** Days ahead listed (server allows 92). */
const DAYS_AHEAD = 90;

/** `/clinic/holidays` — clinic-wide closed days of the next three months. */
@Component({
  selector: 'app-holidays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, AppButton, MatCardModule, DatePipe],
  templateUrl: './holidays.page.html',
})
export class HolidaysPage {
  private readonly api = inject(ScheduleApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);

  protected readonly holidays = signal<ScheduleException[] | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = 'EEEE ' + DATE_FORMAT;

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    const to = clinicIsoDate(new Date(Date.now() + DAYS_AHEAD * 86_400_000));
    this.holidays.set(await firstValueFrom(this.api.holidays(clinicIsoDate(), to)).catch(() => []));
  }

  protected readonly add = async (): Promise<void> => {
    const added = await this.dialogs.open<
      ScheduleExceptionDialog,
      ScheduleExceptionDialogData,
      ScheduleException
    >(ScheduleExceptionDialog, { providerId: null }, { width: '560px' });
    if (added) {
      this.notify.success('Holiday added — nobody can be booked that day.');
      await this.load();
    }
  };

  protected readonly remove = async (holiday: ScheduleException): Promise<void> => {
    await firstValueFrom(this.api.removeHoliday(holiday.id));
    this.notify.success('Holiday removed.');
    await this.load();
  };
}
