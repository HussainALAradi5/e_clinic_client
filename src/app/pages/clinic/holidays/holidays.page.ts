import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { ScheduleExceptionDialog } from '@components/clinic/schedule-exception-dialog/schedule-exception-dialog.component';
import { ScheduleExceptionDialogData } from '@interfaces/clinic/schedule-exception-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ButtonVariant } from '@enums/ui/button.enum';
import { ScheduleException } from '@interfaces/clinic/schedule-exception.interface';
import { ScheduleApi } from '@services/clinic/schedule-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { HOLIDAYS_TEXT } from '@constants/clinic/holidays.constants';

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

  protected readonly text = HOLIDAYS_TEXT;
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
      this.notify.success(HOLIDAYS_TEXT.holidayAddedNobodyCanBe);
      await this.load();
    }
  };

  protected readonly remove = async (holiday: ScheduleException): Promise<void> => {
    await firstValueFrom(this.api.removeHoliday(holiday.id));
    this.notify.success(HOLIDAYS_TEXT.holidayRemoved);
    await this.load();
  };
}
