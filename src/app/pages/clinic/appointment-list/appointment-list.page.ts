import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AppointmentActions } from '@services/clinic/appointment-actions.service';
import { EnumService } from '@services/data/enum.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { EnumFilter } from '@components/common/enum-filter/enum-filter.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { TONE_STRIPE_CLASSES } from '@constants/status-tones.constants';
import { VisitTiming } from '@enums/clinic/visit-timing.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { APPOINTMENT_LIST_TEXT } from '@constants/clinic/appointment-list.constants';

/**
 * `/clinic/appointments` — every booking, searchable and filterable; book from here. Rows carry the colour of
 * their timing (coming, today, past, missed) and the quick filter above narrows to one of them.
 */
@Component({
  selector: 'app-appointment-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton, DatePipe, StatusChip, EnumFilter],
  templateUrl: './appointment-list.page.html',
})
export class AppointmentListPage {
  private readonly actions = inject(AppointmentActions);
  private readonly enums = inject(EnumService);

  protected readonly text = APPOINTMENT_LIST_TEXT;
  private readonly list = viewChild.required(ResourceListPage);
  protected readonly dateFormat = DATE_FORMAT;

  protected readonly timing = signal<VisitTiming | null>(null);
  protected readonly params = computed((): Record<string, string> => {
    const timing = this.timing();
    return timing ? { timing } : {};
  });
  protected readonly rowClass = (row: { id: string }): string =>
    TONE_STRIPE_CLASSES[this.enums.tone('VisitTiming', (row as Appointment).timing)];

  protected readonly book = async (): Promise<void> => {
    if (await this.actions.book()) this.list().reload();
  };
}
