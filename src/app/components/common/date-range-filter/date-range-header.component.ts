import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { MatCalendarHeader } from '@angular/material/datepicker';
import { DateFieldOption, DateRangeValue } from '@interfaces/list/date-range-filter.interface';

/** What the calendar header needs from the field that opened it (provided by DateRangeFilter). */
export abstract class DateRangeHost {
  abstract readonly fields: Signal<DateFieldOption[]>;
  abstract readonly current: Signal<DateRangeValue>;
  abstract chooseField(field: string): void;
}

/** Calendar header of the list date filter: which date (when the list has several), then the month navigation. */
@Component({
  selector: 'ui-date-range-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCalendarHeader],
  templateUrl: './date-range-header.component.html',
  styleUrl: './date-range-header.component.scss',
})
export class DateRangeHeader {
  protected readonly host = inject(DateRangeHost);
}
