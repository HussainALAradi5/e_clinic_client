import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TimeDial } from '@components/common/time-dial/time-dial.component';
import { TimeWheel } from '@components/common/time-wheel/time-wheel.component';
import { TIME_FIELD_TEXT } from '@constants/ui/time-field.constants';
import { TimePickerStyle } from '@enums/ui/time-picker-style.enum';
import { TimePickerPreference } from '@services/ui/time-picker-preference.service';
import { ClockTimes } from '@utilities/clock-time';

/** Account page card: choose how time fields open (wheels or dial), with a live preview of the choice. */
@Component({
  selector: 'app-time-picker-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TimeDial, TimeWheel],
  templateUrl: './time-picker-card.component.html',
})
export class TimePickerCard {
  protected readonly preference = inject(TimePickerPreference);
  protected readonly text = TIME_FIELD_TEXT;
  protected readonly choices = Object.values(TimePickerStyle);
  protected readonly styles = TimePickerStyle;
  protected readonly preview = signal(ClockTimes.parse('09:30'));
}
